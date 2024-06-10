export interface FieldSettingUI {
  name: string;
  nameUI: string;
  fieldId: string;
  setting: FieldSettingValues;
}

export interface FieldSettingValues {
  details: boolean;
  overview: boolean;
}

export interface IFieldSettingKeyView {
  key: keyof FieldSettingValues;
  viewValue: string;
}
export interface IFieldSettingKeys {
  details: IFieldSettingKeyView;
  overview: IFieldSettingKeyView;
}
export interface IFieldSettingDataRef<T> {
  fieldRef: T;
  settingRef: AdminFieldSetting;
}
export const FIELD_SETTING_VISIBILITY_KEYS: IFieldSettingKeys = {
  details: {
    key: 'details',
    viewValue: 'Case Details'
  },
  overview: {
    key: 'overview',
    viewValue: 'Case Overview'
  }
};

export interface AdminFieldSetting {
  fieldId: string;
  setting: FieldSettingValues;
  toched?: boolean;
}

var qwe = {
  tenantId: '11E9D08FB460EF3EA2F602004C4F4F50',
  settings: [
    {
      key: 'rawDataOnSingleCase',
      value: {
        rawDataOnSingleCase: true
      },
      isUnique: false
    },
    {
      key: 'tenantLogo',
      value: {
        documentId: '86cef8db-247e-494c-8cd9-c9786d3b9bda'
      },
      isUnique: false
    },
    {
      key: 'appProcessNameFormat',
      value: {
        firstPosition: 1,
        secondPosition: 2
      },
      isUnique: false
    },
    {
      key: 'processStepNameFormat',
      value: {
        key: 'processStepNameFormat',
        fields: [
          {
            index: 3,
            showFieldName: true,
            truncateSymbols: 23
          }
        ]
      },
      isUnique: false
    },
    {
      key: 'allowManualCreation',
      value: {
        rolePermissions: [
          {
            role: 1,
            permission: {
              add: true,
              edit: true,
              delete: true
            }
          },
          {
            role: 3,
            permission: {
              add: true,
              edit: true,
              delete: true
            }
          },
          {
            role: 4,
            permission: {
              add: true,
              edit: true,
              delete: true
            }
          }
        ]
      },
      isUnique: false
    },
    {
      key: 'applicationTheme',
      value: {
        colors: {
          green: false,
          blue: true,
          dark: false,
          danger: false,
          darkgreen: false
        }
      },
      isUnique: false
    },
    {
      key: 'extRefIdRequired',
      value: {
        rawDataOnSingleCase: true,
        extRefIdRequired: true
      },
      isUnique: false
    },
    {
      key: 'adminCaseFieldsVisibility',
      value: {
        adminCaseFieldsVisibility: [
          {
            fieldId: '8A3AB9188FD8B84BA965A0B13DC63FA8',
            setting: {
              details: true,
              overview: true
            }
          },
          {
            fieldId: 'FA365DF1F9106C4CB58FA27EA59D696D',
            setting: {
              details: true,
              overview: true
            }
          }
        ]
      },
      isUnique: false
    },
    {
      key: 'rawDataFieldsVisibility',
      value: {
        rawDataFieldsVisibility: [
          {
            fieldId: '8A3AB9188FD8B84BA965A0B13DC63FA8',
            setting: {
              details: true,
              overview: true
            }
          }
        ]
      },
      isUnique: false
    }
  ]
};
