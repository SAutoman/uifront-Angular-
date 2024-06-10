/**
 * global
 */
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
/**
 * project
 */
import { IConfigurableListItem, IFieldConfiguration, IKeyValueView } from '@wfm/common/models';
import {
  AreaTypeEnum,
  AreaTypeList,
  AreaTypeMap,
  FieldTypeIds,
  FieldTypeNameMap,
  IFieldBaseDto,
  IUpdateTenantFieldDto,
  SchemasService
} from '@wfm/service-layer';

/**
 * local
 */

import { TenantFieldsStateWrapper } from './tenant-fields-state-wrapper';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { PopupAlertComponent } from '@wfm/shared/popup-alert/popup-alert.component';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';

import {
  selectTenantFieldsState,
  TenantFieldsState,
  GetTenantFields,
  RemoveTenantField,
  AddOrUpdateTenantField,
  UpdateManyTenantFields,
  tfOperationMsgSelector,
  ResetTfOperationMsg
} from '@wfm/store/tenant-fields';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';

@Component({
  selector: 'app-page-tenant-fields',
  templateUrl: './page-tenant-fields.component.html',
  styleUrls: ['./page-tenant-fields.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTenantFieldsComponent extends TenantComponent implements OnInit {
  @ViewChild('listContainer') listContainer: ElementRef;
  title = 'Tenant Fields';
  disabled = false;
  selectedType: AreaTypeEnum = AreaTypeEnum.rawData;
  toggleGroup: IKeyValueView<string, AreaTypeEnum>[];
  allToggleGroups: IKeyValueView<string, AreaTypeEnum>[];
  state$: Observable<TenantFieldsStateWrapper>;
  updateItem?: IConfigurableListItem;
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: this.title } as AppBarData;
  allTenantFields: IConfigurableListItem<IFieldConfiguration>[];
  qsTerm: string = '';
  currentWorkItems: IConfigurableListItem<IFieldConfiguration>[];
  filteredWorkItems: IConfigurableListItem<IFieldConfiguration>[];
  hideComputeValueOption: boolean = true;
  get connectorFieldType() {
    return FieldTypeIds.ConnectorField;
  }
  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
    appStore: Store<ApplicationState>,
    private schemasService: SchemasService,
    private snackbar: MatSnackBar,
    private sharedService: SharedService,
    private ts: TranslateService
  ) {
    super(appStore);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.sharedService.setAppBarData(this.appBarData);
  }

  ngOnInit(): void {
    this.toggleGroup = AreaTypeList.map((x) => AreaTypeMap.get(x));
    this.toggleGroup[0].viewValue = 'All';
    moveItemInArray(this.toggleGroup, 0, this.toggleGroup.length - 1);
    this.allToggleGroups = cloneDeep(this.toggleGroup);
    this.toggleGroup.push({
      key: 'commonFields',
      value: 8,
      viewValue: 'All Fields'
    });

    this.state$ = this.store.select(selectTenantFieldsState).pipe(
      takeUntil(this.destroyed$),
      map((state: TenantFieldsState) => {
        this.disabled = !!state.loading;
        const wrapper = new TenantFieldsStateWrapper(state);
        wrapper.changeFilter(this.selectedType);
        if (state && state.page) {
          wrapper.appendAreaTypeNames(this.allToggleGroups);
        }
        return wrapper;
      })
    );
    this.getAllTenantFields();
    this.store.dispatch(new GetTenantFields({ tenantId: this.tenant }));
    this.store.pipe(select(tfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((msg) => {
      if (msg && msg.toLowerCase().includes('success')) {
        this.snackbar.open(this.ts.instant(msg), 'Ok', { duration: 2000 });
        this.store.dispatch(new ResetTfOperationMsg());
        this.store.dispatch(new GetTenantFields({ tenantId: this.tenant }));
      }
    });
  }

  getAllTenantFields(): void {
    this.state$.pipe(takeUntil(this.destroyed$)).subscribe((state) => {
      this.allTenantFields = state.allFields;
      this.updateCurrentWorkItems(state);
    });
  }

  openDialogAddField(template: TemplateRef<any>): void {
    this.openDialog(template, 'page-tenant-fields--create-field-dialog', 450).subscribe();
  }

  openDialogEditField(e: Event, template: TemplateRef<any>, item: IConfigurableListItem): void {
    if (this.disabled) {
      return;
    }
    this.updateItem = item;
    this.openDialog(template, 'page-tenant-fields--edit-field-dialog', 450).subscribe();
  }

  onDrag(e: CdkDragDrop<IConfigurableListItem[]>): void {
    if (this.disabled) {
      return;
    }
    if (e.previousContainer === e.container) {
      if (e.previousIndex !== e.currentIndex) {
        const allFields = cloneDeep(this.filteredWorkItems);
        moveItemInArray(this.filteredWorkItems, e.previousIndex, e.currentIndex);
        let changedFields = [];
        if (e.previousIndex < e.currentIndex) {
          for (let index = e.previousIndex; index < e.currentIndex + 1; index++) {
            const field = this.filteredWorkItems[index];
            field.configuration.position = allFields[index]?.configuration?.position;
            changedFields.push(BaseFieldConverter.toDto(field));
          }
        } else {
          for (let index = e.previousIndex; index > e.currentIndex - 1; index--) {
            const field = this.filteredWorkItems[index];
            field.configuration.position = allFields[index]?.configuration?.position;
            changedFields.push(BaseFieldConverter.toDto(field));
          }
        }
        if (changedFields?.length) this.updatePositions(changedFields);
      }
    }
  }

  private updatePositions(updatedFieldsArray: IFieldBaseDto[]): void {
    let fieldsForUpdate: IUpdateTenantFieldDto[] = [];
    updatedFieldsArray?.forEach((x) => {
      fieldsForUpdate.push({ newField: <IFieldBaseDto>x, targetId: x.id, tenantId: this.tenant });
    });
    this.store.dispatch(
      new UpdateManyTenantFields({
        tenantId: this.tenant,
        changedItems: fieldsForUpdate
      })
    );
  }

  async onRemove(e: Event, item: IConfigurableListItem): Promise<void> {
    if (this.disabled) {
      return;
    }

    const confirm = this.dialog.open(PopupConfirmComponent, {
      width: '400px',
      data: {
        title: this.ts.instant('Remove Field?'),
        message: this.ts.instant(`Are you sure you want to remove this field?`)
      }
    });
    confirm.afterClosed().subscribe(async (result) => {
      if (result === true) {
        // in case there is a need we can show in which schemas it is used

        let numberOfSchemasWithField = await this.checkIfFieldIsUsed(item);
        if (numberOfSchemasWithField > 0) {
          this.dialog.open(PopupAlertComponent, {
            data: {
              message: `Cannot remove: the field is used in ${numberOfSchemasWithField}  ${
                numberOfSchemasWithField === 1 ? 'schema' : 'schemas'
              }.`
            },
            width: '400px'
          });
          // should we limit the user from removing used field? Maybe just warn?
          return;
        }
        this.disabled = true;
        this.store.dispatch(new RemoveTenantField({ id: item.id, tenantId: this.tenant }));
      }
    });
  }

  async checkIfFieldIsUsed(item: IConfigurableListItem): Promise<number> {
    try {
      let schemasWithThisField = await this.schemasService.getSchemasByFieldId(this.tenant, item.id);
      return schemasWithThisField.length;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  createParamName(item: IConfigurableListItem): string {
    let name = FieldTypeNameMap.get(item.type).viewValue;
    return name;
  }

  onFilterChange(e: MatButtonToggleChange, state: TenantFieldsStateWrapper): void {
    this.selectedType = e.value;
    state.changeFilter(this.selectedType);
    this.updateCurrentWorkItems(state);
    if (this.listContainer) {
      this.scrollToTop(this.listContainer.nativeElement);
    }
  }

  onFieldSave(field: IConfigurableListItem): void {
    if (!field.id) {
      this.addField(field);
    } else {
      this.updateField(field);
    }
  }

  addField(field: IConfigurableListItem): void {
    if (
      this.allTenantFields.findIndex(
        (x) => x.name.toLowerCase() === field.name.toLowerCase() || x.viewName.toLowerCase() === field.viewName.toLowerCase()
      ) >= 0
    ) {
      this.snackbar.open(this.ts.instant('Field name already exists'), 'OK', { duration: 2000 });
      this.dialog.closeAll();
    } else {
      this.dialog.closeAll();
      this.updateItem = undefined;
      // new fields shall have the last index in the list of existing fields
      field.configuration.position = this.allTenantFields.length;
      this.store.dispatch(
        new AddOrUpdateTenantField({
          item: field,
          tenantId: this.tenant
        })
      );
    }
  }

  updateField(field: IConfigurableListItem): void {
    const fieldsWithoutCurrentField = this.allTenantFields.filter((x) => x.id !== field.id && x.name !== field.name);
    if (
      fieldsWithoutCurrentField.findIndex(
        (x) => x.name.toLowerCase() === field.name.toLowerCase() || x.viewName.toLowerCase() === field.viewName.toLowerCase()
      ) >= 0
    ) {
      this.snackbar.open(this.ts.instant('Field name already exists'), 'OK', { duration: 2000 });
      this.dialog.closeAll();
    } else {
      this.dialog.closeAll();
      this.updateItem = undefined;

      this.store.dispatch(
        new AddOrUpdateTenantField({
          item: field,
          tenantId: this.tenant
        })
      );
    }
  }

  private openDialog(template: TemplateRef<any>, panelClass?: string | string[], minWidth: number = 300): Observable<any> {
    return this.dialog
      .open(template, <MatDialogConfig>{
        minWidth,
        maxHeight: '95vh',
        maxWidth: '95vw',
        panelClass,
        disableClose: true
      })
      .afterClosed()
      .pipe(filter((x) => !!x));
  }

  removeQuickSearchTerm(): void {
    this.qsTerm = '';
  }

  updateCurrentWorkItems(state: TenantFieldsStateWrapper): void {
    state.workItems$.pipe(take(1)).subscribe((x) => {
      this.currentWorkItems = x?.sort((a, b) => a?.configuration?.position - b?.configuration?.position);
      if (x.length > 0) {
        this.filterWorkItems();
      }
    });
  }

  filterWorkItems(clear?: boolean): void {
    if (clear) this.qsTerm = '';
    if (this.qsTerm.length === 0) {
      this.filteredWorkItems = cloneDeep(this.currentWorkItems);
    } else {
      this.filteredWorkItems = this.currentWorkItems.filter((x) =>
        x?.displayName?.trim().toLowerCase().includes(this.qsTerm.trim().toLowerCase())
      );
    }
  }
}
