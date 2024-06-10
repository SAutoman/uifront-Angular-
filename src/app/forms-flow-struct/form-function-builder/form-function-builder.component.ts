/**
 * global
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, filter, share, tap } from 'rxjs/operators';
import { remove, cloneDeep } from 'lodash-core';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
/**
 * project
 */

import { IConfigurableListItem } from '@wfm/common/models';
import { Guid } from '@wfm/shared/guid';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { ClearFunctionsState, GetAssociatedCompanies, GetTenantUserGroups, RemoveSchemaFunction, UpdateSchemaFunctions } from '@wfm/store';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
/**
 * local
 */
import { IFieldsExpressionView } from '../interface/expression/expressionModelUI';
import { FormFunctionItemInterface } from '../form-function-item';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-form-function-builder',
  templateUrl: './form-function-builder.component.html',
  styleUrls: ['./form-function-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFunctionBuilderComponent implements OnInit, OnDestroy {
  @Input() readonly tenantId: string;
  @Input() readonly title = 'Build Conditions';

  /**
   * reference to selected form fields
   */
  @Input() readonly fieldsObservable$: Observable<IConfigurableListItem[]>;

  /**
   * prepared expression for update mode
   */
  @Input() readonly inputExpressions?: IFieldsExpressionView[];
  @Input() isUpdateMode: boolean;
  @Output() update = new EventEmitter<IFieldsExpressionView[]>();
  @Output() close = new EventEmitter<boolean>();
  fields$: Observable<IConfigurableListItem[]>;
  fields: IConfigurableListItem[];
  defaultExprName = 'Please, enter condition name';
  componentId = 'a28b1795-1c99-41bf-beee-dd39c1dae72d';

  private expressions = new BehaviorSubject<IFieldsExpressionView[]>([]);
  expressions$: Observable<IFieldsExpressionView[]>;
  touched = false;

  areConditionsUpdated: boolean;
  searchTerm: string;
  constructor(private store: Store<ApplicationState>, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getSystemFieldOptions();
    this.expressions$ = this.expressions.asObservable().pipe(delay(0), share());

    this.fields$ = this.fieldsObservable$.pipe(
      delay(0),
      filter((x) => !!x),
      tap((fields) => {
        this.fields = [...fields];
        setTimeout(() => {
          const expressions = this.expressions.value;
          if (this.inputExpressions && this.inputExpressions.length) {
            const expressionsCopy: IFieldsExpressionView[] = cloneDeep(this.inputExpressions);
            expressionsCopy.forEach((x) => {
              x.fields = fields;
            });
            this.touched = true;
            this.expressions.next(expressionsCopy);
          } else if (!this.touched && !expressions.length) {
            this.createExpression(fields);
          }
        });
      })
    );
  }

  hasFields(fields: IConfigurableListItem[]): boolean {
    return !!fields.length;
  }

  /**
   *
   * @param fields
   * @param expressions
   * create an empty expression skeleton to be shown at the beginning
   */

  createExpression(fields: IConfigurableListItem[], expressions?: IFieldsExpressionView[]): void {
    if (expressions && expressions.length) {
      return;
    }

    const newExpression: IFieldsExpressionView = {
      fields,
      id: Guid.createQuickGuidAsString(),
      name: undefined,
      isClientId: true,
      isChanged: true,
      configuration: {
        expanded: false,
        isChanged: true
      }
    };
    const existingExpressions = this.expressions.getValue();
    const allExpressions = [newExpression, ...existingExpressions];
    this.expressions.next(allExpressions);
    this.touched = true;
  }

  confirmDeleteExpression(e: Event, currentExpression: IFieldsExpressionView): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.onDeleteExpression(e, currentExpression);
    });
  }

  onDeleteExpression(e: Event, currentExpression: IFieldsExpressionView): void {
    e.preventDefault();
    e.stopImmediatePropagation();
    const arr = this.expressions.getValue();
    remove(arr, (x) => x === currentExpression);
    this.expressions.next(arr);
    this.touched = true;

    this.store.dispatch(new RemoveSchemaFunction({ functionId: currentExpression.id }));
  }

  /**
   *
   * @param e
   * @param currentExpression
   * called when a child component FormFunctionItem emits an update
   */

  onExpressionUpdate(e: FormFunctionItemInterface.IFunctionItemUpdateEvent, currentExpression: IFieldsExpressionView): void {
    const model = e.model;
    currentExpression.name = model.name;
    currentExpression.expressionModel = model;
    if (model.fieldsSettings?.length) {
      currentExpression.selectedFieldIds = [];
      e.model.fieldsSettings?.forEach((setting) => {
        if (setting?.field?.id) {
          currentExpression.selectedFieldIds.push(setting.field.id);
        }
      });
    } else {
      currentExpression.selectedFieldIds = [];
    }

    currentExpression.fieldsUsedInRules = model.ruleSet?.rules?.map((rule) => {
      return rule.fieldRef?.id;
    });
    currentExpression.configuration.valid = e.isValid;
    currentExpression.isValid = e.isValid && !!model.name;
    currentExpression.isChanged = true;

    let updatePayload = {
      functionState: {
        [currentExpression.id]: {
          functionName: currentExpression.name,
          selectedFieldIds: currentExpression.selectedFieldIds,
          ruleFieldIds: currentExpression.fieldsUsedInRules
        }
      }
    };
    this.store.dispatch(new UpdateSchemaFunctions(updatePayload));
  }

  /**
   *
   * @param expressions
   * emit the expressions to the parent component
   */

  onSave(expressions: IFieldsExpressionView[]): void {
    const model: IFieldsExpressionView[] = cloneDeep(expressions);
    model.forEach((x) => {
      x.isChanged = true;
      x.configuration.expanded = false;
      x.configuration.valid = true;
    });
    this.update.next(model);
    this.areConditionsUpdated = false;
  }

  onExpanded(item: IFieldsExpressionView): void {
    setTimeout(() => {
      item.configuration.expanded = true;
    });
  }

  onCollapse(item: IFieldsExpressionView): void {
    setTimeout(() => {
      item.configuration.expanded = false;
    });
  }

  /**
   *
   * @param items
   * used in template: disable/enable save button
   */

  isValid(items: IFieldsExpressionView[]): boolean {
    const changeValid = items.map((x: IFieldsExpressionView) => {
      return {
        changed: x.isChanged || x.configuration.isChanged,
        valid: x.configuration.valid
      };
    });
    const changed = changeValid.some((x) => x.changed);
    const valid = changeValid.every((x) => x.valid);
    return !items || !items.length || (valid && changed);
  }

  async cancelDialog(data): Promise<void> {
    if (this.areConditionsUpdated) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{
          title: 'Alert',
          message: unsavedDataWarningMessage,
          showProceedBtn: true
        }
      });
      if (await dialogRef.afterClosed().toPromise()) this.close.emit(true);
    } else this.close.emit(true);
  }

  ngOnDestroy() {
    this.store.dispatch(new ClearFunctionsState());
  }

  onConditionsUpdate(event: boolean): void {
    this.areConditionsUpdated = event;
  }

  /**
   * getting possible values for system fields for function rule builder
   */
  getSystemFieldOptions(): void {
    this.store.dispatch(new GetTenantUserGroups({ tenantId: this.tenantId }));
    this.store.dispatch(new GetAssociatedCompanies({ tenantId: this.tenantId }));
  }

  onFunctionDrag(e: CdkDragDrop<IFieldsExpressionView[]>): void {
    if (e.previousContainer === e.container && e.previousIndex !== e.currentIndex) {
      const reorderedData: IFieldsExpressionView[] = cloneDeep(e.container.data);
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      this.expressions.next(reorderedData);
      this.areConditionsUpdated = true;
    }
  }
}
