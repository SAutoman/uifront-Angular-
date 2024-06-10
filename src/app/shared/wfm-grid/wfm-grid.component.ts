/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import {
  aggregateBy,
  AggregateDescriptor,
  AggregateResult,
  groupBy,
  GroupDescriptor,
  SortDescriptor,
  State
} from '@progress/kendo-data-query';
import {
  ColumnReorderEvent,
  ColumnResizeArgs,
  ColumnVisibilityChangeEvent,
  PageChangeEvent,
  DataStateChangeEvent,
  GridDataResult,
  GridComponent,
  DetailExpandEvent
} from '@progress/kendo-angular-grid';
import { select, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { process } from '@progress/kendo-data-query';
import { KeyValue } from '@angular/common';

/**
 * project
 */
import {
  GridSettingsBaseEx,
  GridConfiguration,
  Paging,
  StatePersistingService,
  SidebarLinksService,
  GridSettings,
  Sorting,
  SortDirection,
  SortDirectionValue,
  ColumnSettings,
  AreaTypeOption,
  CompanyService,
  Company,
  UsersUiGrid
} from '@wfm/service-layer';
import { ApplicationState, getGridLayoutSelector } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ActionEvent, GridAction } from '../dynamic-entity-grid/model/dynamic-entity-grid.model';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { AppBarData, SharedService } from '../../service-layer/services/shared.service';
import { GridDataResultEx } from '../kendo-util';
import { AddAggregateComponent } from '../add-aggregate/add-aggregate.component';
import { MappingsGridActions } from '@wfm/mappings/mappings/mapping-list-page.view-model';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { defaultTenantCompanyUsersGridSettings } from '../default-grid-settings';
import { LayoutTypeEnum } from '../grid-layout-options/grid-layout-options.component';
import DateTimeFormatHelper from '../dateTimeFormatHelper';

export interface GridSelectorData {
  options: KeyValue<string, any>[];
  label: string;
}

/**
 * local
 */

@Component({
  selector: 'app-wfm-grid',
  templateUrl: './wfm-grid.component.html',
  styleUrls: ['./wfm-grid.component.scss']
})
export class WfmGridComponent extends TenantComponent implements OnInit, GridSettingsBaseEx {
  @ViewChild('grid') grid: GridComponent;

  @Input() gridConfiguration: GridConfiguration;
  /**
   * Control  auto loading data from local storage
   * @see  saveGridSettingsLocally(grid: GridComponent): Promise<void>
   * @see initLocalGridSettings(): void
   */
  @Input() disableLsLoading: boolean = false;
  @Input() isModal: boolean = false;
  @Input() selectorValue: any;
  @Input() pageTitle: string;
  @Input() gridAreaType: string;
  @Input() actions: GridAction[] = [];
  @Input() hidePaginationOptions: boolean;
  @Input() gridData: GridDataResultEx<any>;
  @Input() callAddAggregate: string;
  @Input() showCreateButton: boolean;
  @Input() selectorData: GridSelectorData;
  @Input() lastGridState: State;
  @Input() loading?: boolean;

  @Output() deleteItem: EventEmitter<any> = new EventEmitter();
  @Output() searchOpen: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() sortChange: EventEmitter<SortDescriptor[]> = new EventEmitter();
  @Output() actionEvent: EventEmitter<ActionEvent> = new EventEmitter();
  @Output() onSearch: EventEmitter<string> = new EventEmitter();
  @Output() openSearchFilters: EventEmitter<boolean> = new EventEmitter();
  @Output() createBtnEmitter: EventEmitter<boolean> = new EventEmitter();
  @Output() gridSelectorEmitter: EventEmitter<any> = new EventEmitter();
  @Output() paginationChange: EventEmitter<PageChangeEvent> = new EventEmitter();
  @Output() updateCompanyEmitter: EventEmitter<{ userId: string; companyId: string }> = new EventEmitter();

  mappingType: string;

  tenantName: string;
  gridSettings: GridSettings;
  pageSize = [10, 25, 50, 100, { text: 'all', value: 'all' }];
  componentId = 'd9cedaaf-2fe5-4711-b01c-5915833d85c3';
  appBarData: AppBarData = {} as AppBarData;
  qsTerm: string;

  sort: SortDescriptor[] = [
    {
      field: '',
      dir: SortDirectionValue.asc
    }
  ];
  areaTypes: Array<AreaTypeOption>;
  allowCompanyChange: boolean;
  allCompaniesList: Company[];
  filteredCompanies: Company[];

