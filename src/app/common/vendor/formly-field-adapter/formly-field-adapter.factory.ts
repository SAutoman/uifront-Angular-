/**
 * global
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { lowerFirst } from 'lodash-core';

/**
 * project
 */
import { FieldTypeIds } from '@wfm/service-layer';
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { ValidatorType } from '@wfm/service-layer';

/**
 * local
 */
import {
  CheckboxFieldAdapter,
  DateTimeFieldAdapter,
  FileFieldAdapter,
  InputFieldAdapter,
  NumberFieldAdapter,
  SelectFieldAdapter,
  TextareaFieldAdapter,
  MultiSelectFieldAdapter,
  ConnectorFieldAdapter
} from './adapters';
import { FormVariableDto } from './form-variable.dto';
import { ConfigExtraOptions, FormlyFieldAdapter } from './formly-field.adapter';
import { FormlyFieldAdapterTypeEnum } from './formly-field-adapter-type.enum';
import { ListOfEntitiesAdapter } from './adapters/list-of-links-field.adapter';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { IConfigurableListItem } from '@wfm/common/models';
import { FormlyHighlightsHelper } from '@wfm/service-layer/helpers/formly-highlights.helper';
import {
  formlyFieldDefaultClass,
  formlyFieldReadonlyClass
} from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { RichTextFieldAdapter } from './adapters/rich-text-area.adapter';
import { SignatureFieldAdapter } from './adapters/signature-field.adapter';
import { YoutubeEmbedFieldAdapter } from './adapters/youtube-field.adapter';

// high level formly-field adapter, it can call FormlyFieldAdapterFactory for its own fields
// extracting the class to a separate file causes circular dependency warnings

class EmbeddedSchemaFieldAdapter extends FormlyFieldAdapter<any> {
  isDisabledExplicitly: boolean;
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.embeddedSchema);
  }

  getConfig(options: ConfigExtraOptions): FormlyFieldConfig {
    const schema = this.formVariable;
    this.isDisabledExplicitly = options.isDisabledExplicitly;
    return {
      key: schema.name,
      wrappers: ['fieldGroupWrapper'],
      fieldGroup: schema.fields
        ? schema.fields.map((field) => {
            return this.toFormlyField(BaseFieldConverter.toUi(field), schema.allowHighlightCheckbox);
          })
        : [],
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: {
        label: schema.label,
        required: schema.required,
        readonly: schema.readonly,
        isHighlighted: schema.isHighlighted,
        highlightColor: schema.highlightColor,
        isExpanded: false
      },
      defaultValue: schema.value
    };
  }

  /**
   * create a formly field based on the field type.
   * The method will recursively call the SchemaFieldAdapter for deep nested schemas
   * @param item
   */

  private toFormlyField(item: IConfigurableListItem, allowHighlightCheckbox?: boolean): FormlyFieldConfig {
    const dto: FormVariableDto = {
      label: item.displayName,
      name: item.fieldName || item.name,
      type: item.type,
      value: item.value || item.configuration?.value,
      disabled: item.isLockedField,
      valueInfo: item.configuration,
      readonly: item.configuration?.readonly,
      placeholder: item.configuration?.placeholder || '',
      fields: item.fields,
      allowHighlightCheckbox,
      disableButtons: this.isDisabledExplicitly
    };
    if (item.type === FieldTypeIds.ListField) {
      dto.isCascadeSelect = false;
      dto.canResetSelection = true;
      dto.showSearchInput = true;
    }
    if (item.configuration?.renderType) {
      dto.renderType = item.configuration.renderType;
    }

    item.configuration?.validators?.forEach((validator) => {
      const validatorKey = lowerFirst(ValidatorType[validator.validatorType]);
      const validatorValue = validator[validatorKey];

      if (validatorKey === 'minMax') {
        dto.min = validatorValue ? validatorValue.min : validator['min'];
        dto.max = validatorValue ? validatorValue.max : validator['max'];
      }
      dto[validatorKey] = validatorValue;
    });

    if (item.configuration.allowHighlighting) {
      dto.isHighlighted = item.configuration.isHighlighted;
      dto.highlightColor = item.configuration.highlightColor;
    }

    const adapter = FormlyFieldAdapterFactory.createAdapter(dto);
    let config = adapter.getConfig({ isDisabledExplicitly: this.isDisabledExplicitly });
    let classNames = formlyFieldDefaultClass;
    if (item.configuration.readonly) {
      classNames = formlyFieldReadonlyClass;
    }
    if (config.templateOptions.isHighlighted && config.templateOptions.highlightColor) {
      classNames += ` ${config.templateOptions.highlightColor}`;
    }
    config.className = classNames;

    if (item.type === FieldTypeIds.EmbededField) {
      FormlyHighlightsHelper.highlightFieldGroupWrapper(config);
    }
    if (allowHighlightCheckbox && item.configuration.allowHighlighting) {
      config = FormlyHighlightsHelper.addHighlightFunctionalityNestedFields(config);
    }
    return config;
  }
}

