/**
 * global
 */
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { remove, cloneDeep, findLastIndex, sortBy } from 'lodash-core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IFormlyView, IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';
import { AreaTypeEnum, AreaTypeMap, FieldTypeIds, FieldTypeNameMap, ListFieldsLink } from '@wfm/service-layer';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { LayoutSetup } from '@wfm/forms-flow-struct/page-form-builder/layout-setup';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import { IFieldsExpressionView } from '@wfm/forms-flow-struct';
import { convertFieldName, emptyStringValidatorAsRequiredFn, idPredicate } from '@wfm/service-layer/helpers';

/**
 * local
 */
import { IFormEvent, IFormUpdateInfo } from '../i-form.event';
import { SchemaEmbeddingTypeSelectComponent } from './schema-embedding-type-select/schema-embedding-type-select.component';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';

const nameKey = 'name';
const selectFieldsKey = 'selectFields';
interface IView {
  formDef: IFormlyView;
  formFields$: BehaviorSubject<IConfigurableListItem[]>;
  allFields: IConfigurableListItem[];
}

@Component({
  selector: 'app-form-builder-form',
  templateUrl: './form-builder-form.component.html',
  styleUrls: ['./form-builder-form.component.scss']
})
export class FormBuilderFormComponent extends TenantComponent implements OnInit {
  @Input() allFields$: Observable<IConfigurableListItem[]>;
  @Input() schemaId: string;
  @Input() linkedListFields: ListFieldsLink[];
  /**
   * the stream of selected fields, need to add all coming fields to this.fields
   */
  @Input() setFields$?: Observable<IConfigurableListItem[]>;
  @Input() setName$?: Observable<string>;
  @Input() layout: LayoutSetup;
  @Input() expressions: IFieldsExpressionView[];
  @Input() areaType: AreaTypeEnum;
  @Input() isExternalFieldIdentifierPresent: boolean;
  @Output() update = new EventEmitter<IFormEvent<IFormUpdateInfo>>();
  @Output() externalIdentifierEmitter = new EventEmitter<string>();

  view$: Observable<IView>;
  updateItem?: IConfigurableListItem;
  schemaName: string;
  private fields: IConfigurableListItem[] = [];
  private _view: IView;

  private addMap = new Map<string, IConfigurableListItem>();
  private updateMap = new Map<string, IConfigurableListItem>();
  private removeMap = new Map<string, IConfigurableListItem>();

  get FieldTypeNameMapGetter() {
    return FieldTypeNameMap;
  }

  private activeFieldMap = new Map<string, IConfigurableListItem>();

  get connectorFieldType() {
    return FieldTypeIds.ConnectorField;
  }
  constructor(
    store: Store<ApplicationState>,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminSchemasService: AdminSchemasService,
    private ts: TranslateService
  ) {
    super(store, true);
  }

  ngOnInit(): void {
    this.initView();
  }

  initView(): void {
    this.view$ = this.allFields$.pipe(
      map((allFields) => this.createView(allFields)),
      tap(() => {
        setTimeout(() => {
          if (this.setFields$) {
            this.setFields$.pipe(filter((x) => !!x)).subscribe(async (fields) => {
              if (!fields.length) {
                this.fields = [];
              } else {
                for (const field of fields) {
                  await this.addField(field, false, false, true);
                }
              }
              this.updateScope(true);
            });
          }
          if (this.setName$) {
            this.setName$.pipe(filter((x) => !!x)).subscribe((name) => {
              this.schemaName = name;
              if (this._view.formDef.form.get(nameKey)) {
                this._view.formDef.form.get(nameKey).patchValue(name);
                this.emitUpdateToParent();
              }
            });
          }
          this.updateScope(true);
        });
      })
    );
  }

  openDialogEditField(e: Event, template: TemplateRef<any>, item: IConfigurableListItem): void {
    this.updateItem = item;
    this.openDialog(template, ['page-tenant-fields--create-field-dialog']).subscribe();
  }

  onDrag(e: CdkDragDrop<IConfigurableListItem[]>): void {
    if (e.previousContainer === e.container) {
      const srcItem = e.container.data[e.previousIndex];
      if (srcItem.isLockedField) {
        return;
      }
      let lastIndex: number = findLastIndex(e.container.data, (x) => x.isLockedField);
      if (e.currentIndex > lastIndex) {
        lastIndex = e.currentIndex - 1;
      }
      const insertIndex = lastIndex + 1;
      moveItemInArray(e.container.data, e.previousIndex, insertIndex);
      this.fields = e.container.data;
      this.updateScope();
    }
  }

