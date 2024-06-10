import { GridConfiguration } from '@wfm/service-layer';
import { GridDataResultEx } from '@wfm/shared/kendo-util';

export interface IViewList<T> {
  userId: string;
  tenantName: string;
  tenantId: string;
  formsGridSettingId: string;
  formsGridSettingsConf: GridConfiguration;
  gridData: GridDataResultEx<T>;
}
