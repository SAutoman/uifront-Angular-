import { Roles } from '@wfm/service-layer';
import { RuleSetCustom } from '@wfm/service-layer/models/expressionModel';
import { ValidationRuleSet } from './aggregation-validation/aggregation.model';
import { cloneDeep } from 'lodash-core';
import { IKeyValueView, EnumConverter, KeyValueView } from '@wfm/common/models';

export enum RawDataLinkRightsEnum {
  CanAddToNew,
  CanAddToExisting,
  CanDeleteFromCase
}

export const RawDataLinkRightMap: {
  get: (type: RawDataLinkRightsEnum | string) => IKeyValueView<string, RawDataLinkRightsEnum>;
  has: (type: RawDataLinkRightsEnum | string) => boolean;
  getAll: () => IKeyValueView<string, RawDataLinkRightsEnum>[];
} = (() => {
  const map = new Map<RawDataLinkRightsEnum, IKeyValueView<string, RawDataLinkRightsEnum>>();
  const converter = new EnumConverter(RawDataLinkRightsEnum);

  const setItem = (type: RawDataLinkRightsEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(RawDataLinkRightsEnum.CanAddToNew, 'Add to New Case');
  setItem(RawDataLinkRightsEnum.CanAddToExisting, 'Add to Existing Case');
  setItem(RawDataLinkRightsEnum.CanDeleteFromCase, 'Remove from Case');

  const has = (type: RawDataLinkRightsEnum | string) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: RawDataLinkRightsEnum | string) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: (x) => getKv(x),
    has,
    getAll: () => cloneDeep(Array.from(map.values()))
  };
})();

export interface CreateRawDataLinkDto {
  workflowSchemaId: string;
  rawDataSchemaId: string;
  tenantId: string;
  schemaFieldId: string;
  minRawDataCount: number;
  maxRawDataCount: number;
  rawDataLinkOverrides: Array<RawDataLinkOverride>;
}

export interface RawDataLinkDto extends CreateRawDataLinkDto {
  id: string;
}

export interface RawDataLinkOverride {
  name: string;
  rawDataLinkRight: RawDataLinkRightsEnum;
  roles: Roles[];
  userGroupIds: [];
  ruleSet: RuleSetCustom;
  allowedRawDataStatusesIds: string[];
  allowUnassignedStatus: boolean;
  allowedCaseStatusesIds: string[];
  rawDataItemsValidation: ValidationRuleSet;
  caseFieldsRuleSet?: RuleSetCustom;
}
