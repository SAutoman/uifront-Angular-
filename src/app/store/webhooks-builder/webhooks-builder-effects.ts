/**
 * Global
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
/**
 * Project
 */
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { WebHooksService } from '@wfm/service-layer/services/webhooks.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AddWebHook,
  AddWebHookFailed,
  AddWebHookSuccess,
  DeleteWebHook,
  DeleteWebHookFailed,
  DeleteWebHookSuccess,
  GetWebHookDetailsById,
  GetWebHookDetailsByIdFailed,
  GetWebHookDetailsByIdSuccess,
  GetWebHookFields,
  GetWebHookFieldsFailure,
  GetWebHookFieldsSuccess,
  GetWebHooks,
  GetWebHooksFailed,
  GetWebHooksSuccess,
  UpdateWebHook,
  UpdateWebHookFailed,
  UpdateWebHookSuccess,
  WebHookBuilderActionTypes
} from './webhooks-builder-actions';
import { WebHookBuilderState } from './webhooks-builder-reducer';
import { Router } from '@angular/router';
import { convertTenantName } from '@wfm/shared/utils';
import { WebhooksBuilderMainRoute, WebhooksEditRoute } from '@wfm/webhooks-builder/webhook-builder-constants';
import { StatePersistingService } from '@wfm/service-layer';
import { tenantNameKey } from '..';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class WebHooksBuilderEffects extends TenantComponent {
  constructor(
    store: Store<WebHookBuilderState>,
    private actions$: Actions,
    private webHooksService: WebHooksService,
    private route: Router,
    private statePersistingService: StatePersistingService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  AddWebHooks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddWebHook>(WebHookBuilderActionTypes.AddWebHook),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.create(this.tenant, action.payload.data);
          if (result) {
            const tenantName: string = this.statePersistingService.get(tenantNameKey);
            this.route.navigateByUrl(
              convertTenantName(tenantName) + `/${WebhooksBuilderMainRoute}/${WebhooksEditRoute}/${result.targetId}`
            );
            if (result.status.toString() === 'Success') {
              return new AddWebHookSuccess();
            }
          }
        } catch (error) {
          return new AddWebHookFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWebHooks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWebHooks>(WebHookBuilderActionTypes.GetWebHooks),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.get(this.tenant);
          if (result) {
            return new GetWebHooksSuccess({ data: result });
          }
        } catch (error) {
          return new GetWebHooksFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteWebHooks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteWebHook>(WebHookBuilderActionTypes.DeleteWebHook),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.delete(this.tenant, action.payload.id);
          if (result.status.toString() === 'Success') {
            return new DeleteWebHookSuccess({ msg: 'success' });
          }
        } catch (error) {
          return new DeleteWebHookFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateWebHooks: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateWebHook>(WebHookBuilderActionTypes.UpdateWebHook),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.update(this.tenant, action.payload.webHookId, action.payload.data);
          if (result.status.toString() === 'Success') {
            return new UpdateWebHookSuccess({ msg: 'WebHook Updated Successfully' });
          }
        } catch (error) {
          return new UpdateWebHookFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWebHookDetails: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWebHookDetailsById>(WebHookBuilderActionTypes.GetWebHookDetailsById),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.getById(this.tenant, action.payload.data.id);
          if (result) {
            return new GetWebHookDetailsByIdSuccess({ data: result });
          }
        } catch (error) {
          return new GetWebHookDetailsByIdFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetWebHookFields: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetWebHookFields>(WebHookBuilderActionTypes.GetWebHookFields),
      switchMap(async (action) => {
        try {
          let result = await this.webHooksService.getFields(this.tenant, action.payload.workflowSchemaId);
          if (result) {
            return new GetWebHookFieldsSuccess({ data: result });
          }
        } catch (error) {
          return new GetWebHookFieldsFailure({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );
}
