import { Action } from '@ngrx/store';
import { CreateInvitationDto, Invitation } from '../../service-layer';

export enum InvitationsActionTypes {
  SendRegistrationInvitation = '[Invitations] SendRegistrationInvitation',
  SendRegistrationInvitationSuccess = '[Invitations] SendRegistrationInvitation Success',
  SendRegistrationInvitationFail = '[Invitations] SendRegistrationInvitation Fail',
  ResetOperationMsg = '[Invitation] Reset Operation Msg'
}

// ========================================= Send Registration Invitation

export class SendRegistrationInvitation implements Action {
  readonly type = InvitationsActionTypes.SendRegistrationInvitation;
  constructor(public payload: { tenantId: string; invitations: CreateInvitationDto }) {}
}

export class SendRegistrationInvitationSuccess implements Action {
  readonly type = InvitationsActionTypes.SendRegistrationInvitationSuccess;
}

export class SendRegistrationInvitationFail implements Action {
  readonly type = InvitationsActionTypes.SendRegistrationInvitationFail;
  constructor(public payload: { error: string }) {}
}

export class ResetInvitationOperationMsg implements Action {
  readonly type = InvitationsActionTypes.ResetOperationMsg;
}

export type InvitationsAction =
  | SendRegistrationInvitation
  | SendRegistrationInvitationSuccess
  | SendRegistrationInvitationFail
  | ResetInvitationOperationMsg;
