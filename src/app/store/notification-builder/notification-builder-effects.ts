import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NotificationTemplateService } from '@wfm/service-layer/services/notification-template.service';
import { NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import { TenantComponent } from '@wfm/shared/tenant.component';

import {
  AddNotificationTemplateFailed,
  AddNotificationTemplateSuccess,
  AddNotificationTopicFailed,
  AddNotificationTopicSuccess,
  DeleteNotificationTemplate,
  DeleteNotificationTemplateFailed,
  DeleteNotificationTemplateSuccess,
  GetNotificationTemplatesFailed,
  GetNotificationTemplatesSuccess,
  GetTemplateDetailsByIdSuccess,
  UpdateNotificationTopicFailed,
  UpdateNotificationTopicSuccess,
  GetTemplateDetailsByIdFailed,
  UpdateNotificationTopic,
  AddNotificationTemplate,
  AddNotificationTopic,
  GetNotificationDetailsById,
  GetNotificationDetailsByIdFailed,
  GetNotificationDetailsByIdSuccess,
  GetNotificationTemplates,
  GetNotificationTopics,
  GetNotificationTopicsFailed,
  GetNotificationTopicsSuccess,
  NotificationBuilderActionTypes,
  UpdateNotificationTemplate,
  UpdateNotificationTemplateSuccess,
  UpdateNotificationTemplateFailed,
  DeleteNotificationTopic,
  DeleteNotificationTopicFailed,
  DeleteNotificationTopicSuccess,
  TriggerNotificationTopic,
  TriggerNotificationTopicSuccess,
  TriggerNotificationTopicFailed
} from './notification-builder-actions';
import { NotificationBuilderState } from './notification-builder-reducer';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class NotificationBuilderEffects extends TenantComponent {
  constructor(
    store: Store<NotificationBuilderState>,
    private actions$: Actions,
    private notificationTopicService: NotificationTopicService,
    private notificationTemplateService: NotificationTemplateService,
    private notificationTriggerService: NotificationsTriggerService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  GetNotificationDetailsById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetNotificationDetailsById>(NotificationBuilderActionTypes.GetNotificationDetailsById),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTopicService.get(this.tenant, action.payload.data.id);
          if (result) return new GetNotificationDetailsByIdSuccess({ data: result });
        } catch (error) {
          return new GetNotificationDetailsByIdFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetNotificationTemplates: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetNotificationTemplates>(NotificationBuilderActionTypes.GetNotificationTemplates),
      switchMap(async (action) => {
        try {
          let result = (
            await this.notificationTemplateService.search(this.tenant, {
              paging: { skip: 0, take: 9999 }
            })
          ).items;
          if (result) return new GetNotificationTemplatesSuccess({ data: result });
        } catch (error) {
          return new GetNotificationTemplatesFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetNotificationTopics: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetNotificationTopics>(NotificationBuilderActionTypes.GetNotificationTopics),
      switchMap(async (action) => {
        try {
          let result = (
            await this.notificationTopicService.search(this.tenant, {
              paging: { skip: 0, take: 9999 }
            })
          ).items;
          if (result) return new GetNotificationTopicsSuccess({ data: result });
        } catch (error) {
          return new GetNotificationTopicsFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddNotificationTopic: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddNotificationTopic>(NotificationBuilderActionTypes.AddNotificationTopic),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTopicService.create(this.tenant, action.payload.data);
          if (result) return new AddNotificationTopicSuccess({ msg: 'Notification Topic Added Successfully', id: result.targetId });
        } catch (error) {
          return new AddNotificationTopicFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateNotificationTopic: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateNotificationTopic>(NotificationBuilderActionTypes.UpdateNotificationTopic),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTopicService.update(this.tenant, action.payload.id, action.payload.data);
          if (result) return new UpdateNotificationTopicSuccess({ msg: 'Notification Topic Updated Successfully' });
        } catch (error) {
          return new UpdateNotificationTopicFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  AddNotificationTemplate: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<AddNotificationTemplate>(NotificationBuilderActionTypes.AddNotificationTemplate),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTemplateService.create(action.payload.data);
          if (result) return new AddNotificationTemplateSuccess({ msg: 'Template Added Successfully', id: result.targetId });
        } catch (error) {
          return new AddNotificationTemplateFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  GetNotificationTemplateDetailsById: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<GetNotificationDetailsById>(NotificationBuilderActionTypes.GetTemplateDetailsById),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTemplateService.get({ tenantId: this.tenant, id: action.payload.data.id });
          if (result) return new GetTemplateDetailsByIdSuccess({ data: result });
        } catch (error) {
          return new GetTemplateDetailsByIdFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteNotificationTemplate: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteNotificationTemplate>(NotificationBuilderActionTypes.DeleteNotificationTemplate),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTemplateService.delete({ tenantId: this.tenant, id: action.payload.id });
          if (result) return new DeleteNotificationTemplateSuccess({ msg: 'Template Deleted Successfully' });
        } catch (error) {
          return new DeleteNotificationTemplateFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  UpdateNotificationTemplate: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateNotificationTemplate>(NotificationBuilderActionTypes.UpdateNotificationTemplate),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTemplateService.update(action.payload.data);
          if (result) return new UpdateNotificationTemplateSuccess({ msg: 'Template Updated Successfully' });
        } catch (error) {
          return new UpdateNotificationTemplateFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  DeleteNotificationTopic: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<DeleteNotificationTopic>(NotificationBuilderActionTypes.DeleteNotificationTopic),
      switchMap(async (action) => {
        try {
          let result = await this.notificationTopicService.delete(this.tenant, action.payload.id);
          if (result) return new DeleteNotificationTopicSuccess({ msg: 'Topic Deleted Successfully' });
        } catch (error) {
          return new DeleteNotificationTopicFailed({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  TriggerNotificationTopic: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType<TriggerNotificationTopic>(NotificationBuilderActionTypes.TriggerNotificationTopic),
      switchMap(async (action) => {
        try {
          await this.notificationTriggerService.triggerSendingNotificationsByTopic(this.tenant, action.payload.topicId);
          return new TriggerNotificationTopicSuccess('Started Sending Notifications...');
        } catch (error) {
          return new TriggerNotificationTopicFailed(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      })
    )
  );
}
