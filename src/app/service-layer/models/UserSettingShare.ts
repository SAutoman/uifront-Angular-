import { User } from './wfm-application';

export interface UserSettingShare {
  users: string[];
  groups: string[];
  userId: string;
  userSettingId: string;
}

export interface UserSettingShareDtoGet {
  userSettingId: string;
  sharedWithUsers: User[];
  sharedWithGroups: string[];
  sharedWithSystemGroups: string[];
}
