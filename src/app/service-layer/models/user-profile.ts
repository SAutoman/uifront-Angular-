import { DataEntity } from './model';
export interface UserProfileResponse {
  profile: Profile;
  rolesPerTenant: TenantProfile[];
}

export interface TenantProfile {
  tenantId: string;
  tenantName: string;
  role: string;
  roleNum: Roles;
  tenantTimeZone: string;
}

export interface Profile extends DataEntity {
  companyPublicId: string;
  title: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  isAdmin: boolean;
  address: string;
  department: string;
  photoId?: string;
}

export interface ProfileUpdate extends Profile {
  title: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  department: string;
  isAdmin: boolean;
}

export enum Roles {
  TenantAdmin = 1,
  Tenant = 2,
  Supplier = 3,
  Auditor = 4
}

export enum InvitationStatus {
  Pending = 1,
  Accepted = 2,
  Revoked = 3
}

export const searchUsersByEmail = 'Email';
export const searchUsersByName = 'Name';
export const searchUsersByLastName = 'LastName';
export const searchUsersByCompanyName = 'CompanyName';
export const searchUsersByRole = 'Role';
