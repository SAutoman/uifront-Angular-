/**
 * global
 */
import { Action } from '@ngrx/store';

export enum DateFormatActionTypes {
  StoreDateFormatSettingAction = '[StoreDateFormatSettingAction] Action',
  StoreDateFormatSettingActionFail = '[StoreDateFormatSettingActionFail] Action'
}

export class StoreDateFormatSettingAction implements Action {
  readonly type = DateFormatActionTypes.StoreDateFormatSettingAction;
  constructor(public payload: { tenantId: string; userId: string }) {}
}

export class StoreDateFormatSettingActionFail implements Action {
  readonly type = DateFormatActionTypes.StoreDateFormatSettingActionFail;
  constructor(public payload: { error: string }) {}
}

export type DateFormatActions = StoreDateFormatSettingAction | StoreDateFormatSettingActionFail;
