import { Action } from '@ngrx/store';
import { Paging } from '@wfm/service-layer';
import {
  CreateNotificationTemplateCommand,
  NotificationTemplateDto,
  UpdateNotificationTemplateCommand
} from '@wfm/service-layer/models/notificationTemplate';
import { CreateUpdateNotificationTopicCommand, NotificationTopicDto } from '@wfm/service-layer/services/notification-topic.service';

export enum NotificationBuilderActionTypes {
  GetNotificationDetailsById = '[NotificationBuilder] Get Notification Details',
  GetNotificationDetailsByIdSuccess = '[NotificationBuilder] Get Notification Details Success',
  GetNotificationDetailsByIdFailed = '[NotificationBuilder] Get Notification Details Failed',

  GetNotificationTemplates = '[NotificationBuilder] Get Notification Templates',
  GetNotificationTemplatesSuccess = '[NotificationBuilder] Get Notification Templates Success',
  GetNotificationTemplatesFailed = '[NotificationBuilder] Get Notification Templates Failed',

  AddNotificationTopic = '[NotificationBuilder] Add Notification Topic',
  AddNotificationTopicSuccess = '[NotificationBuilder] Add Notification Topic Success',
  AddNotificationTopicFailed = '[NotificationBuilder] Add Notification Topic Failed',

  UpdateNotificationTopic = '[NotificationBuilder] Update Notification Topic',
  UpdateNotificationTopicSuccess = '[NotificationBuilder] Update Notification Topic Success',
  UpdateNotificationTopicFailed = '[NotificationBuilder] Update Notification Topic Failed',

  DeleteNotificationTopic = '[NotificationBuilder] Delete Notification Topic',
  DeleteNotificationTopicSuccess = '[NotificationBuilder] Delete Notification Topic Success',
  DeleteNotificationTopicFailed = '[NotificationBuilder] Delete Notification Topic Failed',

  GetNotificationTopics = '[NotificationBuilder] Get Notification Topics',
  GetNotificationTopicsSuccess = '[NotificationBuilder] Get Notification Topics Success',
  GetNotificationTopicsFailed = '[NotificationBuilder] Get Notification Topics Failed',

  AddNotificationTemplate = '[NotificationBuilder] Add Notification Template',
  AddNotificationTemplateSuccess = '[NotificationBuilder] Add Notification Template Success',
  AddNotificationTemplateFailed = '[NotificationBuilder] Add Notification Template Failed',

  ResetNfTopicOperationMessage = '[NotificationBuilder] Reset Nf Topic Operation Message',
  ResetNfTemplateOperationMessage = '[NotificationBuilder] Reset Nf Template Operation Message',
  ResetNfDetailsById = '[NotificationBuilder] Reset Notification Details By Id',

  GetTemplateDetailsById = '[NotificationBuilder] Get Template Details',
  GetTemplateDetailsByIdSuccess = '[NotificationBuilder] Get Template Details Success',
  GetTemplateDetailsByIdFailed = '[NotificationBuilder] Get Template Details Failed',

  ResetTemplateDetailsById = '[NotificationBuilder] Reset Template Details By Id',

  DeleteNotificationTemplate = '[NotificationBuilder] Delete Template',
  DeleteNotificationTemplateSuccess = '[NotificationBuilder] Delete Template Success',
  DeleteNotificationTemplateFailed = '[NotificationBuilder] Delete Template Failed',

  UpdateNotificationTemplate = '[NotificationBuilder] Update Notification Template',
  UpdateNotificationTemplateSuccess = '[NotificationBuilder] Update Notification Template Success',
  UpdateNotificationTemplateFailed = '[NotificationBuilder] Update Notification Template Failed',

  TriggerNotificationTopic = '[Notification Builder] Trigger Notification Topic',
  TriggerNotificationTopicSuccess = '[Notification Builder] Trigger Notification Topic Success',
  TriggerNotificationTopicFailed = '[Notification Builder] Trigger Notification Topic Failed'
}

export class GetNotificationDetailsById implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationDetailsById;
  constructor(public payload: { data: { id: string } }) {}
}

export class GetNotificationDetailsByIdSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationDetailsByIdSuccess;
  constructor(public payload: { data: NotificationTopicDto }) {}
}

export class GetNotificationDetailsByIdFailed implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationDetailsByIdFailed;
  constructor(public payload: { error: string }) {}
}

export class GetNotificationTemplates implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTemplates;
  constructor(public payload: { data: { paging: Paging } }) {}
}

export class GetNotificationTemplatesSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTemplatesSuccess;
  constructor(public payload: { data: NotificationTemplateDto[] }) {}
}

export class GetNotificationTemplatesFailed implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTemplatesFailed;
  constructor(public payload: { error: string }) {}
}

export class AddNotificationTopic implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTopic;
  constructor(public payload: { data: CreateUpdateNotificationTopicCommand }) {}
}

export class AddNotificationTopicSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTopicSuccess;
  constructor(public payload: { msg: string; id: string }) {}
}

export class AddNotificationTopicFailed implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTopicFailed;
  constructor(public payload: { error: string }) {}
}

export class UpdateNotificationTopic implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTopic;
  constructor(public payload: { id: string; data: CreateUpdateNotificationTopicCommand }) {}
}

export class UpdateNotificationTopicSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTopicSuccess;
  constructor(public payload: { msg: string }) {}
}

