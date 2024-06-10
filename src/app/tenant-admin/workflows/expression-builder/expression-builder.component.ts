import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IConfigurableListItem, IFormlyView, IObjectMap } from '@wfm/common/models';
import { FieldTypeIds, SchemaFieldDto, FieldTypeNameMap, AreaTypeEnum } from '@wfm/service-layer';
import {
  CustomRule,
  OverrideExpression,
  ProcessStepPath,
  PropertyPath,
  PropertyPathTypeEnum,
  RuleCustomOperatorEnum,
  RuleSetCustom,
  RuleSetCustomCondition
} from '@wfm/service-layer/models/expressionModel';
import { Roles } from '@wfm/service-layer/models/user-profile';
import { UserGroupsDto } from '@wfm/service-layer/models/UserGroups';
import { UserGroupsService } from '@wfm/service-layer/services/user-groups.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { distinctUntilChanged, filter, startWith, take, takeUntil } from 'rxjs/operators';
import { cloneDeep, remove } from 'lodash-core';
import { ISchemaFieldRule, IRuleSet, IWorkflowFieldRule, IWorkflowFieldRuleSet } from '@wfm/forms-flow-struct';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import {
  adapterToConfig,
  createConditionField,
  createOperatorField,
  createValueField
} from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { IFormlyRightButtonAddonConfig, Addons, FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue } from '@angular/common';
import { SchemaData, WorkflowStateSchemaData } from '../workflow-create/workflow-create.component';
import { Subscription } from 'rxjs';

export interface ExpressionConfig {
  title?: string;
  rules?: boolean;
  rulesLabel?: string;
  userRolesLabel?: string;
  userGroupsLabel?: string;
  buttons?: boolean;
}

interface IView {
  condition?: IFormlyView<IObjectMap<RuleSetCustomCondition>>;
  rules?: IFormlyView<IRuleForm>[];
  userGroups?: IFormlyView<any>;
  userRoles?: IFormlyView<any>;
  resolutionsCondition?: IFormlyView<IObjectMap<RuleSetCustomCondition>>;
  stepResolutionRules?: IFormlyView<IWorkflowFieldRuleForm>[];
}

interface IRuleForm {
  selectedSchemaRefName: string;
  rule: ISchemaFieldRule;
}

interface IWorkflowFieldRuleForm {
  selectedSchemaRefName: string;
  rule: IWorkflowFieldRule;
}

export interface OverrideExpressionOutput {
  data: OverrideExpression;
  isValid: boolean;
}

enum RuleTypeEnum {
  schemaFieldRule = 1,
  workflowFieldRule = 2
}

const ruleKey = 'rule';
const conditionKey = 'condition';
const resolutionConditionKey = 'resolutionCondition';

const itemIdKey = 'itemId';
const operatorKey = 'operator';
const valueKey = 'value';
const userGroupsKey = 'userGroups';
const userRolesKey = 'userRoles';
const schemaRefNameKey = 'selectedSchemaRefName';

