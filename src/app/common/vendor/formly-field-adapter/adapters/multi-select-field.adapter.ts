/**
 * global
 */
import { KeyValue } from '@angular/common';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * project
 */
import { AppStatic } from '@wfm/app.static';

import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { ListsService } from '@wfm/service-layer';
import { populateListOptionValue } from '@wfm/service-layer/helpers/list-item-display.helper';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';
import { KeyValueDisabled } from './select-field.adapter';

// Copied SelectFieldAdapter, only slight changes

export class MultiSelectFieldAdapter extends FormlyFieldAdapter<any> {
  private listService: ListsService;
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.select);
    this.listService = AppStatic.injector.get(ListsService);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;

    let options: Observable<KeyValue<string, any>[]>;
    if (formVariable?.valueInfo?.options) {
      options = of(formVariable.valueInfo.options);
    } else if (formVariable?.valueInfo?.listId) {
      options = this.listService.getListOptions$(formVariable.valueInfo.listId, null, formVariable.valueInfo.tenantId).pipe(
        map((options) => {
          const selectOptions = options.map((option) => {
            return <KeyValueDisabled>{
              key: populateListOptionValue(option, formVariable.valueInfo?.listItemDisplaySetting),
              value: option.id,
              disabled: option.isDisabled
            };
          });
          return selectOptions;
        })
      );
    } else {
      options = of([]);
      console.warn('not implemented select type', {
        formVariable
      });
    }
    const config: FormlyFieldConfig = {
      key: formVariable.name,
      type: formVariable.autocomplete ? FormlyFieldAdapterTypeEnum.autocomplete : FormlyFieldAdapterTypeEnum.select,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: {
        label: formVariable.label,
        required: formVariable.required,
        readonly: formVariable.readonly,
        disabled: formVariable.disabled || formVariable.readonly,
        options: options,
        labelProp: formVariable?.valueInfo?.labelProp || 'key',
        valueProp: formVariable?.valueInfo?.valueProp || 'value',
        multiple: true,
        isHighlighted: formVariable.isHighlighted,
        highlightColor: formVariable.highlightColor,
        listItemDisplaySetting: formVariable?.valueInfo?.listItemDisplaySetting || null,
        listId: formVariable?.valueInfo?.listId,
        listData: formVariable?.valueInfo?.listData,
        readonlySetExplicitly: formVariable.readonly,
        fieldPath: formVariable.valueInfo?.fieldPath
      }
    };
    if (formVariable.value) {
      config.defaultValue = formVariable.value;
    }
    return config;
  }
}
