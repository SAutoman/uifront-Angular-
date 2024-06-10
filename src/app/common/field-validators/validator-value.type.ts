/**
 * project
 */
import { ValidatorType } from '@wfm/service-layer';
import { IMinMax } from '@wfm/common/models';

export type ValidatorValue = {
  [key in ValidatorType]: string | number | Date | boolean | { MinMax: IMinMax<string | number | Date> };
};