@Component({
  selector: 'app-expression-builder',
  templateUrl: './expression-builder.component.html',
  styleUrls: ['./expression-builder.component.scss']
})
export class ExpressionBuilderComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() workflowStateSchemasData: WorkflowStateSchemaData;

  @Input() expressionConfig: ExpressionConfig;
  @Input() expressionDto: OverrideExpression;
  @Output() expressionUpdated: EventEmitter<OverrideExpressionOutput> = new EventEmitter();
  allRoles: { name: string; value: number }[] = [];
  userGroups: UserGroupsDto[];
  expressionsDef: OverrideExpression = {};
  schemaFieldRuleSubscriptions: Subscription[] = [];
  workflowRuleSubscriptions: Subscription[] = [];

  view: IView;

  constructor(
    store: Store<any>,
    private userGroupService: UserGroupsService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ExpressionBuilderComponent>,
    private expressionHelper: ExpressionHelperService,
    private ts: TranslateService
  ) {
    super(store);
  }

  async ngOnInit() {
    let defaultConfig: ExpressionConfig = {
      title: '',
      rules: false,
      rulesLabel: '',
      userRolesLabel: '',
      userGroupsLabel: '',
      buttons: false
    };
    this.expressionConfig = {
      ...defaultConfig,
      ...this.expressionConfig
    };
    const roles = [Roles.Tenant, Roles.TenantAdmin, Roles.Supplier, Roles.Auditor];

    this.allRoles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });

    await this.fetchUserGroups();

    this.initView(this.expressionDto);
  }

  async fetchUserGroups(): Promise<void> {
    const result = await this.userGroupService.getUserGroups(this.tenant);
    this.userGroups = result.items;
  }

  initView(expression: OverrideExpression): void {
    this.view = {};
    if (this.expressionConfig.rules) {
      this.initFieldRules(expression?.ruleSet);
      this.initWorkflowFieldRules(expression?.stepResolutions);
    }
    if (this.expressionConfig.userGroupsLabel) {
      this.view.userGroups = {
        fields: [this.createUserGroupsField()],
        form: this.fb.group({}),
        model: {
          [userGroupsKey]: this.expressionDto?.userGroups
        }
      };
    }

    if (this.expressionConfig.userRolesLabel) {
      this.view.userRoles = {
        fields: [this.createUserRolesField()],
        form: this.fb.group({}),
        model: {
          [userGroupsKey]: this.expressionDto?.userRoles
        }
      };
    }
  }

  createUserGroupsField(): FormlyFieldConfig {
    const adapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.expressionConfig.userGroupsLabel,
      name: userGroupsKey,
      type: FieldTypeIds.MultiselectListField,
      valueInfo: {
        options: this.userGroups.map((group) => {
          return {
            key: group.name,
            value: group.id
          };
        })
      },
      value: this.expressionDto ? this.expressionDto.userGroups : [],
      required: false
    });
    const config = adapterToConfig(adapter);
    config.className = 'col-lg-12';

    config.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
          this.notify();
        });
      }
    };

    return config;
  }

  createUserRolesField(): FormlyFieldConfig {
    const adapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.expressionConfig.userRolesLabel,
      name: userRolesKey,
      type: FieldTypeIds.MultiselectListField,
      valueInfo: {
        options: this.allRoles.map((role) => {
          return {
            key: role.name,
            value: role.value
          };
        })
      },
      value: this.expressionDto ? this.expressionDto.userRoles : [],
      required: false
    });

    const config = adapterToConfig(adapter);
    config.className = 'col-lg-12';

    config.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            distinctUntilChanged(),

            takeUntil(this.destroyed$)
          )
          .subscribe(() => {
            this.notify();
          });
      }
    };

    return config;
  }

  /**
   * helper methods
   */

  populatePropertyPath(field: SchemaFieldDto | IConfigurableListItem, schemaRefName: string): PropertyPath {
    const schemaData = this.getSchemaDataByRefName(schemaRefName);
    const propPath: PropertyPath = {
      path: this.getPath(field)
    };

    if (schemaData.areaType === AreaTypeEnum.case) {
      propPath.pathType = PropertyPathTypeEnum.CasePath;
    } else if (schemaData.areaType === AreaTypeEnum.stepForm) {
      propPath.pathType = PropertyPathTypeEnum.ProcessStepPath;
      (<ProcessStepPath>propPath).processStepRefName = schemaRefName;
    }
    return propPath;
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

  populateFieldOptions(fields: SchemaFieldDto[]): KeyValue<string, any>[] {
    const options = [];
    [...fields].forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      options.push(...retrieved);
    });
    return options;
  }

  getSchemaDataByPropertyPath(propertyPath: PropertyPath): SchemaData {
    if (!propertyPath) {
      return null;
    }
    switch (propertyPath.pathType) {
      case PropertyPathTypeEnum.CasePath:
        return this.workflowStateSchemasData.case;
      case PropertyPathTypeEnum.ProcessStepPath:
        const refName = (<ProcessStepPath>propertyPath).processStepRefName;
        return this.workflowStateSchemasData.steps.find((step) => step.refName === refName);
      case PropertyPathTypeEnum.Internal:
        const stepRefName = propertyPath.path[1];
        return this.workflowStateSchemasData.steps.find((step) => step.refName === stepRefName);
      default:
        return null;
    }
  }

  getSchemaDataByRefName(refName: string): SchemaData {
    if (this.workflowStateSchemasData.case.refName === refName) {
      return this.workflowStateSchemasData.case;
    } else {
      return this.workflowStateSchemasData.steps.find((step) => step.refName === refName);
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.schemaFieldRuleSubscriptions.forEach((subs) => {
      subs?.unsubscribe();
    });
    this.workflowRuleSubscriptions.forEach((subs) => {
      subs?.unsubscribe();
    });
  }

  /**
   * schemaField rules methods
   */

  initFieldRules(existingRule?: RuleSetCustom): void {
    const ruleSet: IRuleSet = cloneDeep(existingRule || {});
    if (!ruleSet.condition) {
      ruleSet.condition = RuleSetCustomCondition.And;
    }
    if (!ruleSet.rules) {
      ruleSet.rules = [];
    }
    this.view.condition = {
      fields: [createConditionField(conditionKey, ruleSet.condition)],
      form: this.fb.group({}),
      model: {
        [conditionKey]: ruleSet.condition
      }
    };

    this.view.rules = ruleSet.rules.map((rule, index) => {
      const fields = this.getSchemaDataByPropertyPath(rule.propertyPath)?.fields || [];

      let fieldOptions = this.populateFieldOptions(fields);
      const field = this.expressionHelper.getFieldByPath(
        rule.propertyPath.path,
        fieldOptions.map((x) => x.value)
      );
      const ruleWithFieldRef = {
        ...rule,
        fieldRef: field
      };

      return this.createSchemaAndRuleView(ruleWithFieldRef, index);
    });

    this.view.condition.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.notify();
      });

    this.checkConditionVisibility(RuleTypeEnum.schemaFieldRule);
  }

  private createSchemaAndRuleView(rule: ISchemaFieldRule, ruleIndex: number): IFormlyView<IRuleForm> {
    const schemaData = this.getSchemaDataByPropertyPath(rule.propertyPath);
    const schemaSelector = this.getSchemaSelectorConfig(rule);
    const ruleConfig = this.getSchemaFieldRuleConfig(rule, ruleIndex, []);

    const removeBtnConfig: IFormlyRightButtonAddonConfig = {
      icon: 'trash',
      color: ColorEnum.red,
      isFormGroup: true,
      onClick: () => {
        this.view.rules.splice(ruleIndex, 1);
        this.checkConditionVisibility(RuleTypeEnum.schemaFieldRule);
        this.notify();
      }
    };

    const fieldGroup: FormlyFieldConfig = {
      fieldGroupClassName: 'row',
      fieldGroup: [schemaSelector, ruleConfig],
      templateOptions: {
        [Addons.formlyRightBtn]: removeBtnConfig
      }
    };

    let schemaAndRuleView = {
      fields: [fieldGroup],
      form: this.fb.group({}),
      model: {
        selectedSchemaRefName: schemaData?.refName,
        rule: rule
      }
    };
    let isFirstChange = true;

    setTimeout(() => {
      schemaSelector.formControl.valueChanges
        .pipe(
          startWith(schemaSelector.formControl.value),
          filter((schema) => !!schema),
          distinctUntilChanged(),
          // take(1),

          takeUntil(this.destroyed$)
        )
        .subscribe((newSchemaRefName) => {
          // when the schema changes, the rule needs to be reinitialized

          const schemaData = this.getSchemaDataByRefName(newSchemaRefName);
          const schemaFields = schemaData?.fields || [];
          let ruleDef: ISchemaFieldRule;
          if (isFirstChange) {
            ruleDef = rule;
          } else {
            ruleDef = {
              itemId: undefined,
              operator: RuleCustomOperatorEnum.Equal,
              value: undefined,
              propertyPath: { path: [] }
            };
          }
          isFirstChange = false;
          const newRuleConfig = this.getSchemaFieldRuleConfig(ruleDef, ruleIndex, schemaFields);

          const ruleFieldGroup = this.view.rules[ruleIndex].fields[0];
          // replace ruleFieldConfig

          ruleFieldGroup.fieldGroup[1] = newRuleConfig;
          this.view.rules[ruleIndex] = {
            fields: [ruleFieldGroup],
            form: this.fb.group({}),
            model: {
              selectedSchemaRefName: newSchemaRefName,
              rule: ruleDef
            }
          };

          this.subscribeToFormChanges(this.view.rules[ruleIndex], ruleIndex, RuleTypeEnum.schemaFieldRule);
        });
    }, 100);
    this.subscribeToFormChanges(schemaAndRuleView, ruleIndex, RuleTypeEnum.schemaFieldRule);

    return schemaAndRuleView;
  }

  private getSchemaFieldRuleConfig(r: ISchemaFieldRule, ruleIndex: number, schemaFields: SchemaFieldDto[]): FormlyFieldConfig {
    const allFieldOptionsFlattened = this.populateFieldOptions(schemaFields);

    const fieldSelector = this.getSchemaFieldSelectorConfig(itemIdKey, r, ruleIndex, allFieldOptionsFlattened, schemaFields);

    let selectedField: IConfigurableListItem<any>;
    if (r.fieldRef?.id) {
      selectedField = allFieldOptionsFlattened.find((x) => x.value.id === r.fieldRef.id)?.value;
      if (selectedField) {
        selectedField.configuration.tenantId = this.tenant;
      }
    }

    const operatorField = createOperatorField(operatorKey, r.operator, selectedField?.type);
    operatorField.className = 'col-lg-12';

    const valueField = createValueField(valueKey, r.value, selectedField);
    valueField.className = 'col-lg-12';

    valueField.hideExpression = (model) => {
      if (model[operatorKey] === RuleCustomOperatorEnum.IsEmpty || model[operatorKey] === RuleCustomOperatorEnum.IsNotEmpty) {
        // when rule is IsEmpty or isNotEmpty, reset the rule value
        model[valueKey] = null;
        return true;
      }
      return false;
    };

    const ruleGroup: FormlyFieldConfig = {
      key: ruleKey,
      fieldGroupClassName: 'row',
      fieldGroup: [fieldSelector, operatorField, valueField]
    };

    ruleGroup.hideExpression = (model: any, formState: any, field: FormlyFieldConfig) => {
      if (!field.parent.model[schemaRefNameKey]) {
        field.parent[ruleKey] = {};
        return true;
      }
      return false;
    };
    return ruleGroup;
  }

  getSchemaFieldSelectorConfig(
    fieldKey: string,
    rule: ISchemaFieldRule,
    ruleIndex: number,
    options: KeyValue<string, any>[],
    schemaFields: SchemaFieldDto[]
  ): FormlyFieldConfig {
    const fieldOptions = options
      .filter((f) => f.value.type !== FieldTypeIds.EmbededField)
      .map((x) => {
        return {
          key: x.key,
          value: x.value.id,
          viewValue: `${x.key}`
        };
      });

    const selectFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Field'),
      name: fieldKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: fieldOptions
      },
      value: rule.fieldRef?.id || undefined,
      required: true
    });

    const selectFieldCfg = adapterToConfig(selectFieldAdapter, 'col-lg-12');
    selectFieldCfg.templateOptions.labelProp = 'viewValue';
    // selectFieldCfg.templateOptions.groupProp = 'group';

    selectFieldCfg.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            filter((itemId) => !!itemId),
            take(1)
          )
          .subscribe((itemId) => {
            const selectedField = options.find((x) => x.value.id === itemId)?.value;

            const ruleDef: ISchemaFieldRule = {
              itemId: itemId,
              fieldRef: selectedField
            };
            const newRuleConfig = this.getSchemaFieldRuleConfig({ [itemIdKey]: itemId, fieldRef: selectedField }, ruleIndex, schemaFields);

            const schemaSelectorValue = this.view.rules[ruleIndex].model[schemaRefNameKey];

            // replace ruleFieldConfig

            const ruleFieldGroup = this.view.rules[ruleIndex].fields[0];
            ruleFieldGroup.fieldGroup[1] = newRuleConfig;

            this.view.rules[ruleIndex] = {
              fields: [ruleFieldGroup],
              form: this.fb.group({}),
              model: {
                selectedSchemaRefName: schemaSelectorValue,
                rule: {
                  ...ruleDef,
                  propertyPath: this.populatePropertyPath(selectedField, schemaSelectorValue)
                }
              }
            };

            this.subscribeToFormChanges(this.view.rules[ruleIndex], ruleIndex, RuleTypeEnum.schemaFieldRule);
          });
      }
    };
    return selectFieldCfg;
  }

  getSchemaSelectorConfig(rule: ISchemaFieldRule): FormlyFieldConfig {
    const options = [];
    const caseSchema = {
      key: this.workflowStateSchemasData.case.schemaId,
      value: this.workflowStateSchemasData.case.refName,
      viewValue: this.workflowStateSchemasData.case.schemaName
    };

    options.push(caseSchema);
    this.workflowStateSchemasData.steps?.forEach((stepData) => {
      const option = {
        key: stepData.schemaId,
        value: stepData.refName,
        viewValue: stepData.schemaName
      };
      options.push(option);
    });
    let selecteSchema;
    if (rule.propertyPath?.pathType) {
      const data = this.getSchemaDataByPropertyPath(rule.propertyPath);
      selecteSchema = data.refName;
    }
    const selectSchemaAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Schema'),
      name: schemaRefNameKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: options
      },
      value: selecteSchema,
      required: true
    });

    const selectSchemaCfg = adapterToConfig(selectSchemaAdapter, 'col-lg-12');
    selectSchemaCfg.templateOptions.labelProp = 'viewValue';
    // selectFieldCfg.templateOptions.groupProp = 'group';

    return selectSchemaCfg;
  }

  /**
   * stepResolution rules methods
   */

  initWorkflowFieldRules(existingRule?: RuleSetCustom): void {
    const ruleSet: IWorkflowFieldRuleSet = cloneDeep(existingRule || {});
    if (!ruleSet.condition) {
      ruleSet.condition = RuleSetCustomCondition.And;
    }
    if (!ruleSet.rules) {
      ruleSet.rules = [];
    }
    this.view.resolutionsCondition = {
      fields: [createConditionField(resolutionConditionKey, ruleSet.condition)],
      form: this.fb.group({}),
      model: {
        [resolutionConditionKey]: ruleSet.condition
      }
    };

    this.view.stepResolutionRules = ruleSet.rules.map((rule, index) => {
      return this.createStepAndRuleView(rule, index);
    });

    this.view.resolutionsCondition.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.notify();
      });

    this.checkConditionVisibility(RuleTypeEnum.workflowFieldRule);
  }

  createStepAndRuleView(rule: ISchemaFieldRule, ruleIndex: number): IFormlyView<IRuleForm> {
    const schemaData = this.getSchemaDataByPropertyPath(rule.propertyPath);
    const stepSelector = this.getStepSelectorConfig(rule);
    const workflowRuleConfig = this.getWorkflowRuleConfig(rule, ruleIndex, []);

    const removeBtnConfig: IFormlyRightButtonAddonConfig = {
      icon: 'trash',
      color: ColorEnum.red,
      isFormGroup: true,
      onClick: () => {
        this.view.stepResolutionRules.splice(ruleIndex, 1);
        this.checkConditionVisibility(RuleTypeEnum.workflowFieldRule);
        this.notify();
      }
    };

    const ruleFieldGroup: FormlyFieldConfig = {
      fieldGroupClassName: 'row',
      fieldGroup: [stepSelector, workflowRuleConfig],
      templateOptions: {
        [Addons.formlyRightBtn]: removeBtnConfig
      }
    };

    let workflowFieldRuleView = {
      fields: [ruleFieldGroup],
      form: this.fb.group({}),
      model: {
        selectedSchemaRefName: schemaData?.refName,
        rule: rule
      }
    };
    let isFirstChange = true;

    setTimeout(() => {
      stepSelector.formControl.valueChanges
        .pipe(
          startWith(stepSelector.formControl.value),
          filter((step) => !!step),
          distinctUntilChanged(),
          // take(1),

          takeUntil(this.destroyed$)
        )
        .subscribe((newRefName) => {
          // when the schema changes, the rule needs to be reinitialized

          const schemaData = this.getSchemaDataByRefName(newRefName);
          const resolutions = schemaData?.resolutionOptions || [];
          let ruleDef: IWorkflowFieldRule;
          if (isFirstChange) {
            ruleDef = {
              ...rule,
              propertyPath: { pathType: PropertyPathTypeEnum.Internal, path: ['steps', newRefName, 'resolution'] }
            };
          } else {
            ruleDef = {
              operator: RuleCustomOperatorEnum.Equal,
              value: undefined,
              propertyPath: { pathType: PropertyPathTypeEnum.Internal, path: ['steps', newRefName, 'resolution'] }
            };
          }
          isFirstChange = false;
          const newRuleConfig = this.getWorkflowRuleConfig(ruleDef, ruleIndex, resolutions);
          // replace ruleFieldConfig

          const ruleFieldGroup = this.view.stepResolutionRules[ruleIndex].fields[0];
          ruleFieldGroup.fieldGroup[1] = newRuleConfig;

          this.view.stepResolutionRules[ruleIndex] = {
            fields: [ruleFieldGroup],
            form: this.fb.group({}),
            model: {
              selectedSchemaRefName: newRefName,
              rule: ruleDef
            }
          };
          this.subscribeToFormChanges(this.view.stepResolutionRules[ruleIndex], ruleIndex, RuleTypeEnum.workflowFieldRule);
        });
    }, 100);
    this.subscribeToFormChanges(workflowFieldRuleView, ruleIndex, RuleTypeEnum.workflowFieldRule);

    return workflowFieldRuleView;
  }
  getStepSelectorConfig(rule: IWorkflowFieldRule): FormlyFieldConfig {
    const options = [];

    this.workflowStateSchemasData.steps?.forEach((stepData) => {
      const option = {
        key: stepData.schemaId,
        value: stepData.refName,
        viewValue: stepData.schemaName
      };
      options.push(option);
    });
    let selecteSchema;
    if (rule.propertyPath?.pathType) {
      const data = this.getSchemaDataByPropertyPath(rule.propertyPath);
      selecteSchema = data.refName;
    }
    const selectStepAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Step'),
      name: schemaRefNameKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: options
      },
      value: selecteSchema,
      required: true
    });

    const selectSchemaCfg = adapterToConfig(selectStepAdapter, 'col-lg-12');
    selectSchemaCfg.templateOptions.labelProp = 'viewValue';
    // selectFieldCfg.templateOptions.groupProp = 'group';

    return selectSchemaCfg;
  }

  getWorkflowRuleConfig(rule: IWorkflowFieldRule, ruleIndex: number, resolutions: string[]): FormlyFieldConfig {
    const operatorField = createOperatorField(operatorKey, rule.operator, FieldTypeIds.ListField);
    operatorField.className = 'col-lg-12';

    const resolutionSelector = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Resolution'),
      name: valueKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: resolutions.map((res) => {
          return { key: res, value: res };
        })
      },
      value: rule.value || undefined,
      required: true
    });

    const resolutionCfg = adapterToConfig(resolutionSelector, 'col-lg-12');

    resolutionCfg.hideExpression = (model) => {
      if (model[operatorKey] === RuleCustomOperatorEnum.IsEmpty || model[operatorKey] === RuleCustomOperatorEnum.IsNotEmpty) {
        // when rule is IsEmpty or isNotEmpty, reset the rule value
        model[valueKey] = null;
        return true;
      }
      return false;
    };

    const ruleGroup: FormlyFieldConfig = {
      key: ruleKey,
      fieldGroupClassName: 'row',
      //for now we have only one option for this - resolution
      fieldGroup: [operatorField, resolutionCfg]
    };

    ruleGroup.hideExpression = (model: any, formState: any, field: FormlyFieldConfig) => {
      if (!field.parent.model[schemaRefNameKey]) {
        field.parent[ruleKey] = {};
        return true;
      }
      return false;
    };
    return ruleGroup;
  }

  /**
   * shared methods
   */
  onSubmit(): void {
    this.populateExpressionDef();
    if (this.dialogRef) {
      this.dialogRef.close({
        data: this.expressionsDef
      });
    }
  }

  populateExpressionDef(): void {
    try {
      const schemaFieldRules = this.view.rules?.map((k) => {
        const ruleModel = k.model[ruleKey];
        const rule: CustomRule = {
          propertyPath: ruleModel.propertyPath,
          operator: ruleModel.operator,
          value: ruleModel.value
        };
        return rule;
      });

      const resolutionRules = this.view.stepResolutionRules?.map((kaka) => {
        const ruleModel = kaka.model[ruleKey];
        const rule: CustomRule = {
          propertyPath: ruleModel.propertyPath,
          operator: ruleModel.operator,
          value: ruleModel.value
        };
        return rule;
      });

      this.expressionsDef = {};

      if (this.expressionConfig.userGroupsLabel) {
        this.expressionsDef.userGroups = this.view.userGroups?.model[userGroupsKey];
      }
      if (this.expressionConfig.userRolesLabel) {
        this.expressionsDef.userRoles = this.view.userRoles?.model[userRolesKey];
      }
      if (this.expressionConfig.rules) {
        if (schemaFieldRules?.length) {
          this.expressionsDef.ruleSet = {
            condition: this.view.condition?.model[conditionKey],
            rules: schemaFieldRules
          };
        }

        if (resolutionRules?.length) {
          this.expressionsDef.stepResolutions = {
            condition: this.view.resolutionsCondition?.model[resolutionConditionKey],
            rules: resolutionRules
          };
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  subscribeToFormChanges(view: IFormlyView, formIndex: number, ruleType: RuleTypeEnum): void {
    let subs: Subscription;
    switch (ruleType) {
      case RuleTypeEnum.schemaFieldRule:
        subs = this.schemaFieldRuleSubscriptions[formIndex];
        break;
      case RuleTypeEnum.workflowFieldRule:
        subs = this.workflowRuleSubscriptions[formIndex];
        break;

      default:
        break;
    }

    if (subs) {
      subs.unsubscribe();
    }
    subs = view.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        distinctUntilChanged()
      )
      .subscribe(() => {
        view.model.rule.valid = view.form.valid;
        this.notify();
      });
  }

  checkConditionVisibility(ruleType: RuleTypeEnum): void {
    if (ruleType === RuleTypeEnum.schemaFieldRule) {
      this.view.condition.fields[0].hide = this.view?.rules?.length > 1 ? false : true;
    } else if (ruleType === RuleTypeEnum.workflowFieldRule) {
      this.view.resolutionsCondition.fields[0].hide = this.view?.stepResolutionRules?.length > 1 ? false : true;
    }
  }

  addRule(ruleType: RuleTypeEnum): void {
    if (ruleType === RuleTypeEnum.schemaFieldRule) {
      const ruleDef: ISchemaFieldRule = {
        itemId: undefined,
        operator: RuleCustomOperatorEnum.Equal,
        value: undefined,
        propertyPath: { path: [] }
      };
      const ruleFormlyView = this.createSchemaAndRuleView(ruleDef, this.view.rules.length);
      this.view.rules.push(ruleFormlyView);
    } else if (ruleType === RuleTypeEnum.workflowFieldRule) {
      const ruleDef: IWorkflowFieldRule = {
        operator: RuleCustomOperatorEnum.Equal,
        value: undefined,
        propertyPath: { path: [] }
      };
      const ruleFormlyView = this.createStepAndRuleView(ruleDef, this.view.stepResolutionRules.length);
      this.view.stepResolutionRules.push(ruleFormlyView);
    }

    this.checkConditionVisibility(ruleType);
  }

  isExpressionValid(): boolean {
    const isAllGood =
      (!this.view.condition || this.view.condition.form.valid) &&
      (!this.view.rules || this.view.rules.every((formly) => formly.form.valid)) &&
      (!this.view.resolutionsCondition || this.view.resolutionsCondition.form.valid) &&
      (!this.view.stepResolutionRules || this.view.stepResolutionRules.every((formly) => formly.form.valid));
    return isAllGood;
  }

  notify(): void {
    this.populateExpressionDef();

    this.expressionUpdated.emit({
      data: this.expressionsDef,
      isValid: this.isExpressionValid()
    });
  }
}
