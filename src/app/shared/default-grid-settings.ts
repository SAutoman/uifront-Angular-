/**
 * global
 */
import { SortDescriptor } from '@progress/kendo-data-query';
import { SortSettings } from '@progress/kendo-angular-grid';

/**
 * project
 */
import {
  GridConfiguration,
  GridSettingsBase,
  ColumnSettings,
  ColumnSettingsBase,
  GridToolbarSettings,
  appUsersGridSettings,
  usersGridSettings,
  SortDirectionValue,
  FieldTypeIds
} from '../service-layer';

/**
 * local
 */

export const defaultUsersGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 40,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 200,
      field: 'companyInfo',
      title: 'Company Info',
      isActionType: true,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 200,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase,
    {
      field: 'title',
      width: 150,
      title: 'Title',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'name',
      width: 180,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'lastName',
      width: 180,
      title: 'Last Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'role',
      width: 150,
      title: 'Role',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 220,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'phone',
      width: 150,
      title: 'Phone',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'country',
      width: 150,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'city',
      width: 150,
      title: 'City',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'address',
      width: 220,
      title: 'Address',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'companyName',
      width: 180,
      title: 'Company',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'department',
      width: 180,
      title: 'Department',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    allowExports: false,
    allowSharing: false,
    appSettingName: appUsersGridSettings,
    gridSettingsName: usersGridSettings,
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultFormsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 999,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 80,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultWorkflowsFormsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 999,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 70,
      title: 'Created At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      field: 'updatedAt',
      width: 70,
      title: 'Updated At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      width: 80,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultSchemasListGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    sortable: {
      allowUnsort: true,
      mode: 'single'
    },
    resizable: true,
    columnMenu: false
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 50,
      title: 'Type',
      field: 'areaType',
      isActionType: false,
      columnMenu: false,
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      field: 'name',
      width: 80,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 70,
      title: 'Created At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      field: 'updatedAt',
      width: 70,
      title: 'Updated At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      width: 80,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultEmailAuditGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'from',
      width: 80,
      title: 'From',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'to',
      width: 80,
      title: 'To',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    // {
    //   field: 'content',
    //   width: 120,
    //   title: 'Content',
    //   type: FieldTypeIds.StringField
    // } as ColumnSettingsBase,
    {
      field: 'topicName',
      width: 60,
      title: 'Notification topic',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'cc',
      width: 60,
      title: 'Cc',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'corelationId',
      width: 60,
      title: 'Corelation Id',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'role',
      width: 60,
      title: 'User Role',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 60,
      title: 'Created At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showSearchFilter: true
} as GridConfiguration;

