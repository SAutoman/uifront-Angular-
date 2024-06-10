/**
 * global
 */
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { cloneDeep, remove } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { KeyValue } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { IConfigurableListItem, IFormlyView, IObjectMap } from '@wfm/common/models';
import { SchemaDto, FieldTypeIds, SchemaFieldDto, FieldTypeNameMap, AreaTypeEnum } from '@wfm/service-layer';
import {
  CustomRule,
  ExpressionDef,
  RuleCustomOperatorEnum,
  RuleSetCustom,
  RuleSetCustomCondition
} from '@wfm/service-layer/models/expressionModel';
import { Roles } from '@wfm/service-layer/models/user-profile';
import { UserGroupsDto } from '@wfm/service-layer/models/UserGroups';
import { UserGroupsService } from '@wfm/service-layer/services/user-groups.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ISchemaFieldRule, IRuleSet } from '@wfm/forms-flow-struct';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import {
  adapterToConfig,
  createConditionField,
  createOperatorField,
  createValueField
} from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { IFormlyRightButtonAddonConfig, Addons, FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';

import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  ExpressionSystemFieldEnum,
  statusField,
  createdAtField,
  updatedAtField
} from '@wfm/forms-flow-struct/form-function-builder/system-fields';
import { workflowStatusesSelector } from '@wfm/store/workflow';

/**
 * local
 */
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
}

interface IRuleForm {
  rule: ISchemaFieldRule;
}

export interface ExpressionDefOutput {
  data: ExpressionDef;
  isValid: boolean;
}

interface KeyValueGroup<K, V> extends KeyValue<K, V> {
  group?: string;
}

const ruleKey = 'rule';
const conditionKey = 'condition';
const itemIdKey = 'itemId';
const operatorKey = 'operator';
const valueKey = 'value';
const userGroupsKey = 'userGroups';
const userRolesKey = 'userRoles';

@Component({
  selector: 'app-rules-builder',
  templateUrl: './rules-builder.component.html',
  styleUrls: ['./rules-builder.component.scss']
})
export class RulesBuilderComponent extends TenantComponent implements OnInit {
  @Input() expressionConfig: ExpressionConfig;
  @Input() expressionDto: ExpressionDef;
  @Input() schema?: SchemaDto;

  @Output() expressionUpdated: EventEmitter<ExpressionDefOutput> = new EventEmitter();
  allRoles: { name: string; value: number }[] = [];
  userGroups: UserGroupsDto[];
  expressionsDef: ExpressionDef = {};

  fieldOptions: KeyValueGroup<string, IConfigurableListItem>[];
  view: IView;
  systemFieldOptionsLoaded: boolean = false;
  createdAtField: IConfigurableListItem;
  updatedAtField: IConfigurableListItem;
  statusField: IConfigurableListItem;

  constructor(
    private store: Store<ApplicationState>,
    private userGroupService: UserGroupsService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RulesBuilderComponent>,
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

    if (this.schema) {
      this.populateFieldOptions();
    }
    this.initView(this.expressionDto?.ruleSet);
  }

  populateFieldOptions(): void {
    this.fieldOptions = [];
    [...this.schema.fields].forEach((field) => {
      let retrieved: KeyValueGroup<string, IConfigurableListItem>[] = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.fieldOptions = retrieved.map((item) => {
        return {
          ...item,
          group: this.ts.instant('Schema Fields')
        };
      });
    });

    this.populateSystemFields();
  }

  async fetchUserGroups(): Promise<void> {
    const result = await this.userGroupService.getUserGroups(this.tenant);
    this.userGroups = result.items;
  }

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
      const conditionValue = this.view.condition?.model[conditionKey];
      const fieldRules = [];
      const systemFieldRules = [];
      this.view.rules?.forEach((k) => {
        const ruleValue = k.model[ruleKey];
        const rule: CustomRule = {
          propertyPath: ruleValue.propertyPath,
          operator: ruleValue.operator,
          value: ruleValue.value
        };

        if (!ruleValue.fieldRef?.configuration?.forExpressions) {
          fieldRules.push(rule);
        } else {
          systemFieldRules.push(rule);
        }
      });

