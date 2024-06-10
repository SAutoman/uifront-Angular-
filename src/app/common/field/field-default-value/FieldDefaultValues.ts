import { FieldTypeIds } from '@wfm/service-layer';

export interface DefaultValueOption {
  value: DefaultValueTypeEnum;
  key: string;
  label: string;
}

// ------------------- default value type options related

const defaultValueTypes: DefaultValueOption[] = [
  {
    value: 0,
    key: '',
    label: 'None'
  },
  {
    value: 1,
    key: 'staticValue',
    label: 'Static Value'
  },
  {
    value: 2,
    key: 'dynamicValue',
    label: 'Dynamic Value'
  },
  {
    value: 3,
    key: 'systemValue',
    label: 'System Value'
  },
  {
    value: 4,
    key: 'computeValue',
    label: 'Computed Value'
  }
];

export enum DefaultValueTypeEnum {
  none = 0,
  static,
  dynamic,
  system,
  computed
}

export const FieldTypeDefaultValueTypeMap: {
  has: (type: FieldTypeIds) => boolean;
  get: (type: FieldTypeIds) => DefaultValueOption[];
} = (() => {
  const map = new Map<FieldTypeIds, DefaultValueTypeEnum[]>();
  const hasDefaultValueTypes = (type: FieldTypeIds) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getDefaultValueTypes = (type: FieldTypeIds) => {
    if (!hasDefaultValueTypes(type)) {
      return [];
    }
    return [
      ...map.get(type).map((valueType: DefaultValueTypeEnum) => {
        return defaultValueTypes[valueType];
      })
    ];
  };
  map.set(FieldTypeIds.BoolField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static, DefaultValueTypeEnum.computed]);
  map.set(FieldTypeIds.IntField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static, DefaultValueTypeEnum.computed]);
  map.set(FieldTypeIds.DecimalField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static, DefaultValueTypeEnum.computed]);
  // string
  map.set(FieldTypeIds.StringField, [
    DefaultValueTypeEnum.none,
    DefaultValueTypeEnum.static,
    DefaultValueTypeEnum.dynamic,
    DefaultValueTypeEnum.system,
    DefaultValueTypeEnum.computed
  ]);
  map.set(FieldTypeIds.TextareaField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static, DefaultValueTypeEnum.computed]);

  // date
  map.set(FieldTypeIds.DateField, [
    DefaultValueTypeEnum.none,
    DefaultValueTypeEnum.static,
    DefaultValueTypeEnum.dynamic,
    DefaultValueTypeEnum.system,
    DefaultValueTypeEnum.computed
  ]);
  map.set(FieldTypeIds.TimeField, [
    DefaultValueTypeEnum.none,
    DefaultValueTypeEnum.static,
    DefaultValueTypeEnum.dynamic,
    DefaultValueTypeEnum.system,
    DefaultValueTypeEnum.computed
  ]);
  map.set(FieldTypeIds.DateTimeField, [
    DefaultValueTypeEnum.none,
    DefaultValueTypeEnum.static,
    DefaultValueTypeEnum.dynamic,
    DefaultValueTypeEnum.system,
    DefaultValueTypeEnum.computed
  ]);

  map.set(FieldTypeIds.FileField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static]);

  map.set(FieldTypeIds.ListField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static]);

  map.set(FieldTypeIds.MultiselectListField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static]);

  map.set(FieldTypeIds.RichTextField, [DefaultValueTypeEnum.none]);

  map.set(FieldTypeIds.YouTubeEmbedField, [DefaultValueTypeEnum.none, DefaultValueTypeEnum.static]);

  return {
    get: getDefaultValueTypes,
    has: hasDefaultValueTypes
  };
})();

// ------------------- current value related

const dynamicValueTypeOptions: { [key: number]: DefaultValueOption } = {
  1: {
    value: 1,
    key: 'currentUser',
    label: 'Current User'
  },
  2: {
    value: 2,
    key: 'currentDate',
    label: 'Current Date'
  },
  3: {
    value: 3,
    key: 'currentTime',
    label: 'Current Time'
  },
  4: {
    value: 4,
    key: 'currentDateTime',
    label: 'Current DateTime'
  }
};

