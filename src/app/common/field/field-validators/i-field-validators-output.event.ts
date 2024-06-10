import { KeyValue } from '@angular/common';
import { ValidatorType } from '@wfm/service-layer';

export interface IFieldValidatorsOutputEvent {
  valid: boolean;
  validators: KeyValue<ValidatorType, any>[];
  dirty?: boolean;
}
