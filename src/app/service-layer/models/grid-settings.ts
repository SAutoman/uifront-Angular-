/**
 * global
 */
import {
  ColumnReorderEvent,
  ColumnResizeArgs,
  ColumnVisibilityChangeEvent,
  PageChangeEvent,
  ScrollMode,
  DataStateChangeEvent,
  SortSettings,
  RowClassFn
} from '@progress/kendo-angular-grid';
import {
  State,
  DataResult,
  SortDescriptor,
  CompositeFilterDescriptor,
  GroupDescriptor,
  AggregateDescriptor
} from '@progress/kendo-data-query';
import { FieldTypeIds } from './FieldTypeIds';

/**
 * project
 */

/**
 * local
 */

export interface ColumnSettings {
  name?: string;
  type?: FieldTypeIds;
  field: string;
  title?: string;
  filter?: 'string' | 'numeric' | 'date' | 'boolean';
  format?: string;
  width?: number;
  _width?: number;
  filterable?: boolean;
  reorderable?: boolean;
  sortable?: boolean;
  orderIndex?: number;
  hidden?: boolean;
  isActionType?: boolean;
  columnMenu?: boolean;
  isHyperink?: boolean;
  isSystem?: boolean;
}

export interface CardColumnSettings {
  position?: number;
  id?: string;
  width?: string;
  visible?: boolean;
}

export const AllowedColumnSettings: string[] = [
  'name',
  'field',
  'title',
  'isActionType',
  '_width',
  'columnMenu',
  'reorderable',
  'filterable',
  'sortable',
  'hidden',
  'type',
  'orderIndex',
  'filter',
  'format',
  'isHyperlink',
  'isSystem'
];

export interface GridSettings {
  columnsConfig: ColumnSettings[];
  state?: State;
  gridData?: DataResult;
  groups?: GroupDescriptor[];
  aggregates?: AggregateDescriptor[];
}

export interface CardSettings {
  cardConfig: CardColumnSettings[];
  state?: State;
  cardData?: DataResult;
}

export interface GridSettingsBase {
  resizable: boolean;
  pageable: boolean;
  pageSize: number;
  skip: number;
  scrollable: ScrollMode;
  reorderable: boolean;
  sort: Array<SortDescriptor>;
  selectable: boolean;
  sortable: SortSettings;
  columnMenu: boolean;
  filter: CompositeFilterDescriptor;
  selectedKeys?: any[];
  kendoGridSelectBy?: string;
  rowClass?: RowClassFn;
}

export interface GridSettingsBaseEx {
  gridConfiguration: GridConfiguration;
  onColumnReorder(event: ColumnReorderEvent): void;
  onColumnResize(event: Array<ColumnResizeArgs>): void;
  onColumnVisibilityChange(event: ColumnVisibilityChangeEvent): void;
  onPageChange(event: PageChangeEvent): void;
  onDataStateChanged(event: DataStateChangeEvent): void;
  onSortChange(event: Array<SortDescriptor>): void;
}

export interface ColumnSettingsBase {
  field: string;
  title: string;
  width: number;
  hidden: boolean;
  filterable: boolean;
  filter: 'string' | 'numeric' | 'date' | 'boolean';
  isActionType: boolean;
  type?: FieldTypeIds;
}

export interface ColumnResizedEvent {
  columnName: string;
  newWidth: number;
  oldWidth: number;
}

export interface GridToolbarSettings {
  appSettingName: string;
  gridSettingsName: string;
  allowExports: boolean;
  allowSharing: boolean;
  toolbarHidden: boolean;
}

export interface GridConfiguration {
  girdSettingKeyName: string;
  gridSettings: GridSettingsBase;
  columnSettings: ColumnSettingsBase[];
  gridToolbarSettings: GridToolbarSettings;
  showDetails: boolean;
  showQuickSearch?: boolean;
  showSearchFilter?: boolean;
  enableMasterDetail?: boolean;
  hideGroupingAndAggregates?: boolean;
}

export interface CommonGridSettings {
  resizable: boolean;
  pageable: boolean;
  pageSize: number;
  skip: number;
}

export interface AllowedGridOperations {
  actionsColumn: boolean;
  menuColumn: boolean;
  exportActions: boolean;
  infoColumn: boolean;
  layoutActions: boolean;
  crudOperations: boolean;
  allowSharing: boolean;
  allowSearching: boolean;
  enableMasterDetail: boolean;
  enableGrouping: boolean;
}
