/**
 * global
 */
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

/**
 * project
 */
import { Invitation } from '../../service-layer';

/**
 * local
 */
import { InvitationsAction, InvitationsActionTypes } from './invitation-tool.actions';

export interface InvitationsSearchQuery {
  filter: string;
  sorting: string;
  limit: number;
  page: number;
}

export interface InvitationsState extends EntityState<Invitation> {
  loading: boolean;
  operationMsg: string;
  data: any;
}

export interface InvitationsAppState {
  invitationsReducer: InvitationsState;
}

export const invitationsAdapter: EntityAdapter<Invitation> = createEntityAdapter<Invitation>();

export const initialInvitationsState: InvitationsState = invitationsAdapter.getInitialState({
  // additional users state properties
  data: null,
  loading: false,
  operationMsg: null
});

// export const applicationAdapter: EntityAdapter<Invitation> = createEntityAdapter<Invitation>({
//   selectId: (model: Invitation) => model.id
// });

export function invitationsReducer(state = initialInvitationsState, action: InvitationsAction): InvitationsState {
  switch (action.type) {
    case InvitationsActionTypes.SendRegistrationInvitation:
      return {
        ...state,
        loading: true,
        operationMsg: ''
      };

    case InvitationsActionTypes.SendRegistrationInvitationSuccess:
      return {
        ...state,
        loading: false,
        operationMsg: 'Invitation Sent Successfully'
      };

    case InvitationsActionTypes.SendRegistrationInvitationFail:
      return {
        ...state,
        loading: false,
        operationMsg: 'Fail' + action.payload.error
      };

    case InvitationsActionTypes.ResetOperationMsg:
      return {
        ...state,
        operationMsg: null
      };
    default:
      return state;
  }
}
