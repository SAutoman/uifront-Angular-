import { KeyValue } from '@angular/common';
import { cloneDeep } from 'lodash-core';

import { EnumConverter, IConfigurableListItem, IFieldConfiguration, KeyValueView } from '@wfm/common/models';

import {
  AreaTypeEnum,
  AreaTypeList,
  AreaTypeObj,
  FieldTypeIds,
  IBaseFieldConfiguration,
  IFieldBaseDto,
  ValidatorDtoType,
  ValidatorType
} from '../models';
import { convertFieldName } from './convertFieldName';
import { ListValue } from '../models/FieldValueDto';

export class BaseFieldConverter {
  static toDto(field: IConfigurableListItem): IFieldBaseDto {
    const copy: IConfigurableListItem = cloneDeep(field);
    // normalize field name
    copy.name = convertFieldName(field.name || field.displayName);
    const areaTypes = this.getAreaTypesFromUseInObj(copy);
    // remove ui fields
    delete copy.useIn;
    delete copy.useInObj;

    const item: IFieldBaseDto = {
      ...copy,
      type: copy.type,
      areaTypes: areaTypes,
      fieldName: copy.name,
      displayName: field.viewName || field.displayName,
      configuration: this.uiConfigToDtoConfig(copy)
    };

    // remove ui fields
    delete item.name;
    delete item.viewName;
    return item;
  }

  static toUi(field: IFieldBaseDto, position?: number): IConfigurableListItem {
    const fieldCopy: IFieldBaseDto = cloneDeep(field);
    const item: IConfigurableListItem = {
      ...fieldCopy,
      name: fieldCopy.fieldName,
      viewName: fieldCopy.displayName,
      configuration: this.dtoConfigToUiConfiguration(fieldCopy.configuration, fieldCopy)
    };
    if (!item.configuration.position && position) {
      item.configuration.position = position;
    }

    item.useIn = this.getAreaTypesFromDto(field.areaTypes);
    item.useInObj = field.useInObj || new AreaTypeObj(item.useIn);

    return item;
  }

  static getAreaTypesFromUseInObj(field: IConfigurableListItem): AreaTypeEnum[] {
    const config = field.useInObj || {};
    const converter = new EnumConverter(AreaTypeEnum);
    const outputMap = new Map<AreaTypeEnum, AreaTypeEnum>();

    Object.keys(config)
      .filter((x) => !!config[x])
      .map((key) => converter.getKeyValue(key))
      .filter((x) => !!x)
      .forEach((kv) => {
        switch (kv.value) {
          case AreaTypeEnum.all:
            [...AreaTypeList].forEach((j) => outputMap.set(j, j));
            break;

          default:
            outputMap.set(kv.value, kv.value);
            break;
        }
      });
    return [...outputMap.values()];
  }

  static getAreaTypesFromDto(types?: AreaTypeEnum[]): AreaTypeEnum[] {
    let output: AreaTypeEnum[] = [...AreaTypeList];
    if (!types) {
      return output;
    }
    const srcMap = new Map<AreaTypeEnum, AreaTypeEnum>();

    types.forEach((x) => srcMap.set(x, x));

    if (!srcMap.has(AreaTypeEnum.all)) {
      output = [...srcMap.values()];
    }
    return output;
  }

  private static dtoConfigToUiConfiguration(config?: IBaseFieldConfiguration, field?: IFieldBaseDto): IFieldConfiguration {
    const defaultConfig: IFieldConfiguration = { position: 0 };
    if (!config) {
      return defaultConfig;
    }

    const configCopy: IBaseFieldConfiguration = cloneDeep(config);
    const outputCfg: IFieldConfiguration = Object.assign(defaultConfig, configCopy);
    if (configCopy.options) {
      outputCfg.options = configCopy.options.map((x) => new KeyValueView(x.id, x, x.item));
      outputCfg.valueProp = configCopy.valueProp || 'value';
      outputCfg.labelProp = configCopy.labelProp || 'viewValue';
    }
    if (field.value) {
      outputCfg.value = field.value;
    } else if (configCopy.value) {
      // static default value mapping
      if (field.type === FieldTypeIds.ListField) {
        if (field.configuration.defaultValueType === 1) {
          outputCfg.value = configCopy.value.value?.listItemId
            ? configCopy.value.value.listItemId
            : configCopy.value['listItemId'] || configCopy.value;
        } else {
          outputCfg.value = configCopy.value['listItemId'] || configCopy.value;
        }
      } else if (field.type === FieldTypeIds.MultiselectListField) {
        if (field.configuration.defaultValueType === 1) {
          outputCfg.value = configCopy.value?.value ? configCopy.value.value : configCopy.value || configCopy.value;
        } else {
          outputCfg.value = configCopy?.value ? configCopy.value : [];
        }
      } else {
        if (configCopy.value.value !== null && configCopy.value.value !== undefined) {
          outputCfg.value = configCopy.value.value;
        } else {
          outputCfg.value = configCopy.value;
        }
      }
    }
    if (configCopy.validators) {
      outputCfg.validators = configCopy.validators.map((x) => {
        switch (x.key) {
          case ValidatorType.Email:
            return {
              ...x.value,
              email: true,
              validatorType: x.key
            };
          default:
            return {
              ...x.value,
              validatorType: x.key
            };
        }
      });
    }
    if (configCopy.parentListId) {
      outputCfg.parentListId = configCopy.parentListId;
    }
    return outputCfg;
  }

  private static uiConfigToDtoConfig(field: IConfigurableListItem): IBaseFieldConfiguration {
    const defaultConfig: IBaseFieldConfiguration = { position: 0 };

    if (!field.configuration) {
      return defaultConfig;
    }
    const copy: IFieldConfiguration = cloneDeep(field.configuration);

    let validators: KeyValue<ValidatorType, ValidatorDtoType>[] = [];
    if (copy.validators) {
      validators = copy.validators.map((x) => {
        const validatorType = x.validatorType;
        // if do not remove it throw error 500
        // delete x.isValid;
        delete x.validatorType;

        let deleteFieldType = true;
        switch (validatorType) {
          case ValidatorType.MinMax:
            // done for backend, it is waiting for value - {min, max} and not {minMax:{min, max}}
            deleteFieldType = false;
            x['min'] = x['minMax'] ? x['minMax']['min'] : x['min'];
            x['max'] = x['minMax'] ? x['minMax']['max'] : x['max'];
            delete x['minMax'];
            break;
          case ValidatorType.Min:
          case ValidatorType.Max:
            deleteFieldType = false;
            break;

          default:
            break;
        }
        if (deleteFieldType) {
          delete (<any>x).fieldType;
        }
        return {
          key: validatorType,
          value: x
        };
      });
    }
    const outputCfg: IBaseFieldConfiguration = Object.assign(defaultConfig, copy);
    if (copy.options) {
      outputCfg.options = copy.options.map((x) => x.value);
    }
    if (copy.value !== null && copy.value !== undefined) {
      // static default value mapping
      if (field.type === FieldTypeIds.ListField) {
        outputCfg.value = {
          id: convertFieldName(field.name),
          type: field.type,
          value: <ListValue>{ listItemId: copy.value }
        };
      } else {
        outputCfg.value = {
          id: convertFieldName(field.name),
          type: field.type,
          value: copy.value
        };
      }
    }
    outputCfg.parentListId = copy.parentListId;
    outputCfg.validators = validators;
    return outputCfg;
  }
}
