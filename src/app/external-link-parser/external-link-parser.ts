export enum UrlEntityType {
  case = 'case',
  rawData = 'rawData',
  comment = 'comment'
}

export enum UrlViewEnum {
  gridView = 'gridView',
  // kanbanView = 'kanbanView',
  editPopupView = 'editPopupView',
  processSidePanelView = 'processSidePanelView',
  processFullScreenView = 'processFullScreenView'
}

export enum StepToLoadEnum {
  first = 'first',
  last = 'last'
}

export interface ExternalLinkQueries {
  // or tenantName
  tenantId?: string;
  view: UrlViewEnum;
  type: UrlEntityType;
  isSideMenuHidden?: boolean;
  stepToLoad?: StepToLoadEnum;
  entityId: string;
}

export interface ExternalIntegrationResponse {
  schemaPublicId?: string;
  tenantName?: string;
  workflowPublicId?: string;
}
