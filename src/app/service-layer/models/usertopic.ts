import { DataEntity } from './model';

export interface SubscribeUserToTopic {
  userId: string;
  notificationTopicId: string;
  tenantId: string;
}

export interface UnsubscribeUserFromTopicCommand extends SubscribeUserToTopic {}

export interface UserTopicDto extends DataEntity {
  notificationTopicId: string;
  isEnabled: boolean;
}
