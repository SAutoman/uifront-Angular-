import { EnumConverter, IKeyValueView, KeyValueView } from '@wfm/common/models';

/**
 * represent permission to use it in logical area section
 */
export enum AreaTypeEnum {
  unknown = 0,
  /**
   * allow to use it in case schemas
   */
  case = 1,
  /**
   * allow to use it in process and step schemas
   */
  stepForm = 2,
  /**
   * allow to use it in raw data schemas
   */
  rawData = 3,
  /**
   * apply to all, exclude unknown
   */
  all = 4,
  system = 5,
  /**
   * allow to use it in comments schemas
   */
  comment = 6,
  workflowState = 7
}

export const AreaTypeList = [AreaTypeEnum.all, AreaTypeEnum.rawData, AreaTypeEnum.case, AreaTypeEnum.stepForm, AreaTypeEnum.comment];

type InputType = AreaTypeEnum | string | number;

export const AreaTypeMap: {
  get: (type: InputType) => IKeyValueView<string, AreaTypeEnum>;
  has: (type: InputType) => boolean;
} = (() => {
  const map = new Map<AreaTypeEnum, IKeyValueView<string, AreaTypeEnum>>();
  const converter = new EnumConverter(AreaTypeEnum);

  const setItem = (type: AreaTypeEnum, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(AreaTypeEnum.case, 'Case');
  setItem(AreaTypeEnum.stepForm, 'Forms/Steps');
  setItem(AreaTypeEnum.rawData, 'Raw Data');
  setItem(AreaTypeEnum.all, 'All');
  setItem(AreaTypeEnum.comment, 'Comment');

  const has = (type: InputType) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };

  const getKv = (type: InputType) => {
    if (!has(type)) {
      return null;
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };
  return {
    get: getKv,
    has
  };
})();

export interface IAreaTypeObj<T> {
  /**
   * allow to use it in case area | dataObject for area
   */
  case: T;
  /**
   * allow to use it in process and step forms | dataObject for area
   */
  stepForm: T;
  /**
   * allow to use it  in raw data area | dataObject for area
   */
  rawData: T;
  /**
   * apply to all, exclude unknown | dataObject for area
   */
  all: T;
  comment: T;
}

export class AreaTypeObj implements IAreaTypeObj<boolean> {
  case: boolean = false;
  stepForm: boolean = false;
  rawData: boolean = false;
  all: boolean = false;
  comment: boolean = false;

  constructor(types: AreaTypeEnum[]) {
    types.forEach((x) => {
      if (AreaTypeMap.has(x)) {
        const kv = AreaTypeMap.get(x);
        this[kv.key] = true;
      }
    });
  }
}

export interface AreaTypeOption {
  id: AreaTypeEnum | number;
  title: string;
}

/**
 * For all schemas
 */
export const AreaTypeAll = -1;

/**
 * used for generating titles for dynamicEntitiies
 * in different areas of the app
 */
export enum UiAreasEnum {
  caseKanbanTitle = 0,
  caseQuickInfo,
  caseDetailTitle,
  processStepTitle,
  caseVisualTitle,
  visualUnitDynamicTitle
}

const uiAreasOptions: { [key: number]: IKeyValueView<string, UiAreasEnum> } = {
  0: {
    value: UiAreasEnum.caseKanbanTitle,
    key: 'caseKanbanTitle',
    viewValue: 'Title for Cases in Card View'
  },
  1: {
    value: UiAreasEnum.caseQuickInfo,
    key: 'caseQuickInfo',
    viewValue: 'Case Title in RawData Show Info and Add To Case'
  },
  2: {
    value: UiAreasEnum.caseDetailTitle,
    key: 'caseDetailTitle',
    viewValue: 'Case Title in Case Details And Create Dialogue'
  },
  3: {
    value: UiAreasEnum.processStepTitle,
    key: 'processStepTitle',
    viewValue: 'Process Step Title in Case Details'
  },
  4: {
    value: UiAreasEnum.caseVisualTitle,
    key: 'caseVisualTitle',
    viewValue: 'Case Title in Visual View'
  }
};

export const AreaTypesWithUiAreas = [AreaTypeEnum.case, AreaTypeEnum.stepForm];

export const AreaTypeToUIAreaMapper: {
  has: (type: AreaTypeEnum) => boolean;
  get: (type: AreaTypeEnum) => IKeyValueView<string, UiAreasEnum>[];
} = (() => {
  const map = new Map<AreaTypeEnum, UiAreasEnum[]>();
  const hasUiAreas = (type: AreaTypeEnum) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getUiAreas = (type: AreaTypeEnum) => {
    if (!hasUiAreas(type)) {
      return [];
    }

    return [
      ...map.get(type).map((valueType: UiAreasEnum) => {
        return uiAreasOptions[valueType];
      })
    ];
  };

  map.set(AreaTypeEnum.case, [
    UiAreasEnum.caseKanbanTitle,
    UiAreasEnum.caseVisualTitle,
    UiAreasEnum.caseQuickInfo,
    UiAreasEnum.caseDetailTitle
  ]);

  map.set(AreaTypeEnum.stepForm, [UiAreasEnum.processStepTitle]);

  return {
    get: getUiAreas,
    has: hasUiAreas
  };
})();
