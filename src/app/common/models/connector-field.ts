import { AreaTypeEnum, DynamicRuleSet, Sorting } from '@wfm/service-layer';
import { RuleSetCustom } from '@wfm/service-layer/models/expressionModel';

export enum ConnectorTypeEnum {
  WorkflowSchema,
  // Schema Connector not implemented yet
  Schema
}

export enum ConnectorRenderTypeEnum {
  SelectBox = 0,
  SearchInput = 1
}

export interface ConnectorFieldLabelSettings {
  keyValueSeparator: string;
  fieldSeparator: string;
  fieldSettings: ConnectorFieldLabelFieldSettings[];
}

export interface ConnectorFieldLabelFieldSettings {
  fieldId: string;
  numberOfSymbolsFieldName: number;
  // {0: Full FieldName, -1:FieldName Hidden}
  numberOfSymbolsFieldValue?: number;
  position: number;
}

export interface ConnectorOptionRules {
  ruleSet?: RuleSetCustom;
  statuses: string[];
  dynamicRuleSet?: DynamicRuleSet;
}

export interface ConnectorFieldConfiguration {
  allowMultipleSelection: boolean;
  connectorType: ConnectorTypeEnum;
  entitySource: {
    connectorId: string;
    // for ConnectorTypeEnum.WorkflowSchema,
    workflowConnectorSide?: string; // 'source' | 'destination';
    workflowSchemaId?: string;
    // for ConnectorTypeEnum.Schema
    schemaId?: string;
    entityAreaType: AreaTypeEnum;
  };
  labelSettings: ConnectorFieldLabelSettings;
  filterCriteria: ConnectorOptionRules;
  disableCriteria: ConnectorOptionRules;
  enableFieldExposure?: boolean;
  exposedFields?: string[];
  renderType?: ConnectorRenderTypeEnum;
  sortingRules: Sorting[];
}

export interface ConnectorFieldOption {
  enabled: boolean;
  label: string;
  dynamicEntityId: string;
  schemaId: string;
  areaType: AreaTypeEnum;
  labelFieldsValues: string[];
  // other props that we may need
}
