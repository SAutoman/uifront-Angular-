// import { GridDataResult, SelectableSettings } from '@progress/kendo-angular-grid';
// import { State, SortDescriptor } from '@progress/kendo-data-query';

// import { GridSettings, ColumnSettings, SettingsUI } from '@wfm/service-layer';
// import { AuthState } from '@wfm/store';
// import { IConfigurableListItem, IObjectMap } from '@wfm/common/models';
// import { FieldSettingUI } from '@wfm/tenant-admin/models';

// import { IPermission } from './i-permission';

// export interface IRawDataView {
//   loading: boolean;
//   rawDataColumns: IConfigurableListItem[];
//   tsRawDataOnSingleCase: boolean;
//   authState: AuthState;
//   tenantId: string;
//   tenantName: string;
//   isTenantAdmin: boolean;
//   hasSomeCheckFlag: boolean;
//   isCreateCaseButtonClicked: boolean;
//   isAddToCaseClicked: boolean;
//   selectedRowMap: Map<string, IObjectMap<any>>;
//   tenantSettings: SettingsUI[];
//   dateFormatDb: SettingsUI;
//   caseRawDataColumns: FieldSettingUI[];

//   kendo: {
//     gridData: GridDataResult;
//     state: State;
//     gridSettings: GridSettings;
//     selectedKeys: string[];
//     sort: SortDescriptor[];
//     /**
//      *  change only click by checkbox
//      */
//     selectableSettings: SelectableSettings;
//     appSettingName: string;
//     gridSettingsName: string;
//     allowExports: boolean;
//     allowSharing: boolean;
//     pageSize: (
//       | number
//       | {
//           text: string;
//           value: string;
//         }
//     )[];
//     columnsConfig?: ColumnSettings[];
//   };
//   permission: IPermission;
// }
