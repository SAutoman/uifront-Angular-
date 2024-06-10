import { DataEntity } from './model';
import { Settings } from './user-settings';

export interface AppSettingsDto extends DataEntity {
  settings: Settings[];
  appId: string;
}

export interface CreateAppSettingsDto {
  appId: string;
  key: string;
  settingsJson: any;
}

export interface UpdateAppSettingsDto {
  appId: string;
  settings: [
    {
      id: string;
      key: string;
      value: any;
      isUnique: boolean;
    }
  ];
}

export interface RemoveAppSettingsCommand {
  publicId: string;
}

export enum AppSettingKeysEnum {
  CaseMergeUpdate = 'CaseMergeUpdate',
  ListOfEmbeddedFieldSupport = 'ListOfEmbeddedFieldSupport'
}