export class UpdateNotificationTopicFailed implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTopicFailed;
  constructor(public payload: { error: string }) {}
}

export class DeleteNotificationTopic implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTopic;
  constructor(public payload: { id: string }) {}
}

export class DeleteNotificationTopicSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTopicSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteNotificationTopicFailed implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTopicFailed;
  constructor(public payload: { error: string }) {}
}

export class GetNotificationTopics implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTopics;
  constructor(public payload: { data: Paging }) {}
}

export class GetNotificationTopicsSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTopicsSuccess;
  constructor(public payload: { data: NotificationTopicDto[] }) {}
}

export class GetNotificationTopicsFailed implements Action {
  readonly type = NotificationBuilderActionTypes.GetNotificationTopicsFailed;
  constructor(public payload: { error: string }) {}
}

export class AddNotificationTemplate implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTemplate;
  constructor(public payload: { data: CreateNotificationTemplateCommand }) {}
}

export class AddNotificationTemplateSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTemplateSuccess;
  constructor(public payload: { msg: string; id: string }) {}
}

export class AddNotificationTemplateFailed implements Action {
  readonly type = NotificationBuilderActionTypes.AddNotificationTemplateFailed;
  constructor(public payload: { error: string }) {}
}

export class ResetNfTopicOperationMessage implements Action {
  readonly type = NotificationBuilderActionTypes.ResetNfTopicOperationMessage;
  constructor() {}
}

export class ResetNfTemplateOperationMessage implements Action {
  readonly type = NotificationBuilderActionTypes.ResetNfTemplateOperationMessage;
  constructor() {}
}

export class ResetNfDetailsById implements Action {
  readonly type = NotificationBuilderActionTypes.ResetNfDetailsById;
  constructor() {}
}

export class GetTemplateDetailsById implements Action {
  readonly type = NotificationBuilderActionTypes.GetTemplateDetailsById;
  constructor(public payload: { data: { id: string } }) {}
}

export class GetTemplateDetailsByIdSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.GetTemplateDetailsByIdSuccess;
  constructor(public payload: { data: NotificationTemplateDto }) {}
}

export class GetTemplateDetailsByIdFailed implements Action {
  readonly type = NotificationBuilderActionTypes.GetTemplateDetailsByIdFailed;
  constructor(public payload: { error: string }) {}
}

export class ResetTemplateDetailsById implements Action {
  readonly type = NotificationBuilderActionTypes.ResetTemplateDetailsById;
  constructor() {}
}

export class DeleteNotificationTemplate implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTemplate;
  constructor(public payload: { id: string }) {}
}

export class DeleteNotificationTemplateSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTemplateSuccess;
  constructor(public payload: { msg: string }) {}
}

export class DeleteNotificationTemplateFailed implements Action {
  readonly type = NotificationBuilderActionTypes.DeleteNotificationTemplateFailed;
  constructor(public payload: { error: string }) {}
}

export class UpdateNotificationTemplate implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTemplate;
  constructor(public payload: { data: UpdateNotificationTemplateCommand }) {}
}

export class UpdateNotificationTemplateSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTemplateSuccess;
  constructor(public payload: { msg: string }) {}
}

export class UpdateNotificationTemplateFailed implements Action {
  readonly type = NotificationBuilderActionTypes.UpdateNotificationTemplateFailed;
  constructor(public payload: { error: string }) {}
}

export class TriggerNotificationTopic implements Action {
  readonly type = NotificationBuilderActionTypes.TriggerNotificationTopic;
  constructor(public payload: { topicId: string }) {}
}

export class TriggerNotificationTopicSuccess implements Action {
  readonly type = NotificationBuilderActionTypes.TriggerNotificationTopicSuccess;
  constructor(public msg: string) {}
}

export class TriggerNotificationTopicFailed implements Action {
  readonly type = NotificationBuilderActionTypes.TriggerNotificationTopicFailed;
  constructor(public error: string) {}
}

export type NotificationBuilderActions =
  | GetNotificationDetailsById
  | GetNotificationDetailsByIdSuccess
  | GetNotificationDetailsByIdFailed
  | GetNotificationTemplates
  | GetNotificationTemplatesSuccess
  | GetNotificationTemplatesFailed
  | AddNotificationTopic
  | AddNotificationTopicSuccess
  | AddNotificationTopicFailed
  | UpdateNotificationTopic
  | UpdateNotificationTopicSuccess
  | UpdateNotificationTopicFailed
  | DeleteNotificationTopic
  | DeleteNotificationTopicSuccess
  | DeleteNotificationTopicFailed
  | GetNotificationTopics
  | GetNotificationTopicsSuccess
  | GetNotificationTopicsFailed
  | AddNotificationTemplate
  | AddNotificationTemplateSuccess
  | AddNotificationTemplateFailed
  | ResetNfTopicOperationMessage
  | ResetNfTemplateOperationMessage
  | ResetNfDetailsById
  | GetTemplateDetailsById
  | GetTemplateDetailsByIdSuccess
  | GetTemplateDetailsByIdFailed
  | ResetTemplateDetailsById
  | DeleteNotificationTemplate
  | DeleteNotificationTemplateSuccess
  | DeleteNotificationTemplateFailed
  | UpdateNotificationTemplate
  | UpdateNotificationTemplateSuccess
  | UpdateNotificationTemplateFailed
  | TriggerNotificationTopic
  | TriggerNotificationTopicSuccess
  | TriggerNotificationTopicFailed;
