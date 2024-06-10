import { GridConfiguration } from '@wfm/service-layer';

export interface IListRootComponent {
  gridConfigBase: GridConfiguration;
  gridSettingsKeyBase: string;
  settingsKey: string;
}
