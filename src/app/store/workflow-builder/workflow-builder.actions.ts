/**
 * global
 */
import { Action } from '@ngrx/store';

/**
 * project
 */
import {
  CreateStatusCommand,
  CreateWorkflowCommand,
  UpdateWorkflowCommand,
  CreateProcessStepEntityCmd,
  UpdateWorkflowStatusCommand,
  WorkflowTransitionDto,
  ProcessStepLinkDto,
  UpdateProcessStepEntityCmd,
  Paging,
  ProcessStepEntityDto,
  PagedData,
  CreateWorkflowTransitionDto,
  UpdateWorkflowTransitionDto,
  CreateProcessStepLinkDtoNew,
  UpdateProcessStepLinkDto,
  WorkflowDto,
  WorkflowStatusDto,
  ProcessStepLinkPositionsDto,
  CopyWorkflow
} from '@wfm/service-layer';
import { CreateRawDataLinkDto, RawDataLinkDto } from '@wfm/tenant-admin/workflows/rawData-link/rawdata-link.model';
import { CreateFieldLinkDto, FieldLinkDto } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';

/**
 * local
 */

export interface ErrorStates {
  resetError?: boolean;
  resetLinkUpdateError?: boolean;
  resetStepUpdateError?: boolean;
  resetStepUpdateSuccess?: boolean;
  resetDefaultStatusError?: boolean;
}

export enum WorkflowBuilderActionTypes {
  AddStatus = '[WorkflowBuilder] Add Status',
  AddStatusSuccess = '[WorkflowBuilder] Add Status Success',
  AddStatusFail = '[WorkflowBuilder] Add Status Failed',

  UpdateStatus = '[WorkflowBuilder] Update Status',
  UpdateStatusSuccess = '[WorkflowBuilder] Update Status Success',
  UpdateStatusFail = '[WorkflowBuilder] Update Status Failed',

  DeleteStatus = '[WorkflowBuilder] Delete Status',
  DeleteStatusSuccess = '[WorkflowBuilder] Delete Status Success',
  DeleteStatusFail = '[WorkflowBuilder] Delete Status Failed',

  CreateWorkflow = '[WorkflowBuilder] Create Workflow',
  CreateWorkflowSuccess = '[WorkflowBuilder] Create Workflow Success',
  CreateWorkflowFailure = '[WorkflowBuilder] Create Workflow Failed',

  FixWorkflow = '[WorkflowBuilder] Fix Workflow',

  UpdateWorkflow = '[WorkflowBuilder] Update Workflow',
  UpdateWorkflowSuccess = '[WorkflowBuilder] Update Workflow Success',
  UpdateWorkflowFailure = '[WorkflowBuilder] Update Workflow Failure',

  DeleteWorkflow = '[WorkflowBuilder] Delete Workflow Delete',
  DeleteWorkflowSuccess = '[WorkflowBuilder] Delete Workflow Delete Success',
  DeleteWorkflowFailure = '[WorkflowBuilder] Delete Workflow Delete Failure',

  ResetErrorState = '[WorkflowBuilder] Reset Error/Success States',

  AddProcessStepEntity = '[WorkflowBuilder] Add Process Step',
  AddProcessStepEntitySuccess = '[WorkflowBuilder] Add Process Step Success',
  AddProcessStepEntityFailed = '[WorkflowBuilder] Add Process Step Failed',

  UpdateProcessStepEntity = '[Workflow] Update Process Step',
  UpdateProcessStepEntitySuccess = '[Workflow] Update Process Step Success',
  UpdateProcessStepEntityFailed = '[Workflow] Update Process Step Failed',

  DeleteProcessStepEntity = '[WorkflowBuilder] Delete Process Step Entity',
  DeleteProcessStepEntitySuccess = '[WorkflowBuilder] Delete Process Step Entity Success',
  DeleteProcessStepEntityFailed = '[WorkflowBuilder] Delete Process Step Entity Failed',

  GetProcessSteps = '["WorkflowBuilder"] Get List Of Process Steps',
  GetProcessStepsSuccess = '["WorkflowBuilder"] Get List Of Process Steps Success',
  GetProcessStepsFail = '["WorkflowBuilder"] Get List Of Process Steps Fail',