  get gridPaging(): Paging {
    if (!this.gridConfiguration) {
      return null;
    }
    const paging = <Paging>{
      skip: this.gridConfiguration.gridSettings?.skip,
      take: this.gridConfiguration.gridSettings?.pageSize
    };
    return paging;
  }

  get gridSorting(): Sorting[] {
    if (!this.gridConfiguration) {
      return null;
    }
    let gridSorting: SortDescriptor[] = this.gridConfiguration.gridSettings?.sort;

    if (!gridSorting[0]) {
      return null;
    }

    return [
      {
        propertyName: gridSorting[0].field,
        sort: gridSorting[0].dir === SortDirectionValue.asc ? SortDirection.asc : SortDirection.desc
      }
    ];
  }

  get layoutTypeEnum() {
    return LayoutTypeEnum;
  }

  gridChanges$ = new BehaviorSubject<string>('');
  allGridData: GridDataResult = { data: [], total: 0 };
  isDeskTop: boolean = true;

  aggregates: AggregateDescriptor[] = [];
  groups: GroupDescriptor[] = [];
  public total: AggregateResult = aggregateBy(this.allGridData.data, this.aggregates);
  state: State = {
    skip: 0,
    take: 50,
    sort: []
  };
  selectorControl: FormControl;
  usersGridSettingsConf: GridConfiguration = defaultTenantCompanyUsersGridSettings;
  lastOpenedSchema: string = localStorage.getItem('lastSchemaOpened');
  public userDateTimeFormat: string;
  areaChangeSub: Subscription;

  constructor(
    private dynamicGridUiService: DynamicGridUiService,
    private persistingService: StatePersistingService,
    private route: Router,
    private store: Store<ApplicationState>,
    private sidebarService: SidebarLinksService,
    private cd: ChangeDetectorRef,
    private service: AdminSchemasService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private companyService: CompanyService
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.selectorControl = new FormControl();
  }

  onExpand(event: DetailExpandEvent): void {
    this.gridData?.data.map((x, i) => {
      if (i !== event.index) {
        this.grid.collapseRow(i);
      }
    });

    setTimeout(() => {
      document.getElementsByClassName('k-grid-content')[0].scrollLeft = 0;
      document.getElementsByClassName('k-grid-content')[1].scrollLeft = 0;
    }, 100);
  }

  ngOnInit(): void {
    this.route.url.includes('supplier') ? (this.mappingType = 'suppliers') : '';
    this.route.url.includes('auditor') ? (this.mappingType = 'auditors') : '';
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;

    this.loadSelectedGridLayout();
    if (this.pageTitle && !this.isModal) {
      this.appBarData.title = this.pageTitle;
      this.sharedService.setAppBarData(this.appBarData);
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change?.selectorValue?.currentValue) {
      this.selectorControl.setValue(+change?.selectorValue?.currentValue);
      this.qsTerm = null;
    }
    if (change.gridData?.currentValue) {
      this.allGridData = cloneDeep(change.gridData.currentValue);
      if (this.gridAreaType === 'schemas') {
        if (this.areaChangeSub) this.areaChangeSub.unsubscribe();
        this.areaChangeSub = this.selectorControl.valueChanges.pipe(distinctUntilChanged()).subscribe((selectedOption) => {
          this.gridSelectorEmitter.emit(selectedOption);
        });
      }
      if (this.gridAreaType === 'companyInfo') {
        this.getAllCompanies();
      }
      this.populateGroupsAndAggregates();
      this.cd.detectChanges();
    }
    if (change.callAddAggregate?.currentValue) {
      this.addAggregate();
    }
    if (change?.lastGridState?.currentValue) {
      this.state = {
        skip: this.lastGridState?.skip,
        take: this.lastGridState?.take,
        sort: this.lastGridState?.sort
      };
    }
  }

