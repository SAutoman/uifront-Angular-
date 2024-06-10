/**
 * global
 */

import { KeyValue } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';
/**
 * project
 */
import { Value } from '@wfm/common/partial';

/**
 * local
 */
import { FormVariableDto } from './form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from './formly-field-adapter-type.enum';

export interface ConfigExtraOptions {
  isDisabledExplicitly?: boolean;
}

export abstract class FormlyFieldAdapter<TFieldValueType> {
  readonly type: FormlyFieldAdapterTypeEnum;

  protected readonly formVariable: FormVariableDto;

  protected constructor(formVariable: FormVariableDto, adapterType: FormlyFieldAdapterTypeEnum) {
    this.formVariable = formVariable;
    this.type = adapterType;
  }

  abstract getConfig(options?: ConfigExtraOptions): FormlyFieldConfig;

  getValue(): KeyValue<string, TFieldValueType> {
    const formVariable = this.formVariable;

    return {
      key: formVariable.name,
      value: Value.parse(formVariable.value)
    };
  }
}