  GetWorkflowTransitions = '[WorkflowBuilder] Get List of WorkflowTransitions',
  GetWorkflowTransitionsSuccess = '[WorkflowBuilder] Get List of WorkflowTransitions Success',
  GetWorkflowTransitionsFail = '[WorkflowBuilder] Get List of WorkflowTransitions Fail',

  GetWorkflowProcessStepLinks = '[WorkflowBuilder] Get List of GetWorkflowProcessStepLinks',
  GetWorkflowProcessStepLinksSuccess = '[WorkflowBuilder] Get List of GetWorkflowProcessStepLinks Success',
  GetWorkflowProcessStepLinksFail = '[WorkflowBuilder] Get List of GetWorkflowProcessStepLinks Fail',

  AddProcessStepLink = '[WorkflowBuilder] Add  ProcessStep Link ',
  AddProcessStepLinkSuccess = '[WorkflowBuilder] Add  ProcessStep Link Success',
  AddProcessStepLinkFail = '[WorkflowBuilder] Add  ProcessStep Link Fail',

  UpdateProcessStepLink = '[WorkflowBuilder] Update  ProcessStep Link ',
  UpdateProcessStepLinkSuccess = '[WorkflowBuilder] Update  ProcessStep Link Success',
  UpdateProcessStepLinkFail = '[WorkflowBuilder] Update  ProcessStep Link Fail',

  DeleteProcessStepLink = '[WorkflowBuilder] Delete  ProcessStep Link',
  DeleteProcessStepLinkSuccess = '[WorkflowBuilder] Delete  ProcessStep Link Success',
  DeleteProcessStepLinkFail = '[WorkflowBuilder] Delete  ProcessStep Link Fail',

  AddTransition = '[WorkflowBuilder] Add  Transition ',
  AddTransitionSuccess = '[WorkflowBuilder] Add  Transition Success',
  AddTransitionFail = '[WorkflowBuilder] Add  Transition Fail',

  UpdateTransition = '[WorkflowBuilder] Update  Transition ',
  UpdateTransitionSuccess = '[WorkflowBuilder] Update  Transition Success',
  UpdateTransitionFail = '[WorkflowBuilder] Update  Transition Fail',

  DeleteTransition = '[WorkflowBuilder] Delete  Transition ',
  DeleteTransitionSuccess = '[WorkflowBuilder] Delete  Transition Success',
  DeleteTransitionFail = '[WorkflowBuilder] Delete  Transition Fail',

  SetDefaultStatus = '[Workflow] Set Default Status',
  SetDefaultStatusSuccess = '[Workflow] Set Default Status Success',
  SetDefaultStatusFail = '[Workflow] Set Default Status Fail',

  GetWorkflowsByPagination = '[WorkflowBuilder] Get Workflows By Pagination',
  GetWorkflowsByPaginationSuccess = '[WorkflowBuilder] Get Workflows By Pagination Success',
  GetWorkflowsByPaginationFail = '[WorkflowBuilder] Get Workflows By Pagination Fail',

  GetProcessStepDataById = '[WorkflowBuilder] Get Process Step Data By Id',
  GetProcessStepDataByIdSuccess = '[WorkflowBuilder] Get Process Step Data By Id Success',
  GetProcessStepDataByIdFail = '[WorkflowBuilder] Get Process Step Data By Id Failed',
  ClearCurrentProcessStepData = '[WorkflowBuilder] Clear Current Process Step Data',

  GetStatusDataById = '[WorkflowBuilder] Get Status Data By Id',
  GetStatusDataByIdSuccess = '[WorkflowBuilder] Get Status Data By Id Success',
  GetStatusDataByIdFail = '[WorkflowBuilder] Get Status Data By Id Failed',
  ClearCurrentStatusData = '[WorkflowBuilder] Clear Current Status Data',

  ResetWfOperationMsg = '[WorkflowBuilder] Reset Wf Operation Msg',

  CreateCaseFieldLink = '[WorkflowBuilder] Create Case Field Link',
  CreateCaseFieldLinkSuccess = '[WorkflowBuilder] Create Case Field Link Success',
  CreateCaseFieldLinkFail = '[WorkflowBuilder] Create Case Field Link Fail',