export enum DynamicValueTypeEnum {
  currentUser = 1,
  currentDate,
  currentTime,
  currentDateTime
}

export const FieldTypeToDynamicValueTypeMap: {
  has: (type: FieldTypeIds) => boolean;
  get: (type: FieldTypeIds) => DefaultValueOption[];
} = (() => {
  const map = new Map<FieldTypeIds, DynamicValueTypeEnum[]>();
  const hasValueTypes = (type: FieldTypeIds) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getValueTypes = (type: FieldTypeIds) => {
    if (!hasValueTypes(type)) {
      return [];
    }
    return [
      ...map.get(type).map((valueType: DynamicValueTypeEnum) => {
        return dynamicValueTypeOptions[valueType];
      })
    ];
  };

  map.set(FieldTypeIds.StringField, [
    DynamicValueTypeEnum.currentDate,
    DynamicValueTypeEnum.currentDateTime,
    DynamicValueTypeEnum.currentTime,
    DynamicValueTypeEnum.currentUser
  ]);

  // date
  map.set(FieldTypeIds.DateField, [DynamicValueTypeEnum.currentDate]);

  map.set(FieldTypeIds.TimeField, [DynamicValueTypeEnum.currentTime]);

  map.set(FieldTypeIds.DateTimeField, [DynamicValueTypeEnum.currentDateTime]);

  return {
    get: getValueTypes,
    has: hasValueTypes
  };
})();

// ------------------- system value related

export interface SystemDefaultValueOption {
  value: SystemValueTypeEnum;
  key: string;
  label: string;
}

const systemValueTypeOptions: { [key: number]: SystemDefaultValueOption } = {
  1: {
    value: 1,
    key: 'currentUser',
    label: 'Current User'
  },
  2: {
    value: 2,
    key: 'currentDate',
    label: 'Current Date'
  },
  3: {
    value: 3,
    key: 'currentTime',
    label: 'Current Time'
  },
  4: {
    value: 4,
    key: 'currentDateTime',
    label: 'Current DateTime'
  },
  5: {
    value: 5,
    key: 'currentWorkflowStatus',
    label: 'Current Workflow Status'
  }
};

export enum SystemValueTypeEnum {
  currentUser = 1,
  currentDate,
  currentTime,
  currentDateTime,
  currentWorkflowStatus
}

export enum SystemEventTypes {
  Create = 1,
  Update,
  Both
}

export enum ComputedValueTriggerEventEnum {
  /**
   * populate frontend side,with every form change, like schema functions
   */
  Always = 1,
  /**
   *  populate once, onSubmit
   */
  OnSubmit = 2
}

export const FieldTypeToSystemValueTypeMap: {
  has: (type: FieldTypeIds) => boolean;
  get: (type: FieldTypeIds) => SystemDefaultValueOption[];
} = (() => {
  const map = new Map<FieldTypeIds, SystemValueTypeEnum[]>();
  const hasValueTypes = (type: FieldTypeIds) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getValueTypes = (type: FieldTypeIds) => {
    if (!hasValueTypes(type)) {
      return [];
    }
    return [
      ...map.get(type).map((valueType: SystemValueTypeEnum) => {
        return systemValueTypeOptions[valueType];
      })
    ];
  };

  map.set(FieldTypeIds.StringField, [SystemValueTypeEnum.currentUser]);

  // date
  map.set(FieldTypeIds.DateField, [SystemValueTypeEnum.currentDate]);

  map.set(FieldTypeIds.TimeField, [SystemValueTypeEnum.currentTime]);

  map.set(FieldTypeIds.DateTimeField, [SystemValueTypeEnum.currentDateTime]);

  return {
    get: getValueTypes,
    has: hasValueTypes
  };
})();
