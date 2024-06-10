/**
 * global
 */
import { AbstractControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { IAllowedTypesValidatorUi, ValidatorType } from '@wfm/service-layer';
import { FileTypeEnum, getExtensionsByType } from '@wfm/shared/utils';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';

export class FileFieldAdapter extends FormlyFieldAdapter<string> {
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.file);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;

    let acceptedFileTypes = getAllowedExtensions(formVariable);
    let validators = {};
    let templateOptions = {
      label: formVariable.label,
      required: formVariable.required,
      readonly: formVariable.readonly,
      disabled: formVariable.disabled || formVariable.readonly,
      disableButtons: formVariable.disableButtons,
      readonlySetExplicitly: formVariable.readonly
    };

    const minValue = formVariable.min;
    if (minValue) {
      validators['min'] = (control: AbstractControl) => {
        return !control.value || control.value.length >= minValue;
      };
      templateOptions['min'] = minValue;
    }

    const maxValue = formVariable.max;

    if (maxValue) {
      validators['max'] = (control: AbstractControl) => {
        return !control.value || control.value.length <= maxValue;
      };
      templateOptions['max'] = maxValue;
    }

    const config: FormlyFieldConfig = {
      key: formVariable.name,
      type: FormlyFieldAdapterTypeEnum.file,
      validators: validators,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required),
          min: ErrorMessageGenerator.get(ErrorMessageTypeEnum.minCount, minValue),
          max: ErrorMessageGenerator.get(ErrorMessageTypeEnum.maxCount, maxValue)
        }
      },
      templateOptions: {
        ...templateOptions,
        label: formVariable.label,
        required: formVariable.required,
        readonly: formVariable.readonly,
        disabled: formVariable.disabled,
        disableButtons: formVariable.disableButtons,
        isHighlighted: formVariable.isHighlighted,
        highlightColor: formVariable.highlightColor,
        aspectRatio: formVariable?.valueInfo?.aspectRatio,
        thumbnailEnabled: formVariable?.valueInfo?.thumbnailEnabled,
        fileNameSetting: formVariable?.valueInfo?.fileNameSetting
      },
      defaultValue: formVariable.value
    };
    if (acceptedFileTypes.length) {
      // prepare the value for inputFile's [accept] property
      config.templateOptions.accept = acceptedFileTypes
        .map((ext) => {
          if (ext === '*') {
            return ext;
          }
          return `.${ext}`;
        })
        .join(',');
    }

    return config;
  }
}

/**
 * if there is allowedFileTypes validation on the field,
 *  populate allowed extensions in an array
 */
function getAllowedExtensions(formData: FormVariableDto): string[] {
  let acceptedFileTypes = [];

  const allowedFilesValidator = formData.valueInfo?.validators?.find((validator) => {
    return validator.validatorType === ValidatorType.AllowedTypes;
  });
  if (allowedFilesValidator) {
    let allowedTypes = (<IAllowedTypesValidatorUi>allowedFilesValidator).allowedFileTypes;
    allowedTypes.forEach((typeKey) => {
      let item = getExtensionsByType(<FileTypeEnum>typeKey);
      if (item) {
        acceptedFileTypes.push(...item.extensions.map((x) => x.name));
      }
    });
  }
  return acceptedFileTypes;
}