      this.expressionsDef = {
        userGroups: this.view.userGroups?.model[userGroupsKey],
        userRoles: this.view.userRoles?.model[userRolesKey],
        ruleSet: {
          condition: conditionValue,
          rules: fieldRules,
          systemRules: systemFieldRules
        }
      };
    } catch (error) {
      console.log(error);
    }
  }

  initView(existingRule?: RuleSetCustom): void {
    const ruleSet: IRuleSet = cloneDeep(existingRule || {});
    if (!ruleSet.condition) {
      ruleSet.condition = RuleSetCustomCondition.And;
    }
    if (!ruleSet.rules) {
      ruleSet.rules = [];
    }

    this.view = {};

    if (this.expressionConfig.rules) {
      this.view.condition = {
        fields: [createConditionField(conditionKey, ruleSet.condition)],
        form: this.fb.group({}),
        model: {
          [conditionKey]: ruleSet.condition
        }
      };

      const allRules = [...(ruleSet.rules || []), ...(ruleSet.systemRules || [])];

      this.view.rules = allRules.map((rule, index) => {
        const field = this.expressionHelper.getFieldByPath(
          rule.propertyPath.path,
          this.fieldOptions.map((x) => x.value)
        );
        const ruleWithFieldRef = {
          ...rule,
          fieldRef: field
        };

        return this.createRuleFormlyView(ruleWithFieldRef, index);
      });

      this.view.condition.form.valueChanges
        .pipe(
          filter((formValue) => !!formValue),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          this.notify();
        });

      this.checkConditionVisibility();
    }

    if (this.expressionConfig.userGroupsLabel) {
      this.view.userGroups = {
        fields: [this.createUserGroupsField()],
        form: this.fb.group({}),
        model: {
          [userGroupsKey]: this.expressionDto.userGroups
        }
      };
    }

    if (this.expressionConfig.userRolesLabel) {
      this.view.userRoles = {
        fields: [this.createUserRolesField()],
        form: this.fb.group({}),
        model: {
          [userGroupsKey]: this.expressionDto.userRoles
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

  private createRuleFormlyView(rule: ISchemaFieldRule, ruleIndex: number): IFormlyView<IRuleForm> {
    const ruleConfig = this.ruleToFormlyConfig(rule, ruleIndex);
    const ruleFormlyView = {
      fields: [ruleConfig],
      form: this.fb.group({}),
      model: { rule }
    };

    ruleFormlyView.form.valueChanges
      .pipe(
        filter((formValue) => !!formValue),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        ruleFormlyView.model.rule.valid = ruleFormlyView.form.valid;
        this.notify();
      });

    return ruleFormlyView;
  }

  private ruleToFormlyConfig(r: ISchemaFieldRule, ruleIndex: number): FormlyFieldConfig {
    let selectedField: IConfigurableListItem;
    if (r.fieldRef?.id) {
      selectedField = this.fieldOptions.find((x) => x.value.id === r.fieldRef.id)?.value;
      if (selectedField) {
        selectedField.configuration.tenantId = this.schema.tenantId;
      }
    }

    const removeBtnConfig: IFormlyRightButtonAddonConfig = {
      icon: 'trash',
      color: ColorEnum.red,
      isFormGroup: true,
      onClick: () => {
        const rule = this.view.rules.find((x) => x.fields[0] === ruleFieldConfig);
        if (rule) {
          this.removeRule(rule);
        }
      }
    };
    const fieldSelector = this.createFieldSelector(itemIdKey, r, ruleIndex);
    const hideEmptyOperator = selectedField && selectedField.id === 'statusId';
    const operatorField = createOperatorField(operatorKey, r.operator, selectedField?.type, '', hideEmptyOperator);
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

    const ruleFieldConfig: FormlyFieldConfig = {
      key: ruleKey,
      fieldGroupClassName: 'row',
      fieldGroup: [fieldSelector, operatorField, valueField],
      templateOptions: {
        [Addons.formlyRightBtn]: removeBtnConfig
      }
    };

    return ruleFieldConfig;
  }

  createFieldSelector(fieldKey: string, rule: ISchemaFieldRule, ruleIndex: number): FormlyFieldConfig {
    const fieldOptions = this.fieldOptions
      .filter((f) => f.value.type !== FieldTypeIds.EmbededField)
      .map((x) => {
        return {
          key: x.key,
          value: x.value.id,
          viewValue: `${x.key}`,
          group: x.group
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
    selectFieldCfg.templateOptions.groupProp = 'group';

    selectFieldCfg.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            filter((itemId) => !!itemId),
            take(1)
          )
          .subscribe((itemId) => {
            const selectedField = this.fieldOptions.find((x) => x.value.id === itemId)?.value;
            const newRuleFormlyView = this.createRuleFormlyView({ [itemIdKey]: itemId, fieldRef: selectedField }, ruleIndex);

            newRuleFormlyView.model.rule.propertyPath = {
              path: this.getPath(selectedField)
            };
            // replace the old rule with the new one with new field
            this.view.rules[ruleIndex] = newRuleFormlyView;
          });
      }
    };
    return selectFieldCfg;
  }

  private removeRule(ruleFormlyView: IFormlyView<IRuleForm>): void {
    remove(this.view.rules, (x) => x === ruleFormlyView);
    this.checkConditionVisibility();

    this.notify();
  }

  checkConditionVisibility(): void {
    this.view.condition.fields[0].hide = this.view?.rules?.length > 1 ? false : true;
  }

  addRule(): void {
    // const rules = this.view.rules;
    const ruleDef: ISchemaFieldRule = {
      itemId: undefined,
      operator: RuleCustomOperatorEnum.Equal,
      value: undefined,
      propertyPath: { path: [] }
    };
    const ruleFormlyView = this.createRuleFormlyView(ruleDef, this.view.rules.length);
    this.view.rules.push(ruleFormlyView);
    this.checkConditionVisibility();
  }

  onModelChange(): void {}

  isExpressionValid(): boolean {
    return (
      (!this.view.condition || this.view.condition.form.valid) && (!this.view.rules || this.view.rules.every((formly) => formly.form.valid))
    );
  }

  notify(): void {
    this.populateExpressionDef();

    this.expressionUpdated.emit({
      data: this.expressionsDef,
      isValid: this.isExpressionValid()
    });
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

  getFieldTypeLabel(type: FieldTypeIds): string {
    return FieldTypeNameMap.get(type).viewValue;
  }

  populateSystemFields(): void {
    this.store
      .select(workflowStatusesSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((result) => {
        const statuses = Object.values(result);
        // status
        // supported for rawData and case schemas
        if (
          this.schema &&
          [AreaTypeEnum.rawData, AreaTypeEnum.case].includes(this.schema.areaType) &&
          statuses?.length &&
          !this.isFieldInRuleFields(ExpressionSystemFieldEnum.statusId)
        ) {
          this.statusField = { ...statusField };
          this.statusField.configuration.options = statuses.map((status) => {
            return { key: status.name, value: status.id };
          });
          //  if we need unassigned option in statuses list
          // this.statusField.configuration.options.unshift({ key: 'Unassigned', value:-1 });
          this.fieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.statusField.viewName),
            value: this.statusField,
            group: this.ts.instant('System Fields')
          });
        }

        // createdAt
        if (!this.isFieldInRuleFields(ExpressionSystemFieldEnum.createdAt)) {
          this.createdAtField = { ...createdAtField };

          this.fieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.createdAtField.viewName),
            value: this.createdAtField,
            group: this.ts.instant('System Fields')
          });
        }
        // updatedAt
        if (!this.isFieldInRuleFields(ExpressionSystemFieldEnum.updatedAt)) {
          this.updatedAtField = { ...updatedAtField };

          this.fieldOptions.push(<KeyValueGroup<string, IConfigurableListItem>>{
            key: this.ts.instant(this.updatedAtField.viewName),
            value: this.updatedAtField,
            group: this.ts.instant('System Fields')
          });
        }

        this.systemFieldOptionsLoaded = true;
      });
  }

  isFieldInRuleFields(fieldId: ExpressionSystemFieldEnum | string): boolean {
    const fieldFound = this.fieldOptions.find((f) => f.value.id === fieldId);
    return !!fieldFound || false;
  }
}