  orderColumns(): void {
    this.gridSettings.columnsConfig = this.gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  onColumnReorder(event: ColumnReorderEvent): void {
    this.saveGridSettingsLocally(this.grid);
  }

  onColumnResize(event: ColumnResizeArgs[]): void {
    this.saveGridSettingsLocally(this.grid);
  }

  onColumnVisibilityChange(event: ColumnVisibilityChangeEvent): void {
    this.saveGridSettingsLocally(this.grid);
  }

  onPageChange(event: PageChangeEvent): void {
    this.state = event;
    this.paginationChange.emit(event);
  }

  onDataStateChanged(event: DataStateChangeEvent): void {
    if (event.take !== this.gridConfiguration.gridSettings.pageSize) {
      this.gridConfiguration.gridSettings.pageSize = event.take;
    }
    this.state = event;
    this.populateGroupsAndAggregates();
    this.saveGridSettingsLocally(this.grid);
  }

  onSortChange(event: SortDescriptor[]): void {
    this.sortChange.emit(event);
    if (this.gridConfiguration) {
      this.gridConfiguration.gridSettings.sort = event;
    }
    this.saveGridSettingsLocally(this.grid);
  }

  onDelete(dataItem): void {
    this.deleteItem.emit(dataItem);
  }

  private async saveGridSettingsLocally(grid: GridComponent): Promise<void> {
    await new Promise((res) => setTimeout(() => res(true), 100));
    const gridConfig = this.dynamicGridUiService.getGridSettingsFromGridComponent(grid);
    gridConfig.columnsConfig = this.setOriginalTitles(gridConfig);

    gridConfig.groups = this.groups;
    gridConfig.aggregates = this.aggregates;
    /**
     * if we ignore loading, then we ignore saving
     */
    if (!this.disableLsLoading && this.gridConfiguration.girdSettingKeyName) {
      this.persistingService.set(this.getSettingsNameKey(), gridConfig);
      this.gridChanges$.next(`${this.gridConfiguration.girdSettingKeyName}_${Math.round(Math.random() * 100)}`);
    }
    this.cd.detectChanges();
  }

  /**
   * needed not to store other language translations in localstorage, layouts
   * otherwise the foreign language keys are getting deployed to translateServer next time
   */
  setOriginalTitles(gridConfig: GridSettings): ColumnSettings[] {
    gridConfig.columnsConfig.forEach((column) => {
      if (column.field) {
        column.title = this.gridConfiguration.columnSettings.find((cs) => cs.field === column.field)?.title;
      }
    });
    return gridConfig.columnsConfig;
  }

  private initGridConfiguration(): void {
    this.gridSettings = null;
    if (this.gridConfiguration) {
      if (this.gridConfiguration.columnSettings) {
        this.gridSettings = {
          columnsConfig: this.gridConfiguration.columnSettings
        };
      }
    }
    if (this.gridSettings && this.gridSettings.columnsConfig) {
      this.orderColumns();
    } else {
      this.gridSettings = {
        columnsConfig: []
      };
    }
  }

  private initLocalGridSettings(): void {
    this.tenantName = this.sidebarService.getTenantNameAsProperty();

    const settings: string = this.persistingService.get(this.getSettingsNameKey());

    if (settings) {
      this.gridSettings = this.dynamicGridUiService.mapGridSettingsNonSchema(settings);
      if (this.gridSettings?.groups?.length || this.gridSettings.aggregates?.length) {
        this.setGroupsFromGridSettings(cloneDeep(this.gridSettings));
      }
    } else {
      this.initGridConfiguration();
    }

    if (this.gridSettings && this.gridSettings.state) {
      this.sort = this.gridSettings.state.sort;
    }
  }

  private loadSelectedGridLayout(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(getGridLayoutSelector)).subscribe((data) => {
      if (data) {
        this.gridSettings = data;
        this.sort = this.gridSettings.state.sort;
        if (this.gridSettings?.groups?.length || this.gridSettings?.aggregates?.length) {
          this.setGroupsFromGridSettings(cloneDeep(this.gridSettings));
        }
      } else if (data === null) {
        // it means layout has been "reset"
        this.gridSettings = null;
        this.sort = null;
        this.persistingService.remove(this.getSettingsNameKey());
        this.aggregates = [];
        this.groups = [];
        this.initGridConfiguration();
      } else {
        if (!this.disableLsLoading) {
          this.initLocalGridSettings();
        } else {
          this.initGridConfiguration();
        }
      }
      this.populateGroupsAndAggregates();
    });
  }

  searchOpenClicked() {
    this.searchOpen.emit(true);
  }

  onQuickSearch(): void {
    if (this.gridAreaType === 'tenants') {
      this.onSearch.emit(this.qsTerm);
    } else {
      const data = cloneDeep(this.allGridData);
      if (this.gridData) {
        this.gridData.data = process(data.data, {
          filter: {
            logic: 'or',
            filters: this.gridConfiguration.columnSettings
              .filter((x) => x.title && x.title.toLowerCase() !== 'actions')
              .map((x) => {
                return { field: x.field, operator: 'contains', value: this.qsTerm };
              })
          }
        }).data;
        this.gridData.total = !this.qsTerm ? this.allGridData.total : this.gridData.data.length;
      }
    }
  }

