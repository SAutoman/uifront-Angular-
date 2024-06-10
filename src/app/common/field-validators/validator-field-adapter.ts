/**
 * global
 */
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { IKeyValueView, IMinMax, KeyValueView } from '@wfm/common/models';
import { Addons, FormlyFieldAdapterFactory, FormVariableDto, DateTimeAdapterEnum } from '@wfm/common/vendor';

import {
  AllowedFileType,
  FieldTypeIds,
  FieldTypeLists,
  IAllowedTypesValidatorDto,
  ValidatorType,
  ValidatorTypeMap
} from '@wfm/service-layer';
import { IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';
import { allowedFileTypes, FileTypeEnum } from '@wfm/shared/utils';

/**
 * local
 */
function mapVariableToFormlyConfig(dto: FormVariableDto): FormlyFieldConfig {
  const adapter = FormlyFieldAdapterFactory.createAdapter(dto);
  return adapter.getConfig();
}
export interface IValidatorFieldAdapter {
  getConfig(): FormlyFieldConfig;
}

class BaseFieldAdapter {
  protected constructor(protected field: IConfigurableListItem) {}
  protected get config(): IFieldConfiguration {
    if (!this.field.configuration) {
      this.field.configuration = {} as any;
    }
    return this.field.configuration;
  }
  get fieldType(): FieldTypeIds {
    return this.field.type;
  }

  get isNumber(): boolean {
    const type = this.fieldType;
    switch (type) {
      case FieldTypeIds.IntField:
      case FieldTypeIds.DecimalField:
        return true;

      default:
        return false;
    }
  }

  get isDate(): boolean {
    const type = this.fieldType;
    switch (type) {
      case FieldTypeIds.DateField:
      case FieldTypeIds.DateTimeField:
      case FieldTypeIds.TimeField:
        return true;

      default:
        return false;
    }
  }

  get isList(): boolean {
    const type = this.fieldType;
    return FieldTypeLists.some((x) => x === type);
  }

  get isText(): boolean {
    const type = this.fieldType;
    switch (type) {
      case FieldTypeIds.StringField:
      case FieldTypeIds.TextareaField:
        return true;

      default:
        return false;
    }
  }

  get isFile(): boolean {
    return this.fieldType === FieldTypeIds.FileField;
  }
  get isListOfReferences(): boolean {
    switch (this.fieldType) {
      case FieldTypeIds.ListOfLinksField:
        return true;
      default:
        return false;
    }
  }
}
function getDatePickerType(fieldType: FieldTypeIds): DateTimeAdapterEnum {
  switch (fieldType) {
    case FieldTypeIds.DateField:
      return DateTimeAdapterEnum.appFormlyMatDatePicker;
    case FieldTypeIds.TimeField:
      return DateTimeAdapterEnum.appFormlyMatTimePicker;
    case FieldTypeIds.DateTimeField:
      return DateTimeAdapterEnum.appFormlyMatDateTimePicker;
  }
}
function getMinMaxLabel(adapter: BaseFieldAdapter, isMin: boolean): string {
  let val = '';
  const fieldTypeLabel = isMin ? 'Min' : 'Max';
  if (adapter.isText) {
    val = `${fieldTypeLabel} Length`;
  } else if (adapter.isNumber) {
    val = `${fieldTypeLabel} Value`;
  } else if (adapter.isDate) {
    val = isMin ? 'From' : 'To';
  } else if (adapter.isFile) {
    val = `${fieldTypeLabel} Number Of Files/Attachments`;
  } else if (adapter.isListOfReferences) {
    val = `${fieldTypeLabel} Number Of References`;
  }
  return val;
}

function getMinMaxValidatorFieldType(adapter: BaseFieldAdapter) {
  let validatorFieldType = FieldTypeIds.IntField;
  if (adapter.isDate) {
    validatorFieldType = adapter.fieldType;
  }
  return validatorFieldType;
}

function getMinConfig(adapter: BaseFieldAdapter, value?: string | number | Date): FormlyFieldConfig {
  const cfg: FormVariableDto = {
    type: getMinMaxValidatorFieldType(adapter),
    name: 'min',
    value: value,
    label: getMinMaxLabel(adapter, true),
    required: true,
    min: adapter.isText || adapter.isListOfReferences || adapter.isFile ? 1 : null,
    valueInfo: {
      dateTimeAdapterType: getDatePickerType(adapter.fieldType)
    }
  };
  const formlyAdapter = FormlyFieldAdapterFactory.createAdapter(cfg);
  return formlyAdapter.getConfig();
}

function getMaxConfig(adapter: BaseFieldAdapter, value?: string | number | Date): FormlyFieldConfig {
  const cfg: FormVariableDto = {
    type: getMinMaxValidatorFieldType(adapter),
    name: 'max',
    value: value,
    label: getMinMaxLabel(adapter, false),
    required: true,
    min: adapter.isText || adapter.isListOfReferences || adapter.isFile ? 1 : null,
    valueInfo: {
      dateTimeAdapterType: getDatePickerType(adapter.fieldType)
    }
  };
  const formlyAdapter = FormlyFieldAdapterFactory.createAdapter(cfg);
  return formlyAdapter.getConfig();
}

function createVariableConfig(
  typeInfo: IKeyValueView<string, ValidatorType>,
  value?: any,
  extProps?: { [attribute: string]: any }
): FormVariableDto {
  const dto: FormVariableDto = {
    type: FieldTypeIds.StringField,
    name: typeInfo.key,
    value: value || undefined,
    label: typeInfo.viewValue,
    required: true
  };
  Object.assign(dto, extProps || {});
  return dto;
}

function createConfig(
  typeInfo: IKeyValueView<string, ValidatorType>,
  value?: any,
  extProps?: { [attribute: string]: any }
): FormlyFieldConfig {
  return mapVariableToFormlyConfig(createVariableConfig(typeInfo, value, extProps));
}

class MinMaxFieldAdapter extends BaseFieldAdapter implements IValidatorFieldAdapter {
  constructor(field: IConfigurableListItem, private typeInfo: IKeyValueView<string, ValidatorType>) {
    super(field);
  }

  getConfig(): FormlyFieldConfig {
    const min = this.createMin();
    const max = this.createMax();
    const cfg: FormlyFieldConfig = {
      key: this.typeInfo.key,
      fieldGroup: [min, max],
      templateOptions: { [Addons.formlyRightBtn]: { isFormGroup: true } }
    };
    return cfg;
  }

  private get minMax(): IMinMax {
    const cfg = this.config;
    if (!cfg.minMax) {
      cfg.minMax = { min: undefined, max: undefined };
    }
    return cfg.minMax;
  }

  private createMin(): FormlyFieldConfig {
    return getMinConfig(this, this.minMax.min);
  }
  private createMax(): FormlyFieldConfig {
    return getMaxConfig(this, this.minMax.max);
  }
}
class MinFieldAdapter extends BaseFieldAdapter implements IValidatorFieldAdapter {
  constructor(field: IConfigurableListItem, private typeInfo: IKeyValueView<string, ValidatorType>) {
    super(field);
  }

  getConfig(): FormlyFieldConfig {
    const cfg = getMinConfig(this, this.config.min);
    cfg.key = this.typeInfo.key;
    return cfg;
  }
}
class MaxFieldAdapter extends BaseFieldAdapter implements IValidatorFieldAdapter {
  constructor(field: IConfigurableListItem, private typeInfo: IKeyValueView<string, ValidatorType>) {
    super(field);
  }

  getConfig(): FormlyFieldConfig {
    const cfg = getMaxConfig(this, this.config.max);
    cfg.key = this.typeInfo.key;
    return cfg;
  }
}
class RegExFieldAdapter implements IValidatorFieldAdapter {
  constructor(private typeInfo: IKeyValueView<string, ValidatorType>) {}
  getConfig(): FormlyFieldConfig {
    return createConfig(this.typeInfo);
  }
}
class ListFieldAdapter extends BaseFieldAdapter implements IValidatorFieldAdapter {
  constructor(field: IConfigurableListItem, private typeInfo: IKeyValueView<string, ValidatorType>) {
    super(field);
  }
  getConfig(): FormlyFieldConfig {
    const dto = createVariableConfig(this.typeInfo);
    dto.valueInfo.options = this.config.options || [];
    return mapVariableToFormlyConfig(dto);
  }
}

class FileTypeValidatorAdapter extends BaseFieldAdapter implements IValidatorFieldAdapter {
  constructor(field: IConfigurableListItem, private typeInfo: IKeyValueView<string, ValidatorType>) {
    super(field);
  }
  getConfig(): FormlyFieldConfig {
    let validatorDto = this.field?.configuration?.validators?.find((valid) => {
      return valid.validatorType === this.typeInfo.value;
    });

    const dto: FormVariableDto = {
      type: FieldTypeIds.ListField,
      name: this.typeInfo.key,
      value: (<IAllowedTypesValidatorDto>validatorDto)?.allowedFileTypes || undefined,
      label: this.typeInfo.viewValue,
      required: true,
      valueInfo: {
        options: allowedFileTypes().map((allowedType) => {
          return new KeyValueView(allowedType.id, allowedType, `${allowedType.displayName} ${this.addAllowedTypesToViewName(allowedType)}`);
        }),
        labelProp: 'viewValue',
        valueProp: 'key',
        multiple: true
      }
    };

    return mapVariableToFormlyConfig(dto);
  }

  addAllowedTypesToViewName(type: AllowedFileType): string {
    if (type.id !== FileTypeEnum.Pdf) return `(${type.extensions.map((x) => x.name).join(', ')})`;
    else return '';
  }
}

class ReadonlyFieldAdapter implements IValidatorFieldAdapter {
  constructor(private fieldType: FieldTypeIds, private typeInfo: IKeyValueView<string, ValidatorType>) {}
  getConfig(): FormlyFieldConfig {
    return createConfig(this.typeInfo, this.typeInfo.viewValue, {
      type: this.fieldType,
      disabled: true,
      readonly: true
    });
  }
}

export class ValidatorFieldAdapter implements IValidatorFieldAdapter {
  constructor(private validatorType: ValidatorType, private field: IConfigurableListItem) {}
  getConfig(): FormlyFieldConfig {
    const adapter = this.createAdapter();
    if (adapter) {
      return adapter.getConfig();
    }
    return null;
  }
  private createAdapter(): IValidatorFieldAdapter {
    if (!ValidatorTypeMap.has(this.validatorType)) {
      return null;
    }
    const kv = ValidatorTypeMap.get(this.validatorType);

    switch (this.validatorType) {
      case ValidatorType.MinMax:
        return new MinMaxFieldAdapter(this.field, kv);
      case ValidatorType.Min:
        return new MinFieldAdapter(this.field, kv);
      case ValidatorType.Max:
        return new MaxFieldAdapter(this.field, kv);
      case ValidatorType.RegEx:
        return new RegExFieldAdapter(kv);
      case ValidatorType.List:
        return new ListFieldAdapter(this.field, kv);
      case ValidatorType.AllowedTypes:
        return new FileTypeValidatorAdapter(this.field, kv);

      // case ValidatorType.Date:
      // case ValidatorType.Time:
      // case ValidatorType.DateTime:
      case ValidatorType.Required:
      case ValidatorType.Email:
      case ValidatorType.Integer:
      case ValidatorType.Decimal:
        return new ReadonlyFieldAdapter(FieldTypeIds.StringField, kv);

      default:
        throw new Error('Not implemented ValidatorType');
    }
  }
}