  onRemove(e: Event, fieldItem: IConfigurableListItem): void {
    const usedFunctions = this.getFuncsWithThisField(fieldItem, this.expressions);
    if (usedFunctions && usedFunctions.length) {
      const confirm = this.dialog.open(PopupConfirmComponent, {
        width: '400px',
        data: {
          title: this.ts.instant('Remove Item?'),
          message: `${this.ts.instant('Removing this item will break functions where you have used this field')} (${usedFunctions.join(
            ', '
          )}).`
        }
      });
      confirm.afterClosed().subscribe(async (result) => {
        if (result === true) {
          this.removeField(fieldItem);
        }
      });
    } else {
      const listLinks = this.checkForListLinks(fieldItem);
      if (listLinks) {
        const confirm = this.dialog.open(PopupConfirmComponent, {
          width: '400px',
          data: {
            title: this.ts.instant('Remove Item?'),
            message: `${this.ts.instant('Removing this field will break a parent-child list relation set in Schema Settings area')}`
          }
        });
        confirm.afterClosed().subscribe(async (result) => {
          if (result === true) {
            this.removeField(fieldItem);
          }
        });
      } else {
        this.removeField(fieldItem);
      }
    }
  }

  checkForListLinks(field: IConfigurableListItem): ListFieldsLink {
    if (field.type === FieldTypeIds.ListField || field.type === FieldTypeIds.MultiselectListField) {
      return this.linkedListFields?.find((link) => {
        return (
          link.childFieldPath.join(pathSeparator) === (field.fieldName || field.name) ||
          link.parentFieldPath.join(pathSeparator) === (field.fieldName || field.name)
        );
      });
    }
    return null;
  }

  removeField(fieldItem: IConfigurableListItem): void {
    this.removeMap.set(fieldItem.id, fieldItem);
    this.updateMap.delete(fieldItem.id);
    this.addMap.delete(fieldItem.id);
    remove(this.fields, idPredicate(fieldItem.id));
    this.updateScope();
  }

  createParamName(item: IConfigurableListItem): string {
    let name = FieldTypeNameMap.get(item.type).viewValue;
    return name;
  }

  onFieldUpdate(field: IConfigurableListItem): void {
    this.dialog.closeAll();
    if (!this.hasDuplicationInExistingFields(field, true)) {
      field.isChanged = true;
      this.updateMap.set(field.id, cloneDeep(field));
      const index = this.fields.findIndex(idPredicate(field.id));
      this.fields[index] = field;
      this.updateItem = undefined;
      if (field.configuration.isExternalIdentifier) {
        this.isExternalFieldIdentifierPresent = true;
        this.externalIdentifierEmitter.emit(field.name);
      }
      this.updateScope();
    }
  }

  getFuncsWithThisField(fieldItem: IConfigurableListItem, expressions: IFieldsExpressionView[]): string[] {
    if (!expressions || !expressions.length) {
      return [];
    }
    const foundExpressions = expressions.filter((exp: IFieldsExpressionView) => {
      return exp.selectedFieldIds?.includes(fieldItem.id) || exp.fieldsUsedInRules?.includes(fieldItem.id);
    });
    return foundExpressions?.map((f) => f.name) || [];
  }

  private createView(allFields: IConfigurableListItem[]): IView {
    allFields.sort((a, b) => a.type - b.type);
    const view: IView = {
      formDef: this.createForm(allFields),
      formFields$: new BehaviorSubject(this.fields),
      allFields: cloneDeep(allFields)
    };
    this._view = view;
    return view;
  }

  getAreaTypeName(area: AreaTypeEnum): string {
    return this.ts.instant(AreaTypeMap.get(area)?.viewValue);
  }

  getFieldViewName(field: IConfigurableListItem<IFieldConfiguration>): string {
    let fieldViewName = `${field.viewName} `;
    if (field.type === FieldTypeIds.SchemaField) {
      fieldViewName += `(${this.getAreaTypeName(field['area'])} Schema)`;
    } else {
      fieldViewName += `(${FieldTypeNameMap.get(field.type).viewValue})`;
    }
    return fieldViewName;

    // const fieldViewName = `${field.viewName} (${field.type ? FieldTypeNameMap.get(field.type).viewValue : ''})
    //     ${field.type === FieldTypeIds.SchemaField ? this.ts.instant('Area') + ' - ' + this.getAreaTypeName(field['area']) : ''}`;
    // return fieldViewName;
  }

