// Expression models for frontend/UI

import { IConfigurableListItem } from '@wfm/common/models';
import { PropertyPath, RuleCustomOperatorEnum, RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';

export interface ISchemaFieldRule {
  operator?: RuleCustomOperatorEnum;
  /**
   * id of the rule's selected field
   */
  itemId?: string;
  value?: any;
  valid?: boolean;
  propertyPath?: PropertyPath;
  fieldRef?: IConfigurableListItem;
}

export interface IWorkflowFieldRule {
  operator?: RuleCustomOperatorEnum;
  value?: any;
  valid?: boolean;
  propertyPath?: PropertyPath;
}

export interface IWorkflowFieldRuleSet {
  condition: RuleSetCustomCondition;
  rules: IWorkflowFieldRule[];
  valid?: boolean;
}

export interface IRuleSet {
  condition: RuleSetCustomCondition;
  rules?: ISchemaFieldRule[];
  systemRules?: ISchemaFieldRule[];
  valid?: boolean;
}

export interface IFunctionItemModel {
  name?: string;
  selectedFields?: Array<IConfigurableListItem<any>>;
  ruleSet?: IRuleSet;
  fieldsSettings?: IFieldSettings[];
}
/**
 * UI Expression actionSettings (actions to make if rules are met)
 */
export interface IFieldSettingsConfig {
  name: string;
  hidden?: boolean;
  disabled?: boolean;
  useDefaultValue?: boolean;
  defaultValue?: any;
  useHintMessage?: boolean;
  hintMessage?: string;
  /**
   * show only if the rules are met, otherwise hide
   */
  visible?: boolean;
  /**
   * enable only if the rules are met, otherwise disable
   */
  enabled?: boolean;
  makeRequired?: boolean;
  makeOptional?: boolean;
}

/**
 * UI Expression Action and the target field
 */
export interface IFieldSettings {
  field: IConfigurableListItem<any>;
  config?: IFieldSettingsConfig;
  fieldPath?: PropertyPath;
}

export interface IFunctionItemUpdateEvent {
  model: IFunctionItemModel;
  expression: IFieldsExpressionView;
  isValid: boolean;
}

interface IFieldsExpressionConfiguration {
  expanded?: boolean;
  isChanged?: boolean;
  valid?: boolean;
}

interface IFieldsExpression extends IConfigurableListItem<IFieldsExpressionConfiguration> {
  fields: IConfigurableListItem[];
  tenant?: string;
}

export interface IFieldsExpressionView extends IFieldsExpression {
  /**
   * prepare this field if use existing data
   */
  selectedFieldIds?: string[];
  fieldsUsedInRules?: string[];
  expressionModel?: IFunctionItemModel;
}
