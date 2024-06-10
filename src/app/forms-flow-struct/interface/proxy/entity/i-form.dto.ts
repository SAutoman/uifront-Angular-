import { DataEntity } from '@wfm/service-layer';
import { IFormFieldModelDto } from './i-form-field-model.dto';

export interface IFormDto<TSourceFieldModel = any, TSrcData = any> extends DataEntity {
  name: string;
  fields: IFormFieldModelDto<TSourceFieldModel>[];
  fromPreviewImageId?: string;
  /**
   * source date from request use it like readonly
   */
  srcData?: TSrcData;
}