  private createForm(allFields: IConfigurableListItem[]): IFormlyView {
    const model = {};

    const name = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant(this.layout.getSchemaNameFieldLabel()),
      name: nameKey,
      type: FieldTypeIds.StringField,
      value: '',
      required: true
    }).getConfig();
    name.formControl = this.fb.control(undefined, [emptyStringValidatorAsRequiredFn()]);

    const fieldsForUi = allFields.map((field) => {
      return {
        key: field.id,
        value: {
          ...field,
          viewName: this.getFieldViewName(field)
        },
        group: field.type !== FieldTypeIds.SchemaField ? 'Fields' : 'Schemas',
        viewValue: field?.viewName
      };
    });

    const selectField = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Field'),
      name: selectFieldsKey,
      type: FieldTypeIds.ListField,
      value: '',
      valueInfo: {
        options: fieldsForUi || []
      },
      autocomplete: true
    }).getConfig();

    selectField.formControl = this.fb.control(undefined);
    selectField.templateOptions.labelProp = 'viewValue';

    const fields: FormlyFieldConfig[] = [name, selectField];
    const view: IFormlyView = {
      form: this.fb.group(model),
      fields,
      model
    };

    selectField.formControl.valueChanges
      .pipe(
        filter((x) => !!x && typeof x === 'object' && !!x.value),
        map((x) => x.value)
      )
      .subscribe(async (itemSource: IConfigurableListItem) => {
        const originalItem = allFields.find((x) => x.id === itemSource.id);
        if (originalItem) {
          let item = cloneDeep(originalItem);
          // for schema type fields add a flag to identify later
          if (item.type === FieldTypeIds.SchemaField) {
            item.isSchema = true;
            let isRelationAllowed = true;

            if (this.schemaId) {
              isRelationAllowed = await this.adminSchemasService.checkForCircularDependency(this.tenant, this.schemaId, item.id);
            }
            if (!isRelationAllowed) {
              this.snackBar.open(this.ts.instant(`This schema cannot be embed not to have circular dependency`), 'CLOSE', {
                duration: 5000,
                verticalPosition: 'top',
                panelClass: 'text-warning'
              });
            } else {
              const selectPopup = this.dialog.open(SchemaEmbeddingTypeSelectComponent, {
                panelClass: 'schema-selector',
                disableClose: true
              });
              selectPopup.afterClosed().subscribe(async (selectedFieldType) => {
                if (selectedFieldType) {
                  let createItem: IConfigurableListItem = {
                    ...item,
                    type: selectedFieldType,
                    configuration: {
                      ...item.configuration,
                      schemaId: item.id,
                      schemaAreaType: item.area
                    }
                  };
                  if (selectedFieldType === FieldTypeIds.ListOfLinksField) {
                    createItem.name = convertFieldName(`list_of_links_${item.name}`);
                    createItem.isCustom = true;
                  } else if (selectedFieldType === FieldTypeIds.EmbededField) {
                    createItem.name = convertFieldName(`embedded_${item.name}`);
                    createItem.isCustom = true;
                  }
                  if (!this.hasDuplicationInExistingFields(createItem)) {
                    await this.addField(createItem, true, true, true, true);
                  }
                }
              });
            }
          } else {
            if (!this.hasDuplicationInExistingFields(item)) {
              await this.addField(item, true, true, true, true);
            }
          }
          selectField.formControl.reset(undefined, { onlySelf: true, emitEvent: false });
        }
      });
    name.formControl.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.emitUpdateToParent();
    });

    return view;
  }

  hasDuplicationInExistingFields(field: IConfigurableListItem, isUpdate?: boolean): boolean {
    let duplicationFieldFound: boolean = false;
    if (isUpdate) {
      // updating already added field
      const activeFields = Array.from(this.activeFieldMap.values());
      for (let i = 0; i < activeFields.length; i++) {
        const fieldItem = activeFields[i];
        if (fieldItem.name === field.name && fieldItem.id !== field.id) {
          duplicationFieldFound = true;
          break;
        }
      }
    } else if (this.activeFieldMap.has(field.fieldName || field.name)) {
      // adding a field
      duplicationFieldFound = true;
    } else if (field.type === FieldTypeIds.ListOfLinksField) {
      if (this.fields.find((x) => x?.configuration['schemaId'] === field.id)) duplicationFieldFound = true;
    }

    if (duplicationFieldFound) {
      this.snackBar.open(`${this.ts.instant('Field with the same key already exists in the schema')}: '${field.name}'`, 'CLOSE', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: 'text-warning'
      });
      return true;
    }
    return false;
  }

  private updatePositions(init?: boolean): void {
    this.rebuildFields();
    this.fields.forEach((x, idx) => {
      if (x.configuration.position !== idx) {
        x.configuration.position = idx;
        if (!init) x.isChanged = true;
      }
    });
  }

  private openDialog(template: TemplateRef<any>, panelClasses: string[] = [], minWidth: number = 300): Observable<any> {
    // panelClasses.push(this.themeClass);
    return this.dialog
      .open(template, {
        minWidth,
        panelClass: panelClasses,
        data: {
          allowExternalIdentifier: this.isExternalFieldIdentifierPresent
        }
      })
      .afterClosed()
      .pipe(filter((x) => !!x));
  }

  // add a field to the already selected fields (this.fields)
  async addField(
    field: IConfigurableListItem,
    emit = true,
    addToMap = true,
    sortOutputByPosition = false,
    isNewlySelected = false
  ): Promise<void> {
    if (this.hasDuplicationInExistingFields(field)) {
      return;
    }
    // when new custom field is being added or a field from
    // selectbox is selected, put them at the bottom of fields list
    if (field.isCustom || isNewlySelected) {
      field.configuration.position = this.fields?.length || 0;
    }

    // populate the fields of nested schemas here
    if (field.type === FieldTypeIds.EmbededField) {
      field = await this.populateNestedFieldsAndFunctions(field);
    }
    const sort = (items: IConfigurableListItem[]): IConfigurableListItem[] => sortBy(items, [(x) => x.configuration.position]);
    const lockedFields = sort([...this.fields].filter((x) => x.isLockedField));

    const unlockedFields = sort([...this.fields].filter((x) => !x.isLockedField));
    let insert = [cloneDeep(field), ...unlockedFields];
    if (sortOutputByPosition) {
      insert = sort(insert);
    }
    this.fields = [...lockedFields, ...insert];
    if (addToMap) {
      this.addMap.set(field.id, cloneDeep(field));
    }

    if (emit) {
      this.updateScope();
    }
  }

  private updateFieldsInTemplate(): void {
    const newFields = [...this.fields];
    this.activeFieldMap = new Map();
    newFields.forEach((x) => {
      this.activeFieldMap.set(x.fieldName || x.name, x);
    });
    this.fields = newFields;
    this._view.formFields$.next(newFields);
  }

  private emitUpdateToParent(): void {
    this.update.next(this.buildOutput());
  }

  private buildOutput(): IFormEvent<IFormUpdateInfo> {
    const view = this._view;
    const fields = cloneDeep(view.formFields$.getValue()) as IConfigurableListItem[];
    fields.forEach((f) => {
      f.configuration.schemaFieldId = f.id;
      f.configuration.ownerSchemaId = this.schemaId;
    });
    const event: IFormEvent<IFormUpdateInfo> = {
      formName: view.formDef.model[nameKey],
      fields: fields,
      valid: view.formDef.form.valid,
      changed:
        !view.formDef.form.pristine ||
        this.removeMap.size > 0 ||
        this.updateMap.size > 0 ||
        this.addMap.size > 0 ||
        fields.some((x) => x.isChanged),
      formRef: {
        addedFields: cloneDeep([...this.addMap.values()]),
        formFields: fields,
        removedFields: cloneDeep([...this.removeMap.values()]),
        updatedFields: cloneDeep([...this.updateMap.values()])
      }
    };
    return event;
  }

  private rebuildFields(): void {
    const lockedFields = [...this.fields].filter((x) => x.isLockedField);
    const unlockedFields = [...this.fields].filter((x) => !x.isLockedField);

    this.fields = [...lockedFields, ...unlockedFields];
  }

  private updateScope(init?: boolean): void {
    this.updatePositions(init);
    this.updateFieldsInTemplate();
    this.emitUpdateToParent();
  }

  /**
   * populate the fields of nested schemas (recursively do the same for deep nested schema fields)
   */
  async populateNestedFieldsAndFunctions(schemaField: IConfigurableListItem): Promise<IConfigurableListItem> {
    try {
      const schemaDto = await this.adminSchemasService.getSchema(
        this.tenant,
        schemaField.configuration?.schemaAreaType || schemaField.area,
        schemaField.configuration?.schemaId || schemaField.id
      );
      schemaField.fields = schemaDto.fields;
      schemaField.functions = schemaDto.functions;
      for (let field of schemaField.fields) {
        if (field.type === FieldTypeIds.EmbededField && !field.fields) {
          // recursion
          field = await this.populateNestedFieldsAndFunctions(field);
        }
      }
      return schemaField;
    } catch (err) {
      // skip field population for corrupted ones
      return schemaField;
    }
  }
}
