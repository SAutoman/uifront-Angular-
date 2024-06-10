/**
 * global
 */

import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { KeyValue } from '@angular/common';
import { Store } from '@ngrx/store';
import { filter, map, takeUntil, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

import { FormVariableDto } from '@wfm/common/vendor';
import { AreaTypeEnum, FieldTypeIds, Roles, SchemaFieldDto } from '@wfm/service-layer';
import { IConfigurableListItem } from '@wfm/common/models';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { schemaFunctionsStateSelector, SchemaFunctionsState, systemFieldOptionsSelector } from '@wfm/store';
import { BaseComponent } from '@wfm/shared/base.component';

/**
 * local
 */
import { builderViewToFormlyFieldConfig, createFormNameField, mapVariableToFormlyConfig } from '../page-form-builder/maps';

import {
  IFieldSettings,
  IFieldSettingsConfig,
  IFieldsExpressionView,
  IFunctionItemModel,
  IFunctionItemUpdateEvent,
  IRuleSet
} from '../interface/expression/expressionModelUI';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import {
  currentCompaniesField,
  currentRolesField,
  currentUserGroupField,
  createdAtField,
  updatedAtField,
  statusField,
  ExpressionSystemFieldEnum
} from '../form-function-builder/system-fields';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { ActivatedRoute } from '@angular/router';

const selectedFieldName = 'selectedField';

export interface KeyValueGroup<K, V> extends KeyValue<K, V> {
  group?: string;
}

export interface TargetFieldData {
  fieldModel: {
    [selectedFieldName]?: IConfigurableListItem<any>;
  };
  fieldForm: FormGroup;
  selectFieldFormlyField: FormlyFieldConfig[];
  fieldSettings$: Observable<IFieldSettings>;
  fieldSettingsStream$: BehaviorSubject<IFieldSettings>;
  fieldSettings: IFieldSettings;
}
@Component({
  selector: 'app-form-function-item',
  templateUrl: './form-function-item.component.html',
  styleUrls: ['./form-function-item.component.scss'],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }]
})
export class FormFunctionItemComponent extends BaseComponent implements OnInit, AfterViewInit {
  @Input() readonly fieldIds?: string[];
  @Input() readonly expression: IFieldsExpressionView;
  @Input() readonly modelRef?: IFunctionItemModel;
  @Output() update = new EventEmitter<IFunctionItemUpdateEvent>();
  @Output() conditions = new EventEmitter<boolean>();

  existingFieldIds: string[] = [];
  ruleFields: string[] = [];
  functionNames: string[] = [];
  // additional fields not from schema
  currentUserGroup: IConfigurableListItem;
  currentCompanies: IConfigurableListItem;
  currentRoles: IConfigurableListItem;
  createdAtField: IConfigurableListItem;
  updatedAtField: IConfigurableListItem;
  statusField: IConfigurableListItem;

  rules$: Observable<IRuleSet>;

  nameModel: { name?: string } = {};
  nameForm: FormGroup;
  nameFieldFormlyField: FormlyFieldConfig[] = [];

  targetFields: TargetFieldData[] = [];

  fieldOptions: KeyValue<string, IConfigurableListItem>[];
  ruleFieldOptions: KeyValueGroup<string, IConfigurableListItem<any>>[];
  nameFormInit: boolean;
  systemFieldOptionsLoaded: boolean = false;
  schemaAreaType: AreaTypeEnum;

  private fieldMap = new Map<string, IFieldSettingsConfig>();
  private rules = new BehaviorSubject<IRuleSet>(undefined);
  /**
   * tmp field
   */
  private ruleSet?: IRuleSet;
  isFirstChange: boolean;

  constructor(
    private fb: FormBuilder,
    private store: Store<ApplicationState>,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private expressionHelper: ExpressionHelperService,
    private route: ActivatedRoute
  ) {
    super();
    this.nameForm = this.fb.group({});
    this.rules$ = this.rules.asObservable();

    this.nameForm.valueChanges.subscribe(() => {
      this.notify();
      if (this.nameFormInit) this.conditions.emit(true);
      else this.nameFormInit = true;
    });
  }

