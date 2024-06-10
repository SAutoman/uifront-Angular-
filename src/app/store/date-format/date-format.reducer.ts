/**
 * global
 */

/**
 * project
 */
import { UserSettingsDto } from '../../service-layer';

/**
 * local
 */
import { DateFormatActions, DateFormatActionTypes } from './date-format.actions';

export enum DateFormatLoadingState {
  Unknown,
  Loading,
  Loaded,
  Failed
}

export interface DateFormatState {
  dateFormat: UserSettingsDto;
  loadingState: DateFormatLoadingState;
  userId: string;
  tenantId: string;
}

export const initialDateFormatState: DateFormatState = <DateFormatState>{
  dateFormat: {},
  loadingState: DateFormatLoadingState.Unknown
};

export function dateFormatReducer(state = initialDateFormatState, action: DateFormatActions) {
  switch (action.type) {
    case DateFormatActionTypes.StoreDateFormatSettingAction:
      return <DateFormatState>{
        ...state,
        loadingState: DateFormatLoadingState.Loaded,
        userId: action.payload.userId,
        tenantId: action.payload.tenantId
      };
    case DateFormatActionTypes.StoreDateFormatSettingActionFail:
      return <DateFormatState>{
        ...state,
        loadingState: DateFormatLoadingState.Loaded,
        error: action.payload.error
      };
    default:
      return state;
  }
}