export class FormlyFieldAdapterFactory {
  private static readonly adapterTypes = (() => {
    const adapterTypes = new Map<FieldTypeIds, new (fieldVariable: FormVariableDto) => FormlyFieldAdapter<any>>();

    adapterTypes.set(FieldTypeIds.BoolField, CheckboxFieldAdapter);
    // date fields
    adapterTypes.set(FieldTypeIds.DateField, DateTimeFieldAdapter);
    adapterTypes.set(FieldTypeIds.DateTimeField, DateTimeFieldAdapter);
    adapterTypes.set(FieldTypeIds.TimeField, DateTimeFieldAdapter);

    adapterTypes.set(FieldTypeIds.ListField, SelectFieldAdapter);
    adapterTypes.set(FieldTypeIds.MultiselectListField, MultiSelectFieldAdapter);

    adapterTypes.set(FieldTypeIds.FileField, FileFieldAdapter);
    adapterTypes.set(FieldTypeIds.IntField, NumberFieldAdapter);
    adapterTypes.set(FieldTypeIds.DecimalField, NumberFieldAdapter);

    adapterTypes.set(FieldTypeIds.StringField, InputFieldAdapter);
    adapterTypes.set(FieldTypeIds.EmbededField, EmbeddedSchemaFieldAdapter);
    adapterTypes.set(FieldTypeIds.ListOfLinksField, ListOfEntitiesAdapter);
    adapterTypes.set(FieldTypeIds.TextareaField, TextareaFieldAdapter);
    adapterTypes.set(FieldTypeIds.ConnectorField, ConnectorFieldAdapter);
    adapterTypes.set(FieldTypeIds.RichTextField, RichTextFieldAdapter);
    adapterTypes.set(FieldTypeIds.SignatureField, SignatureFieldAdapter);
    adapterTypes.set(FieldTypeIds.YouTubeEmbedField, YoutubeEmbedFieldAdapter);

    return adapterTypes;
  })();

  static createAdapter(fieldVariable: FormVariableDto): FormlyFieldAdapter<any> {
    const fieldType = fieldVariable.type;
    const suitableAdapterType = FormlyFieldAdapterFactory.getSuitableAdapterType(fieldType);

    if (suitableAdapterType) {
      const adapter = FormlyFieldAdapterFactory.adapterTypes.get(suitableAdapterType);

      return new adapter(fieldVariable);
    } else {
      console.error(`No conversion adapter found for type: ${fieldType}`);
    }

    return new InputFieldAdapter(fieldVariable);
  }

  private static getSuitableAdapterType(fieldType: FieldTypeIds | string): FieldTypeIds | null {
    if (!fieldType) {
      return null;
    }
    const kv = Object.keys(FieldTypeIds).map((x) => {
      return {
        key: x,
        value: FieldTypeIds[x]
      };
    });
    const item = kv.find((x) => x.value === fieldType || x.key === fieldType);
    if (!item) {
      return null;
    }
    if (this.adapterTypes.has(item.value)) {
      return item.value;
    }
    return null;
  }
}
