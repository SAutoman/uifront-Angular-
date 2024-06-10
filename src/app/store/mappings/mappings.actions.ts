/**
 * global
 */
import { Action } from '@ngrx/store';
import { AreaTypeEnum } from '@wfm/service-layer';
import { ApplyMappingDto } from '@wfm/service-layer/models/mappings';

/**
 * project
 */
import {
  LoadMappingsPayload,
  LoadMappingsSuccessPayload,
  LoadMappingsFailPayload,
  LoadMappingPayload,
  LoadMappingSucessPayload,
  LoadMappingFailPayload,
  EditMappingPayload,
  EditMappingSuccessPayload,
  EditMappingFailPayload,
  CreateMappingPayload,
  CreateMappingSuccessPayload,
  CreateMappingFailPayload
} from './mappings-payload-models';

/**
 * local
 */

export enum MappingTypes {
  LoadSuppliers = '[LoadSuppliers] Load',
  LoadSuppliersSuccess = '[LoadSuppliers] Load Success',
  LoadSuppliersFail = '[LoadSuppliers] Load Fail',
  DeleteSupplier = '[DeleteSupplier] Delete',
  DeleteSupplierSuccess = '[DeleteSupplier] Delete Success',
  DeleteSupplierFail = '[DeleteSupplier] Delete Fail',
  LoadSupplier = '[LoadSupplier] Load',
  LoadSupplierSuccess = '[LoadSupplier] Load Success',
  LoadSupplierFail = '[LoadSupplier] Load Fail',
  EditSupplier = '[EditSupplier] Edit',
  EditSupplierSuccess = '[EditSupplier] Edit Success',
  EditSupplierFail = '[EditSupplier] Edit Fail',
  CreateSupplier = '[CreateSupplier] Create',
  CreateSupplierSuccess = '[CreateSupplier] Success',
  CreateSupplierFail = '[CreateSupplier] Fail',
  LoadAuditors = '[LoadAuditors] Load',
  LoadAuditorsSuccess = '[LoadAuditors] Load Success',
  LoadAuditorsFail = '[LoadAuditors] Load Fail',
  DeleteAuditor = '[DeleteAuditor] Delete',
  DeleteAuditorSuccess = '[DeleteAuditor] Delete Success',
  DeleteAuditorFail = '[DeleteAuditor] Delete Fail',
  LoadAuditor = '[LoadAuditor] Load',
  LoadAuditorSuccess = '[LoadAuditor] Load Success',
  LoadAuditorFail = '[LoadAuditor] Load Fail',
  EditAuditor = '[EditAuditor] Edit',
  EditAuditorSuccess = '[EditAuditor] Edit Success',
  EditAuditorFail = '[EditAuditor] Edit Fail',
  CreateAuditor = '[CreateAuditor] Create',
  CreateAuditorSuccess = '[CreateAuditor] Success',
  CreateAuditorFail = '[CreateAuditor] Fail',
  ClearEditMappingViewModel = '[ClearEditMappingViewModel] ClearEditMappingViewModel',
  ApplyMappingManual = '[Edit Mapping] Run Mapping Manual',
  ApplyMappingManualSuccess = '[Edit Mapping] Run Mapping Manual Succes',
  ApplyMappingManualFail = '[Edit Mapping] Run Mapping Manual Fail',
  ResetMappingsOperationMsg = '[Mappings] Reset Operation Message',
  ReapplyAllMappingsSuppliers = '[Mappings] Reapply All Mappings Suppliers',
  ReapplyAllMappingsSuppliersSuccess = '[Mappings] Reapply All Mappings Suppliers Success',
  ReapplyAllMappingsSuppliersFail = '[Mappings] Reapply All Mappings Suppliers Fail',
  ReapplyAllMappingsAuditors = '[Mappings] Reapply All Mappings Auditors',
  ReapplyAllMappingsAuditorsSuccess = '[Mappings] Reapply All Mappings Auditors Success',
  ReapplyAllMappingsAuditorsFail = '[Mappings] Reapply All Mappings Auditors Fail'
}

class BaseAction<TPayload> implements Action {
  constructor(public type: string, public payload: any) {} // type modified
}

export class LoadSuppliers extends BaseAction<LoadMappingsPayload> {
  constructor(payload: LoadMappingsPayload) {
    super(MappingTypes.LoadSuppliers, payload);
  }
}

export class LoadSuppliersSuccess extends BaseAction<LoadMappingsSuccessPayload> {
  constructor(payload: LoadMappingsSuccessPayload) {
    super(MappingTypes.LoadSuppliersSuccess, payload);
  }
}

export class LoadSuppliersFailure extends BaseAction<LoadMappingsFailPayload> {
  constructor(payload: LoadMappingsFailPayload) {
    super(MappingTypes.LoadSuppliersFail, payload);
  }
}

