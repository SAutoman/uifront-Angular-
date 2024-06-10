/**
 * global
 */
import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Inject,
  Output,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  TemplateRef,
  Renderer2,
  OnDestroy,
  ChangeDetectionStrategy
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import {
  ColumnMenuChooserComponent,
  ColumnReorderEvent,
  ColumnResizeArgs,
  ColumnVisibilityChangeEvent,
  DataStateChangeEvent,
  DetailExpandEvent,
  GridComponent,
  GridDataResult,
  PageChangeEvent,
  RowArgs,
  RowClassArgs,
  SelectableSettings
} from '@progress/kendo-angular-grid';
import { cloneDeep, sortBy } from 'lodash-core';
import { aggregateBy, AggregateDescriptor, GroupDescriptor, SortDescriptor, AggregateResult, groupBy } from '@progress/kendo-data-query';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, NavigationExtras, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
/**
 * project
 */
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AggregationConfig,
  AggregationEnumBackend,
  AggregationType,
  AllowedGridOperations,
  APP_CLIENT_ID,
  AreaTypeEnum,
  BulkDeleteDynamicEnitiesDto,
  BulkDeleteWorkflowStatesCommand,
  ColumnSettings,
  DynamicEntitiesService,
  DynamicEntityDto,
  dynamicGridSettingsKey,
  FieldTypeIds,
  GridSettings,
  ManualCreationSettings,
  Paging,
  PermissionSettings,
  Roles,
  SchemaDto,
  SchemaFieldDto,
  SchemasService,
  Settings,
  SettingsUI,
  SidebarLinksService,
  SortDirection,
  SortDirectionValue,
  Sorting,
  SortingSettingEnum,
  sortingSettingsKey,
  StatePersistingService,
  TenantProfile,
  UpdateDynamicEntityDto,
  UpdateStateCase,
  UpdateStatusCommand,
  VirtualFieldValueDto,
  WorkflowDto,
  WorkflowStateService,
  WorkflowStatusDto
} from '@wfm/service-layer';
import {
  ApplicationState,
  AuthState,
  childGridsLayoutSelector,
  currentSelectedRoleNum,
  dateFormatSettingsSelector,
  getGridLayoutSelector,
  selectedSearchProfiles,
  loggedInState
} from '@wfm/store';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import {
  DynamicGridUiService,
  hyperLinkDataKey,
  QueryingArea,
  virtualFieldsSeparator
} from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { toApiSort } from '@wfm/shared/kendo-util';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { IConfigurableListItem, IObjectMap } from '@wfm/common/models';
import { RawDataInCaseInfoDialogComponent } from '@wfm/raw-data/raw-data-grid/raw-data-in-case-info-dialog/raw-data-in-case-info-dialog.component';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { BaseFieldValueType, ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { ValueMap } from '@wfm/workflow-state/workflow-state-case/workflow-state-case.component';
import { CustomDateFormatPipe } from '@wfm/pipes/custom-date-format.pipe';
import { panelIn, panelInBottom } from '@wfm/animations/animations';
import { FilePreviewOverlayRef } from '@wfm/common/vendor/formly-file/file-preview/file-preview-overlay-ref';
import { FilePreviewOverlayService } from '@wfm/common/vendor/formly-file/file-preview/file-preview-overlay.service';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { FormattingType } from '@wfm/service-layer/models/conditional-formatting';
import { RefreshWorkflowStatesList, ResetStatusUpdateMsg, statusUpdateMsgSelector, UpdateWorkflowStateStatus } from '@wfm/store/workflow';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { CaseActionsEnum } from '@wfm/workflow-state/workflow-states-grid/workflow-states-grid.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { RawdataLinkService } from '@wfm/service-layer/services/rawdata-link.service';
import { dataListRoute } from '@wfm/raw-data/raw-data.routing';
import { caseExpandGridRowKey } from '@wfm/tenants/cases-setting/cases-setting.component';

/**
 * local
 */
import { ActionEvent, GridAction } from './model/dynamic-entity-grid.model';
import { SharedService } from '../../service-layer/services/shared.service';
import { NotificationLogsComponent } from '../notification-logs/notification-logs.component';
import { AddAggregateComponent } from '../add-aggregate/add-aggregate.component';
import DateTimeFormatHelper from '../dateTimeFormatHelper';
import { CustomNumberFormatPipe } from '../../pipes/custom-number-format.pipe';
import { GridSystemFields, GridSystemFieldsEnum } from './dynamic-grid-system-fields';
import { LayoutTypeEnum } from '../grid-layout-options/grid-layout-options.component';
import { SearchEvent } from '../dynamic-entity-search-mask/dynamic-entity-search-mask.component';
import { DynamicGridRawDataRefComponent } from './dynamic-grid-raw-data-ref/dynamic-grid-raw-data-ref.component';
import { CaseGridAction, CaseGridActionData } from '../case-grid/case-grid.component';
import { convertTenantName, isUndefinedOrNull } from '../utils';
import { YoutubeVideoComponent } from '../youtube-video/youtube-video.component';

export interface DynamicEntitySystemFields {
  statusId: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface Row {
  [key: string]: any;
  publicId?: string;
  valueMap?: ValueMap;
  systemFields?: DynamicEntitySystemFields;
  _virtualFields?: VirtualFieldValueDto<BaseFieldValueType>[];
}

export interface GridColumnField extends SchemaFieldDto {
  propertyPath: string;
  isSystem?: boolean;
}

export interface ExternalGridColumn extends GridColumnField {
  parentConnectorField?: string;
  nonSortable?: boolean;
}

export interface NestedEntityData {
  fieldName: string;
  displayName: string;
  schemaId: string;
  areaType: AreaTypeEnum;
  items: string[];
  selectedRows: Row[];
  actions: GridAction[];
  parentPublicId: string;
  permission?: any;
  expandableSubGridPaths?: Array<string[]>;
}

export enum GridCellTypeEnum {
  BASE = '',
  FILE = 'FILE',
  HYPERLINK = 'HYPERLINK',
  DATE = 'DATE',
  DATETIME = 'DATETIME',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  RAWDATA_INFO = 'RAWDATA_INFO',
  STATUS = 'STATUS',
  NOTIFICATIONS = 'NOTIFICATIONS',
  RAWDATA_ACTIONS = 'RAWDATA_ACTIONS',
  ACTIONS = 'ACTIONS',
  RICH_TEXT = 'RICH_TEXT',
  CASE_RAWDATA_INFO = 'CASE_RAWDATA_INFO',
  SIGNATURE = 'SIGNATURE',
  YT_EMBED = 'YT_EMBED'
}

export const showDetailsKey = 'showDetails';
export const deleteRawDataKey = 'deleteRawData';
export const editRawDataKey = 'editRawData';

export interface GridDataWithAggregation extends GridDataResult {
  aggregationResult?: AggregateResult;
}

@Component({
  selector: 'app-dynamic-entity-grid',
  templateUrl: './dynamic-entity-grid.component.html',
  styleUrls: ['./dynamic-entity-grid.component.scss'],
  // added for performance optimization
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DynamicGridUiService],
  animations: [panelIn, panelInBottom]
})
export class DynamicEntityGridComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('grid') grid: GridComponent;
  @ViewChild('addDataTmpl') addDataTmpl: TemplateRef<any>;
  @ViewChild('quickSearchInput') quickSearchInput: ElementRef;
  @ViewChild('viewDynamicEntityTmpl') viewDynamicEntityTmpl: TemplateRef<any>;

  /**
   *  true only when rendering the raw data area grid
   */
  @Input() isRawDataMainGrid: boolean;
  @Input() schemaId: string;
  @Input() showAll: boolean = false;
  @Input() dynamicEntityIds: string[] = [];
  @Input() loading: boolean = true;
  @Input() actions: GridAction[] = [];
  @Input() areaType: AreaTypeEnum;
  @Input() pageable: boolean = true;
  @Input() useLayout: boolean = true;
  @Input() isPaginationOptional: boolean = false;
  @Input() showToolButtons: boolean;
  @Input() allowedGridOperations: AllowedGridOperations = {
    // default settings for grid operations
    actionsColumn: true,
    menuColumn: false,
    exportActions: true,
    infoColumn: false,
    layoutActions: true,
    crudOperations: false,
    allowSharing: true,
    allowSearching: false,
    enableMasterDetail: false,
    enableGrouping: true
  };
  @Input() workflow: WorkflowDto;
  @Input() reloadDataSubject: BehaviorSubject<{ isReload: boolean }>;
  @Input() fileName: string;
  @Input() showCreateCaseButton: boolean;
  @Input() showStatusChange: boolean;
  @Input() isPreviewModule?: boolean;
  @Input() workflowStateId?: string;
  @Input() parentSchemaId?: string;
  @Input() showInfoBtnInSubGrid?: boolean;

  @Output() actionEvent: EventEmitter<ActionEvent> = new EventEmitter();
  @Output() loaded: EventEmitter<boolean> = new EventEmitter();
  @Output() openCaseCreateDialogue: EventEmitter<string> = new EventEmitter<string>();
  @Output() onRawDataUpdate: EventEmitter<string> = new EventEmitter();
  /**
   * initializes the searchMask component
   */
  isSearchActive: boolean = false;
  /**
   * shows/hides the searchMask component (it still is doing it's job when hidden)
   */
  isSearchBarOpen: boolean = false;
  gridData: GridDataWithAggregation;
  staticGridData: GridDataWithAggregation;
  pageSize = [5, 10, 20, 50, 150, 500, 1000, { text: 'all', value: 'all' }];
  schema: SchemaDto;
  gridColumnFields: Array<GridColumnField | ExternalGridColumn>;
  schemaOwnFields: GridColumnField[];
  /**
   * schema.fields + schema.virtualFields
   */
  schemaAllFields: Array<GridColumnField | ExternalGridColumn>;
  gridSettings: GridSettings;
  storedSettingIsApplied: boolean = false;
  filters: SearchFieldModel[];
  uiSorting: SortDescriptor[] = [];
  // in api sorting propertyName includes propertyPath
  apiSorting: SortDescriptor[] = [];
  gridSettingsName: string = dynamicGridSettingsKey;

  selectedMenu: string;
  qsTerm: string = '';
  defaultWidth: number = 190;
  componentId = '1b26dae9-46c2-4477-ad6d-ed09590bb859';
  authState: AuthState;
  rolesPerTenant: TenantProfile[] = [];
  row: Row;
  isAnyChecked: boolean = false;
  selectedItemsMap: Map<string, IObjectMap<any>> = new Map();
  selectedGridItems: Row[] = [];
  rows: DynamicEntityDto[] = [];
  /**
   * stores the grid's native selection
   */
  public mySelection: string[] = [];
  /**
   * used by caseCreatorWrapper
   */
  selectedItemsSubject$: BehaviorSubject<Row[]> = new BehaviorSubject([]);

  schemaPermissions: PermissionSettings;
  allowManualCreationDb: ManualCreationSettings;
  permission = {
    create: false,
    edit: false,
    delete: false,
    hideGridSelection: false,
    allowLayoutChange: false,
    allowGridStatusChange: false,
    disabledCaseStatuses: [],
    loadSearchAutomatically: null
  };
  tenantName: string;
  selectableSettings: SelectableSettings = {
    checkboxOnly: true, // change only click by checkbox
    mode: 'multiple'
  };
  modalConfig = { width: '500px', maxHeight: '95vh', maxWidth: '95vw', panelClass: [] };
  isEdit: boolean;
  isCreate: boolean = false;
  isDeskTop: boolean = true;
  tenantSettings: SettingsUI[];
  // non resolved issues with virtual columns blocks us from using the feature
  // it is not working ok with our column reordering and layout applying
  // https://github.com/telerik/kendo-angular/issues/3242
  isVirtualColumnsEnabled = false;
  virtualColumnEnableThreshold = 30;
  statusField: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.StringField,
    displayName: 'Status',
    fieldName: GridSystemFieldsEnum.STATUS,
    propertyPath: GridSystemFieldsEnum.STATUS
  };

  createdAt: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.DateTimeField,
    displayName: 'Created At',
    fieldName: GridSystemFieldsEnum.CREATED_AT,
    propertyPath: GridSystemFieldsEnum.CREATED_AT,
    isSystem: true
  };

  updatedAt: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.DateTimeField,
    displayName: 'Updated At',
    fieldName: GridSystemFieldsEnum.UPDATED_AT,
    propertyPath: GridSystemFieldsEnum.UPDATED_AT,
    isSystem: true
  };

  suppliersField: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.StringField,
    displayName: 'Suppliers',
    fieldName: GridSystemFieldsEnum.SUPPLIERS,
    propertyPath: GridSystemFieldsEnum.SUPPLIERS,
    isSystem: true
  };

  auditorsField: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.StringField,
    displayName: 'Auditors',
    fieldName: GridSystemFieldsEnum.AUDITORS,
    propertyPath: GridSystemFieldsEnum.AUDITORS,
    isSystem: true
  };
  emailsCount: GridColumnField = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.IntField,
    displayName: 'Notifications Info',
    fieldName: GridSystemFieldsEnum.EMAIL_COUNT,
    propertyPath: GridSystemFieldsEnum.EMAIL_COUNT,
    isSystem: true
  };
  selectAllListener: () => void;
  sortArr: { propertyName: string; sort: SortDirection }[];
  bottomBarOpened: boolean;
  dateFormat: string;
  gridSettingsForCaseGrid: ColumnSettings[];
  allowCaseDelete: boolean;

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  get tenantId(): string {
    return this.tenant;
  }

  get fieldTypes() {
    return FieldTypeIds;
  }

  get systemFieldsEnum() {
    return GridSystemFieldsEnum;
  }

  get layoutTypeEnum() {
    return LayoutTypeEnum;
  }
  get gridCellTypeEnum() {
    return GridCellTypeEnum;
  }

  gridChanges$ = new BehaviorSubject<string>('');
  firstLoadIsRun: boolean = false;
  userRole: Roles;
  actionsColumnWidth: number = 140;

  isInfoMinWidth = false;
  isActionsMinWidth = false;

  querySubs: Subscription;
  queryParams: Params;
  showCreateCasePanel: boolean = false;
  wfStateStatuses: WorkflowStatusDto[];

  searchBarOpenSubject$ = new BehaviorSubject(false);
  public aggregates: AggregateDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public total: AggregateResult;
  public userDateFormat: string;
  public userDateTimeFormat: string;
  fastCreateEnabled: boolean = true;
  barcodeScanningEnabled: boolean = true;
  // props for child grid (Master/Detail feature)
  @Input() isChildDetailGrid: boolean;
  @Input() nestedEntitySchemaPermission?: PermissionSettings;
  @Input() nestedEntityData: NestedEntityData;
  @Input() parentAreaType: AreaTypeEnum;
  @Input() allowAddAndEditActionInChildGrid?: boolean;
  @Output() emitSelectionToParentGrid: EventEmitter<{ selectedRows: Row[] }> = new EventEmitter();
  detailGridOperations: AllowedGridOperations = {
    actionsColumn: true,
    menuColumn: true,
    //if need to add rawData id-s in ListOfLinks field
    // menuColumn: true,
    exportActions: false,
    infoColumn: false,
    layoutActions: false,
    crudOperations: true,
    allowSharing: true,
    allowSearching: false,
    enableMasterDetail: true,
    enableGrouping: false
  };

  detailSchemaFields$ = new Observable<IConfigurableListItem[]>();
  detailSchema: SchemaDto;
  detailSystemFields: DynamicEntitySystemFields;
  pagerButtonCount: number = 10;

  expandedDetailKeys: string[] = [];
  previewModuleItemsForDeletion: string[];
  isHideCaseGrid = true;
  shouldExpandRowOnCaseProcess: boolean = false;
  isChildGridExpanded = true;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    private adminSchemaService: AdminSchemasService,
    private persistingService: StatePersistingService,
    private dynamicGridUiService: DynamicGridUiService,
    private cd: ChangeDetectorRef,
    private dynamicEntitiesService: DynamicEntitiesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sharedService: SharedService,
    private previewDialog: FilePreviewOverlayService,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private customDatePipe: CustomDateFormatPipe,
    private customNumberPipe: CustomNumberFormatPipe,
    private ts: TranslateService,
    private renderer: Renderer2,
    private workflowStateService: WorkflowStateService,
    private rawdataLinkService: RawdataLinkService,
    private schemasService: SchemasService,
    private errorHandlerService: ErrorHandlerService,
    private sideBarLinkService: SidebarLinksService
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
  }

  get hyperLinkData() {
    return hyperLinkDataKey;
  }

  async ngOnInit(): Promise<void> {
    try {
      this.populateDateFormats();
      this.getRole();
      this.store.pipe(takeUntil(this.destroyed$), select(selectedSearchProfiles)).subscribe((selectedProfiles) => {
        if (
          selectedProfiles &&
          ((selectedProfiles.rawData && this.areaType === AreaTypeEnum.rawData) ||
            (selectedProfiles.case && this.areaType === AreaTypeEnum.case))
        ) {
          this.isSearchActive = true;
          this.cd.detectChanges();
        }
        // else {
        //   this.isSearchActive = false;
        // }
      });
      this.subscribeToDataReceipt();

      if (this.reloadDataSubject) {
        this.reloadDataSubject
          .asObservable()
          .pipe(
            filter((x) => x && x.isReload),
            takeUntil(this.destroyed$)
          )
          .subscribe(() => {
            this.loadData();
            this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: false }));
          });
      }

      if (!this.isChildDetailGrid)
        this.store.pipe(select(getGridLayoutSelector), takeUntil(this.destroyed$)).subscribe((gridSettings) => {
          // {gridSettings: null} case is handled separately: with resetGridHandler method
          if (gridSettings && this.gridColumnFields) {
            setTimeout(() => {
              this.applyGridSettings(cloneDeep(gridSettings));
              this.loadData(true);
            }, 200);
          }
        });

      if (this.isChildDetailGrid)
        this.store.pipe(select(childGridsLayoutSelector), takeUntil(this.destroyed$)).subscribe((childLayouts) => {
          const layout = childLayouts ? childLayouts[this.schemaId] : null;
          if (layout) {
            setTimeout(() => {
              this.applyGridSettings(cloneDeep(layout));
            }, 200);
          }
        });

      this.store.pipe(select(loggedInState), takeUntil(this.destroyed$)).subscribe(async (data) => {
        if (data) this.authState = data;
        if (data.currentTenantSystem && data.currentTenantSystem.tenantSettings && data.rolesPerTenant) {
          this.rolesPerTenant = data.rolesPerTenant;
          this.tenantSettings = data.currentTenantSystem.tenantSettings;
          if (!this.firstLoadIsRun) {
            this.firstLoadIsRun = true;
            await this.initGridColumnsAndActions();
            // WFM-3236 call loadData (with no filters) if there is no active searchProfile
            if (!this.isSearchActive) {
              this.loading = true;
              this.cd.detectChanges();
              if (!this.isChildDetailGrid) this.loadData();
            }
          }
        }
      });

      this.store.pipe(select(statusUpdateMsgSelector), takeUntil(this.destroyed$)).subscribe((msg) => {
        if (msg) {
          if (msg?.toLowerCase().includes('success')) {
            this.snackBar.open(this.ts.instant(msg), 'Ok', { duration: 3000 });
          } else this.snackBar.open(this.ts.instant(msg), 'Ok', { duration: 3000 });
          this.store.dispatch(new ResetStatusUpdateMsg());
        }
      });

      if (this.workflow) this.initializeExpandRowSetting();
    } catch (error) {
      console.log(error);
    }
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(dateFormatSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((s) => {
        const value = <Settings>s;
        this.dateFormat = DateTimeFormatHelper.getDateFormat(value);
        if (this.dateFormat === 'D') this.dateFormat = DateTimeFormatHelper.getDateFormatString();
      });
  }

  private initializeExpandRowSetting(): void {
    const expandGridRowSettingKey = `${caseExpandGridRowKey}_${this.workflow.id}`;
    this.shouldExpandRowOnCaseProcess =
      this.tenantSettings?.find((sett) => sett.key === expandGridRowSettingKey)?.value?.expandGridRow ?? false;
  }

  resetGridHandler(): void {
    this.applyGridSettings();
    this.loadData();
  }

  checkRouteParams(): void {
    if (!this.querySubs) {
      this.querySubs = this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((paramMap) => {
        this.queryParams = cloneDeep(paramMap);
        switch (this.queryParams['action']) {
          case 'create':
            this.openCreate();
            break;
          case 'update':
            this.queryParams['itemId'] ? this.openEdit(this.queryParams['itemId']) : null;
            break;
          default:
            break;
        }

        if (!this.isRawDataMainGrid && !this.queryParams['workflowStateId']) {
          this.gridData.data.forEach((x) => {
            x.isChecked = false;
            x.isActive = false;
            x.allowStatusChange = false;
          });
        } else if (this.queryParams['workflowStateId']) {
          this.gridData.data.forEach((item) => {
            if (this.queryParams['workflowStateId'] === item.publicId) {
              item['isActive'] = true;
              this.expandProcessedRow(item.publicId);
            } else {
              item['isActive'] = false;
            }
          });
          this.cd.detectChanges();
        }
      });
    }
  }

  setDefautlSortSetting(existingSortSetting: Settings): SortDescriptor {
    // if there is no saved settings, sort and show newest first
    let sort = existingSortSetting?.value?.sortSetting ? existingSortSetting.value.sortSetting : SortDirection.desc;
    return <SortDescriptor>{
      field: GridSystemFieldsEnum.CREATED_AT,
      dir: sort === SortDirection.asc ? SortDirectionValue.asc : SortDirectionValue.desc
    };
  }

  getRole(): void {
    this.store.pipe(select(currentSelectedRoleNum), takeUntil(this.destroyed$)).subscribe((roleNum) => {
      this.userRole = roleNum;
    });
  }

  async initGridColumnsAndActions() {
    if (this.schemaId && this.tenantSettings) {
      await this.getSchema();
      if (this.allowedGridOperations.crudOperations) {
        await this.setUpPermissions();
        if (this.schemaPermissions?.loadSearchAutomatically) this.checkForLastSavedSearchfields();
      }
      this.applyGridSettings();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes.schemaId && changes.schemaId.previousValue && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.expandedDetailKeys = [];
      this.showCreateCasePanel = false;
      this.gridData = null;
      this.loading = true;
      await this.initGridColumnsAndActions();
      await this.loadData();

      this.isAnyChecked = false;
      this.selectedGridItems = [];
      this.rows = [];
      this.cd.detectChanges();
    }

    if (changes.dynamicEntityIds) {
      if (this.isPreviewModule) {
        this.previewModuleItemsForDeletion = await this.getItemsAllowedForRemove(
          this.dynamicEntityIds,
          this.schemaId,
          this.workflowStateId
        );
      }
      await this.loadData();
    }

    if (changes.actions && changes.actions.currentValue) {
      this.setActionsColumnDefaultWidth();
    }
  }

  canDeleteReference(removeAction: GridAction, item: any): boolean {
    if (this.parentAreaType === AreaTypeEnum.case) {
      return removeAction?.actionAllowedOn?.includes(item.publicId) || false;
    } else {
      return this.nestedEntitySchemaPermission?.delete || false;
    }
  }

  /**
   * subscribe to get the upToDate list of dynamic entities to show in grid
   */
  subscribeToDataReceipt(): void {
    this.dynamicGridUiService
      .asObservable()
      .pipe(
        filter((x) => x !== null),
        tap((gridData) => {
          gridData?.data?.forEach((item) => {
            item['isChecked'] = false;
            item['isActive'] = false;
            if (this.isChildDetailGrid) {
              const removAction = this.actions.find((a) => a.actionId === deleteRawDataKey);
              item._allowedActions = {
                [showDetailsKey]: true,
                [deleteRawDataKey]: this.canDeleteReference(removAction, item)
              };
              if (this.parentAreaType === AreaTypeEnum.rawData) {
                item._allowedActions = {
                  ...item._allowedActions,
                  [editRawDataKey]: this.nestedEntitySchemaPermission
                    ? this.allowAddAndEditActionInChildGrid && this.nestedEntitySchemaPermission?.edit
                    : false
                };
              }
            }
            if (this.isPreviewModule) {
              item._allowedActions = {
                [showDetailsKey]: true,
                [deleteRawDataKey]: this.previewModuleItemsForDeletion?.includes(item.publicId)
              };
            }
          });
          this.staticGridData = cloneDeep(gridData);
          this.gridData = cloneDeep(gridData);
          let page: number = Number(this.pageSize[0]);
          this.pageable = this.isPaginationOptional ? this.gridData?.total > page : true;
          this.populateGroupsAndAggregates();
          /**
           * To check previously selected rows
           */
          if (this.rows.length) {
            const ids = this.rows.map((x) => x.id);
            this.onSelectedKeysChange(ids);
          }
          if (this.qsTerm) {
            this.quickSearch();
          }
          this.checkForActiveWorkflowState();
          setTimeout(() => {
            // give  time to grid viewChild to get rendered
            this.checkRouteParams();
          });
          this.loading = false;
          if (this.isRawDataMainGrid) {
            // populate RawData grid title
            if (gridData && gridData['schemaData']) {
              this.selectedMenu = gridData['schemaData'].name;
            }
          }

          if (!this.isChildDetailGrid && this.filters?.length) {
            this.checkForSubgridExpand();
          } else if (this.isChildDetailGrid && this.nestedEntityData && this.nestedEntityData.expandableSubGridPaths?.length) {
            this.gridData.data.forEach((dataItem) => {
              this.expandSubgridsBasedOnRefPaths(dataItem, this.nestedEntityData.expandableSubGridPaths);
            });
          } else {
            if (this.expandedDetailKeys?.length) {
              this.expandedDetailKeys.forEach((key) => {
                const dataItem = this.gridData.data?.find((x) => x.publicId === key);
                if (dataItem) {
                  this.onDetailExpand(true, null, dataItem);
                }
              });
            }
          }
          this.cd.detectChanges();
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  /**
   * if there is a filter on nested references,
   * expand those nested references for the first parent row
   * (to be done recursively, expand down till the level of references that were subject of filtering)
   */
  checkForSubgridExpand(): void {
    const refPathsForExpandableSubGrids = [];

    this.filters.forEach((searchField) => {
      if (searchField.propertyPath && searchField.propertyPath?.path?.length > 1) {
        const refPath = searchField.propertyPath.path.slice(0, -1);
        refPathsForExpandableSubGrids.push(cloneDeep(refPath));
      }
    });
    if (refPathsForExpandableSubGrids.length) {
      const dataItem = this.gridData.data[0];
      if (dataItem) {
        this.expandSubgridsBasedOnRefPaths(dataItem, refPathsForExpandableSubGrids);
      }
    }
  }

  expandSubgridsBasedOnRefPaths(dataItem, refPaths: Array<string[]>): void {
    this.expandedDetailKeys = [...this.expandedDetailKeys, dataItem.publicId];
    this.onDetailExpand(true, null, dataItem, refPaths);
  }

  expandDetailsBy = (dataItem: any): string => {
    return dataItem.publicId;
  };

  populateGroupsAndAggregates(): void {
    if (this.staticGridData) {
      const schemaFields = {};
      this.schema.fields.forEach((f) => {
        schemaFields[f.fieldName] = null;
      });

      const data = cloneDeep(this.staticGridData.data).map((item) => {
        return {
          ...schemaFields,
          ...item
        };
      });

      this.total = this.staticGridData.aggregationResult;
      this.gridData.data = groupBy(cloneDeep(data), this.groups);
      this.cd.detectChanges();
    }
  }

  async getSchema(): Promise<void> {
    try {
      if (this.schema && this.schema.id === this.schemaId) {
        return;
      }
      this.schema = await this.adminSchemaService.getSchema(this.tenant, this.areaType, this.schemaId);
      if (this.isChildDetailGrid) {
        const hasReferencedSchema = this.schema.fields.find((field) => {
          return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
        });
        if (!hasReferencedSchema) {
          this.detailGridOperations.enableMasterDetail = false;
        }
      }
      await this.setSchemaFields();
      this.checkForFastCreate();
    } catch (error) {
      console.log(error);
    }
  }

  checkForFastCreate(): void {
    this.fastCreateEnabled = false;
    if (this.schema.schemaConfiguration?.fastCreateSettings) {
      this.fastCreateEnabled = true;
    }
  }

  async setSchemaFields(): Promise<void> {
    let fields = [...this.schema.fields].map((field) => {
      return <GridColumnField>{
        ...field,
        propertyPath: `fields.${field.fieldName}`
      };
    });
    fields = this.hideExposedConnectorFields(fields);

    this.schemaOwnFields = sortBy(fields, [(field) => field.configuration?.position]);
    const virtualColumns = this.populateVirtualColumns();
    this.schemaAllFields = [...this.schemaOwnFields, ...virtualColumns];

    this.gridColumnFields = cloneDeep(this.schemaAllFields);
    this.addSystemFields();
    this.gridColumnFields = (await this.schemaPermissionsHelper.checkSchemaFieldsVisibility(
      this.schema,
      this.gridColumnFields
    )) as GridColumnField[];
  }

  /**
   * if there are virtual fields exposed from connector field, the connectorField itself to be hidden from grid,
   * it's redundant already
   */
  hideExposedConnectorFields(schemaFields: GridColumnField[]): GridColumnField[] {
    return schemaFields.filter((field) => {
      if (field.type === FieldTypeIds.ConnectorField && this.schema.virtualFields.find((f) => f.fieldName === field.fieldName)) {
        return false;
      }
      return true;
    });
  }

  populateVirtualColumns(): ExternalGridColumn[] {
    // put some flag to know where they come from and to differentiatie from native fields in case there is duplication in fieldNames
    const virtualFieldsMap = this.schema.virtualFields;
    if (virtualFieldsMap) {
      let virtualFields = [];

      virtualFieldsMap.forEach((item) => {
        const connectorFieldsExposed = item.fields?.sort((a, b) => a.configuration.position - b.configuration.position);
        connectorFieldsExposed.forEach((field) => {
          const virtualField = {
            ...field,
            fieldName: `${item.fieldName}${virtualFieldsSeparator}${field.fieldName}`,
            parentConnectorField: item.fieldName,
            propertyPath: `fields.${item.fieldName}.${field.fieldName}`,
            nonSortable: true
          };
          virtualFields.push(virtualField);
        });
      });
      return virtualFields;
    }
    return [];
  }

  async loadData(showPopup?: boolean): Promise<void> {
    try {
      this.loading = true;
      if (!this.schemaId) {
        return;
      }
      if (this.showAll) {
        await this.initAllData(showPopup);
      } else {
        await this.initDataByIds();
      }
    } catch (error) {
      this.loading = false;
      console.log(error);
    }
  }

  mapColumnField(field: GridColumnField): GridColumnField {
    field.publicId = field.id;
    field.id = field.fieldName;
    field.name = field.displayName;

    return field;
  }

  getBackendAggregationEnum(aggKey: AggregationType): AggregationEnumBackend {
    switch (aggKey) {
      case 'count':
        return AggregationEnumBackend.Count;
      case 'sum':
        return AggregationEnumBackend.Sum;
      case 'average':
        return AggregationEnumBackend.Avg;
      case 'min':
        return AggregationEnumBackend.Min;
      case 'max':
        return AggregationEnumBackend.Max;
      default:
        break;
    }
  }

  async initAllData(showPopup?: boolean): Promise<void> {
    let aggregationQuery = this.populateAggregationConfig();

    this.sortArr = this.getSortFields() || [];
    const paging: Paging = { skip: this.gridSettings?.state?.skip, take: this.gridSettings?.state?.take };
    await this.dynamicGridUiService.query(
      this.areaType,
      this.tenant,
      this.schemaId,
      paging,
      this.filters,
      this.sortArr,
      QueryingArea.DynamicEntityGrid,
      aggregationQuery
    );
    if (showPopup) {
      this.snackBar.open(this.ts.instant('Data Loaded!'), 'CLOSE', {
        duration: 3000
      });
    }
    this.loaded.next(true);
  }

  async initDataByIds(): Promise<void> {
    this.sortArr = this.getSortFields() || [];
    const paging: Paging = { skip: this.gridSettings?.state?.skip, take: this.gridSettings?.state?.take };
    await this.dynamicGridUiService.queryMany(
      this.areaType,
      this.tenant,
      this.schemaId,
      this.dynamicEntityIds,
      paging,
      this.filters,
      this.sortArr,
      QueryingArea.DynamicEntityGrid
    );
    this.loaded.next(true);
  }

  getSortFields(): Sorting[] {
    return this.apiSorting
      .filter((x) => !!x.field && !!x.dir)
      .map((x) => {
        return {
          propertyName: x.field,
          sort: toApiSort(x)
        };
      });
  }

  expandProcessedRow(publicId: string): void {
    if (this.shouldExpandRowOnCaseProcess && !this.expandedDetailKeys.includes(publicId)) {
      this.expandedDetailKeys = [...this.expandedDetailKeys, publicId];
      const dataItem = this.gridData.data?.find((x) => x.publicId === publicId);
      if (dataItem) {
        this.onDetailExpand(true, null, dataItem);
      }
    }
  }

  actionClicked(raw: Row, action: GridAction, event: MouseEvent): void {
    event.stopPropagation();
    // when Process button is clicked in WorkflowStates grid
    if (!this.isRawDataMainGrid && this.workflow && !this.isPreviewModule) {
      switch (action?.actionId) {
        case CaseActionsEnum.Process:
          this.expandProcessedRow(raw.publicId);
        case CaseActionsEnum.Edit:
          const qParams = {
            workflowStateId: raw.publicId,
            isEditCase: action?.actionId === 'edit' ? true : false
          };
          this.updateQueryParams(qParams, true);
          break;
        case CaseActionsEnum.CaseQuickView:
          action['raw'] = raw;
          this.quickViewDynamicEntity(action, this.schemaId, this.areaType);
          break;

        case CaseActionsEnum.CasePrintPreview:
        case CaseActionsEnum.Download:
          const cmd: ActionEvent = {
            actionId: action.actionId,
            raw: raw
          };
          this.actionEvent.next(cmd);
          break;

        default:
          break;
      }
    } else {
      const cmd: ActionEvent = {
        actionId: action.actionId,
        raw: raw
      };
      this.actionEvent.next(cmd);
    }
  }

  onPageChange(event: PageChangeEvent): void {
    this.gridSettings.state.skip = event.skip;
    this.loadData();
    this.saveGridSettingsLocally();
  }

  onSortChange(sortings: SortDescriptor[]): void {
    this.populateApiSortingDto(sortings);
    this.uiSorting = sortings;
    this.gridSettings.state.sort = this.uiSorting;
    this.saveGridSettingsLocally();
    this.loadData();
  }

  onReorder(data: ColumnReorderEvent): void {
    moveItemInArray(this.gridSettings.columnsConfig, data.oldIndex, data.newIndex);
    for (let i = 0; i < this.gridSettings.columnsConfig.length; i++) {
      const element = this.gridSettings.columnsConfig[i];
      element.orderIndex = i;
    }
    this.saveGridSettingsLocally();
  }

  onResize(data: ColumnResizeArgs[]): void {
    const resizeEvent = data[0];
    const affectedColumn = this.gridSettings.columnsConfig.find((col) => col.field === resizeEvent.column['field']);
    affectedColumn._width = resizeEvent.newWidth;
    this.saveGridSettingsLocally();
  }

  saveGridSettingsLocally(): void {
    this.setActionsColumnBreakdown(this.gridSettings.columnsConfig);
    const key = this.getSettingsKey();
    this.persistingService.set(`${key}`, this.gridSettings);
    this.gridChanges$.next(`${dynamicGridSettingsKey}_${Math.round(Math.random() * 100)}`);
    this.gridSettingsForCaseGrid = cloneDeep(this.gridSettings.columnsConfig);
  }

  onVisibilityChange(data: ColumnVisibilityChangeEvent): void {
    this.gridSettings.columnsConfig.forEach((colConfig) => {
      const changedCol = data.columns.find((c) => c['field'] === colConfig.field);
      if (changedCol) {
        colConfig.hidden = changedCol.hidden;
      }
    });
    this.saveGridSettingsLocally();
  }

  getSettingsKey(): string {
    // if (!this.isChildDetailGrid) {
    return `${dynamicGridSettingsKey}_${this.schemaId}_${this.areaType}`;
    // } else {
    // return `${dynamicGridSettingsKey}_${this.schemaId}_${this.areaType}_${this.parentSchemaId}`;
    // }
  }

  /**
   * first check if there is layout selected,
   * if no, check for gridSettings in localstorage,
   * if no, create the gridSettings from scratch
   * @param storeSettings
   */
  applyGridSettings(storeSettings?: GridSettings): void {
    this.storedSettingIsApplied = false;
    this.groups = [];
    this.aggregates = [];
    this.gridSettings = null;
    const key = this.getSettingsKey();
    const localSettings: string = this.persistingService.get(`${key}`);

    if (storeSettings) {
      this.gridSettings = this.dynamicGridUiService.mapGridSettings(storeSettings, this.gridColumnFields);
      this.storedSettingIsApplied = true;
      if (storeSettings?.groups?.length || storeSettings?.aggregates?.length) {
        this.setGroupsFromGridSettings(storeSettings);
      }
      // Remove EmailCount, Suppliers & Auditors columns for Role Supplier and Auditor from layout
      if (!this.isTenant()) {
        const restrictedFields = [this.emailsCount.fieldName, this.suppliersField.fieldName, this.auditorsField.fieldName];
        this.gridSettings.columnsConfig = this.gridSettings.columnsConfig.filter((x) => !restrictedFields.includes(x.field));
      }
    } else if (localSettings) {
      try {
        let jsonSettings = JSON.parse(localSettings);
        this.gridSettings = this.dynamicGridUiService.mapGridSettings(jsonSettings, this.gridColumnFields);
        this.storedSettingIsApplied = true;
        this.gridChanges$.next(`${dynamicGridSettingsKey}_${Math.round(Math.random() * 100)}`);
        if (jsonSettings?.groups?.length || jsonSettings?.aggregates?.length) {
          this.setGroupsFromGridSettings(jsonSettings);
        }
      } catch (error) {
        console.log('unable to parse settings from localstorage, using factory settings');
        this.gridSettings = this.initGridSettings();
      }
    } else {
      this.gridSettings = this.initGridSettings();
    }
    if (this.gridSettings) {
      this.gridSettings.columnsConfig = this.manageExtraColumns(this.gridSettings?.columnsConfig);
      if (this.gridSettings.state) {
        this.uiSorting = this.gridSettings.state.sort;
        this.populateApiSortingDto(this.gridSettings?.state?.sort || []);
      }
    }
    if (this.isRawDataMainGrid && !this.permission.edit && this.gridSettings?.columnsConfig?.length > 0) {
      this.gridSettings.columnsConfig = this.gridSettings.columnsConfig.filter(
        (x) => x.field?.toLowerCase() !== GridSystemFieldsEnum.ACTIONS
      );
    }
    // if (this.gridSettings.columnsConfig.length > this.virtualColumnEnableThreshold) {
    //   this.isVirtualColumnsEnabled = true;
    // } else {
    //   this.isVirtualColumnsEnabled = false;
    // }
    this.setActionsColumnBreakdown(this.gridSettings.columnsConfig);
    this.gridSettingsForCaseGrid = cloneDeep(this.gridSettings.columnsConfig);
    this.cd.detectChanges();
  }

  setGroupsFromGridSettings(data: GridSettings): void {
    this.groups = cloneDeep(data?.groups) || [];
    this.aggregates = cloneDeep(data?.aggregates ? data.aggregates : this.groups[0]?.aggregates ? this.groups[0]?.aggregates : []);
    this.populateGroupAggregates();
  }

  populateApiSortingDto(sortFields: SortDescriptor[]): void {
    this.apiSorting = [];
    if (sortFields?.length > 0) {
      sortFields.forEach((sort) => {
        const currentField = this.gridColumnFields.find((f) => sort.field === f.fieldName);
        if (currentField) {
          this.apiSorting.push({
            field: currentField.propertyPath,
            dir: sort.dir
          });
        }
      });
    }
  }

  /**
   * create grid settings based on the schema fields (add extra column if the respective allowedGridOperations property is true and the column is not)
   */

  initGridSettings(): GridSettings {
    if (!this.gridColumnFields) {
      return;
    }
    let columns: ColumnSettings[] = this.gridColumnFields
      .filter((field) => {
        return field.type !== FieldTypeIds.ListOfLinksField && field.type !== FieldTypeIds.EmbededField;
      })
      .map((item: GridColumnField | ExternalGridColumn) => {
        this.mapColumnField(item);

        return <ColumnSettings>{
          type: item.type,
          field: item.id,
          title: item.name,
          reorderable: true,
          _width: !this.isChildDetailGrid ? this.setDefaultWidth(item.id) : null,
          sortable: (<ExternalGridColumn>item).nonSortable ? false : true,
          isHyperlink: item.configuration?.isHyperlink,
          isSystem: item.isSystem,
          headerClass: item.parentConnectorField ? 'virtualColumn' : ''
        };
      });
    const existingSortSetting = this.authState.allUserSettings?.find((x) => x.key === sortingSettingsKey);
    let addSortSetting: boolean = true;
    if (!existingSortSetting) {
      addSortSetting = false;
    } else if (existingSortSetting && existingSortSetting?.value?.sortSetting === SortingSettingEnum.default) {
      addSortSetting = false;
    }
    return (this.gridSettings = {
      columnsConfig: columns,
      state: {
        sort: addSortSetting ? [this.setDefautlSortSetting(existingSortSetting)] : [],
        skip: 0,
        take: 50
      }
    });
  }

  canAddSorting(colVisibilityFlag: boolean, existingSortSetting: boolean): boolean {
    if (colVisibilityFlag && !existingSortSetting) return false;
    else return true;
  }

  /**
   * based on allowedGridOperations, add/remove the extra columns from the grid
   * (doing this because it happens that those columns are being added/removed in layouts or localStorage,
   *  because it is possible to create/update layout in different places in the app for the same schema,
   * and the extra columns differ from place to place in the app)
   */

  manageExtraColumns(originalColumns: ColumnSettings[]): ColumnSettings[] {
    if (!originalColumns) {
      return;
    }
    let columns = [...originalColumns];

    let additionalColumns = [];

    if (!this.allowedGridOperations.menuColumn) {
      // remove the checkbox column from columns
      columns = columns.filter((col) => col.title && col.title !== '');
    } else if (!columns.find((col) => !col.title || col.title === '')) {
      const columnItem = <ColumnSettings>{
        field: null,
        title: '',
        columnMenu: true,
        reorderable: true,
        sortable: false,
        _width: !this.isChildDetailGrid ? 80 : 80,
        isSystem: true
      };
      additionalColumns.push(columnItem);
    }

    if (!this.allowedGridOperations.infoColumn) {
      // remove the Info column from columns
      columns = columns.filter((col) => col.field !== GridSystemFieldsEnum.INFO);
    } else if (!columns.find((col) => col.field === GridSystemFieldsEnum.INFO)) {
      const columnItem = {
        field: GridSystemFieldsEnum.INFO,
        title: 'Info',
        reorderable: true,
        sortable: false,
        _width: 150,
        isSystem: true
      };
      additionalColumns.push(columnItem);
    }

    if (!this.allowedGridOperations.actionsColumn) {
      // remove the Actions column from columns
      columns = columns.filter((col) => col.field !== GridSystemFieldsEnum.ACTIONS);
    } else if (!columns.find((col) => col.field === GridSystemFieldsEnum.ACTIONS)) {
      const columnItem = {
        field: GridSystemFieldsEnum.ACTIONS,
        title: 'Actions',
        reorderable: true,
        sortable: false,
        _width: this.actionsColumnWidth,
        isSystem: true
      };
      additionalColumns.push(columnItem);
    }
    columns.unshift(...additionalColumns);
    return columns;
  }

  quickSearch(): void {
    const filteredData = this.dynamicGridUiService.quickSearch(this.qsTerm, cloneDeep(this.staticGridData?.data));
    this.gridData.data = filteredData;
  }

  isRowSelected = (e: RowArgs) => {
    return e.dataItem?.isChecked;
  };

  onSearch(event: SearchEvent): void {
    this.filters = event.filters;
    this.gridSettings.state.skip = 0;
    if (event.refreshData) {
      this.loadData(true);
    }
  }

  async onSelectedKeysChange(selectedRowIds: string[]): Promise<void> {
    let selectedRows = [];
    this.selectedItemsMap = new Map();
    if (!this.groups.length) {
      this.gridData.data.forEach((data: Row) => {
        data.isChecked = false;
        if (selectedRowIds.indexOf(data.publicId) >= 0) {
          selectedRows.push(data);
          this.selectedItemsMap.set(data.publicId, data);
          data.isChecked = true;
        }
      });
    } else {
      this.checkSelectedRows(selectedRowIds, selectedRows, this.gridData.data);
    }

    // To remove unchecked rows
    this.rows = this.rows.filter((row) => selectedRowIds.includes(row.id));
    this.selectedGridItems = this.selectedGridItems.filter((item) => selectedRowIds.includes(item.publicId));
    this.selectedGridItems?.forEach((item) => {
      // in the MAP add  selected grid items from other pages

      this.selectedItemsMap.set(item.publicId, item);
    });

    // now selectedItemsMap has the full data (previous page selection + current page selection)
    // reassign selectedGridItems to include it all

    this.selectedGridItems = Array.from(this.selectedItemsMap.values());

    this.isAnyChecked = !!this.selectedGridItems.length;
    this.isHideCaseGrid = !this.isAnyChecked;

    const dy = this.dynamicGridUiService.dynamicEntities;
    for (const row of this.selectedGridItems) {
      const id = row.publicId;
      if (!this.rows.find((x) => x.id === id)) {
        for (const entity of dy) {
          if (entity.id === id) {
            // entity.statusId = <any>CaseStatus.Open;
            this.rows.push(entity);
            break;
          }
        }
      }
    }
    if (!this.selectedGridItems.length) {
      this.showCreateCasePanel = false;
      this.selectedItemsSubject$.next([]);
    } else if (this.isRawDataMainGrid) {
      this.selectedItemsSubject$.next([...this.rows]);
    }
    if (this.isChildDetailGrid) {
      this.emitSelectionToParentGrid.next({
        selectedRows: this.selectedGridItems
      });
    }

    this.mySelection = this.selectedGridItems.map((row) => row.publicId);
    this.checkForStatusPermission();
    this.cd.detectChanges();
  }

  checkSelectedRows(selectedRowIds: string[], rows: Row[], gridData: Row[]): void {
    gridData.forEach((data: Row) => {
      data.items.forEach((item) => {
        item.isChecked = false;
        if (selectedRowIds.indexOf(item.publicId) >= 0) {
          rows.push(item);
          this.selectedItemsMap.set(item.publicId, item);
          item.isChecked = true;
        } else if (item?.items?.length) {
          this.checkSelectedRows(selectedRowIds, rows, [item]);
        }
      });
    });
  }

  // Use this when allowedGridOperations.crudOperations is 'true'
  async setUpPermissions(): Promise<void> {
    this.schemaPermissions = await this.getSchemaPermissions(this.schemaId, this.areaType);
    this.setPermissions();
  }

  async getSchemaPermissions(schemaId: string, areaType: AreaTypeEnum): Promise<PermissionSettings> {
    return await this.schemaPermissionsHelper.getSchemaPermissions(schemaId, areaType, this.tenant);
  }

  setPermissions(): void {
    this.permission = {
      create: this.schemaPermissions.add,
      edit: this.schemaPermissions.edit,
      delete: this.schemaPermissions.delete,
      hideGridSelection: this.schemaPermissions?.hideGridSelection,
      allowLayoutChange: this.schemaPermissions?.enableLayoutAndGridOptions,
      allowGridStatusChange: this.schemaPermissions?.allowGridStatusChange,
      disabledCaseStatuses: this.schemaPermissions?.statusesWithDisabledDelete || [],
      loadSearchAutomatically: this.schemaPermissions?.loadSearchAutomatically
    };
  }

  addSystemFields(): void {
    let systemDateFields = [this.createdAt, this.updatedAt];
    if (this.areaType === AreaTypeEnum.rawData || this.areaType === AreaTypeEnum.case) {
      this.gridColumnFields.unshift(this.statusField);
    }
    this.gridColumnFields.push(...systemDateFields);
    if (this.isTenant()) {
      this.gridColumnFields.push(this.suppliersField);
      this.gridColumnFields.push(this.auditorsField);
      this.gridColumnFields.unshift(this.emailsCount);
    }
  }

  onRawDataInfoClicked(rawData: Row): void {
    const dialogRef = this.dialog.open(RawDataInCaseInfoDialogComponent, {
      width: '500px'
    });
    dialogRef.componentInstance.rawData = rawData;
    dialogRef.componentInstance.tenantId = this.tenantId;
    dialogRef.componentInstance.rawDataSchemaId = this.schemaId;
  }

  removeFromSelected(removedItem: Row): void {
    let filteredItems = this.selectedGridItems.filter((item) => {
      return item.publicId !== removedItem.publicId;
    });
    let rowIds = filteredItems.map((item) => item.publicId);
    this.onSelectedKeysChange(rowIds);
  }

  closePanel(): void {
    if (!this.groups.length) {
      this.gridData.data.forEach((data: Row) => {
        data.isChecked = false;
      });
    } else {
      this.uncheckSelectedRows(this.gridData.data);
    }
    this.selectedGridItems = [];
    this.mySelection = [];
    this.rows = [];
    this.selectedItemsMap.clear();
    this.showCreateCasePanel = false;
    this.isAnyChecked = false;
    this.isHideCaseGrid = true;
  }

  uncheckSelectedRows(gridData: Row[]): void {
    gridData.forEach((data: Row) => {
      data.items.forEach((item) => {
        item.isChecked = false;
        if (item?.items?.length) {
          this.uncheckSelectedRows([item]);
        }
      });
    });
  }

  //File Preview
  showPreview(file: string, name: string) {
    const data = {
      url: file
    };
    let dialogRef: FilePreviewOverlayRef = this.previewDialog.open({
      file: data
    });
  }

  onDynamicEntityDeleteButtonClicked(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        let entities = Array.from(this.selectedItemsMap.values());

        let bulkDeleteDto = <BulkDeleteDynamicEnitiesDto>{
          ids: entities.map((x) => x.publicId),
          areaType: AreaTypeEnum.rawData,
          schemaId: this.schemaId,
          tenantId: this.tenantId
        };
        try {
          await this.dynamicEntitiesService.bulkDelete(bulkDeleteDto);
        } catch (error) {
          this.errorHandlerService.getAndShowErrorMsg(error);
        }
        await this.loadData();
        this.snackBar.open(this.ts.instant('Data Deleted Successfully'), 'CLOSE', { duration: 2000 });
        this.isAnyChecked = false;
        this.selectedItemsMap = new Map();
        this.selectedGridItems = [];
        this.cd.detectChanges();
      }
    });
  }

  onDynamicEntityUpdateClicked(itemId: string, event: MouseEvent): void {
    event.stopPropagation();
    const qParams = {
      action: 'update',
      itemId: itemId
    };
    this.updateQueryParams(qParams, true);
  }

  onWorkflowStateDeleteButtonClicked(): void {
    if (!this.allowCaseDelete) {
      let name: string[] = [];
      this.permission.disabledCaseStatuses.forEach((status) => {
        const data = this.workflow.statuses.find((x) => x?.id === status);
        if (data) name.push(data.name);
      });
      this.snackBar.open(
        `${this.ts.instant('Case(s) with status')} "${name.join(',')}" ${this.ts.instant('are restricted to be deleted by permission')}`,
        'Ok',
        {
          duration: 3000
        }
      );
      return;
    }
    let entities = Array.from(this.selectedItemsMap.values());
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          const cmd: BulkDeleteWorkflowStatesCommand = {
            schemaId: this.workflow.id,
            tenant: this.tenant,
            workflowStateIds: entities.map((item) => item.publicId)
          };
          await this.workflowStateService.bulkDelete(cmd);

          this.store.dispatch(new RefreshWorkflowStatesList({ isRefresh: false }));

          await this.loadData();
          this.snackBar.open(this.ts.instant('Data Deleted Successfully'), 'CLOSE', { duration: 2000 });
          this.isAnyChecked = false;
          this.selectedItemsMap = new Map();
          this.selectedGridItems = [];
          // close active case in sidepanel, in case it has been removed

          const removeQParams = { workflowStateId: null, isEditCase: null };
          this.updateQueryParams(removeQParams, true);
          this.cd.detectChanges();
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  openEdit(itemId) {
    const deItem = this.dynamicGridUiService.dynamicEntities?.find((f) => f.id === itemId);
    if (deItem) {
      this.row = this.getDeFieldKeyValuePairs(deItem);
      if (this.row) {
        this.isEdit = true;
        const dialogRef = this.dialog.open(this.addDataTmpl, { ...this.modalConfig, disableClose: true });
        dialogRef.afterClosed().subscribe(() => {
          const removeQueryParams = {
            action: null,
            itemId: null
          };
          this.row = null;
          this.updateQueryParams(removeQueryParams, true);
          this.loadData();
        });
      }
    }
  }

  onDynamicEntityAddClicked(): void {
    this.updateQueryParams({ action: 'create' }, true);
  }

  openCreate(): void {
    const dialogExist = this.dialog.getDialogById('dyDialog');
    if (!dialogExist) {
      this.isEdit = false;
      const dialogRef = this.dialog.open(this.addDataTmpl, {
        id: 'dyDialog',
        ...this.modalConfig,
        disableClose: true,
        panelClass: ['create-article-rawdata']
      });
      dialogRef.afterClosed().subscribe(() => {
        const qParamsToRemove = {
          action: null
        };
        this.updateQueryParams(qParamsToRemove, true);
        this.loadData();
      });
    }
  }

  getDeFieldKeyValuePairs(de: DynamicEntityDto): Row {
    let row: Row = {
      publicId: de.id
    };
    de.fields.forEach((field) => {
      row[field.id] = field.value;
    });
    row.valueMap = this.getDynamicEntityMap(de.fields);
    row.systemFields = {
      statusId: de.statusId,
      createdAt: de.createdAt,
      updatedAt: de.updatedAt
    };
    row._virtualFields = de.virtualFields;
    return row;
  }

  private getDynamicEntityMap(dynamicEntityFields: BaseFieldValueType[]): ValueMap {
    let fieldMap = {};
    dynamicEntityFields.forEach((field: BaseFieldValueType) => {
      if (field) {
        if (field.type !== FieldTypeIds.EmbededField) {
          fieldMap[field.id] = { ...field };
        } else {
          fieldMap[field.id] = { ...this.getDynamicEntityMap(<BaseFieldValueType[]>field.value) };
        }
      }
    });
    return fieldMap;
  }

  close(close: boolean): void {
    if (close) {
      this.dialog.closeAll();
    }
  }

  onCreateClicked(): void {
    this.isCreate = !this.isCreate;
  }

  toggleSearchBar(): void {
    this.isSearchActive = true;
    this.isSearchBarOpen = !this.isSearchBarOpen;
    this.searchBarOpenSubject$.next(this.isSearchBarOpen);
    this.sharedService.startListeningOutsideClick();
  }

  closeSearchBar(): void {
    this.isSearchBarOpen = false;
    this.searchBarOpenSubject$.next(this.isSearchBarOpen);
    this.sharedService.stopListeningOutsideClick();
  }

  quickSearchCases(clear?: boolean): void {
    if (clear) {
      this.qsTerm = '';
    }
    if (this.qsTerm) {
      this.quickSearch();
    } else {
      this.gridData = cloneDeep(this.staticGridData);
    }
    this.checkForActiveWorkflowState();
  }

  setDefaultWidth(field: string): number {
    if (field === 'document') {
      return 350;
    }
    return 190;
  }

  isTenant(): boolean {
    return (this.userRole && this.userRole === Roles.Tenant) || this.userRole === Roles.TenantAdmin;
  }

  onOpenCaseCreateDialogue(): void {
    this.openCaseCreateDialogue.emit();
  }

  showNotificationWidget(row: Row): void {
    const dialogRef = this.dialog.open(NotificationLogsComponent, {
      width: '400px'
    });

    dialogRef.componentInstance.dynamicEntityId = row.publicId;
    dialogRef.componentInstance.areaType = this.areaType;
    dialogRef.componentInstance.tenantId = this.tenant;
  }

  /**
   * update the actions column width after getting info about the number of buttons
   * (update only if it is default grid settings)
   */
  setActionsColumnDefaultWidth(): void {
    this.actionsColumnWidth = 115 * (this.actions?.length || 1);

    if (this.gridSettings && this.gridSettings.columnsConfig && !this.storedSettingIsApplied) {
      this.gridSettings.columnsConfig.forEach((x) => {
        if (x.isSystem && x.field === GridSystemFieldsEnum.ACTIONS) {
          x._width = this.actionsColumnWidth;
        }
      });
      this.cd.detectChanges();
    }
  }

  setActionsColumnBreakdown(columnConfig: ColumnSettings[]): void {
    for (const col of columnConfig) {
      if (this.isRawDataMainGrid && col.field === GridSystemFieldsEnum.INFO) {
        if (col._width < 100) {
          this.isInfoMinWidth = true;
        } else {
          this.isInfoMinWidth = false;
        }
      }
      if (this.isRawDataMainGrid && col.field === GridSystemFieldsEnum.ACTIONS) {
        if (col._width < 100) {
          this.isActionsMinWidth = true;
        } else {
          this.isActionsMinWidth = false;
        }
      }
      if (!this.isRawDataMainGrid && col.field === GridSystemFieldsEnum.ACTIONS) {
        if (col._width < this.actionsColumnWidth) {
          this.isActionsMinWidth = true;
        } else {
          this.isActionsMinWidth = false;
        }
      }
    }
  }

  /**
   * the callback shall combine conditionalFormatting checks and highlight checks from the route
   */
  public rowClassCheckCallback = (context: RowClassArgs) => {
    const activeRow = this.getRowActive(context) ? { active: true } : { default: true };
    if (this.itemToBeHighlighted(context.dataItem?.publicId)) {
      return {
        highlightRow: true,
        ...activeRow
      };
    } else if (this.schema && this.schema.schemaConfiguration?.conditionalFormattings) {
      const deItem = context.dataItem;
      if (deItem.meetsConditionalFormatting && deItem.conditionalFormattingAreas.includes(FormattingType.Grid)) {
        return {
          [deItem.conditionalFormattingClassName]: true,
          ...activeRow
        };
      }
    }
    return {
      ...activeRow
    };
  };

  getRowActive(context: RowClassArgs): boolean {
    return context.dataItem.isActive || false;
  }

  itemToBeHighlighted(itemId: string): boolean {
    return (
      this.queryParams &&
      this.queryParams['action'] &&
      this.queryParams['action'] === 'highlight' &&
      this.queryParams['itemId'] &&
      itemId === this.queryParams['itemId']
    );
  }

  onGroupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.populateGroupAggregates();
    this.gridSettings.groups = this.groups;
    this.gridSettings.aggregates = this.aggregates;
    this.saveGridSettingsLocally();
    this.populateGroupsAndAggregates();
  }

  addAggregate(): void {
    const dialogRef = this.dialog.open(AddAggregateComponent, {
      data: {
        gridColumns: cloneDeep(
          this.gridColumnFields.filter((x) => x.type !== FieldTypeIds.ListOfLinksField && x.type !== FieldTypeIds.EmbededField)
        ),
        existingAggregates: cloneDeep(this.aggregates)
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.aggregates = cloneDeep(x);
        // if there are groups, add the aggregates in them
        this.populateGroupAggregates();
        this.gridSettings.aggregates = this.aggregates;
        this.gridSettings.groups = this.groups;
        this.saveGridSettingsLocally();
        this.loadData();
      }
    });
  }

  populateGroupAggregates(): void {
    if (this.groups?.length) {
      this.groups = this.groups.map((group) => {
        return {
          ...group,
          aggregates: this.aggregates
        };
      });
    }
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state.take !== this.gridSettings.state.take) {
      this.gridSettings.state.take = state.take;
    }
  }

  populateDateFormats(): void {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  getFormattedAggregate(aggregate: any, col: ColumnSettings): string {
    switch (col.type) {
      case FieldTypeIds.DateField:
        return this.customDatePipe.transform(aggregate, this.userDateFormat);
      case FieldTypeIds.DateTimeField:
        return this.customDatePipe.transform(aggregate, this.userDateTimeFormat);
      case FieldTypeIds.IntField:
      case FieldTypeIds.DecimalField:
        return this.customNumberPipe.transform(aggregate, col.field, this.schema);
      default:
        return null;
    }
  }

  onCellClick(event: any): void {
    this.gridData.data.forEach((x) => {
      if (x.publicId === event.dataItem.publicId) {
        x.isActive = !x.isActive;
      } else {
        x.isActive = false;
      }
      if (this.queryParams['workflowStateId'] && this.queryParams['workflowStateId'] === x.publicId) {
        // active workflowState shall be highlighted always
        x.isActive = true;
      }
    });
  }

  checkForActiveWorkflowState(): void {
    if (this.queryParams && this.queryParams['workflowStateId']) {
      for (let index = 0; index < this.gridData.data.length; index++) {
        const x = this.gridData.data[index];
        if (this.queryParams['workflowStateId'] === x.publicId) {
          // active workflowState shall be highlighted always
          x.isActive = true;
          break;
        }
      }
    }
  }
  getColumnTitle(col: ColumnSettings): string {
    if (this.isSystemField(col) && col.title) {
      return this.ts.instant(col.title);
    }
    return col.title;
  }

  isSystemField(col: ColumnSettings): boolean {
    return col.isSystem;
  }

  openCreateCasePanel(): void {
    this.showCreateCasePanel = this.selectedGridItems.length ? true : false;
    if (!this.showCreateCasePanel) {
      this.snackBar.open(this.ts.instant('No Raw Data selected'), 'Ok', { duration: 2000 });
    }
  }

  onFocusSearch(): void {
    const element = this.quickSearchInput.nativeElement;
    this.renderer.addClass(element, 'full-width');
  }

  onFocusOutSearch(): void {
    const element = this.quickSearchInput.nativeElement;
    this.renderer.removeClass(element, 'full-width');
  }

  trackFn(index: number): number {
    return index;
  }

  expandMenu(columnChooser: ColumnMenuChooserComponent): void {
    try {
      const item = columnChooser['hostElement']['nativeElement'].children[0].children[1].children[0].children[0];
      let checkedAll = true;
      let isSelectAllAdded = item?.children[0]?.className.includes('custom-select-all');
      for (let child of item.children) {
        if (!(child.children[0] as HTMLInputElement).checked && !child.className.includes('custom-select-all')) {
          checkedAll = false;
          break;
        }
      }
      if (!isSelectAllAdded) {
        const label: HTMLLabelElement = this.renderer.createElement('label');
        label.className = 'k-column-list-item custom-select-all';
        label.innerHTML = `<input class='custom-k-checkbox' type='checkbox' ${
          checkedAll ? 'checked' : ''
        } /><span class='k-checkbox-label'>Select All</span>`;
        this.selectAllListener = this.renderer.listen(label, 'click', () => {
          const target = label.parentElement.children;
          for (let i = 0; i < target.length; i++) {
            const Child = target[i];
            (Child.children[0] as HTMLInputElement).checked = (label.children[0] as HTMLInputElement).checked;
          }
        });
        this.renderer.insertBefore(item, label, item.children[0]);
      } else {
        (item?.children[0] as HTMLInputElement).checked = checkedAll;
      }
    } catch (error) {
      console.log(error);
    }
  }

  updateQueryParams(queryParams?: Params, isMerge?: boolean): void {
    const navigationExtras: NavigationExtras = {
      relativeTo: this.activatedRoute
    };

    if (queryParams) {
      navigationExtras.queryParams = { ...queryParams };
    }
    if (isMerge) {
      navigationExtras.queryParamsHandling = 'merge';
    }
    this.router.navigate([], navigationExtras);
  }

  // Master/Detail feature

  async onDetailExpand(fromCode: boolean, event?: DetailExpandEvent, dataItem?: any, subgridsToExpand?: Array<string[]>): Promise<void> {
    const row = !fromCode ? event.dataItem : dataItem;
    if (!row._nestedEntities) {
      const rawDataListOfLinksFields = this.schema.fields
        .filter((field) => {
          return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
        })
        .sort((a, b) => {
          return a.configuration.position - b.configuration.position;
        });
      row._nestedEntities = [];
      for (const field of rawDataListOfLinksFields) {
        const itemIds = row[field.fieldName] || [];
        const nestedEntData = <NestedEntityData>{
          displayName: field.displayName,
          fieldName: field.fieldName,
          schemaId: field.configuration.schemaId,
          areaType: field.configuration.schemaAreaType,
          items: itemIds,
          parentPublicId: row?.publicId,
          actions: [
            {
              actionId: showDetailsKey,
              icon: 'info'
            },
            {
              actionId: editRawDataKey,
              icon: 'edit',
              color: 'primary'
            },
            {
              actionId: deleteRawDataKey,
              icon: 'trash',
              color: 'warn',
              actionAllowedOn:
                this.areaType === AreaTypeEnum.case
                  ? await this.getItemsAllowedForRemove(itemIds, field.configuration.schemaId, row?.publicId)
                  : [itemIds]
            }
          ],
          permission: await this.getSchemaPermissions(field.configuration.schemaId, field.configuration.schemaAreaType)
        };

        if (!subgridsToExpand) {
          row._nestedEntities.push(nestedEntData);
        } else if (subgridsToExpand.length) {
          const subgridRefPathFound = subgridsToExpand.filter((refPath) => {
            return refPath[0] === field.fieldName;
          });
          if (subgridRefPathFound.length) {
            const expandableRefPaths = [];
            subgridRefPathFound.forEach((path) => {
              const nextLevelPath = path.slice(1);
              if (nextLevelPath?.length) {
                expandableRefPaths.push(nextLevelPath);
              }
            });
            nestedEntData.expandableSubGridPaths = expandableRefPaths;
            row._nestedEntities.push(nestedEntData);
          }
        }
      }

      this.cd.detectChanges();
    }
  }

  async getItemsAllowedForRemove(itemIds: string[], itemsSchemaId: string, parentId: string): Promise<string[]> {
    if (!itemIds || !itemIds.length) {
      return [];
    }
    try {
      const query = {
        rawDataIds: itemIds,
        rawDataSchemaId: itemsSchemaId,
        caseId: parentId,
        workflowSchemaId: this.workflow.id
      };
      const response = await this.rawdataLinkService.checkRulesForRawDataRemovalFromCase(query, this.tenant);
      return response.canDelete || [];
    } catch (error) {
      return [];
    }
  }

  // Child grid action

  async detailActionEvent(event: ActionEvent, nestedEntityData: NestedEntityData, masterEntity: Row): Promise<void> {
    switch (event.actionId) {
      case showDetailsKey:
        this.quickViewDynamicEntity(event, nestedEntityData.schemaId, nestedEntityData.areaType);

        break;
      case deleteRawDataKey:
        if (this.areaType === AreaTypeEnum.case) {
          this.deleteRawDataFromCase(event, nestedEntityData, masterEntity);
        } else if (this.areaType === AreaTypeEnum.rawData) {
          const dialogRef = this.dialog.open(ConfirmDialogComponent);
          dialogRef.afterClosed().subscribe((response) => {
            if (response) this.deleteChildRawDataFromRawData(event, nestedEntityData, masterEntity);
          });
        }
        break;
      case editRawDataKey:
        this.openChildDynamicRawData(nestedEntityData, event);

        break;

      default:
        break;
    }
  }

  async deleteRawDataFromCase(event, nestedEntityData: NestedEntityData, masterEntity: Row): Promise<void> {
    try {
      const query = {
        rawDataIds: [event.raw.publicId],
        rawDataSchemaId: nestedEntityData.schemaId,
        caseId: masterEntity.publicId,
        workflowSchemaId: this.workflow.id
      };
      const response = await this.rawdataLinkService.checkMinMaxValidationBeforeRemoval(query, this.tenant);
      if (response.canDelete) {
        this.removeRawDataReferenceFromCase(event.raw.publicId, masterEntity, this.schemaId, this.workflow.id);
      } else {
        this.snackBar.open('Cannot Remove: Min RawData count validation not passed', 'CLOSE', { duration: 5000 });
      }
    } catch (error) {}
  }

  async deleteChildRawDataFromRawData(event: ActionEvent, nestedEntityData: NestedEntityData, masterEntity: Row): Promise<void> {
    const de: DynamicEntityDto = await this.dynamicEntitiesService.getById(
      this.tenant,
      masterEntity.publicId,
      this.schemaId,
      AreaTypeEnum.rawData,
      true
    );
    const filteredFields: BaseFieldValueType[] = this.fieldsAfterRemovingRawData(de, event.raw?.publicId);
    this.updateParentRawData(filteredFields, masterEntity.publicId);
  }

  fieldsAfterRemovingRawData(de: DynamicEntityDto, deleteId: string): BaseFieldValueType[] {
    return de.fields.map((x) => {
      if (x.type === FieldTypeIds.ListOfLinksField) {
        x.value = (x.value as string[]).filter((id) => {
          return id !== deleteId;
        });
      }
      return x;
    });
  }

  async removeRawDataReferenceFromCase(deleteId: string, parent: Row, parentSchemaId: string, workflowSchemaId: string): Promise<void> {
    const de: DynamicEntityDto = await this.dynamicEntitiesService.getById(
      this.tenant,
      parent.publicId,
      parentSchemaId,
      AreaTypeEnum.case,
      true
    );

    const filteredFields: BaseFieldValueType[] = this.fieldsAfterRemovingRawData(de, deleteId);
    const cmd: UpdateStateCase = {
      workflowStateId: de.id,
      tenantId: this.tenant,
      caseDynamicEntity: {
        appId: this.appId,
        tenantId: this.tenant,
        schemaId: parentSchemaId,
        areaType: AreaTypeEnum.case,
        fields: filteredFields
      },
      schemaId: workflowSchemaId
    };
    const operation = await this.workflowStateService.updateCase(cmd);
    if (operation.status.toString() === 'Success') {
      this.snackBar.open(this.ts.instant('Case Updated Successfully!'), 'CLOSE', { duration: 2000 });
      parent._nestedEntities = parent._nestedEntities.map((data: NestedEntityData) => {
        data.items = data.items?.filter((id) => id !== deleteId) || null;
        return data;
      });
      this.cd.detectChanges();
    }
  }

  async quickViewDynamicEntity(event, schemaId: string, areaType: AreaTypeEnum): Promise<void> {
    const selectedRaw: DynamicEntityDto = await this.dynamicEntitiesService.getById(this.tenant, event.raw.publicId, schemaId, areaType);

    const row = await this.getDeFieldKeyValuePairs(selectedRaw);
    if (row) {
      this.detailSchema = await this.adminSchemaService.getSchema(this.tenant, areaType, schemaId);
      const schemaFieldsWithValue = sortBy([...this.detailSchema.fields], [(field) => field.configuration?.position]).map((field) =>
        this.mapValuesToFields(field, row)
      );

      this.detailSchemaFields$ = of(
        schemaFieldsWithValue.filter((f) => f.fieldName !== 'status').map((field) => BaseFieldConverter.toUi(field))
      );
      this.detailSystemFields = {
        statusId: selectedRaw.statusId,
        createdAt: selectedRaw.createdAt,
        updatedAt: selectedRaw.updatedAt
      };

      const dialogRef = this.dialog.open(this.viewDynamicEntityTmpl, this.modalConfig);

      dialogRef.afterClosed().subscribe(async (result) => {
        this.detailSchema = null;
        this.detailSchemaFields$ = null;
        this.detailSystemFields = null;
      });
    }
  }

  mapValuesToFields(field: SchemaFieldDto, row: Row): SchemaFieldDto {
    let f = { ...field };
    f.value = row[f.fieldName];
    if (f.type === FieldTypeIds.ConnectorField && row._virtualFields) {
      f.configuration.exposedFieldsData = row._virtualFields.find((virtualFieldData) => virtualFieldData.fieldName === f.fieldName);
    }
    return f;
  }

  // Selection in child grid

  childSelectionEmitted(event: { selectedRows: Row[] }, nestedEntityData: NestedEntityData): void {
    nestedEntityData.selectedRows = event.selectedRows;
  }

  toggleStatusChangeOption(dataItem): void {
    if (!dataItem.allowStatusChange) {
      this.gridData.data.forEach((item) => {
        item.allowStatusChange = false;
      });
    }
    dataItem.allowStatusChange = !dataItem.allowStatusChange;
    if (dataItem.allowStatusChange) this.getAllowedStatusTransitions(dataItem);
  }

  async getAllowedStatusTransitions(dataItem): Promise<void> {
    try {
      const wfState = await this.workflowStateService.get({ id: dataItem?.publicId, schemaId: this.workflow.id, tenant: this.tenant });
      if (wfState) {
        this.wfStateStatuses = wfState?.statuses?.filter((x) => x.enabled)?.sort((x) => x.position);
      }
    } catch (error) {
      console.log(error);
    }
  }

  confirmStatusChange(status: WorkflowStatusDto, dataItem): void {
    if (status.id !== dataItem?.statusConfig.currentStatusId) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        data: {
          title: 'Warning',
          message: 'Are you sure you want to change the status?',
          showProceedBtn: true
        }
      });
      dialogRef
        .afterClosed()
        .pipe(take(1))
        .subscribe((x) => {
          if (x) {
            const cmd = <UpdateStatusCommand>{
              statusId: status.id,
              workflowStateId: dataItem?.publicId,
              tenantId: this.tenant,
              schemaId: this.workflow.id
            };
            this.changeCaseStatus(cmd);
          } else {
            const currentStatus = this.workflow.statuses.find((x) => x.id === dataItem?.statusConfig?.currentStatusId);
            if (currentStatus)
              dataItem.statusConfig.statusInfo = { ...dataItem.statusConfig.statusInfo, name: currentStatus.name, id: currentStatus.id };
            this.cd.detectChanges();
          }
        });
    }
  }

  async changeCaseStatus(data: UpdateStatusCommand): Promise<void> {
    this.store.dispatch(new UpdateWorkflowStateStatus({ data: data }));
  }

  async onCsvDownloadButtonClicked(): Promise<void> {
    try {
      const total = this.gridData?.total;
      if (total > 0) {
        this.snackBar.open(this.ts.instant('Downloading in progress...'), 'OK');
        const data = await this.schemasService.exportAllDataCsv(this.tenant, this.schemaId, total, this.filters, this.sortArr);
        const fileName = this.isRawDataMainGrid ? this.selectedMenu : this.workflow.name;
        this.downloadFile(data, fileName);
      } else this.snackBar.open(this.ts.instant('No records found'), this.ts.instant('Ok'), { duration: 3000 });
    } catch (error) {
      this.snackBar.dismiss();
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  downloadFile(fileData: string, fileName: string): void {
    this.snackBar.dismiss();
    const blob = new Blob([fileData]);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async openChildDynamicRawData(nestedEntityData: NestedEntityData, event?: ActionEvent): Promise<void> {
    let row: Row;
    if (event) {
      const deItem = await this.dynamicEntitiesService.getById(
        this.tenant,
        event.raw.publicId,
        nestedEntityData.schemaId,
        nestedEntityData.areaType
      );
      row = this.getDeFieldKeyValuePairs(deItem);
      row.systemFields = {
        statusId: deItem.statusId,
        createdAt: deItem.createdAt,
        updatedAt: deItem.updatedAt
      };
    }
    const publicId = nestedEntityData?.parentPublicId;
    const schema = await this.adminSchemaService.getSchema(this.tenant, nestedEntityData.areaType, nestedEntityData.schemaId);
    if (schema) {
      const dialogRef = this.dialog.open(DynamicGridRawDataRefComponent, {
        ...this.modalConfig,
        disableClose: true,
        panelClass: ['create-article-rawdata']
      });
      dialogRef.componentInstance.deItem = row ? row : null;
      dialogRef.componentInstance.schema = schema;
      dialogRef.componentInstance.schemaId = schema.id;
      dialogRef.componentInstance.fields = schema.fields;
      dialogRef.componentInstance.areaTypeFromGrid = nestedEntityData.areaType;
      dialogRef.componentInstance.allowActionsFor = nestedEntityData.areaType;
      dialogRef.componentInstance.isEdit = event ? true : false;
      dialogRef.afterClosed().subscribe(async (targetIds: string[]) => {
        if (targetIds?.length && !event) {
          const de: DynamicEntityDto = await this.dynamicEntitiesService.getById(
            this.tenant,
            publicId,
            this.parentSchemaId ? this.parentSchemaId : this.schemaId,
            AreaTypeEnum.rawData,
            true
          );
          const refField = de?.fields?.find((x) => x.type === FieldTypeIds.ListOfLinksField && x['schemaId'] === schema.id);
          if (!refField) {
            const schemaRefField = this.schema?.fields?.find(
              (x) => x.type === FieldTypeIds.ListOfLinksField && schema.id === x.configuration.schemaId
            );
            if (schemaRefField) {
              let rawDataIds: ListOfLinkFieldValueDto = {
                type: FieldTypeIds.ListOfLinksField,
                id: schemaRefField.fieldName,
                value: [...targetIds]
              };
              de.fields.push(rawDataIds);
            }
          } else {
            const existingValues = <string>refField.value;
            refField.value = [...existingValues, ...targetIds];
          }
          this.updateParentRawData(de.fields, publicId);
        } else if (event) {
          //TODO-Mridul:  if the user just clicks Cancel after opening the dialog - no need to refresh the gridData
          this.loadData();
        }
      });
    }
  }

  async updateParentRawData(fields: BaseFieldValueType[], publicId: string): Promise<void> {
    const cmd: UpdateDynamicEntityDto = {
      appId: this.appId,
      tenantId: this.tenant,
      schemaId: this.parentSchemaId ? this.parentSchemaId : this.schemaId,
      areaType: AreaTypeEnum.rawData,
      fields: fields,
      publicId: publicId
    };
    try {
      const op = await this.dynamicEntitiesService.update(cmd);
      if (op.status?.toString()?.toLowerCase() === 'success') {
        this.snackBar.open(this.ts.instant('Data Edited Successfully!'), 'CLOSE', { duration: 2000 });
        if (this.parentSchemaId) this.onRawDataUpdate.emit('load');
        else this.initAllData();
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  updateGrid(event: string): void {
    if (event) {
      this.loadData();
    }
  }

  getCellType(col: ColumnSettings): GridCellTypeEnum {
    if (col.type && col.type === FieldTypeIds.FileField) {
      return GridCellTypeEnum.FILE;
    } else if (col['isHyperlink']) {
      return GridCellTypeEnum.HYPERLINK;
    } else if (col.type && col.type === FieldTypeIds.DateField) {
      return GridCellTypeEnum.DATE;
    } else if (col.type && col.type === FieldTypeIds.DateTimeField) {
      return GridCellTypeEnum.DATETIME;
    } else if (
      col.type &&
      col.field !== this.systemFieldsEnum.EMAIL_COUNT &&
      (col.type === FieldTypeIds.IntField || col.type === FieldTypeIds.DecimalField)
    ) {
      return GridCellTypeEnum.NUMBER;
    } else if (col.type && col.type === FieldTypeIds.BoolField) {
      return GridCellTypeEnum.BOOLEAN;
    } else if (this.isRawDataMainGrid && col.field === this.systemFieldsEnum.INFO) {
      return GridCellTypeEnum.RAWDATA_INFO;
    } else if (col.field === this.systemFieldsEnum.STATUS) {
      return GridCellTypeEnum.STATUS;
    } else if (col.field === this.systemFieldsEnum.EMAIL_COUNT) {
      return GridCellTypeEnum.NOTIFICATIONS;
    } else if (this.isRawDataMainGrid && col.field === this.systemFieldsEnum.ACTIONS && this.permission.edit) {
      return GridCellTypeEnum.RAWDATA_ACTIONS;
    } else if (!this.isRawDataMainGrid && col.field === this.systemFieldsEnum.ACTIONS) {
      return GridCellTypeEnum.ACTIONS;
    } else if (col.type && col.type === FieldTypeIds.RichTextField) return GridCellTypeEnum.RICH_TEXT;
    else if (col.type && col.type === FieldTypeIds.SignatureField) return GridCellTypeEnum.SIGNATURE;
    else if (col.type && col.type === FieldTypeIds.YouTubeEmbedField) return GridCellTypeEnum.YT_EMBED;
    else if (col.field === this.systemFieldsEnum.INFO && this.showInfoBtnInSubGrid) {
      return GridCellTypeEnum.CASE_RAWDATA_INFO;
    }
    return GridCellTypeEnum.BASE;
  }

  hasTotal(colField: string): boolean {
    return this.total && !isUndefinedOrNull(this.total[colField]);
  }

  hasGroupAggregate(colField: string): boolean {
    return !!this.aggregates && !!this.aggregates?.find((agg) => agg.field === colField);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.selectAllListener) {
      this.selectAllListener();
    }
  }

  toggleBottomBar(): void {
    this.bottomBarOpened = !this.bottomBarOpened;
  }

  onCaseGridActions(event: CaseGridActionData): void {
    switch (event.action) {
      case CaseGridAction.DeleteItems:
        this.removeFromSelected(event.dataItem);
        break;
      case CaseGridAction.OpenRawDataInfo:
        this.onRawDataInfoClicked(event.dataItem);
        break;
      case CaseGridAction.OpenNotificationWidget:
        this.showNotificationWidget(event.dataItem);
        break;
      default:
        break;
    }
  }

  goToRawData(dataItem): void {
    const route: string = `${convertTenantName(this.sideBarLinkService.tenantName)}/${dataListRoute}/${this.schemaId}`;
    this.dialog.closeAll();
    this.router.navigate([route], {
      queryParams: {
        action: 'update',
        itemId: dataItem?.publicId
      }
    });
  }

  populateAggregationConfig(): AggregationConfig[] {
    return this.aggregates?.map((aggDesc) => {
      if (GridSystemFields.includes(aggDesc.field)) {
        return {
          field: `${aggDesc.field}`,
          aggregate: this.getBackendAggregationEnum(aggDesc.aggregate)
        };
      } else {
        return {
          field: `fields.${aggDesc.field}`,
          aggregate: this.getBackendAggregationEnum(aggDesc.aggregate)
        };
      }
    });
  }

  playYoutubeVideo(value: string): void {
    this.dialog.open(YoutubeVideoComponent, {
      data: { embedUrl: value }
    });
  }

  checkForStatusPermission(): void {
    if (this.permission?.disabledCaseStatuses?.length) {
      this.allowCaseDelete = true;
      const selectedItemIds = this.selectedGridItems.map((x) => x.publicId);
      const filteredData = this.gridData.data.filter((x) => selectedItemIds.includes(x?.publicId));
      const disabledStatusIds = this.permission.disabledCaseStatuses?.join(',');
      for (let index = 0; index < filteredData.length; index++) {
        const data = filteredData[index];
        if (disabledStatusIds.includes(data?.statusConfig?.currentStatusId)) {
          this.allowCaseDelete = false;
          break;
        }
      }
    } else this.allowCaseDelete = true;
  }

  checkForLastSavedSearchfields(): void {
    const keyForLastFilterFields = 'lastSearchFields';
    const lastSavedFilters: string = this.persistingService.get(`${keyForLastFilterFields}_${this.schemaId}_${this.areaType}`);
    if (lastSavedFilters) {
      const filters = JSON.parse(lastSavedFilters);
      if (filters) {
        const searchFields = filters.map((f) => f.searchFieldModel).filter((x) => x.isValid);
        this.filters = searchFields;
      }
    }
  }
}
