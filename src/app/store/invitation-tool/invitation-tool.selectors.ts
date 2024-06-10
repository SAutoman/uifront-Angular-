import { createSelector } from '@ngrx/store';
import { InvitationsState } from './invitation-tool.reducer';

export const selectInvitationsState: (u: any) => InvitationsState = (state) => state.invitations;

export const currentInvitationSelector = createSelector(selectInvitationsState, (invitation) => invitation.data);

export const invitationOperationMsgSelector = createSelector(selectInvitationsState, (invitation) => invitation.operationMsg);