  UpdateCaseFieldLink = '[WorkflowBuilder] Update Case Field Link',
  UpdateCaseFieldLinkSuccess = '[WorkflowBuilder] Update Case Field Link Success',
  UpdateCaseFieldLinkFail = '[WorkflowBuilder] Update Case Field Link Fail',

  DeleteCaseFieldLink = '[WorkflowBuilder] Delete Case Field Link',
  DeleteCaseFieldLinkSuccess = '[WorkflowBuilder] Delete Case Field Link Success',
  DeleteCaseFieldLinkFail = '[WorkflowBuilder] Delete Case Field Link Fail',

  GetCaseFieldLink = '[WorkflowBuilder] Get Case Field Link',
  GetCaseFieldLinkSuccess = '[WorkflowBuilder] Get Case Field Link Success',
  GetCaseFieldLinkFail = '[WorkflowBuilder] Get Case Field Link Fail',

  GetAllCaseFieldLinks = '[WorkflowBuilder] Get All Case Field Links',
  GetAllCaseFieldLinksSuccess = '[WorkflowBuilder] Get All Case Field Links Success',
  GetAllCaseFieldLinksFail = '[WorkflowBuilder] Get All Case Field Links Fail',

  CreateRawDataLink = '[WorkflowBuilder] Create RawData Link',
  CreateRawDataLinkSuccess = '[WorkflowBuilder] Create RawData Link Success',
  CreateRawDataLinkFail = '[WorkflowBuilder] Create RawData Link Fail',

  UpdateRawDataLink = '[WorkflowBuilder] Update RawData Link',
  UpdateRawDataLinkSuccess = '[WorkflowBuilder] Update RawData Link Success',
  UpdateRawDataLinkFail = '[WorkflowBuilder] Update RawData Link Fail',

  DeleteRawDataLink = '[WorkflowBuilder] Delete RawData Link',
  DeleteRawDataLinkSuccess = '[WorkflowBuilder] Delete RawData Link Success',
  DeleteRawDataLinkFail = '[WorkflowBuilder] Delete RawData Link Fail',

  GetRawDataLink = '[WorkflowBuilder] Get RawData Link',
  GetRawDataLinkSuccess = '[WorkflowBuilder] Get RawData Link Success',
  GetRawDataLinkFail = '[WorkflowBuilder] Get RawData Link Fail',

  GetAllRawDataLinks = '[WorkflowBuilder] Get All RawData Links',
  GetAllRawDataLinksSuccess = '[WorkflowBuilder] Get All RawData Links Success',
  GetAllRawDataLinksFail = '[WorkflowBuilder] Get All RawData Links Fail',

  UpdateAllProcessStepLinksPosition = '[WorkflowBuilder] Update All Process Step Links Position',
  UpdateAllProcessStepLinksPositionSuccess = '[WorkflowBuilder] Update All Process Step Links Position Success',
  UpdateAllProcessStepLinksPositionFailure = '[WorkflowBuilder] Update All Process Step Links Position Fail',

  CreateWorkflowCopy = '[Workflow Builder] Create Workflow Copy',
  CreateWorkflowCopySuccess = '[Workflow Builder] Create Workflow Copy Success',
  CreateWorkflowCopyFailed = '[Workflow Builder] Create Workflow Copy Failed'
}

export class AddStatus implements Action {
  readonly type = WorkflowBuilderActionTypes.AddStatus;
  constructor(public payload: { data: CreateStatusCommand }) {}
}

export class AddStatusSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.AddStatusSuccess;
  constructor(public payload: { data: { tenantId: string; id: string } }) {}
}

export class AddStatusFail implements Action {
  readonly type = WorkflowBuilderActionTypes.AddStatusFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateStatus implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateStatus;
  constructor(public payload: { id: string; data: UpdateWorkflowStatusCommand }) {}
}

export class UpdateStatusSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateStatusSuccess;
  constructor(public payload: { tenantId: string; id: string }) {}
}

export class UpdateStatusFail implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateStatusFail;
  constructor(public payload: { error: string }) {}
}

export class ResetWfOperationMsg implements Action {
  readonly type = WorkflowBuilderActionTypes.ResetWfOperationMsg;
  constructor() {}
}

