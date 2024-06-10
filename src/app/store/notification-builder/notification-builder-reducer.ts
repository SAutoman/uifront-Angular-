import { NotificationTemplateDto } from '@wfm/service-layer/models/notificationTemplate';
import { NotificationTopicDto } from '@wfm/service-layer/services/notification-topic.service';
import { NotificationBuilderActions, NotificationBuilderActionTypes } from './notification-builder-actions';

export interface NotificationBuilderState {
  loading: boolean;
  error: string;
  newlyAddedEntityId: string;
  notificationDetailById: NotificationTopicDto;
  notificationTemplates: NotificationTemplateDto[];
  notificationTopics: NotificationTopicDto[];
  templateOperationMessage: string;
  notificationTopicOperationMessage: string;
  templateDetailsById: NotificationTemplateDto;
}

export const initialNotificationBuilderState: NotificationBuilderState = {
  loading: false,
  error: null,
  newlyAddedEntityId: null,
  notificationDetailById: null,
  notificationTemplates: null,
  notificationTopics: null,
  templateOperationMessage: null,
  notificationTopicOperationMessage: null,
  templateDetailsById: null
};

export function nfBuilderReducer(state = initialNotificationBuilderState, action: NotificationBuilderActions): NotificationBuilderState {
  switch (action.type) {
    case NotificationBuilderActionTypes.GetNotificationDetailsById:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.GetNotificationDetailsByIdSuccess:
      return {
        ...state,
        loading: false,
        notificationDetailById: action.payload.data
      };
    case NotificationBuilderActionTypes.GetNotificationDetailsByIdFailed:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.GetNotificationTemplates:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.GetNotificationTemplatesSuccess:
      return {
        ...state,
        loading: false,
        notificationTemplates: action.payload.data
      };
    case NotificationBuilderActionTypes.GetNotificationTemplatesFailed:
      return {
        ...state,
        loading: false,
        error: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.AddNotificationTopic:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.AddNotificationTopicSuccess:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: action.payload.msg,
        newlyAddedEntityId: action.payload.id
      };
    case NotificationBuilderActionTypes.AddNotificationTopicFailed:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.UpdateNotificationTopic:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.UpdateNotificationTopicSuccess:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: action.payload.msg
      };
    case NotificationBuilderActionTypes.UpdateNotificationTopicFailed:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.DeleteNotificationTopic:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.DeleteNotificationTopicSuccess:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: action.payload.msg
      };
    case NotificationBuilderActionTypes.DeleteNotificationTopicFailed:
      return {
        ...state,
        loading: false,
        notificationTopicOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.GetNotificationTopics:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.GetNotificationTopicsSuccess:
      return {
        ...state,
        loading: false,
        notificationTopics: action.payload.data
      };
    case NotificationBuilderActionTypes.GetNotificationTopicsFailed:
      return {
        ...state,
        loading: false
      };
    case NotificationBuilderActionTypes.AddNotificationTemplate:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.AddNotificationTemplateSuccess:
      return {
        ...state,
        loading: false,
        newlyAddedEntityId: action.payload.id,
        templateOperationMessage: action.payload.msg
      };
    case NotificationBuilderActionTypes.AddNotificationTemplateFailed:
      return {
        ...state,
        loading: false,
        templateOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.ResetNfTopicOperationMessage:
      return {
        ...state,
        notificationTopicOperationMessage: null,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.ResetNfTemplateOperationMessage:
      return {
        ...state,
        templateOperationMessage: null,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.ResetNfDetailsById:
      return {
        ...state,
        notificationDetailById: null,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.GetTemplateDetailsById:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.GetTemplateDetailsByIdSuccess:
      return {
        ...state,
        loading: false,
        templateDetailsById: action.payload.data
      };
    case NotificationBuilderActionTypes.GetTemplateDetailsByIdFailed:
      return {
        ...state,
        loading: false,
        templateOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.UpdateNotificationTemplate:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.UpdateNotificationTemplateSuccess:
      return {
        ...state,
        loading: false,
        templateOperationMessage: action.payload.msg
      };
    case NotificationBuilderActionTypes.UpdateNotificationTemplateFailed:
      return {
        ...state,
        loading: false,
        templateOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.ResetTemplateDetailsById:
      return {
        ...state,
        templateDetailsById: null,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.DeleteNotificationTemplate:
      return {
        ...state,
        loading: true,
        newlyAddedEntityId: null
      };
    case NotificationBuilderActionTypes.DeleteNotificationTemplateSuccess:
      return {
        ...state,
        loading: false,
        templateOperationMessage: action.payload.msg
      };
    case NotificationBuilderActionTypes.DeleteNotificationTemplateFailed:
      return {
        ...state,
        loading: false,
        templateOperationMessage: 'Fail-' + action.payload.error
      };
    case NotificationBuilderActionTypes.TriggerNotificationTopicSuccess:
      return {
        ...state,
        notificationTopicOperationMessage: action.msg
      };
    case NotificationBuilderActionTypes.TriggerNotificationTopicFailed:
      return {
        ...state,
        notificationTopicOperationMessage: 'Fail-' + action.error
      };
    default:
      return state;
  }
}
