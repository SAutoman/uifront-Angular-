export interface SendNotificationCommand {
  tenantId: string;
  from: string;
  recipientCompanyId: string;
  subject: string;
  templateId: string;
  rawDataSchemaID: string;
  rawDataId: string;
}