export const defaultOperationsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'id',
      width: 20,
      title: 'Id',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 80,
      title: 'CreatedAt',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      field: 'updatedAt',
      width: 80,
      title: 'UpdatedAt',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase,
    {
      field: 'targetId',
      width: 60,
      title: 'TargetId',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'status',
      width: 80,
      title: 'Status',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'actor',
      width: 20,
      title: 'Actor',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'errorMsg',
      width: 120,
      title: 'Error',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultCompanyGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 40,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'actions',
      width: 330,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase,
    {
      field: 'name',
      width: 220,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'vatNr',
      width: 120,
      title: 'Vat Number',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 280,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'country',
      width: 120,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'taxNumber',
      width: 130,
      title: 'Tax Number',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'city',
      width: 90,
      title: 'City',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'address',
      width: 180,
      title: 'Address',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'zip',
      width: 180,
      title: 'Zip',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'phone',
      width: 130,
      title: 'Phone',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'contactPersonName',
      width: 150,
      title: 'Contact Person',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'notes',
      width: 300,
      title: 'Notes',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultMappingsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'tenantName',
      width: 190,
      title: 'Tenant',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'schemaName',
      width: 240,
      title: 'Schema',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'companyName',
      width: 240,
      title: 'Company',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'filters',
      width: 190,
      title: 'Filters'
    } as ColumnSettingsBase,
    {
      width: 300,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultInvitationsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true,
    sortable: <SortSettings>{
      allowUnsort: true,
      mode: 'single'
    },
    sort: <SortDescriptor[]>[
      {
        field: '',
        dir: SortDirectionValue.asc
      }
    ]
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 260,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase,
    {
      field: 'senderName',
      width: 200,
      title: 'Sender',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'emailAddress',
      width: 220,
      title: 'Receiver',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'role',
      width: 170,
      title: 'Invited For Role',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'status',
      width: 170,
      title: 'Invitation Status',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'invitationLink',
      width: 280,
      title: 'Invitation Link',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 190,
      title: 'Sent At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showDetails: true,
  showQuickSearch: true,
  enableMasterDetail: true
} as GridConfiguration;

export const defaultRegisteredUsersGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Registered User',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 100,
      title: 'Email Address',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 100,
      title: 'Joined At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const tenantsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      field: 'actions',
      width: 30,
      title: 'Actions',
      isActionType: true
    } as ColumnSettingsBase,
    {
      field: 'name',
      width: 40,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'timeZone',
      width: 40,
      title: 'Timezone',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'id',
      width: 40,
      title: 'Tenant ID',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

// export const fieldsGridSettings: GridConfiguration = {
//   gridSettings: <GridSettingsBase>{
//     pageable: true,
//     resizable: true,
//     columnMenu: false
//   },
//   columnSettings: [
//     {
//       field: 'name',
//       width: 100,
//       title: 'Name'
//     } as ColumnSettingsBase,
//     {
//       field: 'type',
//       width: 100,
//       title: 'Type'
//     } as ColumnSettingsBase
//   ],
//   gridToolbarSettings: {
//     toolbarHidden: true
//   } as GridToolbarSettings
// } as GridConfiguration;

export const defaultUsersGroupUsersGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 1000,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 70,
      title: 'Company Info',
      isActionType: true,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'title',
      width: 40,
      title: 'Title',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'name',
      width: 40,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'lastName',
      width: 40,
      title: 'Last Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 40,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'country',
      width: 40,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'city',
      width: 40,
      title: 'City',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'role',
      width: 40,
      title: 'Role',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'phone',
      width: 40,
      title: 'Phone',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'address',
      width: 40,
      title: 'Address',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'department',
      width: 40,
      title: 'Department',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    allowExports: false,
    allowSharing: false,
    appSettingName: 'appUsersGroupGridSettings',
    gridSettingsName: 'appUsersGroupGridSettings',
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultCompanyInfoGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: false,
    pageSize: 0,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 40,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'companyName',
      width: 250,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 240,
      field: 'companyAddress',
      title: 'Address',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'companyEmail',
      width: 180,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'companyPhone',
      title: 'Phone',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'companyCity',
      title: 'City',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'companyCountry',
      width: 150,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 180,
      field: 'companyVatNr',
      title: 'Vat Nr',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 300,
      field: 'companyNotes',
      title: 'Notes',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      field: 'companyZip',
      title: 'Zip',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      field: 'companyTaxNumber',
      title: 'Tax Nr',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultNotificationTopicsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 100,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'description',
      width: 100,
      title: 'Description',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'notificationTopic',
      width: 100,
      title: 'Notification Topic',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'userRoles',
      width: 100,
      title: 'User Roles',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultNotificationTemplatesGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 40,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultWebHooksGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 40,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultUserGroupCreateDialogGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 100,
      title: 'Name',
      field: 'name',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      field: 'lastName',
      width: 100,
      title: 'Last Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      title: 'Email',
      field: 'email',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      field: 'country',
      width: 100,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      title: 'City',
      field: 'city',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      width: 100,
      title: 'Address',
      field: 'address',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      width: 100,
      title: 'Phone',
      field: 'phone',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      width: 100,
      title: 'Role',
      field: 'role',
      type: FieldTypeIds.StringField
    } as ColumnSettings,
    {
      width: 100,
      title: 'Department',
      field: 'department',
      type: FieldTypeIds.StringField
    } as ColumnSettings
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultDeactivateUsersGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 10,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'title',
      width: 30,
      title: 'Title',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'firstName',
      width: 50,
      title: 'First Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'lastName',
      width: 50,
      title: 'Last Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 80,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'roleName',
      width: 30,
      title: 'Role',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'company',
      width: 50,
      title: 'Company',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 40,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultUserGroupGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 40,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 80,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'type',
      width: 50,
      title: 'Type',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultConnectorsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 70,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'source',
      width: 100,
      title: 'Source',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'destination',
      width: 100,
      title: 'Destination',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'createdAt',
      width: 100,
      title: 'Created At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultOrchestratorsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 20,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 70,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 100,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,

    {
      field: 'createdAt',
      width: 100,
      title: 'Created At',
      type: FieldTypeIds.DateTimeField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  showQuickSearch: true
} as GridConfiguration;

export const defaultTenantCompanyGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: true,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 30,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      field: 'name',
      width: 250,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 240,
      field: 'address',
      title: 'Address',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 180,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'phone',
      title: 'Phone',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'city',
      title: 'City',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'country',
      width: 150,
      title: 'Country',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 180,
      field: 'vatNr',
      title: 'Vat Nr',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 300,
      field: 'notes',
      title: 'Notes',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      field: 'zip',
      title: 'Zip',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 100,
      field: 'taxNumber',
      title: 'Tax Nr',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  showQuickSearch: true,
  showDetails: true,
  enableMasterDetail: true,
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;

export const defaultTenantCompanyUsersGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: false,
    pageSize: 0,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 60,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 240,
      field: 'title',
      title: 'Title',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'name',
      width: 250,
      title: 'First Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'lastName',
      width: 250,
      title: 'Last Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'department',
      width: 250,
      title: 'Department',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'email',
      width: 180,
      title: 'Email',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'phone',
      title: 'Phone',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'city',
      title: 'City',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'country',
      title: 'Country',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      width: 150,
      field: 'tenantsName',
      title: 'Tenant(s)',
      isActionType: false,
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings,
  hideGroupingAndAggregates: true
} as GridConfiguration;

export const defaultApiClientsGridSettings: GridConfiguration = {
  gridSettings: <GridSettingsBase>{
    pageable: false,
    pageSize: 50,
    skip: 0,
    resizable: true,
    columnMenu: true
  },
  columnSettings: [
    {
      width: 10,
      title: '',
      isActionType: false,
      columnMenu: true
    } as ColumnSettings,
    {
      width: 40,
      title: 'Actions',
      isActionType: true,
      columnMenu: false
    } as ColumnSettings,
    {
      field: 'name',
      width: 50,
      title: 'Name',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase,
    {
      field: 'id',
      width: 50,
      title: 'ID',
      type: FieldTypeIds.StringField
    } as ColumnSettingsBase
  ],
  gridToolbarSettings: {
    toolbarHidden: true
  } as GridToolbarSettings
} as GridConfiguration;