  onCloseQuickSearch(): void {
    this.qsTerm = null;
    if (this.gridAreaType === 'tenants') {
      this.onSearch.emit('');
    } else {
      this.gridData = cloneDeep(this.allGridData);
    }
  }

  private getSettingsNameKey(): string {
    let settingName = `${this.gridConfiguration.girdSettingKeyName}${this.tenantName}`;

    return settingName;
  }

  actionClicked(action: GridAction, dataRow): void {
    const cmd: ActionEvent = {
      actionId: action.actionId,
      raw: dataRow
    };
    this.actionEvent.next(cmd);
  }

  onShowInfoClicked(dataRow): void {
    const showInfoAction: GridAction = {
      actionId: 'companyInfoGridData',
      icon: ''
    };
    this.actionClicked(showInfoAction, dataRow);
  }

  onGroupChange(groups: GroupDescriptor[]): void {
    groups.map((group) => (group.aggregates = this.aggregates));
    this.groups = groups;
    this.saveGridSettingsLocally(this.grid);
    this.populateGroupsAndAggregates();
  }

  setGroupsFromGridSettings(data: GridSettings): void {
    this.groups = cloneDeep(data?.groups) || [];
    this.aggregates = cloneDeep(data?.aggregates ? data.aggregates : this.groups[0]?.aggregates ? this.groups[0]?.aggregates : []);
  }

  populateGroupsAndAggregates(): void {
    if (this.gridData) {
      this.total = aggregateBy(this.allGridData?.data, this.aggregates);
      this.gridData.data = groupBy(cloneDeep(this.allGridData?.data), this.groups);
    }
  }

  addAggregate(): void {
    const gridColumns = this.gridSettings.columnsConfig
      .filter((x) => x.title && !x.isActionType)
      .map((x) => {
        return {
          fieldName: x.field,
          displayName: x.title,
          type: x.type
        };
      });
    const dialogRef = this.dialog.open(AddAggregateComponent, {
      data: {
        gridColumns: gridColumns,
        existingAggregates: cloneDeep(this.aggregates)
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.aggregates = cloneDeep(x);
        this.populateGroupsAndAggregates();
        this.gridChanges$.next(`${this.gridConfiguration.girdSettingKeyName}_${Math.round(Math.random() * 100)}`);
        this.saveGridSettingsLocally(this.grid);
      }
    });
  }

  openFilters(): void {
    this.state = { skip: 0, take: this.gridConfiguration?.gridSettings?.pageSize };
    this.openSearchFilters.emit(true);
  }

  backToParent(): void {
    this.createBtnEmitter.emit(true);
  }

  reapplyAllMappings(): void {
    const cmd: ActionEvent = {
      actionId: MappingsGridActions.ReApply_ALL_Mappings,
      raw: null
    };
    this.actionEvent.next(cmd);
  }

  toggleCompanyChangeFlag(): void {
    this.allowCompanyChange = !this.allowCompanyChange;
  }

  async getAllCompanies(): Promise<void> {
    const data = await this.companyService.getCompaniesByTenantWithUsers(this.tenant);
    this.allCompaniesList = data || [];
    this.filteredCompanies = cloneDeep(this.allCompaniesList);
  }

  handleFilter(term: string): void {
    if (term?.length) {
      this.filteredCompanies = this.allCompaniesList.filter((x) => x.name?.toLowerCase().includes(term?.toLowerCase()));
    } else this.filteredCompanies = cloneDeep(this.allCompaniesList);
  }

  onCompanyChange(value: Company, dataItem: UsersUiGrid): void {
    this.confirmCompanyChange(value, dataItem);
  }

  async confirmCompanyChange(newCompany: Company, dataItem: UsersUiGrid): Promise<void> {
    if (newCompany.id !== dataItem?.company?.id) {
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
          if (x) this.updateCompanyEmitter.emit({ companyId: newCompany.id, userId: dataItem.id });
          else dataItem.companyDropDownInfo = { name: dataItem?.company?.name, id: dataItem?.company?.id };
        });
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.gridChanges$.unsubscribe();
    this.areaChangeSub?.unsubscribe();
  }
}
