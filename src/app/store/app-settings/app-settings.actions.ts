import { Action } from '@ngrx/store';
import { Paging, SettingsUI } from '@wfm/service-layer';
import { CreateAppSettingsDto, UpdateAppSettingsDto } from '@wfm/service-layer/models/app-settings';

export enum AppSettingsActionTypes {
  SearchAppSettings = '[AppSettings] Search App Settings',
  SearchAppSettingsSuccess = '[AppSettings] Search App Settings Success',
  SearchAppSettingsFailed = '[AppSettings] Search App Settings Failed',

  UpdateAppSetting = '[AppSettings] Update App Setting',
  UpdateAppSettingSuccess = '[AppSettings] Update App Setting Success',
  UpdateAppSettingFailure = '[AppSettings] Update App Setting Failure',

  CreateAppSetting = '[AppSettings] Create App Setting',
  CreateAppSettingSuccess = '[AppSettings] Create App Setting Success',
  CreateAppSettingFailure = '[AppSettings] Create App Setting Failure',

  DeleteAppSetting = '[AppSettings] Delete App Setting',
  DeleteAppSettingSuccess = '[AppSettings] Delete App Setting Success',
  DeleteAppSettingFailure = '[AppSettings] Delete App Setting Failure',

  ResetAppSettingOperationMsg = '[App Setting] Reset App Setting Operation Msg'
}

export class SearchAppSettings implements Action {
  readonly type = AppSettingsActionTypes.SearchAppSettings;
  constructor(public payload: { paging: Paging }) {}
}

export class SearchAppSettingsSuccess implements Action {
  readonly type = AppSettingsActionTypes.SearchAppSettingsSuccess;
  constructor(public data: SettingsUI[]) {}
}

export class SearchAppSettingsFailure implements Action {
  readonly type = AppSettingsActionTypes.SearchAppSettingsFailed;
  constructor(public msg: string) {}
}

export class CreateAppSettingAction implements Action {
  readonly type = AppSettingsActionTypes.CreateAppSetting;
  constructor(public payload: { data: CreateAppSettingsDto }) {}
}

export class CreateAppSettingSuccess implements Action {
  readonly type = AppSettingsActionTypes.CreateAppSettingSuccess;
  constructor(public msg: string) {}
}

export class CreateAppSettingFailure implements Action {
  readonly type = AppSettingsActionTypes.CreateAppSettingFailure;
  constructor(public msg: string) {}
}

export class UpdateAppSetting implements Action {
  readonly type = AppSettingsActionTypes.UpdateAppSetting;
  constructor(public payload: { data: UpdateAppSettingsDto }) {}
}

export class UpdateAppSettingSuccess implements Action {
  readonly type = AppSettingsActionTypes.UpdateAppSettingSuccess;
  constructor(public msg: string) {}
}

export class UpdateAppSettingFailure implements Action {
  readonly type = AppSettingsActionTypes.UpdateAppSettingFailure;
  constructor(public msg: string) {}
}

export class DeleteAppSetting implements Action {
  readonly type = AppSettingsActionTypes.DeleteAppSetting;
  constructor(public payload: { id: string }) {}
}

export class DeleteAppSettingSuccess implements Action {
  readonly type = AppSettingsActionTypes.DeleteAppSettingSuccess;
  constructor(public msg: string) {}
}

export class DeleteAppSettingFailure implements Action {
  readonly type = AppSettingsActionTypes.DeleteAppSettingFailure;
  constructor(public msg: string) {}
}

export class ResetAppSettingOperationMsg implements Action {
  readonly type = AppSettingsActionTypes.ResetAppSettingOperationMsg;
  constructor() {}
}

export type AppSettingsActions =
  | SearchAppSettings
  | SearchAppSettingsSuccess
  | SearchAppSettingsFailure
  | CreateAppSettingAction
  | CreateAppSettingSuccess
  | CreateAppSettingFailure
  | UpdateAppSetting
  | UpdateAppSettingSuccess
  | UpdateAppSettingFailure
  | DeleteAppSetting
  | DeleteAppSettingSuccess
  | DeleteAppSettingFailure
  | ResetAppSettingOperationMsg;
