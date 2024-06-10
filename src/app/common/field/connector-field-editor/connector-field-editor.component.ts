import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { IConfigurableListItem, IFormlyView, KeyValueView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import {
  AreaTypeEnum,
  AreaTypeList,
  AreaTypeMap,
  AreaTypeObj,
  FieldTypeIds,
  FieldTypeNameMap,
  IAreaTypeObj,
  IFieldValidatorUi,
  SchemaDto,
  ValidatorTypeMap
} from '@wfm/service-layer';
import { convertFieldName, emptyStringValidatorAsRequiredFn } from '@wfm/service-layer/helpers';
import { WorkflowSchemaConnectorEntity, WorkflowSchemaItem } from '@wfm/service-layer/models/orchestrator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { switchMap, takeUntil, map, catchError, share, startWith, filter, tap } from 'rxjs/operators';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { LabelSettingsOutput } from './connector-field-option-label-settings/connector-field-option-label-settings.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { FieldOptionsRulesOutput } from './connector-field-option-rules/connector-field-option-rules.component';
import { cloneDeep } from 'lodash-core';
import { formValueToValidators, ValidatorValue } from '@wfm/common/field-validators';
import { IFieldHighlightOutput } from '../field-highlights/field-highlights.component';
import {
  ConnectorFieldConfiguration,
  ConnectorOptionRules,
  ConnectorRenderTypeEnum,
  ConnectorTypeEnum
} from '@wfm/common/models/connector-field';
import { IFieldValidatorsOutputEvent } from '../field-validators/i-field-validators-output.event';
import { KeyValue } from '@angular/common';
import { FieldOptionsSortingOutput } from './connector-field-options-sorting/connector-field-options-sorting.component';

interface IConnectorField {
  name: string;
  fieldTitle?: string;
  isReadonly?: boolean;
  allowMultipleSelection: boolean;
  connectorEntity?: string;
  connectorSide?: string;
  connectorSideSchemaId?: string;
  enableFieldExposure?: boolean;
  exposedFields?: string[];
  renderType: ConnectorRenderTypeEnum;
}

type Key = keyof IConfigurableListItem & string;
const nameKey: Key = 'name';
const isReadonlyKey: Key = 'isReadonly';
const titleKey = 'fieldTitle';
const connectorEntityKey = 'connectorEntity';
const connectorSideKey = 'connectorSide';
const connectorSideSchemaIdKey = 'connectorSideSchemaId';
const allowMultiSelectionKey = 'allowMultipleSelection';
const enableExposureKey = 'enableFieldExposure';
const exposedFieldsKey = 'exposedFields';
const useAll = AreaTypeMap.get(AreaTypeEnum.all);
const renderTypeKey = 'renderType';

const notAllowedExposeFieldTypes = [FieldTypeIds.ConnectorField, FieldTypeIds.EmbededField, FieldTypeIds.ListOfLinksField];

@Component({
  selector: 'app-connector-field-editor',
  templateUrl: './connector-field-editor.component.html',
  styleUrls: ['./connector-field-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConnectorFieldEditorComponent extends TenantComponent implements OnInit {
  @Input() field: IConfigurableListItem;
  @Input() rules: ConnectorOptionRules;
  @Input() useApplyTo: boolean = true;
  @Input() ownerSchemaFields$?: Observable<IConfigurableListItem[]>;
  @Input() ownerSchemaName?: string;
  @Output() save: EventEmitter<IConfigurableListItem> = new EventEmitter();
  isUpdate: boolean;
  selectedConnector: WorkflowSchemaConnectorEntity;
  selectedConnectorType: ConnectorTypeEnum;
  validators: IFieldValidatorsOutputEvent;
  highlightsConfig: IFieldHighlightOutput;
  isValidatorFormDirty: boolean;
  workflowConnectors: WorkflowSchemaConnectorEntity[];
  connectorFieldType$: Observable<FieldTypeIds> = from([FieldTypeIds.ConnectorField]);
  view: IFormlyView<IConnectorField>;
  schema$: Observable<SchemaDto>;
  schemaSubject$: BehaviorSubject<SchemaDto> = new BehaviorSubject(null);
  isFormlyInitialized: boolean;

  workflowSchemaStatuses: Array<{ name: string; id: string }>;
  labelSettings: LabelSettingsOutput = null;
  filterRules: FieldOptionsRulesOutput = null;
  disableRules: FieldOptionsRulesOutput = null;
  sortingRules: FieldOptionsSortingOutput = null;
  useInView: IFormlyView<IAreaTypeObj<boolean>>;

  constructor(
    private store: Store<ApplicationState>,
    private ts: TranslateService,
    private fb: FormBuilder,
    private workflowConnectorsService: WorkflowsConnectorService,
    private adminSchemaService: AdminSchemasService,
    private dialog: MatDialog
  ) {
    super(store);
  }

  async ngOnInit() {
    if (this.field) {
      this.isUpdate = true;
    }
    await this.getAllConnectors();

    this.view = await this.createView();
    if (this.useApplyTo) {
      this.setupAreaTypesView();
    }
  }

  async getAllConnectors(): Promise<void> {
    this.workflowConnectors = await this.workflowConnectorsService.getAll();
  }

  onValidatorsUpdate(e: IFieldValidatorsOutputEvent): void {
    const inputValidators = e.valid ? [...e.validators] : [];

    this.validators = {
      valid: e.valid,
      validators: inputValidators
    };
    if (e.dirty) this.isValidatorFormDirty = true;
  }

  async setModelValues(model: IConnectorField): Promise<IConnectorField> {
    model.name = this.field.name;
    model.fieldTitle = this.field.viewName;
    model.isReadonly = this.field.configuration.readonly;
    const connectorConfig: ConnectorFieldConfiguration = this.field.configuration.connectorFieldConfiguration;
    if (connectorConfig) {
      model.allowMultipleSelection = connectorConfig.allowMultipleSelection;

      model.connectorEntity = connectorConfig.entitySource.connectorId;
      await this.getConnector(model.connectorEntity);

      model.connectorSide = connectorConfig.entitySource.workflowConnectorSide;
      model.connectorSideSchemaId = connectorConfig.entitySource.workflowSchemaId;

      model.enableFieldExposure = connectorConfig.enableFieldExposure || false;
      model.exposedFields = connectorConfig.exposedFields || [];
      model.renderType = connectorConfig.renderType || ConnectorRenderTypeEnum.SelectBox;
      this.labelSettings = {
        ...connectorConfig.labelSettings,
        isValid: true
      };
      this.filterRules = {
        ...connectorConfig.filterCriteria,
        isValid: true
      } as FieldOptionsRulesOutput;
      this.disableRules = {
        ...connectorConfig.disableCriteria,
        isValid: true
      } as FieldOptionsRulesOutput;

      this.sortingRules = {
        data: connectorConfig.sortingRules,
        isValid: true
      } as FieldOptionsSortingOutput;
    }
    return model;
  }

  async createView(): Promise<IFormlyView<IConnectorField>> {
    let model: IConnectorField = {
      name: '',
      fieldTitle: '',
      isReadonly: false,
      connectorEntity: '',
      connectorSide: '',
      connectorSideSchemaId: '',
      allowMultipleSelection: false,
      enableFieldExposure: false,
      exposedFields: [],
      renderType: 0
    };
    if (this.isUpdate) {
      model = await this.setModelValues(model);
    }

    // fieldName
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
    // fieldTitle
    const titleField = FormlyFieldAdapterFactory.createAdapter({
      name: titleKey,
      type: FieldTypeIds.StringField,
      label: 'Field Title',
      value: model.fieldTitle,
      required: true
    }).getConfig();

    titleField.templateOptions.description = this.ts.instant('Field label visible within the app');

    //  is Readonly
    const isReadonlyField = FormlyFieldAdapterFactory.createAdapter({
      name: isReadonlyKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Make Field ReadOnly'),
      required: false,

      value: model[isReadonlyKey]
    }).getConfig();

    //  multiple selection
    const allowMultiSelectionField = FormlyFieldAdapterFactory.createAdapter({
      name: allowMultiSelectionKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Allow Multiple Options'),
      required: false,

      value: model[allowMultiSelectionKey]
    }).getConfig();

    const enableExposureField = FormlyFieldAdapterFactory.createAdapter({
      name: enableExposureKey,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Expose Fields to Grids'),
      required: false,
      value: model[enableExposureKey]
    }).getConfig();

    enableExposureField.hideExpression = (model: IConnectorField) => {
      if (model?.allowMultipleSelection) {
        model[enableExposureKey] = false;
        return true;
      }
      return false;
    };

    const exposedFields = FormlyFieldAdapterFactory.createAdapter({
      name: exposedFieldsKey,
      type: FieldTypeIds.MultiselectListField,
      label: this.ts.instant('Select Fields To Be Exposed'),
      required: true,
      value: model[exposedFieldsKey]
    }).getConfig();

    exposedFields.hideExpression = (model: IConnectorField) => {
      if (model?.allowMultipleSelection || !model?.enableFieldExposure) {
        model[exposedFieldsKey] = [];
        return true;
      }
      return false;
    };

    exposedFields.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.templateOptions.options = this.schemaSubject$.pipe(
          takeUntil(this.destroyed$),
          switchMap((schema) => {
            if (schema) {
              const fieldOptions = schema.fields
                .filter((f) => {
                  return !notAllowedExposeFieldTypes.includes(f.type);
                })
                .map(
                  (field) =>
                    new KeyValueView(field.fieldName, field.id, `${field.displayName} (${FieldTypeNameMap.get(field.type).viewValue})`)
                );
              return from([fieldOptions]);
            }
            return from([]);
          })
        );
        field.templateOptions.labelProp = 'viewValue';
      }
    };

    // render type
    const renderType = FormlyFieldAdapterFactory.createAdapter({
      name: renderTypeKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('How Connector Is To Be Rendered'),
      required: false,
      valueInfo: {
        options: [
          {
            key: 'Select Box',
            value: ConnectorRenderTypeEnum.SelectBox
          },
          {
            key: 'Search Input',
            value: ConnectorRenderTypeEnum.SearchInput
          }
        ]
      },

      value: model[renderTypeKey]
    }).getConfig();

    // connector item
    const connectorField = FormlyFieldAdapterFactory.createAdapter({
      name: connectorEntityKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Select Connector'),
      required: true,
      disabled: this.isUpdate ? true : false,
      valueInfo: {
        options: this.workflowConnectors.map((connector) => {
          return {
            key: connector.name,
            value: connector.id
          };
        }),
        showTooltip: true
      },
      value: model[connectorEntityKey]
    }).getConfig();

    const connectorSchemaIdField = FormlyFieldAdapterFactory.createAdapter({
      name: connectorSideSchemaIdKey,
      type: FieldTypeIds.StringField,
      label: 'Schema',
      value: model[connectorSideSchemaIdKey]
    }).getConfig();
    connectorSchemaIdField.hide = true;

    // connector item's side (A-B)
    const connectorSideField = FormlyFieldAdapterFactory.createAdapter({
      name: connectorSideKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Select Workflow'),
      disabled: this.isUpdate ? true : false,
      required: true,
      valueInfo: {
        options: [],
        showTooltip: true
      },
      value: model[connectorSideKey]
    }).getConfig();

    connectorSideField.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.templateOptions.options = field.form.get(connectorEntityKey).valueChanges.pipe(
          startWith(field.form.get(connectorEntityKey).value),
          takeUntil(this.destroyed$),
          switchMap((connectorId: string) => {
            this.selectedConnectorType = ConnectorTypeEnum.WorkflowSchema;
            if (connectorId) {
              if (field.form.get(connectorEntityKey).touched) {
                // when parent control's value changes, the child control shall be reset
                field.formControl.reset();
                field.form.get(connectorSideKey).reset();
              }
              return this.getConnectorSides(connectorId).pipe(
                catchError((error) => {
                  console.log(error);
                  return of([]);
                })
              );
            }
            return of([]);
          })
        );

        // schema related to the connector item's side
        this.schema$ = field.form.get(connectorSideKey).valueChanges.pipe(
          startWith(field.form.get(connectorSideKey).value),

          takeUntil(this.destroyed$),
          switchMap((connectorSide: string) => {
            if (connectorSide) {
              let connectorSchema: WorkflowSchemaItem;
              switch (connectorSide) {
                case 'source':
                  connectorSchema = this.selectedConnector.workflowSchemaSource;
                  break;
                case 'destination':
                  connectorSchema = this.selectedConnector.workflowSchemaDestination;
                  break;
                default:
                  return of(null);
              }
              this.workflowSchemaStatuses = connectorSchema.statuses || [];
              this.view.model[connectorSideSchemaIdKey] = connectorSchema.id;

              return from(
                this.adminSchemaService.getSchema(connectorSchema.tenantId, AreaTypeEnum.case, connectorSchema.caseSchemaId)
              ).pipe(
                catchError((error) => {
                  console.log(error);
                  return of(null);
                })
              );
            }
            return of(null);
          }),
          tap((schema) => {
            this.schemaSubject$.next(schema);
          })
        );
        this.isFormlyInitialized = true;
      }
    };
    nameField.className = 'col-6';
    titleField.className = 'col-6';
    isReadonlyField.className = 'col-6';
    allowMultiSelectionField.className = 'col-6';
    connectorField.className = 'col-6 mt-4';
    connectorSideField.className = 'col-6 mt-4';
    enableExposureField.className = 'col-12';
    exposedFields.className = 'col-12';
    renderType.className = 'col-12';
    const fields = [
      nameField,
      titleField,
      connectorField,
      connectorSideField,
      connectorSchemaIdField,
      isReadonlyField,
      allowMultiSelectionField,
      enableExposureField,
      exposedFields,
      renderType
    ];

    const view: IFormlyView<IConnectorField> = {
      form: this.fb.group({}),
      fields,
      model
    };
    return view;
  }

  async getConnector(id: string): Promise<void> {
    this.selectedConnector = await this.workflowConnectorsService.get(id);
  }

  getConnectorSides(id: string): Observable<KeyValue<string, string>[]> {
    return from(this.workflowConnectorsService.get(id)).pipe(
      map((connector) => {
        this.selectedConnector = cloneDeep(connector);
        return [
          {
            key: `${connector.workflowSchemaSource.name} (source side)`,
            value: 'source'
          },
          {
            key: `${connector.workflowSchemaDestination.name} (destination side)`,
            value: 'destination'
          }
        ];
      }),
      catchError((error) => {
        console.log(error);
        return of([]);
      })
    );
  }

  onClose(): void {
    if (this.view.form.dirty || this.view.form.dirty) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      dialogRef.afterClosed().subscribe((x) => {
        if (x) this.dialog.closeAll();
      });
    } else {
      this.dialog.closeAll();
    }
  }

  isValidForm(): boolean {
    const isValid =
      this.view?.form?.valid &&
      this.labelSettings?.isValid &&
      (!this.useInView || this.useInView?.form?.valid) &&
      (!this.filterRules || this.filterRules?.isValid) &&
      (!this.disableRules || this.disableRules?.isValid) &&
      (!this.sortingRules || this.sortingRules.isValid);
    return isValid;
  }

  labelSettingsUpdated(event: LabelSettingsOutput): void {
    this.labelSettings = event;
  }

  filterRulesUpdated(event: FieldOptionsRulesOutput): void {
    this.filterRules = null;
    if (event?.statuses?.length || event?.ruleSet?.rules?.length || event?.dynamicRuleSet?.rules?.length) {
      this.filterRules = event;
    }
  }

  disableRulesUpdated(event: FieldOptionsRulesOutput): void {
    this.disableRules = null;
    if (event?.statuses?.length || event?.ruleSet?.rules?.length || event?.dynamicRuleSet?.rules?.length) {
      this.disableRules = event;
    }
  }

  sortingRulesUpdated(data: FieldOptionsSortingOutput): void {
    this.sortingRules = data;
  }

  onSaveForm(): void {
    const dto: IConfigurableListItem = this.createFieldItem();
    this.save.next(cloneDeep(dto));
  }

  highlightsConfigUpdated(event: IFieldHighlightOutput): void {
    this.highlightsConfig = event;
  }

  private createFieldItem(): IConfigurableListItem {
    const model = this.view.model;
    const useInObj = this.useInView?.model;
    const validatorEvent = this.validators;
    const inputValidators = validatorEvent?.validators || [];
    const validatorValue: ValidatorValue = {} as any;

    inputValidators.forEach((x) => {
      const kv = ValidatorTypeMap.get(x.key);
      validatorValue[kv.key] = x.value;
    });
    const outputValidators: IFieldValidatorUi[] = formValueToValidators(validatorValue, FieldTypeIds.ConnectorField).map((x) => x.value);

    let labels, filterRules, disableRules;
    if (this.labelSettings) {
      labels = cloneDeep(this.labelSettings);
      delete labels.isValid;
      labels.fieldSettings.forEach((f) => {
        delete f['displayName'];
      });
    }

    if (this.filterRules) {
      filterRules = cloneDeep(this.filterRules);
      delete filterRules.isValid;
    }

    if (this.disableRules) {
      disableRules = cloneDeep(this.disableRules);
      delete disableRules.isValid;
    }

    const item: IConfigurableListItem = {
      ...this.field,
      tenantId: this.tenant,
      id: this.field?.id || undefined,
      name: !this.field?.isCustom && this.field?.fieldName ? this.field.fieldName : convertFieldName(model.name),
      viewName: model?.fieldTitle ? model.fieldTitle : model.name,
      type: FieldTypeIds.ConnectorField,
      useIn: [],
      configuration: Object.assign(this.field?.configuration || { position: 0 }, {
        validators: outputValidators,
        readonly: model.isReadonly,
        connectorFieldConfiguration: {
          allowMultipleSelection: model.allowMultipleSelection,
          connectorType: ConnectorTypeEnum.WorkflowSchema,
          entitySource: {
            connectorId: model.connectorEntity,
            entityAreaType: AreaTypeEnum.case // when dealing with Schema Connector, set to the selected Schema's areatype
          },
          labelSettings: labels,
          filterCriteria: filterRules,
          disableCriteria: disableRules,
          enableFieldExposure: model.enableFieldExposure,
          exposedFields: model.exposedFields,
          renderType: model.renderType || ConnectorRenderTypeEnum.SelectBox,
          sortingRules: this.sortingRules?.data
        }
      })
    };
    if (useInObj) {
      item.useInObj = useInObj;
    }

    if (this.selectedConnectorType === ConnectorTypeEnum.Schema) {
      item.configuration.connectorFieldConfiguration.entitySource.schemaId = model.connectorSideSchemaId;
      delete item.configuration.connectorFieldConfiguration.entitySource.workflowConnectorSide;
      delete item.configuration.connectorFieldConfiguration.entitySource.workflowSchemaId;
    } else {
      item.configuration.connectorFieldConfiguration.entitySource.workflowConnectorSide = model.connectorSide;
      item.configuration.connectorFieldConfiguration.entitySource.workflowSchemaId = model.connectorSideSchemaId;
      delete item.configuration.connectorFieldConfiguration.entitySource.schemaId;
    }

    // highlights settings
    if (this.highlightsConfig?.allowHighlighting) {
      item.configuration = {
        ...item.configuration,
        allowHighlighting: this.highlightsConfig.allowHighlighting,
        highlightColor: this.highlightsConfig.highlightColor
      };
    } else {
      delete item.configuration.allowHighlighting;
      delete item.configuration.highlightColor;
    }

    if (useInObj) {
      Object.keys(useInObj)
        .filter((x) => !!useInObj[x])
        .forEach((x) => {
          const enumVal = AreaTypeMap.get(x);
          if (enumVal) {
            item.useIn.push(enumVal.value);
          }
        });
    }
    return item;
  }

  setupAreaTypesView(): void {
    this.useInView = this.createUseInView();
    setTimeout(() => {
      this.useInView.form
        .get(useAll.key)
        .valueChanges.pipe(takeUntil(this.destroyed$))
        .subscribe((value) => {
          Object.keys(this.useInView.form.controls)
            .filter((x) => x !== useAll.key)
            .forEach((ctrlKey) => {
              const control = this.useInView.form.controls[ctrlKey];
              if (value) {
                control.patchValue(true, { onlySelf: true, emitEvent: false });
                control.disable();
              } else {
                control.enable();
                control.patchValue(false);
              }
            });
        });
    });
  }

  /**
   * logic copied from field-editor component
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

  onModelChange(event: AreaTypeObj): void {
    if (Object.values(event).filter((x) => x).length === Object.values(event).length - 1) {
      this.useInView.form.controls.all.setValue(true);
    }
  }
}