  addTargetField(fieldId?: string): void {
    const targetFieldData: TargetFieldData = {
      fieldModel: {},
      fieldForm: this.fb.group({}),
      selectFieldFormlyField: [],
      fieldSettings$: null,
      fieldSettingsStream$: new BehaviorSubject<IFieldSettings>(null),
      fieldSettings: null
    };
    targetFieldData.fieldSettings$ = this.createStreamForSelectedFieldChange(targetFieldData);
    this.initFieldFormly(targetFieldData, fieldId);
    this.targetFields.push(targetFieldData);
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((paramsMap) => {
      if (paramsMap['area']) {
        this.schemaAreaType = Number(paramsMap['area']);
      }
    });
    this.initFunctionStateSubs();
    this.populateFieldOptions();
    if (this.fieldIds?.length) {
      this.fieldIds.forEach((fieldId) => {
        this.addTargetField(fieldId);
      });
    } else {
      this.addTargetField();
    }
    this.populateRuleFieldOptions();
    this.populateSystemFields();
    if (this.modelRef?.fieldsSettings && this.modelRef.fieldsSettings.length) {
      this.modelRef.fieldsSettings.forEach((fieldSetting) => {
        if (fieldSetting?.field?.id) {
          this.fieldMap.set(fieldSetting.field.id, fieldSetting.config);
        }
      });
    }
    this.initNameFormly();

    if (this.modelRef) {
      this.ruleSet = this.modelRef.ruleSet;
    }
  }

  initNameFormly(): void {
    const nameDto = createFormNameField('name', this.expression.name, this.ts.instant('Function Name'));
    nameDto.configuration.required = true;
    nameDto.configuration.readonly = false;
    const nameField = builderViewToFormlyFieldConfig(nameDto);
    nameField.validators = {
      alreadyUsed: {
        expression: (control) => {
          return this.functionNames?.indexOf(control?.value) < 0;
        },
        message: (error, field: FormlyFieldConfig) => `${this.ts.instant('Condition with the same name already exists!')}`
      }
    };
    this.nameFieldFormlyField = [nameField];
  }

  initFieldFormly(targetFieldData: TargetFieldData, fieldId: string) {
    const selectedField = fieldId ? this.fieldOptions.find((x) => x.value.id === fieldId) : undefined;

    const selectDto: FormVariableDto = {
      label: this.ts.instant('Select Field'),
      name: selectedFieldName,
      type: FieldTypeIds.ListField,
      value: selectedField,
      required: false,
      valueInfo: {
        options: this.fieldOptions
      }
    };
    const fieldSelectbox = mapVariableToFormlyConfig(selectDto);

    fieldSelectbox.hooks = {
      afterViewInit: (config: FormlyFieldConfig) => {
        setTimeout(() => {
          config.formControl.valueChanges.pipe(filter((f) => !!f)).subscribe((f) => {
            this.checkUsageAsTarget(f);
            this.conditions.emit(true);
          });
        }, 500);
      }
    };
    fieldSelectbox.validators = {
      alreadyUsedInRule: {
        expression: (control) => {
          return this.ruleFields.indexOf(control?.value?.id) < 0;
        },
        message: (error, field: FormlyFieldConfig) => this.ts.instant(`Already used in the condition's rule!`)
      },
      alreadyUsedInTarget: {
        expression: (control) => {
          const settingsForSelectedField = this.targetFields.filter((target) => {
            return (
              control.value &&
              target.fieldForm.get(selectedFieldName)?.value &&
              target.fieldForm.get(selectedFieldName).value.id === control.value.id
            );
          });

          return !control.value || settingsForSelectedField.length <= 1;
        },
        message: (error, field: FormlyFieldConfig) => this.ts.instant(`Already used as target in this function!`)
      }
    };

    if (selectedField) {
      targetFieldData.fieldModel.selectedField = selectedField.value;
      targetFieldData.fieldSettings = {
        field: selectedField.value,
        config: this.getOrCreateFieldConfig(selectedField.value)
      };
    }
    targetFieldData.selectFieldFormlyField = [fieldSelectbox];
  }

  populateSystemFields(): void {
    this.store
      .select(systemFieldOptionsSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => {
        // status
        // supported for rawData and case schemas
        if (
          [AreaTypeEnum.rawData, AreaTypeEnum.case].includes(this.schemaAreaType) &&
          result.statuses?.length &&
          !this.isFieldInRuleFields(ExpressionSystemFieldEnum.statusId)
        ) {
          this.statusField = { ...statusField };
          this.statusField.configuration.options = result.statuses.map((status) => {
            return { key: status.name, value: status.id };
          });
          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.statusField.viewName),
            value: this.statusField,
            group: this.ts.instant('System Fields')
          });
        }