// export class DeleteSupplier extends BaseAction<DeleteMappingPayload> {
//   constructor(payload: DeleteMappingPayload) {
//     super(MappingTypes.DeleteSupplier, payload);
//   }
// }

export class DeleteSupplier implements Action {
  readonly type = MappingTypes.DeleteSupplier;
  constructor(public payload: { tenantId: string; id: string }) {}
}

// export class DeleteSupplierSuccess extends BaseAction<DeleteMappingSuccessPayload> {
//   constructor(payload: DeleteMappingSuccessPayload) {
//     super(MappingTypes.DeleteSupplierSuccess, payload);
//   }
// }

export class DeleteSupplierSuccess implements Action {
  readonly type = MappingTypes.DeleteSupplierSuccess;
  constructor(public payload: { msg: string }) {}
}

// export class DeleteSupplierFailure extends BaseAction<DeleteMappingFailPayload> {
//   constructor(payload: DeleteMappingFailPayload) {
//     super(MappingTypes.DeleteSupplierFail, payload);
//   }
// }

export class DeleteSupplierFailure implements Action {
  readonly type = MappingTypes.DeleteSupplierFail;
  constructor(public payload: { error: string }) {}
}

export class LoadSupplier extends BaseAction<LoadMappingPayload> {
  constructor(payload: LoadMappingPayload) {
    super(MappingTypes.LoadSupplier, payload);
  }
}

export class LoadSupplierSuccess extends BaseAction<LoadMappingSucessPayload> {
  constructor(payload: LoadMappingSucessPayload) {
    super(MappingTypes.LoadSupplierSuccess, payload);
  }
}

export class LoadSupplierFailure extends BaseAction<LoadMappingFailPayload> {
  constructor(payload: LoadMappingFailPayload) {
    super(MappingTypes.LoadSuppliersFail, payload);
  }
}

export class EditSupplier extends BaseAction<EditMappingPayload> {
  constructor(payload: EditMappingPayload) {
    super(MappingTypes.EditSupplier, payload);
  }
}

export class EditSupplierSuccess extends BaseAction<EditMappingSuccessPayload> {
  constructor(payload: EditMappingSuccessPayload) {
    super(MappingTypes.EditSupplierSuccess, payload);
  }
}

export class EditSupplierFailure extends BaseAction<EditMappingFailPayload> {
  constructor(payload: EditMappingFailPayload) {
    super(MappingTypes.EditSupplierFail, payload);
  }
}

export class CreateSupplier extends BaseAction<CreateMappingPayload> {
  constructor(payload: CreateMappingPayload) {
    super(MappingTypes.CreateSupplier, payload);
  }
}

export class CreateSupplierSuccess extends BaseAction<CreateMappingSuccessPayload> {
  constructor(payload: CreateMappingSuccessPayload) {
    super(MappingTypes.CreateSupplierSuccess, payload);
  }
}

export class CreateSupplierFailure extends BaseAction<CreateMappingFailPayload> {
  constructor(payload: CreateMappingFailPayload) {
    super(MappingTypes.CreateSupplierFail, payload);
  }
}

export class LoadAuditors extends BaseAction<LoadMappingsPayload> {
  constructor(payload: LoadMappingsPayload) {
    super(MappingTypes.LoadAuditors, payload);
  }
}

export class LoadAuditorsSuccess extends BaseAction<LoadMappingsSuccessPayload> {
  constructor(payload: LoadMappingsSuccessPayload) {
    super(MappingTypes.LoadAuditorsSuccess, payload);
  }
}

export class LoadAuditorsFailure extends BaseAction<LoadMappingsFailPayload> {
  constructor(payload: LoadMappingsFailPayload) {
    super(MappingTypes.LoadAuditorsFail, payload);
  }
}

export class CreateAuditor extends BaseAction<CreateMappingPayload> {
  constructor(payload: CreateMappingPayload) {
    super(MappingTypes.CreateAuditor, payload);
  }
}

export class CreateAuditorSuccess extends BaseAction<CreateMappingSuccessPayload> {
  constructor(payload: CreateMappingSuccessPayload) {
    super(MappingTypes.CreateAuditorSuccess, payload);
  }
}

export class CreateAuditorFailure extends BaseAction<CreateMappingFailPayload> {
  constructor(payload: CreateMappingFailPayload) {
    super(MappingTypes.CreateAuditorFail, payload);
  }
}

export class LoadAuditor extends BaseAction<LoadMappingPayload> {
  constructor(payload: LoadMappingPayload) {
    super(MappingTypes.LoadAuditor, payload);
  }
}

export class LoadAuditorSuccess extends BaseAction<LoadMappingSucessPayload> {
  constructor(payload: LoadMappingSucessPayload) {
    super(MappingTypes.LoadAuditorSuccess, payload);
  }
}

