import { IFilter, Paging, Sorting } from '@wfm/service-layer/models';

export interface NotificationTemplateDto {
  template: string;
  name: string;
  logoId: string;
  tenantId: string;
  id: string;
}

export interface CreateNotificationTemplateCommand {
  tenantId: string;
  name: string;
  logoId: string;
  template: string;
}

export interface DeleteNotificationTemplateCommand {
  id: string;
  tenantId: string;
}

export interface GetNotificationTemplateQuery {
  id: string;
  tenantId: string;
}

export interface UpdateNotificationTemplateCommand {
  id: string;
  tenantId: string;
  logoId: string;
  name: string;
  template: string;
}

export interface SearchNotificationTemplatesQuery {
  paging?: Paging;
  sorting?: Sorting[];
  filters?: IFilter[];
  projection?: {
    propertyNames: string[];
  };
}