export class DeleteStatus implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteStatus;
  constructor(public payload: { statusId: string }) {}
}

export class DeleteStatusSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteStatusSuccess;
  constructor() {}
}

export class DeleteStatusFail implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteStatusFail;
  constructor(public payload: { error: string }) {}
}

export class GetStatusDataById implements Action {
  readonly type = WorkflowBuilderActionTypes.GetStatusDataById;
  constructor(public payload: { data: { id: string } }) {}
}

export class GetStatusDataByIdSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetStatusDataByIdSuccess;
  constructor(public payload: { data: WorkflowStatusDto }) {}
}

export class GetStatusDataByIdFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetStatusDataByIdFail;
  constructor() {}
}

export class ClearCurrentStatusData implements Action {
  readonly type = WorkflowBuilderActionTypes.ClearCurrentStatusData;
  constructor() {}
}

// WORKFLOW CASES

export class CreateWorkflow implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflow;
  constructor(public payload: { data: CreateWorkflowCommand; defaultStatusId: string }) {}
}

export class CreateWorkflowSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflowSuccess;
  constructor(public payload: { defaultStatusId: string; workflowId: string; msg: string }) {}
}
export class CreateWorkflowFailure implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflowFailure;
  constructor(public payload: { error: string }) {}
}

export class FixWorkflow implements Action {
  readonly type = WorkflowBuilderActionTypes.FixWorkflow;
  constructor(public payload: { data: UpdateWorkflowCommand }) {}
}

export class UpdateWorkflow implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateWorkflow;
  constructor(public payload: { data: UpdateWorkflowCommand }) {}
}

export class UpdateWorkflowSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateWorkflowSuccess;
  constructor(public payload: { workflowId: string; msg: string }) {}
}

export class UpdateWorkflowFailure implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateWorkflowFailure;
  constructor(public payload: { errorMessage: string }) {}
}

export class DeleteWorkflow implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteWorkflow;
  constructor(public payload: { tenantId: string; wfId: string }) {}
}

export class DeleteWorkflowSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteWorkflowSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteWorkflowFailure implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteWorkflowFailure;
  constructor(public payload: { error: string }) {}
}

export class ResetErrorState implements Action {
  readonly type = WorkflowBuilderActionTypes.ResetErrorState;
  constructor(public payload: ErrorStates) {}
}

export class CreateWorkflowCopy implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflowCopy;
  constructor(public payload: { data: CopyWorkflow }) {}
}

export class CreateWorkflowCopySuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflowCopySuccess;
  constructor(public payload: { workflowId: string; msg: string }) {}
}

export class CreateWorkflowCopyFailed implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateWorkflowCopyFailed;
  constructor(public payload: { error: string }) {}
}

/** Process Step */

export class AddProcessStepEntity implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepEntity;
  constructor(public payload: { data: CreateProcessStepEntityCmd }) {}
}

export class AddProcessStepEntitySuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepEntitySuccess;
  constructor() {}
}

export class AddProcessStepEntityFailed implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepEntityFailed;
  constructor(public payload: { error: string }) {}
}

export class UpdateProcessStepEntity implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepEntity;
  constructor(public payload: { data: UpdateProcessStepEntityCmd }) {}
}

export class UpdateProcessStepEntitySuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepEntitySuccess;
  constructor() {}
}

export class UpdateProcessStepEntityFailed implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepEntityFailed;
  constructor(public payload: { error: string }) {}
}

export class DeleteProcessStepEntity implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepEntity;
  constructor(public payload: { tenantId: string; id: string }) {}
}

export class DeleteProcessStepEntitySuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepEntitySuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteProcessStepEntityFailed implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepEntityFailed;
  constructor(public payload: { error: string }) {}
}

export class GetProcessSteps implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessSteps;
  constructor(public payload: { tenantId: string; paging: Paging }) {}
}

export class GetProcessStepsSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessStepsSuccess;
  constructor(public payload: { data: PagedData<ProcessStepEntityDto> }) {}
}

export class GetProcessStepsFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessStepsFail;
  constructor(public payload: { error: string }) {}
}

export class GetProcessStepDataById implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessStepDataById;
  constructor(public payload: { data: { id: string } }) {}
}

export class GetProcessStepDataByIdSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessStepDataByIdSuccess;
  constructor(public payload: { data: ProcessStepEntityDto }) {}
}

export class GetProcessStepDataByIdFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetProcessStepDataByIdFail;
  constructor() {}
}

export class ClearCurrentProcessStepData implements Action {
  readonly type = WorkflowBuilderActionTypes.ClearCurrentProcessStepData;
  constructor() {}
}

export class GetWorkflowTransitions implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowTransitions;
  constructor(public payload: { tenantId: string; workflowId: string }) {}
}

export class GetWorkflowTransitionsSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowTransitionsSuccess;
  constructor(public payload: { data: WorkflowTransitionDto[] }) {}
}
export class GetWorkflowTransitionsFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowTransitionsFail;
  constructor(public payload: { error: string }) {}
}

export class GetWorkflowProcessStepLinks implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowProcessStepLinks;
  constructor(public payload: { tenantId: string; workflowId: string }) {}
}

export class GetWorkflowProcessStepLinksSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowProcessStepLinksSuccess;
  constructor(public payload: { data: ProcessStepLinkDto[] }) {}
}
export class GetWorkflowProcessStepLinksFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowProcessStepLinksFail;
  constructor(public payload: { error: string }) {}
}

export class AddProcessStepLink implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepLink;
  constructor(public payload: { tenantId: string; data: CreateProcessStepLinkDtoNew }) {}
}

export class AddProcessStepLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepLinkSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class AddProcessStepLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.AddProcessStepLinkFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateProcessStepLink implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepLink;
  constructor(public payload: { tenantId: string; data: UpdateProcessStepLinkDto }) {}
}

export class UpdateProcessStepLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepLinkSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class UpdateProcessStepLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateProcessStepLinkFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteProcessStepLink implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepLink;
  constructor(public payload: { tenantId: string; id: string; workflowId: string }) {}
}

export class DeleteProcessStepLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepLinkSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class DeleteProcessStepLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteProcessStepLinkFail;
  constructor(public payload: { error: string }) {}
}

export class AddTransition implements Action {
  readonly type = WorkflowBuilderActionTypes.AddTransition;
  constructor(public payload: { tenantId: string; data: CreateWorkflowTransitionDto }) {}
}

export class AddTransitionSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.AddTransitionSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class AddTransitionFail implements Action {
  readonly type = WorkflowBuilderActionTypes.AddTransitionFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateTransition implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateTransition;
  constructor(public payload: { tenantId: string; data: UpdateWorkflowTransitionDto }) {}
}

export class UpdateTransitionSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateTransitionSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class UpdateTransitionFail implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateTransitionFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteTransition implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteTransition;
  constructor(public payload: { tenantId: string; id: string; workflowId: string }) {}
}

export class DeleteTransitionSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteTransitionSuccess;
  constructor(public payload: { id: string; workflowId: string }) {}
}
export class DeleteTransitionFail implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteTransitionFail;
  constructor(public payload: { error: string }) {}
}

export class SetDefaultStatus implements Action {
  readonly type = WorkflowBuilderActionTypes.SetDefaultStatus;
  constructor(public payload: { wfId: string; defaultStatusId: string }) {}
}

export class SetDefaultStatusSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.SetDefaultStatusSuccess;
  constructor() {}
}

export class SetDefaultStatusFail implements Action {
  readonly type = WorkflowBuilderActionTypes.SetDefaultStatusFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateAllProcessStepLinksPosition implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPosition;
  constructor(public payload: { tenantId: string; wfId: string; data: ProcessStepLinkPositionsDto[] }) {}
}

export class UpdateAllProcessStepLinksPositionSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPositionSuccess;
  constructor(public payload: { msg: string }) {}
}

export class UpdateAllProcessStepLinksPositionFailure implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateAllProcessStepLinksPositionFailure;
  constructor(public payload: { error: string }) {}
}

// Workflows
export class GetWorkflowsByPagination implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowsByPagination;
  constructor(public payload: { paging?: Paging }) {}
}

export class GetWorkflowsByPaginationSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowsByPaginationSuccess;
  constructor(public payload: { items: WorkflowDto[]; total: number; incorrectItems: WorkflowDto[] }) {}
}

export class GetWorkflowsByPaginationFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetWorkflowsByPaginationFail;
  constructor() {}
}

export class CreateCaseFieldLink implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateCaseFieldLink;
  constructor(public payload: { data: CreateFieldLinkDto }) {}
}

export class CreateCaseFieldLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateCaseFieldLinkSuccess;
  constructor(public payload: { fieldLink: FieldLinkDto; msg: string }) {}
}
export class CreateCaseFieldLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateCaseFieldLinkFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateCaseFieldLink implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateCaseFieldLink;
  constructor(public payload: { data: FieldLinkDto }) {}
}

export class UpdateCaseFieldLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateCaseFieldLinkSuccess;
  constructor(public payload: { fieldLink: FieldLinkDto; msg: string }) {}
}
export class UpdateCaseFieldLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateCaseFieldLinkFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteCaseFieldLink implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteCaseFieldLink;
  constructor(public payload: { tenantId: string; linkId: string }) {}
}

export class DeleteCaseFieldLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteCaseFieldLinkSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteCaseFieldLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteCaseFieldLinkFail;
  constructor(public payload: { error: string }) {}
}

export class GetCaseFieldLink implements Action {
  readonly type = WorkflowBuilderActionTypes.GetCaseFieldLink;
  constructor(public payload: { tenantId: string; linkId: string }) {}
}

export class GetCaseFieldLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetCaseFieldLinkSuccess;
  constructor(public payload: { fieldLink: FieldLinkDto }) {}
}

export class GetCaseFieldLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetCaseFieldLinkFail;
  constructor(public payload: { error: string }) {}
}

export class GetAllCaseFieldLinks implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllCaseFieldLinks;
  constructor(public payload: { tenantId: string; workflowId: string }) {}
}

export class GetAllCaseFieldLinksSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllCaseFieldLinksSuccess;
  constructor(public payload: { fieldLinks: FieldLinkDto[] }) {}
}

export class GetAllCaseFieldLinksFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllCaseFieldLinksFail;
  constructor(public payload: { error: string }) {}
}

export class CreateRawDataLink implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateRawDataLink;
  constructor(public payload: { data: CreateRawDataLinkDto }) {}
}

export class CreateRawDataLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateRawDataLinkSuccess;
  constructor(public payload: { rawDataLink: RawDataLinkDto; msg: string }) {}
}
export class CreateRawDataLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.CreateRawDataLinkFail;
  constructor(public payload: { error: string }) {}
}

export class UpdateRawDataLink implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateRawDataLink;
  constructor(public payload: { data: RawDataLinkDto }) {}
}

export class UpdateRawDataLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateRawDataLinkSuccess;
  constructor(public payload: { rawDataLink: RawDataLinkDto; msg: string }) {}
}
export class UpdateRawDataLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.UpdateRawDataLinkFail;
  constructor(public payload: { error: string }) {}
}

export class DeleteRawDataLink implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteRawDataLink;
  constructor(public payload: { tenantId: string; linkId: string }) {}
}

export class DeleteRawDataLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteRawDataLinkSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteRawDataLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.DeleteRawDataLinkFail;
  constructor(public payload: { error: string }) {}
}

export class GetRawDataLink implements Action {
  readonly type = WorkflowBuilderActionTypes.GetRawDataLink;
  constructor(public payload: { tenantId: string; linkId: string }) {}
}

export class GetRawDataLinkSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetRawDataLinkSuccess;
  constructor(public payload: { rawDataLink: RawDataLinkDto }) {}
}

export class GetRawDataLinkFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetRawDataLinkFail;
  constructor(public payload: { error: string }) {}
}

export class GetAllRawDataLinks implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllRawDataLinks;
  constructor(public payload: { tenantId: string; workflowId: string }) {}
}

export class GetAllRawDataLinksSuccess implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllRawDataLinksSuccess;
  constructor(public payload: { rawDataLinks: RawDataLinkDto[] }) {}
}

export class GetAllRawDataLinksFail implements Action {
  readonly type = WorkflowBuilderActionTypes.GetAllRawDataLinksFail;
  constructor(public payload: { error: string }) {}
}