export class LoadAuditorFailure extends BaseAction<LoadMappingFailPayload> {
  constructor(payload: LoadMappingFailPayload) {
    super(MappingTypes.LoadAuditorFail, payload);
  }
}

export class EditAuditor extends BaseAction<EditMappingPayload> {
  constructor(payload: EditMappingPayload) {
    super(MappingTypes.EditAuditor, payload);
  }
}

export class EditAuditorSuccess extends BaseAction<EditMappingSuccessPayload> {
  constructor(payload: EditMappingSuccessPayload) {
    super(MappingTypes.EditAuditorSuccess, payload);
  }
}

export class EditAuditorFailure extends BaseAction<EditMappingFailPayload> {
  constructor(payload: EditMappingFailPayload) {
    super(MappingTypes.EditAuditorFail, payload);
  }
}

// export class DeleteAuditor extends BaseAction<DeleteMappingPayload> {
//   constructor(payload: DeleteMappingPayload) {
//     super(MappingTypes.DeleteAuditor, payload);
//   }
// }

export class DeleteAuditor implements Action {
  readonly type = MappingTypes.DeleteAuditor;
  constructor(public payload: { tenantId: string; id: string }) {}
}

export class DeleteAuditorSuccess implements Action {
  readonly type = MappingTypes.DeleteAuditorSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteAuditorFailure implements Action {
  readonly type = MappingTypes.DeleteAuditorFail;
  constructor(public payload: { error: string }) {}
}

export class ClearEditMappingViewModel implements Action {
  readonly type = MappingTypes.ClearEditMappingViewModel;
}

export class ResetMappingsOperationMsg implements Action {
  readonly type = MappingTypes.ResetMappingsOperationMsg;
  constructor() {}
}

export class ApplyMappingManual implements Action {
  readonly type = MappingTypes.ApplyMappingManual;
  constructor(public payload: { tenantId: string; areaType: AreaTypeEnum; data: ApplyMappingDto }) {}
}

export class ApplyMappingManualSuccess implements Action {
  readonly type = MappingTypes.ApplyMappingManualSuccess;
  constructor(public payload: { msg: string }) {}
}

export class ApplyMappingManualFail implements Action {
  readonly type = MappingTypes.ApplyMappingManualFail;
  constructor(public payload: { error: string }) {}
}

export class ReapplyAllMappingsSuppliers implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsSuppliers;
  constructor(public payload: { tenantId: string; areaType: AreaTypeEnum }) {}
}

export class ReapplyAllMappingsSuppliersSuccess implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsSuppliersSuccess;
  constructor(public payload: { msg: string }) {}
}

export class ReapplyAllMappingsSuppliersFail implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsSuppliersFail;
  constructor(public payload: { error: string }) {}
}

export class ReapplyAllMappingsAuditors implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsAuditors;
  constructor(public payload: { tenantId: string; areaType: AreaTypeEnum }) {}
}

export class ReapplyAllMappingsAuditorsSuccess implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsAuditorsSuccess;
  constructor(public payload: { msg: string }) {}
}

export class ReapplyAllMappingsAuditorsFail implements Action {
  readonly type = MappingTypes.ReapplyAllMappingsAuditorsFail;
  constructor(public payload: { error: string }) {}
}

export type MappingActions =
  | LoadSuppliers
  | LoadSuppliersSuccess
  | LoadSuppliersFailure
  | DeleteSupplier
  | DeleteSupplierSuccess
  | DeleteSupplierFailure
  | LoadSupplier
  | LoadSupplierSuccess
  | LoadSupplierFailure
  | EditSupplier
  | EditSupplierSuccess
  | EditSupplierFailure
  | CreateSupplier
  | CreateSupplierSuccess
  | CreateSupplierFailure
  | LoadAuditors
  | LoadAuditorsSuccess
  | LoadAuditorsFailure
  | CreateAuditor
  | CreateAuditorSuccess
  | CreateAuditorFailure
  | LoadAuditor
  | LoadAuditorSuccess
  | LoadAuditorFailure
  | EditAuditor
  | EditAuditorSuccess
  | EditAuditorFailure
  | DeleteAuditor
  | DeleteAuditorSuccess
  | DeleteAuditorFailure
  | ClearEditMappingViewModel
  | ApplyMappingManual
  | ApplyMappingManualSuccess
  | ApplyMappingManualFail
  | ResetMappingsOperationMsg
  | ReapplyAllMappingsSuppliers
  | ReapplyAllMappingsSuppliersSuccess
  | ReapplyAllMappingsSuppliersFail
  | ReapplyAllMappingsAuditors
  | ReapplyAllMappingsAuditorsSuccess
  | ReapplyAllMappingsAuditorsFail;
