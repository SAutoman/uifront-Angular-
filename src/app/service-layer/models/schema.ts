import { IFieldConfiguration } from '@wfm/common/models';
import { AreaTypeEnum } from './area-type.enum';
import { CaseStatus } from './CaseStatus';
import { ConditionalFormatting } from './conditional-formatting';
import { Expression, PropertyPath, RuleCustomOperatorEnum, RuleSetCustomCondition } from './expressionModel';
import { IFieldBaseDto } from './field-base.dto';
import { SystemValueTypeEnum } from '@wfm/common/field/field-default-value/FieldDefaultValues';
import { HideFieldSetting } from '@wfm/forms-flow-struct/schema-additional-settings/fields-visibility/fields-visibility.component';

export interface SchemaDto {
  id: string;
  name: string;
  areaType: AreaTypeEnum;
  tenantId: string;
  functions: Expression[];
  status?: CaseStatus;
  fields: SchemaFieldDto[];
  schemaConfiguration?: SchemaConfiguration;
  virtualFields?: Array<VirtualFieldValueDto<SchemaFieldDto>>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface VirtualFieldValueDto<T> {
  tenantId: string;
  caseSchemaId: string;
  fieldName: string;
  fields: Array<T>;
}

export interface SchemaFieldDto extends IFieldBaseDto {
  schemaFieldConfiguration: IFieldConfiguration;
  tenantFieldId?: string;
}

export interface UpdateSchemaCommand {
  id: string;
  newTemplate: SchemaDto;
}

export interface SchemaConfiguration {
  conditionalFormattings?: ConditionalFormatting[];
  fastCreateSettings?: FastCreateSettings;
  validators?: SchemaValidator[];
  linkedListFields?: ListFieldsLink[];
  fieldVisibiltySettings?: HideFieldSetting[];
  dataLifetimeSettings: DataLifetimeSettings;
  // [key: string]: any;
}

export interface ListFieldsLink {
  parentFieldPath: string[];
  childFieldPath: string[];
}

export interface FastCreateSettings {
  // true => Enter keyStroke = "next control"
  // false => Enter keyStroke = "submit"
  enableBarcodeScanning: boolean;
  // path to fields that are to be shown in fastCreate form
  fields: Array<PropertyPath>;
}

export interface ExpirationPeriod {
  days: number;
  hours: number;
  minutes: number;
}

export interface DataLifetimeSettings {
  baseField: PropertyPath;
  expirationPeriod: ExpirationPeriod;
}

export interface SchemaValidator {
  crossSchemaValidator?: CrossSchemaValidatorDto;
  schemaValidator?: SchemaValidatorDto;
}

export enum SchemaValidatorEnum {
  CrossSchemaValidator = 1,
  SchemaValidator = 2 // WFM-3137
}

// if there is some entity that does not match the ruleset from the remote workflow, the validation is not passed
export interface CrossSchemaValidatorDto {
  name: string;
  type: SchemaValidatorEnum;
  workflowSchemaConnectorId: string;
  workflowSchemaId: string;
  ruleSet: DynamicRuleSet;
  validationAction: ValidatorActionEnum;
  message: string;
}

export interface DynamicRuleSet {
  /**
   * AND: ALL remote case shall meet this DynamicRules
   * OR: at least ONE remote case shall meet this DynamicRules
   */
  summaryCondition?: RuleSetCustomCondition;
  condition: RuleSetCustomCondition;
  rules: DynamicRule[];
}

export enum DynamicValueEnum {
  currentDate = 1,
  currentTime,
  currentDateTime
}

export interface DynamicRule {
  currentFieldPath: string[];
  operator: RuleCustomOperatorEnum;
  valueFieldPath?: string[];
  dynamicValue?: DynamicValueEnum;
}

export enum ValidatorActionEnum {
  BLOCK = 1,
  ALERT = 2
}

// 3137
export interface SchemaValidatorDto {
  // compare fields of the same entity
  ruleSet: DynamicRuleSet;
  validationAction: ValidatorActionEnum;
}

export interface ValidationResponse {
  validatorName: string;
  validationPassed: boolean;
  // the below 2 will be sent if the validation is not passing
  action?: ValidatorActionEnum;
  message?: string;
}

export interface ValidatSchemasRelation {
  isAllowed: boolean;
}
