import { DataEntity } from './model';
import { Roles } from './user-profile';
import { User } from './wfm-application';

export interface Invitation extends CreateInvitationDto {
  id: string;
  createdAt: string;
  status: number;
  registeredUsers: User[];
  invitationUrl: string;
  creatorUserId: number;
  tenantId: string;
  creatorUser: User;
  acceptedAt?: Date;
  isActive?: boolean;
  invitationSettingId: string;
}

export interface CreateInvitationDto {
  emailAddress: string;
  role: Roles;
  userGroupId?: string;
  multipleRegistrations?: boolean;
}
