import { SortDescriptor, State } from '@progress/kendo-data-query';
import { Paging, Roles } from '@wfm/service-layer';
import { GridDataResultEx } from '../../shared/kendo-util';

export class EmailAuditViewModel {
  from: string;
  to: string[];
  cc: string[];
  corelationId?: string;
  content: string;
  createdAt: string;
}

export class BaseEmailAuditViewModel {
  id: string;
  tenantId: string;
  userId: string;
  userRole: Roles;
  notificationTopicId: string;
  topicName: string;
  emailAudit: EmailAuditViewModel;
  role?: string;
  createdAt?: string;
}

export class CaseEmailAuditViewModel extends BaseEmailAuditViewModel {
  newWorkflowId: string;
  from?: string;
  to?: string[];
  cc?: string[];
  corelationId?: string;
  content: string;
}

export class RawDataEmailAuditViewModel extends BaseEmailAuditViewModel {
  newRawDataId: string;
}

export interface SearchEmailAuditsQuery {
  from: string;
  to: string;
  userIds: string[];
  notificationTopicIds: string[];
  paging: Paging;
}

export class EmailAuditListPageViewModel {
  paging: State;
  gridData: GridDataResultEx<EmailAuditViewModel>;
  sort: SortDescriptor[];
  displayDeleteConfirmation: boolean;
}

export const emailAuditGridSettings = 'emailAuditGridSettings';

export interface EmailAuditSearch {
  from: Date;
  to: Date;
  users?: string[];
  notificationTopics?: string[];
}
