import { DataEntity } from './model';
import { Roles } from './user-profile';
import { User } from './wfm-application';

export interface UserGroupsDto extends DataEntity {
  ownerUserId: string;
  name: string;
  users: User[];
}

export interface UserGroupUpdateDto {
  name: string;
  users: string[];
}

export interface UserGroupCreateDto {
  ownerUserId: string;
  name: string;
  users: string[];
}

export interface GroupUsers extends DataEntity {
  ownerUserId: string;
  name: string;
  users: User[];
  systemGroup?: boolean;
}

export interface SystemUserGroupDto extends UserGroupsDto {
  systemGroup: Roles;
}

export interface UserAndSystemGroupsDto {
  name: string;
  id: string;
  systemGroup?: Roles;
}