export type WorkflowBuilderActions =
  | AddStatus
  | AddStatusSuccess
  | AddStatusFail
  | UpdateStatus
  | UpdateStatusSuccess
  | UpdateStatusFail
  | DeleteStatus
  | DeleteStatusSuccess
  | DeleteStatusFail
  | CreateWorkflow
  | CreateWorkflowSuccess
  | CreateWorkflowFailure
  | FixWorkflow
  | UpdateWorkflow
  | UpdateWorkflowSuccess
  | DeleteWorkflow
  | DeleteWorkflowSuccess
  | DeleteWorkflowFailure
  | AddProcessStepEntity
  | AddProcessStepEntitySuccess
  | AddProcessStepEntityFailed
  | UpdateProcessStepEntity
  | UpdateProcessStepEntitySuccess
  | UpdateProcessStepEntityFailed
  | DeleteProcessStepEntity
  | DeleteProcessStepEntitySuccess
  | DeleteProcessStepEntityFailed
  | GetProcessSteps
  | GetProcessStepsSuccess
  | GetProcessStepsFail
  | GetWorkflowTransitions
  | GetWorkflowTransitionsSuccess
  | GetWorkflowTransitionsFail
  | GetWorkflowProcessStepLinks
  | GetWorkflowProcessStepLinksSuccess
  | GetWorkflowProcessStepLinksFail
  | AddProcessStepLink
  | AddProcessStepLinkSuccess
  | AddProcessStepLinkFail
  | UpdateProcessStepLink
  | UpdateProcessStepLinkSuccess
  | UpdateProcessStepLinkFail
  | DeleteProcessStepLink
  | DeleteProcessStepLinkSuccess
  | DeleteProcessStepLinkFail
  | AddTransition
  | AddTransitionSuccess
  | AddTransitionFail
  | UpdateTransition
  | UpdateTransitionSuccess
  | UpdateTransitionFail
  | DeleteTransition
  | DeleteTransitionSuccess
  | DeleteTransitionFail
  | ResetErrorState
  | SetDefaultStatus
  | SetDefaultStatusSuccess
  | SetDefaultStatusFail
  | GetWorkflowsByPagination
  | GetWorkflowsByPaginationSuccess
  | GetWorkflowsByPaginationFail
  | GetProcessStepDataById
  | GetProcessStepDataByIdSuccess
  | GetProcessStepDataByIdFail
  | ClearCurrentProcessStepData
  | GetStatusDataById
  | GetStatusDataByIdSuccess
  | GetStatusDataByIdFail
  | ClearCurrentStatusData
  | ResetWfOperationMsg
  | UpdateWorkflowFailure
  | CreateCaseFieldLink
  | CreateCaseFieldLinkSuccess
  | CreateCaseFieldLinkFail
  | UpdateCaseFieldLink
  | UpdateCaseFieldLinkSuccess
  | UpdateCaseFieldLinkFail
  | DeleteCaseFieldLink
  | DeleteCaseFieldLinkSuccess
  | DeleteCaseFieldLinkFail
  | GetCaseFieldLink
  | GetCaseFieldLinkSuccess
  | GetCaseFieldLinkFail
  | GetAllCaseFieldLinks
  | GetAllCaseFieldLinksSuccess
  | GetAllCaseFieldLinksFail
  | CreateRawDataLink
  | CreateRawDataLinkSuccess
  | CreateRawDataLinkFail
  | UpdateRawDataLink
  | UpdateRawDataLinkSuccess
  | UpdateRawDataLinkFail
  | DeleteRawDataLink
  | DeleteRawDataLinkSuccess
  | DeleteRawDataLinkFail
  | GetRawDataLink
  | GetRawDataLinkSuccess
  | GetRawDataLinkFail
  | GetAllRawDataLinks
  | GetAllRawDataLinksSuccess
  | GetAllRawDataLinksFail
  | UpdateAllProcessStepLinksPosition
  | UpdateAllProcessStepLinksPositionSuccess
  | UpdateAllProcessStepLinksPositionFailure
  | CreateWorkflowCopy
  | CreateWorkflowCopySuccess
  | CreateWorkflowCopyFailed;
