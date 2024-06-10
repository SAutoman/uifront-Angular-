// import { Update } from '@ngrx/entity';
// import { Action } from '@ngrx/store';

// import { ChildrenItems } from '../../../shared/menu-items/menu-items';
// import { UserSettingsDto } from '../../../service-layer/models/user-settings';

// export enum CasesListActionTypes {
//   SetSelectedLayout = '[SetSelectedLayout] Action',
//   GetSelectedLayout = '[GetSelectedLayout] Action',
//   GetSelectedLayoutSuccess = '[GetSelectedLayoutSuccess] Action',
//   GetSelectedLayoutFail = '[GetSelectedLayoutFail] Action',
//   ResetState = '[ResetState] Action',
//   DeleteLayout = '[DeleteLayout] Action',
//   DeleteLayoutSuccess = '[DeleteLayoutSuccess] Action',
//   DeleteLayoutFail = '[DeleteLayoutFail] Action',
//   UpdateLayout = '[UpdateLayout] Action',
//   UpdateLayoutSuccess = '[UpdateLayoutSuccess] Action',
//   UpdateLayoutFail = '[UpdateLayoutFail] Action'
// }

// export class SetSelectedLayout implements Action {
//   readonly type = CasesListActionTypes.SetSelectedLayout;
//   constructor(public payload: { tenantId?: string; userId?: string; layout: ChildrenItems }) {}
// }

// export class GetSelectedLayout implements Action {
//   readonly type = CasesListActionTypes.GetSelectedLayout;
//   constructor(public payload: { tenantId: string; userId: string }) {}
// }

// export class GetSelectedLayoutSuccess implements Action {
//   readonly type = CasesListActionTypes.GetSelectedLayoutSuccess;
//   constructor(public payload: { layout: { layout: ChildrenItems } }) {}
// }

// export class GetSelectedLayoutFail implements Action {
//   readonly type = CasesListActionTypes.GetSelectedLayoutFail;
//   constructor(public payload: { error: string }) {}
// }

// export class DeleteLayout implements Action {
//   readonly type = CasesListActionTypes.DeleteLayout;
//   constructor(public payload: { tenantId: string; id: string }) {}
// }

// export class DeleteLayoutSuccess implements Action {
//   readonly type = CasesListActionTypes.DeleteLayoutSuccess;
//   constructor(public payload: { id: string }) {}
// }

// export class DeleteLayoutFail implements Action {
//   readonly type = CasesListActionTypes.DeleteLayoutFail;
//   constructor(public payload: { error: string }) {}
// }

// export class UpdateLayout implements Action {
//   readonly type = CasesListActionTypes.UpdateLayout;
//   constructor(public payload: { tenantId: string; layout: UserSettingsDto }) {}
// }

// export class UpdateLayoutSuccess implements Action {
//   readonly type = CasesListActionTypes.UpdateLayoutSuccess;
//   constructor(public payload: { update: Update<UserSettingsDto> }) {}
// }

// export class UpdateLayoutFail implements Action {
//   readonly type = CasesListActionTypes.UpdateLayoutFail;
//   constructor(public payload: { error: string }) {}
// }

// export class ResetState implements Action {
//   readonly type = CasesListActionTypes.ResetState;
// }

// export type CasesListActions =
//   | SetSelectedLayout
//   | GetSelectedLayout
//   | GetSelectedLayoutSuccess
//   | GetSelectedLayoutFail
//   | DeleteLayout
//   | DeleteLayoutSuccess
//   | DeleteLayoutFail
//   | UpdateLayout
//   | UpdateLayoutSuccess
//   | UpdateLayoutFail
//   | ResetState;
