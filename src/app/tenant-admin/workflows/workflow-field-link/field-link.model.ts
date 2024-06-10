import { Roles } from '@wfm/service-layer';

export interface CreateFieldLinkDto {
  workflowSchemaId: string;
  tenantId: string;
  schemaFieldId: string;
  caseFieldLinkOverrides?: FieldLinkOverride[];
}

export interface FieldLinkDto extends CreateFieldLinkDto {
  id: string;
}

export interface ShortUrlDto {
  shortUrl: string;
}

export interface FieldLinkOverride {
  name: string;
  workflowStatusIds?: string[];
  roles?: Roles[];
  userGroupIds?: string[];
  caseFieldLinkOverrideRights: FieldLinkOverrideRights;
}

export interface FieldLinkOverrideRights {
  canView: boolean;
  canEdit: boolean;
}

export interface FieldLinkRules {
  schemaFieldId: string;
  activeOverrideNames: string[];
  rights: FieldLinkOverrideRights;
}
