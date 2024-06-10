/**
 * global
 */
import { lowerFirst, cloneDeep, sortBy, isArray } from 'lodash-core';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, share, startWith, take, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { FormlyModel, IConfigurableListItem, IFieldConfiguration, IFormlyView } from '@wfm/common/models';
import {
  Addons,
  FormlyFieldAdapterFactory,
  FormlyFieldAdapterTypeEnum,
  FormVariableDto,
  IFormlyRightButtonAddonConfig,
  KeyValueDisabled
} from '@wfm/common/vendor';
import { AreaTypeEnum, FieldTypeIds, ManualCreationSettings, SchemaDto, ValidatorType } from '@wfm/service-layer';
import { IFunctionItemModel } from '@wfm/forms-flow-struct';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { FormlyHighlightsHelper, highlightsFormGroupKey } from '@wfm/service-layer/helpers/formly-highlights.helper';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { ComputedValueTriggerEventEnum, DefaultValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { IFormlyHyperlinkConfig } from '@wfm/common/vendor/formly-addons/formly-hyperlink-addon/formly-hyperlink-addon.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
/**
 * local
 */
import { ExpressionHelperService } from '../expression-helper.service';
import { schemaPermissionSettingsKey } from '@wfm/tenants/manual-creation-settings-by-schema/manual-creation-settings-by-schema.component';
import { tenantSettingsSelector } from '@wfm/store';
import { DynamicEntityCreateAnotherSetting } from '@wfm/tenants/manual-creation-settings-by-schema/create-another/create-another.component';
import { ConnectorRenderTypeEnum } from '@wfm/common/models/connector-field';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { populateListOptionValue } from '@wfm/service-layer/helpers/list-item-display.helper';
import { DynamicEntitySystemFields } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
export const formlyFieldDefaultClass = '';
export const activatedFormlyFieldClass = 'activatedFormlyField';
export const formlyFieldReadonlyClass = 'mat-form-field-readonly';

export interface FormlyDataOutput {
  form: FormGroup;
  model: FormlyModel;
  keepFormOpen?: boolean;
  allFieldsHiddenOrDisabled?: boolean;
  createForMultipleWorkflow?: boolean;
}

@Component({
  selector: 'app-form-builder-form-preview',
  templateUrl: './form-builder-form-preview.component.html',
  styleUrls: ['./form-builder-form-preview.component.scss'],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormBuilderFormPreviewComponent extends TenantComponent implements OnInit {
  @Input() fields$: Observable<IConfigurableListItem[]>;
  @Input() schema: SchemaDto;
  @Input() allowActionsFor?: AreaTypeEnum;
  @Input() isUpdate: boolean = false;
  @Input() isFormDisabled: boolean = false;
  @Input() isStepResolved?: boolean = false;
  @Input() allowStepHighlighting?: boolean = false;
  @Input() createDirectly: boolean;
  @Input() activeFieldPath: PropertyPath;
  @Input() dynamicEntityId?: string;
  @Input() hideCreateAndProceedBtn?: boolean;
  @Input() systemFields: DynamicEntitySystemFields;
  @Output() formValue: EventEmitter<FormlyDataOutput> = new EventEmitter();
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  @Output() caseProceed: EventEmitter<FormlyDataOutput> = new EventEmitter();
  /**
   * used to pass step form values back to wf-state-case-step component
   */
  @Output() stepFormValueEmitter: EventEmitter<FormlyDataOutput> = new EventEmitter();
  @Output() stepHighlightsEmitter: EventEmitter<FormlyModel> = new EventEmitter();
  @Output() fieldPathEmitter: EventEmitter<PropertyPath> = new EventEmitter();

  /**
   * all schema functions, including the nested schema functions
   */
  allFunctions?: IFunctionItemModel[];
  anyFormula: boolean = false;
  view$: Observable<IFormlyView>;
  model: FormlyModel;
  options: FormlyFormOptions = {};
  formSubmitted = false;
  localFieldsCopy: IConfigurableListItem[] = [];
  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  permissions: { add: boolean; edit: boolean } = { add: false, edit: false };

  keepFormOpen: boolean = false;
  showKeepOpenCheckbox: boolean = false;
  createAnotherItemSetting: DynamicEntityCreateAnotherSetting;
  constructor(
    private fb: FormBuilder,
    private expressionHelper: ExpressionHelperService,
    private adminSchemaService: AdminSchemasService,
    private store: Store<ApplicationState>,
    private dialog: MatDialog,
    private elementRef: ElementRef,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private ts: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    super(store);
  }
  ngOnInit(): void {}

  prepareFields(): void {
    this.view$ = this.fields$.pipe(
      filter((fields) => !!fields),
      map((fields) => {
        this.localFieldsCopy = cloneDeep(fields);
        fields = sortBy(fields || [], [(x) => x.configuration?.position]);
        if (fields?.length) {
          fields = this.updateSchemaFieldsPosition(fields);
        }
        if (this.schema) {
          this.checkForKeepOpenSettings();
          this.setSchemaPermissions();
          this.allFunctions = [];
          this.allFunctions = this.getAllFunctions(this.schema);
        }
        const fieldsCopies = cloneDeep(fields);
        const model = this.populateModel(fieldsCopies, {});
        this.populateFieldPaths(fields, []);
        const view: IFormlyView = {
          fields: fields.map((x) => this.toFormly(x)),
          form: this.fb.group({}),
          model: model
        };
        if (this.allowStepHighlighting) {
          view.form.addControl(highlightsFormGroupKey, this.fb.group({}));
          let highlightsGroup = view.form.get(highlightsFormGroupKey) as FormGroup;
          const highlightsModel = FormlyHighlightsHelper.populateHighlightsModel(view.fields, {});
          FormlyHighlightsHelper.addHighlightsControlsRecursively(highlightsModel, highlightsGroup);

          view.form
            .get(highlightsFormGroupKey)
            .valueChanges.pipe(takeUntil(this.destroyed$))
            .subscribe((newHighlightsValue) => {
              this.stepHighlightsEmitter.emit(newHighlightsValue);
            });
        }
        this.model = view.model;
        if (view.fields.length) {
          view.fields.forEach((fieldConfig) => {
            // schema functions
            fieldConfig = this.expressionHelper.addExpressionsRecursively(
              fieldConfig,
              fields,
              this.allFunctions,
              this.model,
              this.isFormDisabled || this.isStepResolved
            );

            // formulas
            fieldConfig = this.expressionHelper.addFormulas(fieldConfig, fields, this.model);

            fieldConfig = this.processParentChildListLink(fieldConfig, view);
          });
        }
        if (this.isFormDisabled || this.isStepResolved) {
          setTimeout(() => {
            view.form.disable({ emitEvent: false });
          }, 10);
        }
        if (this.allowActionsFor === AreaTypeEnum.stepForm) {
          view.form.valueChanges
            .pipe(
              filter((values) => !!values),
              distinctUntilChanged(),
              debounceTime(300),
              takeUntil(this.destroyed$)
            )
            .subscribe(() => {
              this.stepFormValueEmitter.emit({
                form: view.form,
                model: view.model,
                allFieldsHiddenOrDisabled: view.fields.every((field) => field.hide || field.templateOptions?.disabled)
              });
            });
          if (this.activeFieldPath) {
            this.scrollToActiveField();
          }
        }
        return view;
      }),
      share()
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.fields$?.currentValue) {
      this.prepareFields();
    }
  }

  populateFieldPaths(fields: IConfigurableListItem[], parentFieldPath: string[]): void {
    fields?.forEach((field) => {
      field.configuration.fieldPath = [...parentFieldPath, field.fieldName || field.name];
      if (field.fields) {
        this.populateFieldPaths(field.fields, field.configuration.fieldPath);
      }
    });
  }

  updateSchemaFieldsPosition(fields: IConfigurableListItem<IFieldConfiguration>[]): IConfigurableListItem<IFieldConfiguration>[] {
    fields = fields.sort((a, b) => {
      return a.configuration?.position - b?.configuration?.position;
    });
    fields.forEach((field) => {
      if (field?.fields?.length) {
        this.updateSchemaFieldsPosition(field?.fields);
      }
    });
    return fields;
  }

  scrollToActiveField(): void {
    const activeField = (<HTMLElement>this.elementRef.nativeElement).querySelector(`.${activatedFormlyFieldClass}`);
    activeField?.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * when making changes here we need consider updateing the nested schema handler too
   * check EmbeddedSchemaFieldAdapter.toFormlyField method
   */

  private toFormly(item: IConfigurableListItem): FormlyFieldConfig {
    // this is the templateOptions
    const dto: FormVariableDto = {
      label: item.viewName || item.name,
      name: item.fieldName || item.name,
      type: item.type,
      // used in formly custom field templates for disabling toggle buttons
      disableButtons: this.isFormDisabled || this.isStepResolved,
      disabled: item.isLockedField || item.configuration.disabledByRule,
      value: item.value || item.configuration?.value,
      valueInfo: {
        ...item.configuration,
        tenantId: this.tenant,
        ownerSchemaId: this.schema?.id,
        schemaFieldId: item.id,
        dynamicEntityId: this.dynamicEntityId
      },
      readonly: item.configuration?.readonly,
      placeholder: item.configuration?.placeholder || undefined,
      fields: item.fields, //used for schemas
      allowHighlightCheckbox: this.allowStepHighlighting
    };

    if (item.type === FieldTypeIds.ConnectorField) {
      dto.allowDisablingOptions = true;
      dto.valueInfo.forFormPreview = true;
      dto.valueInfo.isClientId = item.isClientId;
    }

    if (item.type === FieldTypeIds.ListField) {
      // for now hiding cascade selectboxes,
      // in case of business requirement can be made configurable
      dto.isCascadeSelect = false;
      // canResetSelection and showSearchInput can be configurable
      dto.canResetSelection = true;
      dto.showSearchInput = true;
    }

    if (item.configuration.allowHighlighting) {
      dto.isHighlighted = item.configuration.isHighlighted;
      dto.highlightColor = item.configuration.highlightColor;
    }

    if (item.configuration?.renderType) {
      dto.renderType = item.configuration.renderType;
    }

    item.configuration?.validators?.forEach((validator) => {
      const validatorKey = lowerFirst(ValidatorType[validator.validatorType]);
      const validatorValue = validator[validatorKey];

      if (validatorKey === 'minMax') {
        dto.min = validatorValue ? validatorValue.min : validator['min'];
        dto.max = validatorValue ? validatorValue.max : validator['max'];
      }
      dto[validatorKey] = validatorValue;
    });

    const adapter = FormlyFieldAdapterFactory.createAdapter(dto);

    let config = adapter.getConfig({ isDisabledExplicitly: this.isFormDisabled || this.isStepResolved });

    let className = formlyFieldDefaultClass;
    if (item.configuration.readonly) {
      className = formlyFieldReadonlyClass;
    }
    if (config.templateOptions.isHighlighted && config.templateOptions.highlightColor) {
      className += ` ${config.templateOptions.highlightColor}`;
    }
    config.className = className;

    if (item.type === FieldTypeIds.EmbededField) {
      FormlyHighlightsHelper.highlightFieldGroupWrapper(config);
    }

    if (item.configuration.allowHighlighting && this.allowStepHighlighting) {
      config = FormlyHighlightsHelper.addHighlightFunctionality(config);
    }

    if (item.configuration.isHyperlink) {
      this.addHyperlink(config, item.configuration);
    }

    if (this.activeFieldPath) {
      this.processActiveField(config, this.activeFieldPath.path);
    }

    if (this.allowActionsFor === AreaTypeEnum.stepForm && item.type !== FieldTypeIds.ListOfLinksField) {
      this.addFieldPathGeneratorButton(config);
    }

    if (this.anyFormula || (this.allFunctions && this.allFunctions.length)) {
      // debounce to decrease the number of function evaluations
      config.modelOptions = {
        ...config.modelOptions,
        debounce: {
          default: 200
        }
      };
    }
    // for ConnectorWithSearchInput, add a custom class to control the field look
    if (
      item.type === FieldTypeIds.ConnectorField &&
      item.configuration?.connectorFieldConfiguration?.renderType === ConnectorRenderTypeEnum.SearchInput
    ) {
      config.expressionProperties = {
        ...config.expressionProperties,
        className: (model: FormlyModel) => {
          if (!model[<string>config.key] || !model[<string>config.key].length) {
            config.className = 'empty-connector-field';
          } else {
            config.className = className;
          }
        }
      };
    }

    return config;
  }

  processActiveField(fieldConfig: FormlyFieldConfig, fieldPath: string[]): void {
    if (fieldPath?.length && fieldConfig.key === fieldPath[0]) {
      if (fieldConfig.fieldGroup) {
        fieldConfig.templateOptions.isExpanded = true;
        const slicedFieldPath = fieldPath.slice(1);
        let nestedConfig = fieldConfig.fieldGroup.find((config) => config.key === slicedFieldPath[0]);
        if (nestedConfig) {
          this.processActiveField(nestedConfig, slicedFieldPath);
        }
      } else {
        fieldConfig.className += ` ${activatedFormlyFieldClass}`;
      }
    }
  }

  addFieldPathGeneratorButton(config: FormlyFieldConfig) {
    if (!config.fieldGroup) {
      const linkGeneratorConfig: IFormlyRightButtonAddonConfig = {
        icon: 'share',
        color: ColorEnum.accent,
        cssClass: 'linkGeneratorWrapper',
        tooltip: this.ts.instant('Click to copy link'),
        onClick: () => {
          this.fieldPathEmitter.emit({
            path: FormlyHighlightsHelper.getFieldPath(config)
          });
        }
      };

      config.templateOptions[Addons.formlyRightBtn] = linkGeneratorConfig;
    } else {
      config.fieldGroup.forEach((nestedConfig) => this.addFieldPathGeneratorButton(nestedConfig));
    }
  }

  addHyperlink(config: FormlyFieldConfig, fieldConfig: IFieldConfiguration): void {
    const linkGeneratorConfig: IFormlyHyperlinkConfig = {
      hyperlinkTemplate: fieldConfig.hyperlinkTemplate,
      hyperLinkVisibility: fieldConfig.hyperLinkVisibility,
      customHyperLinkLabel: fieldConfig.customHyperLinkLabel
    };

    config.templateOptions[Addons.hyperlink] = linkGeneratorConfig;
  }

  /**
   * add all the keys of formlyView.model,
   * even if there is no value yet for some fields
   * (will create tree like structure for nested schema fields)
   * @param fields
   * @param model
   * @returns
   */

  populateModel(fields: IConfigurableListItem[], model: FormlyModel): FormlyModel {
    fields.forEach((field) => {
      if (!this.anyFormula && this.expressionHelper.hasFormulaConfig(field)) {
        this.anyFormula = true;
      }
      const key = field.name || field.fieldName;
      if (field.fields) {
        const nestedSchema = field as SchemaDto;
        let uiFields: IConfigurableListItem[] = nestedSchema.fields.map((schemaField) => {
          return BaseFieldConverter.toUi(schemaField);
        });
        field.fields = uiFields;
        model[key] = {};
        this.populateModel(field.fields, model[key]);
      } else {
        model[key] = !isUndefinedOrNull(field.value) ? field.value : field.configuration?.value;
      }
    });

    if (this.systemFields) {
      Object.keys(this.systemFields).forEach((key) => {
        model[key] = this.systemFields[key];
      });
    }
    return model;
  }

  /**
   * Recursively get all the functions, update the nested schema
   * propertyPaths to include the parent's name
   * at the top of the path tree
   * @param schema
   * @returns
   */

  getAllFunctions(schema, parentName?: string): IFunctionItemModel[] {
    let funcArr: IFunctionItemModel[] = [];
    schema.functions?.forEach((expression) => {
      let funcItem = this.adminSchemaService.mapFunctionForFrontend(schema, expression);
      if (parentName) {
        funcItem = this.addPathItem(funcItem, parentName);
      }
      funcArr.push(funcItem);
    });
    schema.fields?.forEach((field) => {
      if (field.type === FieldTypeIds.EmbededField && field.functions) {
        let nestedArr = this.getAllFunctions(field, field.fieldName || field.name);
        funcArr.push(...nestedArr);
      }
    });
    return funcArr;
  }

  /**
   * for deep nested functions we need to update
   * the property path with the parent schema names
   * (just for frontend, not sent to backend)
   * @param
   * @param parentName
   * @returns
   */
  addPathItem(f: IFunctionItemModel, parentName: string): IFunctionItemModel {
    f.fieldsSettings?.forEach((setting) => {
      setting.fieldPath?.path?.unshift(parentName);
    });
    f.ruleSet?.rules?.forEach((rule) => {
      rule?.propertyPath?.path?.unshift(parentName);
    });
    return f;
  }

  /**
   * create rawData/comment/case-with-no-rawData
   */
  onSubmit(form: FormGroup, model: FormlyModel): void {
    this.populateComputeOnSubmitValues(model);
    this.formSubmitted = true;
    this.formValue.emit({
      form,
      model,
      keepFormOpen: this.keepFormOpen
    });

    if (!this.keepFormOpen) {
      this.enableButton();
      this.close.emit(true);
      this.clearForm();
    } else {
      setTimeout(() => {
        this.formSubmitted = false;
        this.resetFieldsForCreateAnother();
        this.cd.detectChanges();
      }, 1000);
    }
  }

  // reset all the fields except the ones found in persistingFields array,
  resetFieldsForCreateAnother(): void {
    let newModel = this.populateModelWithPersistFields(this.localFieldsCopy, {}, this.model, 0);
    this.options.resetModel(newModel);
  }

  // reset all the fields except the ones found in persistingFields array,
  populateModelWithPersistFields(
    fields: IConfigurableListItem[],
    newModel: FormlyModel,
    currentValues: FormlyModel,
    pathLevel: number
  ): FormlyModel {
    const persistingFields = this.createAnotherItemSetting.persistingFields || [];
    fields.forEach((field) => {
      const key = field.name || field.fieldName;
      if (field.fields) {
        const nestedSchema = field as SchemaDto;
        let uiFields: IConfigurableListItem[] = nestedSchema.fields.map((schemaField) => {
          return BaseFieldConverter.toUi(schemaField);
        });
        field.fields = uiFields;
        newModel[key] = {};
        this.populateModelWithPersistFields(field.fields, newModel[key], currentValues[key], pathLevel + 1);
      } else {
        if (persistingFields.find((path) => path[pathLevel] === key)) {
          newModel[key] = currentValues[key];
        } else {
          newModel[key] = undefined;
        }
      }
    });
    return newModel;
  }

  async onCancel(view: IFormlyView): Promise<void> {
    if (view.form.dirty) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      if (await dialogRef.afterClosed().toPromise()) this.close.emit(false);
    } else this.close.emit(false);
  }

  onCaseProceed(form: FormGroup, model: FormlyModel, disableButton: boolean): void {
    this.populateComputeOnSubmitValues(model);
    // in FormlyModel un-touched controls have undefined value, instead of null. We do not save undefined values, only nulls
    this.caseProceed.emit({ form, model, keepFormOpen: this.keepFormOpen, createForMultipleWorkflow: false });
    this.formSubmitted = disableButton;
    if (this.keepFormOpen) {
      setTimeout(() => {
        this.formSubmitted = false;
        this.resetFieldsForCreateAnother();
        this.cd.detectChanges();
      }, 1000);
    } else {
      this.enableButton();
    }
  }

  clearForm(): void {
    this.options.resetModel();
  }

  enableButton(): void {
    setTimeout(() => {
      this.formSubmitted = false;
      this.cd.detectChanges();
    }, 1000);
  }

  /**
   * populate computed values for the fields with computeTriggerEvent setting equal to OnSubmit
   */
  populateComputeOnSubmitValues(formlyModel: FormlyModel): void {
    const computeOnSubmitFields = this.localFieldsCopy.filter((f) => {
      return (
        f.configuration?.computeDefaultValueFormula &&
        f.configuration?.defaultValueType === DefaultValueTypeEnum.computed &&
        f.configuration?.computeTriggerEvent === ComputedValueTriggerEventEnum.OnSubmit
      );
    });

    if (computeOnSubmitFields.length) {
      computeOnSubmitFields.forEach((field) => {
        const value = this.expressionHelper.manuallyComputeFieldValue(field.name, this.localFieldsCopy, formlyModel);
        if (!isUndefinedOrNull(value)) {
          formlyModel[`${field.name}`] = value;
        }
      });
    }
  }

  checkForKeepOpenSettings(): void {
    if (this.isUpdate) {
      this.showKeepOpenCheckbox = false;
      return;
    }

    this.store
      .pipe(
        select(tenantSettingsSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((data) => {
        const sett = data.find((x) => {
          return x.key.includes(`${schemaPermissionSettingsKey}_${this.schema.id}_${this.schema.areaType}`);
        });
        if (sett && sett.value) {
          this.createAnotherItemSetting = (<ManualCreationSettings>sett.value)?.createAnotherSetting;
          this.showKeepOpenCheckbox = this.createAnotherItemSetting?.enableCreateAnother || false;
        } else {
          this.showKeepOpenCheckbox = false;
        }
      });
  }

  async setSchemaPermissions(): Promise<void> {
    const permissions = await this.schemaPermissionsHelper.getSchemaPermissions(this.schema.id, this.schema.areaType, this.tenant);
    if (permissions) {
      this.permissions.add = permissions.add;
      this.permissions.edit = permissions.edit;
      this.cd.detectChanges();
    }
  }

  processParentChildListLink(fieldConfig: FormlyFieldConfig, view: IFormlyView): FormlyFieldConfig {
    if (
      fieldConfig.fieldGroup ||
      fieldConfig.type === FormlyFieldAdapterTypeEnum.select ||
      fieldConfig.type === FormlyFieldAdapterTypeEnum.autocomplete
    ) {
      if (fieldConfig.fieldGroup) {
        fieldConfig.fieldGroup.forEach((fConfig) => {
          fConfig = this.processParentChildListLink(fConfig, view);
        });
      } else {
        const listLink = this.schema?.schemaConfiguration?.linkedListFields?.find((l) => {
          return l.childFieldPath.join(pathSeparator) === fieldConfig.templateOptions.fieldPath?.join(pathSeparator);
        });
        if (listLink?.parentFieldPath?.length) {
          fieldConfig.hooks = {
            onInit: (field) => {
              const parenControl = view.form.get(listLink.parentFieldPath) as FormControl;
              const ownControl = field.formControl;
              if (parenControl) {
                field.templateOptions.options = parenControl.valueChanges.pipe(
                  distinctUntilChanged(),
                  startWith(parenControl.value),
                  map(() => {
                    const parentValue = parenControl.value ? (isArray(parenControl.value) ? parenControl.value : [parenControl.value]) : [];

                    let options = fieldConfig.templateOptions.listData?.items
                      ?.filter((f) => {
                        return parentValue.length ? parentValue.includes(f.parentListItemId) : true;
                      })
                      .map((option) => {
                        return <KeyValueDisabled>{
                          key: populateListOptionValue(option, field.templateOptions.listItemDisplaySetting),
                          value: option.id,
                          disabled: option.isDisabled
                        };
                      });

                    // when parent value changes, make a cleanup in child selection and keep only selected children of parent value

                    let ownValue = isArray(ownControl.value) ? ownControl.value : ownControl.value ? [ownControl.value] : [];

                    ownValue = ownValue.filter((value) => options.find((option) => option.value === value));
                    isArray(ownControl.value) ? ownControl.setValue(ownValue) : ownControl.setValue(ownValue[0]);
                    return options;
                  })
                );
              }
            }
          };
        }
      }
    }
    return fieldConfig;
  }

  onCaseCreate(form: FormGroup, model: FormlyModel, disableButton: boolean): void {
    this.populateComputeOnSubmitValues(model);
    this.caseProceed.emit({ form, model, keepFormOpen: this.keepFormOpen, createForMultipleWorkflow: true });
  }

  onDialogClose(): void {
    this.dialog.closeAll();
  }
}
