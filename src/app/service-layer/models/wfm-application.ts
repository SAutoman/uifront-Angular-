import { Company } from './Company';
import { DataEntity } from './model';
import { Roles } from './user-profile';

export interface WfmApplication extends DataEntity {
  baseUrl: string;
  name: string;
}

export interface Tenant extends DataEntity {
  name: string;
  appPublicId: string;
  companyName?: string;
  company?: UsersUiGrid;
  timeZone: string;
}

export interface User extends DataEntity {
  title: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  department: string;
  photoId?: string;
  isAdmin: boolean;
  publicId: string;
  companyId: string;
  role: Roles;
  createdAt: string;
  // used for tests
  subject?: string;
  // ui field
  isChecked?: boolean;
  company: Company;
  isTestUser: boolean;
}

export interface DeactivatedUser extends DataEntity {
  firstName: string;
  lastName: string;
  email: string;
  role: Roles;
  company: string;
}

export interface DeactivatedUserGrid extends DeactivatedUser {
  id: string;
  roleName: string;
}

export interface UsersUiGrid extends User {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyEmail: string;
  companyNotes: string;
  companyPhone: string;
  companyVatNr: string;
  companyTaxNumber: string;
  companyZip: string;
  companyDropDownInfo?: { name: string; id: string };
}

export interface CreateTenantModel {
  name: string;
  appPublicId: string;
  companyId: string;
  invitationTemplate: string;
  timeZone: string;
}

export interface CopyTenantSettingsModel {
  oldTenantId: string;
  newTenantId: string;
  invitationTemplate: string;
}

export interface RegisterUserCommand extends User {
  invitationEmail: string;
  invitationSettingId: string;
}

export interface UpdateTenantModel {
  name: string;
  appPublicId: string;
  id: string;
  timeZone: string;
}
