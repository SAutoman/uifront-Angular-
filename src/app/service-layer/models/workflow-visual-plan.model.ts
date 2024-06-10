import { ConnectorFieldLabelSettings } from '@wfm/common/models/connector-field';
import { MappingSearchFieldModel } from './dynamic-entity-models';

export interface WorkflowVisualPlanConfig extends CreateWorkflowVisualPlanConfig {
  workflowVisualPlanId: string;
}

export interface CreateWorkflowVisualPlanConfig {
  name: string;
  tenantId: string;
  workflowSchemaId: string;
  // serialized canvas settings (without objects - those are saved separately)
  canvas: string;
  units: Array<PlanUnit>;
}

export interface PlanUnit {
  // backend id
  id?: string;
  // ui id
  canvasObjectId: string;
  /**
   * serialized canvas object
   */
  canvasObject: string;
  /**
   * dataBinding associated with canvasObject
   */
  dataBinding: PlanUnitDataBinding;
}

export interface PlanUnitDataBinding {
  name: string;
  color: string;
  /**
   * json.stringified MappingSearchFieldModel[]
   */
  fieldMappings: string;
  /**
   * json.stringified ConnectorFieldLabelSettings
   */
  titleSettings: string;
  //UI props
  fieldMappingsUI?: { filters: MappingSearchFieldModel[] };
  titleSettingsUI?: ConnectorFieldLabelSettings;

  unitId?: string;
}

// for activated Units we can make a separate request, we will need to get
export interface MappedPlanUnitItem {
  unitId: string;
  workflowStateIds: string[];
  isUnitMapped: boolean;
}
