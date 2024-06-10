/**
 * global
 */
import { Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';

import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * project
 */
import { InvitationToolService } from '../../service-layer';

/**
 * local
 */
import {
  InvitationsActionTypes,
  SendRegistrationInvitation,
  SendRegistrationInvitationFail,
  SendRegistrationInvitationSuccess
} from './invitation-tool.actions';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class InvitationsEffects {
  // ========================================= SendRegistrationInvitation
  SendRegistrationInvitation: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<SendRegistrationInvitation>(InvitationsActionTypes.SendRegistrationInvitation),
      switchMap(async (action) => {
        try {
          await this.service.sendInvitation(action.payload.tenantId, action.payload.invitations);
          return new SendRegistrationInvitationSuccess();
        } catch (error) {
          return new SendRegistrationInvitationFail({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  constructor(private actions$: Actions, private service: InvitationToolService, private errorHandlerService: ErrorHandlerService) {}
}
