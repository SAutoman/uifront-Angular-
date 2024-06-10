/**
 * global
 */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';

import { BehaviorSubject, from, Observable } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * project
 */

import {
  AreaTypeEnum,
  AreaTypeList,
  AreaTypeMap,
  AreaTypeObj,
  FieldTypeIds,
  FieldTypeNameMap,
  FieldTypeSimpleFields,
  IFieldValidatorUi,
  IAreaTypeObj,
  ListDto,
  ListsService,
  PagedData,
  ValidatorTypeMap,
  FieldRenderTypeEnum,
  ListItemDisplayEnum,
  ListItemDisplayOptions,
  ListItemDisplayMap,
  ValidatorType
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { IFormlyView, KeyValueView, IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import { formValueToValidators, ValidatorValue } from '@wfm/common/field-validators';
import { convertFieldName, emptyStringValidatorAsRequiredFn } from '@wfm/service-layer/helpers';

/**
 * local
 */
import { IFieldValidatorsOutputEvent } from '../field-validators/i-field-validators-output.event';
import { IFieldDefaultValueOutput } from '../field-default-value/i-field-default-value-output-event';
import { DefaultValueTypeEnum } from '../field-default-value/FieldDefaultValues';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';

import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { INumberFormatOutput } from '../number-field-format/i-number-field-format-output-event';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IFieldHighlightOutput } from '../field-highlights/field-highlights.component';
import { IFieldHyperlinkSettingsOutput } from '../field-hyperlink-settings/field-hyperlink-settings.component';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { AutoIncrementSettingsOutput } from '../auto-increment-field/auto-increment-field.component';
import { ThumbnailSettingsOutput } from '../thumbnail-settings/thumbnail-settings.component';
import { ApplicationState, schemasAsFieldSelector } from '@wfm/store';
import { FileNameSettingEnum } from '../file-name-settings/file-name-settings.component';

type Key = keyof IConfigurableListItem & string;
const nameKey: Key = 'name';
const typeKey: Key = 'type';
const listIdKey: Key = 'listId';
const schemaIdKey: Key = 'schemaId';
const listItemDisplaySettingKey: Key = 'listItemDisplaySetting';
const renderKey: Key = 'renderType';
const isExternalIdKey = 'isExternalIdentifier';
const isReadonlyKey: Key = 'isReadonly';
const addNumberFormatKey: Key = 'addNumberFormat';
const useAll = AreaTypeMap.get(AreaTypeEnum.all);
const titleKey = 'fieldTitle';

const renderOptionsMap = {
  radio: { key: FieldRenderTypeEnum.radio, value: FieldRenderTypeEnum.radio, viewValue: 'Radio Buttons' },
  checkbox: { key: FieldRenderTypeEnum.checkbox, value: FieldRenderTypeEnum.checkbox, viewValue: 'Checkbox' },
  select: {
    key: FieldRenderTypeEnum.select,
    value: FieldRenderTypeEnum.select,
    viewValue: 'Select Box',
    templateOptions: { appearance: 'outline' }
  }
};

interface IField {
  name: string;
  type: FieldTypeIds;
  listId?: string;
  listItemDisplaySetting?: ListItemDisplayEnum;
  isList: boolean;
  renderType?: FieldRenderTypeEnum;
  isReadonly?: boolean;
  addNumberFormat?: boolean;
  fieldTitle?: string;
  isExternalIdentifier?: boolean;
}
interface IView {
  field: IFormlyView<IField>;
  useIn: IFormlyView<IAreaTypeObj<boolean>>;
  /**
   * used by FieldValidators component
   */
  fieldType$: BehaviorSubject<FieldTypeIds>;
  /**
   * used by Default Value component
   */
  listId$?: BehaviorSubject<string>;
  tenantId: string;
  validators?: IFieldValidatorsOutputEvent;
  deaultValue?: IFieldDefaultValueOutput;
  numberFormat?: INumberFormatOutput;
  highlights?: IFieldHighlightOutput;
  hyperlinkSettings?: IFieldHyperlinkSettingsOutput;
  autoIncrementSettings?: AutoIncrementSettingsOutput;
  thumbnailSettings?: ThumbnailSettingsOutput;
  fileNameSetting?: FileNameSettingEnum;
}

@Component({
  selector: 'app-field-editor',
  templateUrl: './field-editor.component.html',
  styleUrls: ['./field-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: '' } }]
})
export class FieldEditorComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Input() isSchemaBuilder: boolean;
  @Input() useApplyTo = true;
  @Input() hideComputeValueOption?: boolean;
  @Input() areaType: AreaTypeEnum;
  @Input() allowExternalIdentifier?: boolean;
  view$: Observable<IView>;
  @Output() save = new EventEmitter<IConfigurableListItem>();
  isUpdate = false;

  disableSaveBtn: boolean = false;

  isValidatorFormDirty: boolean = false;
  isDefaultValueFormDirty: boolean = false;
  addNumberFormatting: boolean = false;
  lists: ListDto[];
  schemas: IConfigurableListItem[];

  get fieldTypes() {
    return FieldTypeIds;
  }

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  constructor(
    private store: Store<ApplicationState>,
    private listsService: ListsService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private ts: TranslateService,
    private snackBar: MatSnackBar
  ) {
    super(store, false);
  }

  ngOnInit(): void {
    this.isUpdate = !!this.field;
    this.getSchemasAsFields();
    this.view$ = this.createView();
  }

  isValidForm(view: IView): boolean {
    const form = view.field.form.valid;
    const useIn = view.useIn.form.valid;
    const isNumberFormatValid = this.addNumberFormatting ? view.numberFormat?.valid : true;
    const highlightsValid = view.highlights ? view.highlights.valid : true;
    const isDefaultClauseValid = view.deaultValue ? view.deaultValue.valid : true;
    const isHyperlinkClauseValid = view.hyperlinkSettings ? view.hyperlinkSettings.valid : true;
    const isAutoIncrementSettingValid = view.autoIncrementSettings ? view.autoIncrementSettings.valid : true;
    const thumbnailSettingValid = view?.thumbnailSettings ? view?.thumbnailSettings?.valid : true;
    let validators = true;
    if (view.validators) {
      validators = view.validators.valid;
    }
    return (
      form &&
      useIn &&
      validators &&
      isNumberFormatValid &&
      highlightsValid &&
      isDefaultClauseValid &&
      isHyperlinkClauseValid &&
      isAutoIncrementSettingValid &&
      thumbnailSettingValid
    );
  }

  onClose(view: IView): void {
    if (view.field.form.dirty || view.useIn.form.dirty || this.isDefaultValueFormDirty || this.isValidatorFormDirty) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      dialogRef.afterClosed().subscribe((x) => {
        if (x) this.dialog.closeAll();
      });
    } else this.dialog.closeAll();
  }

  onSaveForm(view: IView): void {
    this.disableSaveBtn = true;
    const item = this.createFieldItem(view);
    if (item) {
      item.tenantId = view.tenantId;
      this.save.next(cloneDeep(item));
    }
  }

  onValidatorsUpdate(e: IFieldValidatorsOutputEvent, view: IView): void {
    const inputValidators = e.valid ? [...e.validators] : [];

    view.validators = {
      valid: e.valid,
      validators: inputValidators
    };
    if (e.dirty) this.isValidatorFormDirty = true;
  }

  /**
   * create a stream for all the data used in template
   */
  private createView(): Observable<IView> {
    return this.tenant$.pipe(
      switchMap((tenantId) => {
        return from(this.listsService.getLists(tenantId)).pipe(
          map((data: PagedData<ListDto>) => {
            this.lists = data.items;
            return {
              tenantId,
              data
            };
          })
        );
      }),
      map(({ tenantId, data }: { tenantId: string; data: PagedData<ListDto> }) => {
        const view: IView = {
          field: this.createFieldView(tenantId, data),
          useIn: this.createUseInView(),
          fieldType$: new BehaviorSubject(this.field?.type || undefined),
          listId$: new BehaviorSubject(this.field?.configuration?.listId || undefined),
          tenantId
        };
        setTimeout(() => {
          let listIdField = view.field.fields.find((f) => f.key === listIdKey);
          if (listIdField) {
            listIdField.formControl.valueChanges.subscribe((listId) => {
              view.listId$.next(listId);
              const listItemDisplay = view.field.fields.find((x) => x.key === listItemDisplaySettingKey);
              if (listId) {
                this.toggleListItemDisplaySetting(listId, listItemDisplay);
              }
            });
          }

          view.field.form.get(typeKey).valueChanges.subscribe(() => {
            // when the field type changes we want to reset the listRef value (and also the observable default value issubscribed to) and field default value that was selected for another field type;
            delete this.field?.configuration?.value;
            view.listId$.next('');
            const listItemDisplay = view.field.fields.find((x) => x.key === listItemDisplaySettingKey);
            const listRefField = view.field.fields.find((x) => x.key === listIdKey);

            listRefField.formControl.patchValue('');
            const renderField = view.field.fields.find((x) => x.key === renderKey);
            const addNumberFormat = view.field.fields.find((x) => x.key === addNumberFormatKey);
            addNumberFormat.hide = true;
            const type = view.field.model[typeKey];
            switch (type) {
              // case FieldTypeIds.Radio:
              case FieldTypeIds.ListField:
                listRefField.hide = false;
                listRefField.templateOptions.required = true;

                renderField.templateOptions.options = [renderOptionsMap.select, renderOptionsMap.radio];
                renderField.formControl.setValue(FieldRenderTypeEnum.select);
                renderField.templateOptions.required = true;
              case FieldTypeIds.MultiselectListField:
                listRefField.hide = false;
                listRefField.templateOptions.required = true;
                renderField.hide = type === FieldTypeIds.MultiselectListField ? true : false;
                break;
              case FieldTypeIds.BoolField:
                listRefField.hide = true;
                listRefField.templateOptions.required = false;

                listItemDisplay.hide = true;
                listItemDisplay.templateOptions.required = false;

                renderField.formControl.setValue(FieldRenderTypeEnum.checkbox);
                renderField.hide = false;
                renderField.templateOptions.required = true;
                renderField.templateOptions.options = [renderOptionsMap.checkbox, renderOptionsMap.radio];
                break;
              case FieldTypeIds.DecimalField:
              case FieldTypeIds.IntField:
                addNumberFormat.hide = false;
                addNumberFormat.formControl.setValue(false);
                break;
              default:
                listRefField.templateOptions.required = false;
                listRefField.hide = true;
                listItemDisplay.hide = true;
                listItemDisplay.templateOptions.required = false;

                renderField.hide = true;
                renderField.templateOptions.required = false;
                break;
            }
            if (type) {
              view.fieldType$.next(type);
            }
          });
          if (this.useApplyTo) {
            view.useIn.form
              .get(useAll.key)
              .valueChanges.pipe(takeUntil(this.destroyed$))
              .subscribe((value) => {
                Object.keys(view.useIn.form.controls)
                  .filter((x) => x !== useAll.key)
                  .forEach((ctrlKey) => {
                    const control = view.useIn.form.controls[ctrlKey];
                    if (value) {
                      control.patchValue(true, { onlySelf: true, emitEvent: false });
                      control.disable();
                    } else {
                      control.enable();
                      control.patchValue(false);
                    }
                  });
              });
          }
        });
        return view;
      })
    );
  }

  private toggleListItemDisplaySetting(listId: string, listItemDisplay: FormlyFieldConfig): void {
    const selectedList = this.lists.find((list) => list.id === listId);
    if (selectedList?.listItemKeyEnabled) {
      listItemDisplay.hide = false;
      listItemDisplay.templateOptions.required = true;
    } else {
      listItemDisplay.hide = true;
      listItemDisplay.templateOptions.required = false;
    }
  }

  /**
   * create a stream for field's name and type related data
   */
  private createFieldView(tenantId: string, data: PagedData<ListDto>): IFormlyView<IField> {
    const model: IField = {
      name: '',
      type: undefined,
      listId: undefined,
      isList: false,
      isExternalIdentifier: false,
      isReadonly: false,
      addNumberFormat: false,
      listItemDisplaySetting: ListItemDisplayEnum.None
    };
    if (this.isUpdate) {
      model.name = this.field.name;
      model.fieldTitle = this.field.viewName;
      model.type = this.field.type;
      model.listId = this.field.configuration.listId;
      model.isList = !!model.listId;
      model.isReadonly = this.field.configuration.readonly;
      model.isExternalIdentifier = this.field.configuration.isExternalIdentifier;
      if (this.field.configuration.renderType) {
        model.renderType = this.field.configuration.renderType;
      }
      if (this.field.configuration.numberFormatting) {
        model.addNumberFormat = true;
        this.addNumberFormatting = true;
      }
      if (this.field.configuration.listItemDisplaySetting) {
        model.listItemDisplaySetting = this.field.configuration.listItemDisplaySetting;
      }
    }

    const nameField = FormlyFieldAdapterFactory.createAdapter({
      name: nameKey as string,
      type: FieldTypeIds.StringField,
      label: this.ts.instant('Field Name'),
      required: true,
      value: model.name,
      disabled: this.isUpdate ? true : false
    }).getConfig();

    nameField.validators = Object.assign(nameField.validators || {}, {
      required: {
        expression: (x) => !emptyStringValidatorAsRequiredFn()(x)
      }
    });

    nameField.templateOptions = {
      ...nameField.templateOptions,
      pattern: '^[A-Za-z].*$',
      description: this.ts.instant('Field reference (for internal usage)'),
      blur: () => {
        if (nameField.form.controls?.name?.valid) nameField?.form?.controls?.name?.setValue(convertFieldName(model[nameKey]));
      },
      keyup: () => {
        nameField?.form?.controls?.fieldTitle?.setValue(model[nameKey]);
      }
    };

    nameField.validation = {
      messages: {
        pattern: (error, field: FormlyFieldConfig) => `Name should not start with a digit & can contain alphanumeric values only.`
      }
    };

    const titleField = FormlyFieldAdapterFactory.createAdapter({
      name: titleKey,
      type: FieldTypeIds.StringField,
      label: 'Field Title',
      value: model.fieldTitle,
      required: true
    }).getConfig();

    titleField.templateOptions.description = this.ts.instant('Field label visible within the app');

    const typeField = FormlyFieldAdapterFactory.createAdapter({
      name: typeKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Field Type'),
      required: true,
      valueInfo: {
        options: [...FieldTypeSimpleFields, FieldTypeIds.ListField, FieldTypeIds.MultiselectListField].map((x) => FieldTypeNameMap.get(x))
      },
      value: model[typeKey]
    }).getConfig();

    typeField.templateOptions.labelProp = 'viewValue';
    // do not let to change the field type of an existing tenant field
    typeField.templateOptions.disabled = this.field && !this.field.isClientId;

    // listOfLinks field type is also not to be editable
    if (this.field && this.field.type === FieldTypeIds.ListOfLinksField) {
      typeField.templateOptions.options = [FieldTypeNameMap.get(FieldTypeIds.ListOfLinksField)];
      typeField.templateOptions.disabled = true;
    }

    // for ListOfLinksField and EmbededFIeld type
    // readonly control used as label to show the referenced schema
    const schemaRefField = FormlyFieldAdapterFactory.createAdapter({
      name: schemaIdKey,
      type: FieldTypeIds.StringField,
      label: this.ts.instant('Referenced Schema'),
      required: false,
      value: this.getReferencedSchemaLabel(this.field?.configuration?.schemaId)
    }).getConfig();

    schemaRefField.templateOptions.disabled = this.field && !this.field.isClientId;

    schemaRefField.hide = !this.field || this.field.type !== FieldTypeIds.ListOfLinksField;

    const listRefField = FormlyFieldAdapterFactory.createAdapter({
      name: listIdKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('List Name'),
      required: false,
      valueInfo: {
        options: data.items.filter((x) => x.tenantPublicId === tenantId).map((x) => new KeyValueView(x.id, x.id, x.name))
      },
      value: model[listIdKey]
    }).getConfig();

    listRefField.templateOptions.disabled = this.field && !this.field.isClientId;

    listRefField.hide = !model.isList;
    listRefField.templateOptions.labelProp = 'viewValue';

    const listItemDisplaySetting = FormlyFieldAdapterFactory.createAdapter({
      name: listItemDisplaySettingKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('List Options Display Settings'),
      required: false,
      valueInfo: {
        options: ListItemDisplayOptions.map((x) => ListItemDisplayMap.get(x))
      },
      value: model[listItemDisplaySettingKey]
    }).getConfig();

    listItemDisplaySetting.hide = true;
    if (model[listIdKey]) {
      const selectedList = data.items.find((list) => list.id === model[listIdKey]);
      listItemDisplaySetting.hide = !selectedList.listItemKeyEnabled;
    }
    listItemDisplaySetting.templateOptions.labelProp = 'viewValue';

    let renderOptions = [renderOptionsMap.radio];
    if (model.type === FieldTypeIds.BoolField) {
      renderOptions.push(renderOptionsMap.checkbox);
    } else if (model.type === FieldTypeIds.ListField || model.type === FieldTypeIds.MultiselectListField) {
      renderOptions.push(renderOptionsMap.select);
    }

    const renderField = FormlyFieldAdapterFactory.createAdapter({
      name: renderKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Select Rendering Option'),
      required: false,
      valueInfo: {
        options: renderOptions
      },
      value: model[renderKey]
    }).getConfig();

    renderField.hide = model.type !== FieldTypeIds.ListField && model.type !== FieldTypeIds.BoolField;
    renderField.templateOptions.labelProp = 'viewValue';

    //  is External Identifier
    const isExternalIdentifier = FormlyFieldAdapterFactory.createAdapter({
      name: isExternalIdKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Make External Identifier'),
      required: false,
      disabled: !this.allowExternalIdentifier,
      value: model[isExternalIdKey]
    }).getConfig();

    isExternalIdentifier.hideExpression = (model: IField) =>
      !this.isSchemaBuilder || (model.type !== FieldTypeIds.StringField && model.type !== FieldTypeIds.IntField);

    isExternalIdentifier.hooks = {
      afterViewInit: (config: FormlyFieldConfig) => {
        setTimeout(() => {
          config.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
            if (x) {
              this.dialog.open(ConfirmActionComponent, {
                data: {
                  title: this.ts.instant('Warning'),
                  message: this.ts.instant('External Identifier can not be modified once saved'),
                  showProceedBtn: true,
                  hideCancelBtn: true
                }
              });
            }
          });
        }, 500);
      }
    };

    //  is Readonly
    const isReadonlyField = FormlyFieldAdapterFactory.createAdapter({
      name: isReadonlyKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Make Field ReadOnly'),
      required: false,

      value: model[isReadonlyKey]
    }).getConfig();

    isReadonlyField.hide = model.type === FieldTypeIds.EmbededField || model.type == FieldTypeIds.ListOfLinksField;

    //  has number formatting
    const enableNumberFormatting = FormlyFieldAdapterFactory.createAdapter({
      name: addNumberFormatKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Add Number Formatting'),
      required: false,
      value: model[addNumberFormatKey]
    }).getConfig();
    enableNumberFormatting.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            takeUntil(this.destroyed$),
            tap((newValue) => {
              this.addNumberFormatting = newValue;
            })
          )
          .subscribe();
      }
    };
    enableNumberFormatting.hide = model.type !== FieldTypeIds.DecimalField && model.type !== FieldTypeIds.IntField;

    nameField.className = 'col-12';
    titleField.className = 'col-12';
    typeField.className = 'col-12';
    schemaRefField.className = 'col-12';
    listRefField.className = 'col-12';
    listItemDisplaySetting.className = 'col-12';
    renderField.className = 'col-12';
    isExternalIdentifier.className = 'col-6';
    isReadonlyField.className = 'col-6';
    enableNumberFormatting.className = 'col-12';

    const fields = [
      nameField,
      titleField,
      typeField,
      schemaRefField,
      listRefField,
      listItemDisplaySetting,
      renderField,
      isExternalIdentifier,
      isReadonlyField,
      enableNumberFormatting
    ];

    const view: IFormlyView<IField> = {
      form: this.fb.group({}),
      fields,
      model
    };
    return view;
  }

  /**
   * create a stream for area selector data
   */
  private createUseInView(): IFormlyView<IAreaTypeObj<boolean>> {
    const model = this.field?.useInObj || new AreaTypeObj([AreaTypeEnum.all]);

    const fields = AreaTypeList.map((x) => {
      const enumVal = AreaTypeMap.get(x);

      let value = false;
      if (this.isUpdate) {
        value = model[enumVal.key];
      } else if (enumVal.value === useAll.value) {
        value = true;
      }

      const dto: FormVariableDto = {
        label: this.ts.instant(enumVal.viewValue),
        name: enumVal.key,
        type: FieldTypeIds.BoolField,
        value: value
      };

      const adapter = FormlyFieldAdapterFactory.createAdapter(dto);
      const config = adapter.getConfig();

      config.className = 'col-6';
      return config;
    });

    const view: IFormlyView<IAreaTypeObj<boolean>> = {
      form: this.fb.group({}),
      fields,
      model
    };
    if (model.all) {
      fields
        .filter((x) => x.key !== useAll.key)
        .forEach((x) => {
          x.templateOptions.disabled = true;
          x.defaultValue = true;
        });
      model.case = true;
      model.rawData = true;
      model.stepForm = true;
      model.comment = true;
    }

    return view;
  }

  /**
   * create/update field based on the selected areas, name, type and validators provided
   */
  private createFieldItem(view: IView): IConfigurableListItem {
    const field = view.field.model;
    const useInObj = view.useIn.model;
    const validatorEvent = view.validators;
    const defaultValueEvent = view.deaultValue;
    const inputValidators = validatorEvent?.validators || [];
    const numberFormat = view.numberFormat;
    const highlights = view.highlights;
    const hyperlinkSettings = view.hyperlinkSettings;
    const type: FieldTypeIds = view.field.form.get(typeKey).value;
    const validatorValue: ValidatorValue = {} as any;
    const listItemDisplaySetting = view.field.form.get(listItemDisplaySettingKey)?.value;
    const autoIncrementSettings = view.autoIncrementSettings;
    const thumbnailSettings = view?.thumbnailSettings;
    const fileNameSetting = view?.fileNameSetting;

    inputValidators.forEach((x) => {
      const kv = ValidatorTypeMap.get(x.key);
      validatorValue[kv.key] = x.value;
    });
    const outputValidators: IFieldValidatorUi[] = formValueToValidators(validatorValue, type).map((x) => x.value);

    if (field?.isExternalIdentifier) {
      const hasRequiredValidator = outputValidators.find((x) => x.validatorType === ValidatorType.Required);
      if (!hasRequiredValidator) {
        const requiredValidator = { isValid: true, validatorType: ValidatorType.Required, fieldType: type, required: true };
        outputValidators.push(requiredValidator);
      }
    }

    const item: IConfigurableListItem = {
      ...this.field,
      id: this.field?.id || undefined,
      name: !this.field?.isCustom && this.field?.fieldName ? this.field.fieldName : convertFieldName(field.name),
      viewName: field?.fieldTitle ? field.fieldTitle : field.name,
      type: field.type,
      useIn: [],
      useInObj: useInObj,
      configuration: Object.assign(this.field?.configuration || { position: 0 }, {
        listId: field.listId,
        validators: outputValidators,
        readonly: field.isReadonly,
        isExternalIdentifier: field.isExternalIdentifier
      })
    };

    if (this.isDuplicateSystemField(item)) {
      this.snackBar.open(`${`Field with System Key '${field.name}' not allowed`}`, 'CLOSE', {
        duration: 2000,
        verticalPosition: 'top',
        panelClass: 'text-warning'
      });
      return;
    }
    // number formatting settings
    else if (numberFormat) {
      item.configuration.numberFormatting = numberFormat;
    } else {
      delete item.configuration.numberFormatting;
    }
    // highlights settings
    if (highlights?.allowHighlighting) {
      item.configuration = {
        ...item.configuration,
        allowHighlighting: highlights.allowHighlighting,
        highlightColor: highlights.highlightColor
      };
    } else {
      delete item.configuration.allowHighlighting;
      delete item.configuration.highlightColor;
    }
    // hyperlink settings

    if (hyperlinkSettings?.isHyperlink) {
      item.configuration = {
        ...item.configuration,
        isHyperlink: hyperlinkSettings.isHyperlink,
        hyperlinkTemplate: hyperlinkSettings.hyperlinkTemplate,
        hyperLinkVisibility: hyperlinkSettings.hyperLinkVisibility,
        customHyperlinkLabel: hyperlinkSettings.customHyperLinkLabel
      };
    } else {
      delete item.configuration.isHyperlink;
      delete item.configuration.hyperlinkTemplate;
    }

    // auto increment settings
    if (autoIncrementSettings?.isAutoIncremented) {
      item.configuration = {
        ...item.configuration,
        isAutoIncremented: autoIncrementSettings.isAutoIncremented,
        defaultIncrementValue: autoIncrementSettings.defaultIncrementValue
      };
    } else {
      delete item.configuration.isAutoIncremented;
      delete item.configuration.defaultIncrementValue;
    }

    // Thumbnail Settings
    if (thumbnailSettings?.thumbnailEnabled) {
      item.configuration = {
        ...item.configuration,
        thumbnailEnabled: thumbnailSettings.thumbnailEnabled,
        imageMaxSize: thumbnailSettings.imageMaxSize,
        aspectRatio: thumbnailSettings?.aspectRatio
      };
    } else {
      item.configuration.thumbnailEnabled = false;
      delete item.configuration.imageMaxSize;
      delete item.configuration.aspectRatio;
    }

    // File Name Setting
    if (item.type === FieldTypeIds.FileField)
      item.configuration.fileNameSetting = fileNameSetting ? fileNameSetting : FileNameSettingEnum.default;
    else delete item.configuration.fileNameSetting;

    if (field.listId) {
      const selectedList = this.lists.find((list) => list.id === field.listId);
      if (selectedList.listItemKeyEnabled) {
        item.configuration.listItemDisplaySetting = listItemDisplaySetting;
      } else {
        delete item.configuration.listItemDisplaySetting;
      }
    }

    if (field.type === FieldTypeIds.ListField || field.type === FieldTypeIds.MultiselectListField) {
      item.configuration.renderType = field.renderType || FieldRenderTypeEnum.select;
    } else if (field.type === FieldTypeIds.BoolField) {
      item.configuration.renderType = field.renderType || FieldRenderTypeEnum.checkbox;
    }

    this.setDefaultValue(item, defaultValueEvent);

    Object.keys(useInObj)
      .filter((x) => !!useInObj[x])
      .forEach((x) => {
        const enumVal = AreaTypeMap.get(x);
        if (enumVal) {
          item.useIn.push(enumVal.value);
        }
      });
    return item;
  }

  isDuplicateSystemField(field: IConfigurableListItem<IFieldConfiguration>): boolean {
    const systemFields: string[] = [
      GridSystemFieldsEnum.STATUS,
      GridSystemFieldsEnum.AUDITORS,
      GridSystemFieldsEnum.CREATED_AT,
      GridSystemFieldsEnum.EMAIL_COUNT,
      GridSystemFieldsEnum.SUPPLIERS,
      GridSystemFieldsEnum.UPDATED_AT,
      GridSystemFieldsEnum.INFO,
      GridSystemFieldsEnum.ACTIONS
    ];
    if (systemFields.includes(field.name)) {
      return true;
    } else return false;
  }

  /**
   * add the default value configs into the field configuration
   * @param field
   * @param event
   * @returns
   */
  setDefaultValue(field: IConfigurableListItem, event: IFieldDefaultValueOutput): IConfigurableListItem {
    if (field.configuration && event) {
      field.configuration.defaultValueType = event.defaultValueType;

      delete field.configuration.value;

      delete field.configuration.dynamicValue;
      delete field.configuration.isSystemDefault;
      delete field.configuration.systemDefaultType;
      delete field.configuration.systemDefaultEvent;
      delete field.configuration.computeDefaultValueFormula;

      switch (event.defaultValueType) {
        case DefaultValueTypeEnum.static:
          field.configuration.value = event.value;
          break;
        case DefaultValueTypeEnum.dynamic:
          field.configuration.dynamicValue = event.dynamicValueType;
          break;
        case DefaultValueTypeEnum.system:
          field.configuration.isSystemDefault = true;
          field.configuration.systemDefaultType = event.systemValueType;
          field.configuration.systemDefaultEvent = event.systemEventType;
          break;
        case DefaultValueTypeEnum.computed:
          field.configuration.computeDefaultValueFormula = event.computeDefaultValueFormula;
          field.configuration.computeTriggerEvent = event.computeTriggerEvent;
          break;
        default:
          delete field.configuration.defaultValueType;
          break;
      }
    }
    return field;
  }

  onModelChange(event: AreaTypeObj, view: IView): void {
    if (Object.values(event).filter((x) => x).length === Object.values(event).length - 1) {
      view.useIn.form.controls.all.setValue(true);
    }
  }

  defaultValueUpdated(e: IFieldDefaultValueOutput, view: IView): void {
    view.deaultValue = { ...e };
    if (e.dirty) this.isDefaultValueFormDirty = true;
  }

  numberFormatUpdated(event: INumberFormatOutput, view: IView): void {
    view.numberFormat = event ? { ...event } : null;
  }

  highlightsConfigUpdated(event: IFieldHighlightOutput, view: IView): void {
    view.highlights = event ? { ...event } : null;
  }

  hyperlinkSettingsUpdated(event: IFieldHyperlinkSettingsOutput, view: IView): void {
    view.hyperlinkSettings = event ? { ...event } : null;
  }

  autoIncrementSettingsUpdate(event: AutoIncrementSettingsOutput, view: IView): void {
    view.autoIncrementSettings = event ? { ...event } : null;
  }

  /**
   * show/hide the hyperlink builder dynamically based on the selected field type
   */
  isHyperlinkBuilderVisible(fieldType: FieldTypeIds): boolean {
    // todo: add support for List field type
    return [
      FieldTypeIds.IntField,
      FieldTypeIds.StringField,
      FieldTypeIds.DecimalField,
      FieldTypeIds.BoolField,
      FieldTypeIds.TextareaField
    ].includes(fieldType);
  }

  isAutoIncrementSettingVisible(fieldType: FieldTypeIds): boolean {
    return (
      (this.areaType === AreaTypeEnum.case || this.areaType === AreaTypeEnum.stepForm) &&
      [FieldTypeIds.IntField, FieldTypeIds.DecimalField].includes(fieldType)
    );
  }

  thumbnailSettingsUpdate(event: ThumbnailSettingsOutput, view: IView): void {
    view.thumbnailSettings = event;
  }

  isFieldTypeFile(fieldType: FieldTypeIds, view: IView): boolean {
    return fieldType === FieldTypeIds.FileField;
  }

  onFileNameSettingChange(value: FileNameSettingEnum, view: IView): void {
    view.fileNameSetting = value;
  }

  getSchemasAsFields(): void {
    this.store
      .select(schemasAsFieldSelector)
      .pipe(
        filter((state) => !!state),
        take(1)
      )
      .subscribe((schemas) => (this.schemas = schemas));
  }

  getReferencedSchemaLabel(id: string): string {
    if (this.schemas?.length && id) {
      const sch = this.schemas.find((schema) => schema.id === id);
      if (sch) {
        return `${sch.name} (${this.ts.instant(AreaTypeMap.get(sch.area)?.viewValue)})`;
      }
    }
    return null;
  }
}