        // createdAt
        if (!this.isFieldInRuleFields(ExpressionSystemFieldEnum.createdAt)) {
          this.createdAtField = { ...createdAtField };

          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.createdAtField.viewName),
            value: this.createdAtField,
            group: this.ts.instant('System Fields')
          });
        }
        // updatedAt
        if (!this.isFieldInRuleFields(ExpressionSystemFieldEnum.updatedAt)) {
          this.updatedAtField = { ...updatedAtField };

          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.updatedAtField.viewName),
            value: this.updatedAtField,
            group: this.ts.instant('System Fields')
          });
        }

        // userGroup

        if (result.groups?.length && !this.isFieldInRuleFields(ExpressionSystemFieldEnum.userGroups)) {
          this.currentUserGroup = { ...currentUserGroupField };
          this.currentUserGroup.configuration.options = result.groups.map((g) => {
            return { key: g.name, value: g.id };
          });
          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.currentUserGroup.viewName),
            value: this.currentUserGroup,
            group: this.ts.instant('System Fields')
          });
        }

        // userCompany
        if (result.companies?.length && !this.isFieldInRuleFields(ExpressionSystemFieldEnum.companies)) {
          this.currentCompanies = { ...currentCompaniesField };
          this.currentCompanies.configuration.options = result.companies.map((c) => {
            return { key: c?.name, value: c?.id };
          });
          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.currentCompanies.viewName),
            value: this.currentCompanies,
            group: this.ts.instant('System Fields')
          });
        }
        // userRole
        if (result.roles?.length && !this.isFieldInRuleFields(ExpressionSystemFieldEnum.roles)) {
          this.currentRoles = { ...currentRolesField };
          this.currentRoles.configuration.options = result.roles.map((r) => {
            return { key: Roles[r], value: r };
          });
          this.ruleFieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.currentRoles.viewName),
            value: this.currentRoles,
            group: this.ts.instant('System Fields')
          });
        }

        this.systemFieldOptionsLoaded = true;
      });
  }

  isFieldInRuleFields(fieldId: ExpressionSystemFieldEnum | string): boolean {
    const fieldFound = this.ruleFieldOptions.find((f) => f.value.id === fieldId);
    return !!fieldFound || false;
  }

  initFunctionStateSubs(): void {
    this.store
      .select(schemaFunctionsStateSelector)
      .pipe(
        filter((state: SchemaFunctionsState) => !!state),
        takeUntil(this.destroyed$)
      )
      .subscribe((functionsState: SchemaFunctionsState) => {
        this.existingFieldIds = [];
        this.ruleFields = [];
        this.functionNames = [];

        if (functionsState) {
          for (const key in functionsState) {
            if (functionsState.hasOwnProperty(key)) {
              const funcState = functionsState[key];
              if (key !== this.expression.id) {
                this.existingFieldIds.push(...funcState?.selectedFieldIds);
                this.functionNames.push(funcState?.functionName);
              } else {
                this.ruleFields = funcState.ruleFieldIds ? [...funcState.ruleFieldIds] : [];
              }
            }
          }
        }
        // check the fieldSelector and name of the function (their validations) each time the selections in functions are changed
        this.targetFields.forEach((targetField) => {
          targetField.fieldForm?.get(selectedFieldName)?.updateValueAndValidity({ emitEvent: false });
        });
        this.nameForm?.get('name')?.updateValueAndValidity({ emitEvent: false });
      });
  }

  /**
   * add all the fields to this.fieldOptions
   * including the nested schema fields (done recursively)
   */
  populateFieldOptions(): void {
    const fields = [...this.expression.fields];
    this.fieldOptions = [];
    fields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.fieldOptions.push(...retrieved);
    });
  }

  populateRuleFieldOptions(): void {
    this.ruleFieldOptions = [];

    this.ruleFieldOptions = this.fieldOptions
      .filter((f) => {
        return (
          f.value.type !== FieldTypeIds.EmbededField &&
          f.value.type !== FieldTypeIds.FileField &&
          f.value.type !== FieldTypeIds.YouTubeEmbedField
        );
      })
      .map((schemaFieldOption) => {
        return <KeyValueGroup<string, IConfigurableListItem>>{
          key: schemaFieldOption.key,
          value: schemaFieldOption.value,
          group: this.ts.instant('Schema Fields')
        };
      });
  }

  ngAfterViewInit(): void {
    if (this.ruleSet) {
      this.onRuleUpdate(this.ruleSet);
    }
    if (this.modelRef?.fieldsSettings?.length) {
      setTimeout(() => {
        this.targetFields?.forEach((targetField) => {
          targetField.fieldForm?.get(selectedFieldName)?.updateValueAndValidity();
        });
      }, 100);
    }
  }

  /**
   * delete selected target field
   */
  onDelete(targetFieldIndex: number): void {
    this.targetFields.splice(targetFieldIndex, 1)[0];
    this.notify();
  }
  /**
   * fired when selected target field's settings are updated in child - FormFunctionItemSettings component
   */
  onSettingsUpdate(e: IFieldSettingsConfig, cfg: IFieldSettings, targetField: TargetFieldData): void {
    Object.assign(cfg.config, e);
    targetField.fieldSettings = cfg;

    this.notify();
  }

  hasRules(ruleSet?: IRuleSet): boolean {
    if (!ruleSet || !ruleSet.rules || !ruleSet.rules.length) {
      return false;
    }
    return true;
  }

  onRuleUpdate(e: IRuleSet): void {
    this.ruleSet = e;
    this.rules.next(e);
    this.notify();
  }

  private createStreamForSelectedFieldChange(targetField: TargetFieldData): Observable<IFieldSettings> {
    return targetField.fieldForm.valueChanges.pipe(
      map((x) => {
        const selectedField: IConfigurableListItem<any> = x[selectedFieldName];
        this.onSelectedFieldChange(selectedField, targetField);
        targetField.fieldSettingsStream$.next(targetField.fieldSettings);
        this.notify();
        return targetField.fieldSettings;
      })
    );
  }

  private checkUsageAsTarget(field: IConfigurableListItem): void {
    const isUsed = this.existingFieldIds.indexOf(field.id) >= 0;
    if (isUsed) {
      this.snackbar.open(
        `${field.viewName} ${this.ts.instant(
          'is used in more than one condition! You may get wrong results if more than one condition is met'
        )}`,
        'CLOSE',
        {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: 'text-warning'
        }
      );
    }
  }

  private onSelectedFieldChange(field: IConfigurableListItem<any>, targetFieldData: TargetFieldData): void {
    if (field) {
      targetFieldData.fieldSettings = {
        field: field,
        config: this.getOrCreateFieldConfig(field),
        fieldPath: {
          path: this.getPath(field)
        }
      };
    } else {
      targetFieldData.fieldSettings = null;
    }
  }

  private getPath(field: SchemaFieldDto | IConfigurableListItem): Array<string> {
    let finalPath = [];
    finalPath.unshift(`${field.fieldName || field.name}`);

    if (field.parentField) {
      const parentFieldName = this.getPath(field.parentField);
      finalPath.unshift(...parentFieldName);
    }
    return finalPath;
  }

  /**
   * get the expression wrapper model, whic is also used to pass the data to the parent component
   */
  private getEventModel(): IFunctionItemUpdateEvent {
    const functionItem: IFunctionItemUpdateEvent = {
      model: {
        name: this.nameModel.name,
        selectedFields: this.targetFields.map((f) => f.fieldModel.selectedField),
        ruleSet: this.ruleSet,
        fieldsSettings: this.targetFields.map((f) => f.fieldSettings)
      },
      expression: this.expression,
      isValid: this.nameForm.valid && this.ruleSet?.valid && this.targetFields.every((f) => f.fieldForm.valid)
    };
    return functionItem;
  }

  /**
   *
   * @param field
   * get or create an item of expression.fieldsSettings
   */

  private getOrCreateFieldConfig(field: IConfigurableListItem<any>): IFieldSettingsConfig {
    if (!this.fieldMap.has(field.id)) {
      const settings: IFieldSettingsConfig = {
        name: field.name,
        hidden: false,
        disabled: false,
        useDefaultValue: false,
        defaultValue: undefined,
        useHintMessage: false,
        hintMessage: undefined,
        visible: false,
        enabled: false,
        makeOptional: false,
        makeRequired: false
      };
      if (field.type === FieldTypeIds.EmbededField) {
        delete settings.defaultValue;
        delete settings.useDefaultValue;
      }

      this.fieldMap.set(field.id, settings);
    }
    const fieldValue = this.fieldMap.get(field.id);
    fieldValue.name = field.name;
    return fieldValue;
  }

  /**
   * emit update to the parent
   */
  private notify(): void {
    this.update.next(this.getEventModel());
  }

  // onModelChange(): void {
  //   if (!this.isFirstChange) {
  //     this.isFirstChange = true;
  //   } else {
  //     this.conditions.emit(true);
  //   }
  // }

  onNameChange(): void {
    this.conditions.emit(true);
  }

  onFieldSettingsChange(): void {
    this.conditions.emit(true);
  }

  onConditionChanges(event: boolean): void {
    this.conditions.emit(event);
  }
}
