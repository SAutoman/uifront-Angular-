import { DataEntity } from '@wfm/service-layer';
import { IKeyValueView } from '@wfm/common/models';

export interface IFieldSettingsVisibilityDto<T = any> extends DataEntity {
  name: string;
  options: IKeyValueView<string, boolean>[];
  useKeys: string[];
  toched?: boolean;
  data?: T;
}
