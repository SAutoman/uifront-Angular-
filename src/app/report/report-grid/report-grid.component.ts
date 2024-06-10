/**
 * global
 */
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import {
  GridDataResult,
  PageChangeEvent,
  ColumnReorderEvent,
  ColumnResizeArgs,
  RowClassArgs,
  DataStateChangeEvent
} from '@progress/kendo-angular-grid';
import { AggregateDescriptor, AggregateResult, GroupDescriptor, SortDescriptor, aggregateBy, groupBy } from '@progress/kendo-data-query';
import { filter, takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { getReportGridLayoutSelector, workflowMenuItemsSelector } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { SearchEvent } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.component';
import {
  ExportReportToCsv,
  GetDatasourceSchemaFields,
  GetGridReport,
  ResetCurrentGridReport,
  selectCurrentDatasource,
  selectDatasourceFieldsWithConfigs,
  selectGridReport,
  selectReportDatasourceLoading
} from '@wfm/store/report-datasource';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import {
  GridSettings,
  AllowedGridOperations,
  StatePersistingService,
  reportGridSettingsKey,
  ColumnSettings,
  FieldTypeIds,
  AreaTypeEnum,
  AggregationEnumBackend,
  AggregationType,
  WorkflowSimplifiedDto
} from '@wfm/service-layer';
import { ProcessStepPath, PropertyPath, PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { LayoutTypeEnum } from '@wfm/shared/grid-layout-options/grid-layout-options.component';

/**
 * local
 */
import {
  DataSourceDto,
  DatasourceSchemaFieldConfiguration,
  GridReportQuery,
  ReportGridCellItem,
  ReportGridColumnItem,
  ReportGridDataResult,
  ReportGridRowItem,
  ReportGroupedDataResult,
  ReportTypeEnum
} from '../report-datasource.model';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddAggregateComponent } from '@wfm/shared/add-aggregate/add-aggregate.component';

@Component({
  selector: 'app-report-grid',
  templateUrl: './report-grid.component.html',
  styleUrls: ['./report-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportGridComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() isEditMode: boolean;
  @Output() modeChanged = new EventEmitter<boolean>();
  @Output() removeDataSource = new EventEmitter<boolean>();
  source: DataSourceDto;
  isSearchActive: boolean;
  isSearchBarOpen: boolean;
  searchBarOpenSubject$ = new BehaviorSubject(false);

  gridData: GridDataResult;
  staticGridData: GridDataResult;

  gridSettings: GridSettings;
  filters: SearchFieldModel[] = [];
  uiSorting: SortDescriptor[] = [];
  apiSorting: SortDescriptor[] = [];

  allowedGridOperations: AllowedGridOperations = {
    actionsColumn: false,
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
  allowSorting = false; // not needed for now, no BE support
  allowLayoutChange: boolean = true;
  loading$: Observable<boolean>;
  pageSize = [20, 50, 150, 500, 1000, { text: 'all', value: 'all' }];
  gridChanges$ = new BehaviorSubject<string>('');
  /**
   * used by grid - fieldName is the joined path
   */
  gridColumnFields: Array<ReportGridColumnItem> = [];
  reportData: ReportGridDataResult | ReportGroupedDataResult;
  gridSettingsName: string = reportGridSettingsKey;
  public aggregates: AggregateDescriptor[] = [];
  public groups: GroupDescriptor[] = [];
  public total: AggregateResult = {};

  noColumnsSelected: boolean = false;
  workflows: WorkflowSimplifiedDto[];
  get layoutTypeEnum() {
    return LayoutTypeEnum;
  }

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  isViewModeActivated: boolean = true;
  isEditActivated: boolean = false;
  caseSchemaId: string;

  constructor(
    private persistingService: StatePersistingService,
    private cd: ChangeDetectorRef,
    private store: Store<ApplicationState>,
    private dynamicGridUiService: DynamicGridUiService,
    private dialog: MatDialog
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.loading$ = this.store.select(selectReportDatasourceLoading);
    this.subscribeToCurrentDatasource();

    this.isEditActivated = this.isEditMode === true ? true : false;
    this.isViewModeActivated = this.isEditMode === true ? false : true;
  }

  subscribeToCurrentDatasource(): void {
    this.store
      .select(selectCurrentDatasource)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (data) => {
        this.groups = [];
        this.aggregates = [];
        this.source = cloneDeep(data);
        this.loadWorkflows();
        this.subscribeToReportData();
        this.subscribeToGridLayout();

        this.store.dispatch(new GetDatasourceSchemaFields({ datasourceId: this.source.id, tenantId: this.tenant }));
        this.cd.detectChanges();
      });
  }

  subscribeToGridLayout(): void {
    this.store.pipe(select(getReportGridLayoutSelector), takeUntil(this.destroyed$)).subscribe((gridSettings) => {
      if (gridSettings && this.gridColumnFields) {
        setTimeout(async () => {
          this.applyGridSettings(cloneDeep(gridSettings));
          this.loadData();
        }, 200);
      }
    });
  }

  applyGridSettings(storeSettings?: GridSettings): void {
    this.gridSettings = null;
    this.groups = [];
    this.aggregates = [];
    let localSettings: string = this.persistingService.get(`${reportGridSettingsKey}_${this.source.id}`);

    if (storeSettings) {
      this.gridSettings = this.dynamicGridUiService.mapGridSettings(storeSettings, this.gridColumnFields);
      if (storeSettings?.groups?.length || storeSettings?.aggregates?.length) {
        this.setGroupsFromGridSettings(storeSettings);
      }
    } else if (localSettings) {
      try {
        let jsonSettings = JSON.parse(localSettings);
        this.gridSettings = this.dynamicGridUiService.mapGridSettings(jsonSettings, this.gridColumnFields);
        if (jsonSettings?.groups?.length || jsonSettings?.aggregates?.length) {
          this.setGroupsFromGridSettings(jsonSettings);
        }
        this.gridChanges$.next(`${reportGridSettingsKey}_${Math.round(Math.random() * 100)}`);
      } catch (error) {
        console.log('unable to parse settings from localstorage, using factory settings');
        this.initDefaultGrid();
      }
    } else {
      this.initDefaultGrid();
    }
    if (this.gridSettings) {
      if (this.gridSettings.state) {
        this.uiSorting = this.gridSettings.state.sort;
        this.populateApiSortingDto(this.gridSettings?.state?.sort || []);
      }
    }
    this.cd.detectChanges();
  }

  subscribeToReportData(): void {
    this.store
      .select(selectGridReport)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.reportData = cloneDeep(data);
        const gridData = this.populateGridRows();
        this.staticGridData = cloneDeep(gridData);
        this.populateGroupsAndAggregates();
      });

    this.store
      .select(selectDatasourceFieldsWithConfigs)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.populateGridColumns(data);
        this.applyGridSettings();
        this.loadData();
      });
  }

  loadData(): void {
    const dto: GridReportQuery = {
      tenantId: this.source.tenantId,
      datasourceId: this.source.id,
      reportType: this.source.reportType,
      filters: { filters: this.filters }
    };
    if (this.source.reportType === ReportTypeEnum.AGGREGATION) {
      dto.paging = {
        skip: this.gridSettings?.state.skip,
        take: this.gridSettings?.state.take
      };
    }

    this.store.dispatch(new GetGridReport(dto));
  }

  processRows(rows: ReportGridRowItem[]): any[] {
    const gridData = [];
    rows?.forEach((row: ReportGridRowItem, index: number) => {
      const finalRow = {};
      if (!row.reportColumns.length) {
        this.noColumnsSelected = true;
      } else {
        this.noColumnsSelected = false;

        row.reportColumns.forEach((column: ReportGridCellItem) => {
          let columnPathJoined;
          if (column.isSystemField) {
            columnPathJoined = column.fieldName;
          } else {
            columnPathJoined = this.getPathString(column.propertyPath);
          }
          finalRow[columnPathJoined] = column.formattedValue;
        });

        finalRow['publicId'] = `${row.workflowStateId}_${index}`;
      }
      gridData.push(finalRow);
    });
    return gridData;
  }

  populateGridRows(): GridDataResult {
    let gridData = [];
    if (this.source.reportType === ReportTypeEnum.GRID) {
      const reportGridData = this.reportData as ReportGridDataResult;
      gridData = this.processRows(reportGridData.data);
      return {
        data: gridData,
        total: gridData.length
      };
    } else if (this.source.reportType === ReportTypeEnum.AGGREGATION) {
      const reportData: ReportGroupedDataResult = cloneDeep(this.reportData);
      if (reportData.groupedData) {
        let gridRows = (<ReportGroupedDataResult>this.reportData).groupedData.map((data) => {
          const row = {};
          data.aggregates?.forEach((agg) => {
            row[agg.fieldName] = agg.value;
          });

          data.groupedData?.forEach((group) => {
            row[group.fieldName] = group.value;
          });
          return row;
        });
        return {
          data: gridRows,
          total: this.reportData.total
        };
      } else if (reportData.overAllAggregationResult) {
        const row = {};
        reportData.overAllAggregationResult?.forEach((agg) => {
          row[agg.fieldName] = agg.value;
        });

        return {
          data: [row],
          total: 1
        };
      } else if (reportData.total === 0) {
        return {
          data: [],
          total: 0
        };
      }
    }
  }

  populateGridColumns(data: DatasourceSchemaFieldConfiguration[]): void {
    this.gridColumnFields = [];
    data
      .filter((field) => {
        return field.type !== FieldTypeIds.ListOfLinksField && field.type !== FieldTypeIds.EmbededField;
      })
      .forEach((field: DatasourceSchemaFieldConfiguration) => {
        let columnPathJoined;
        if (field.isSystemField) {
          columnPathJoined = field.fieldName;
        } else {
          columnPathJoined = this.getPathString(field.propertyPath);
        }
        let columnTitle = `${field.columnTitle || columnPathJoined}`;

        this.gridColumnFields.push({
          ...field,
          fieldName: columnPathJoined,
          displayName:
            this.source.reportType === ReportTypeEnum.GRID ? columnTitle : `${columnTitle} ${this.getFieldAggregationLabel(field)}`
        });
      });
  }

  getFieldAggregationLabel(field: ReportGridColumnItem): string {
    const foundAgg = this.source.dataSourceUI.aggregationConfigs.find((config) => {
      return field.isSystemField
        ? field.fieldName === config.field
        : this.getPathString(field.propertyPath) === this.getPathString(config.propertyPath);
    });
    if (foundAgg) {
      const agg = this.getKendoAggregationEnum(foundAgg.aggregate);
      return `(${agg.toUpperCase()})`;
    } else {
      const foundGroup = this.source.dataSourceUI.groupByFields.find((group) => {
        return field.isSystemField
          ? field.fieldName === group.fieldName
          : this.getPathString(field.propertyPath) === this.getPathString(group.propertyPath);
      });
      if (foundGroup) {
        return `(GROUP BY)`;
      }
    }
  }

  getPathString(propPath: PropertyPath): string {
    if (propPath) {
      const path = cloneDeep(propPath.path);
      if (propPath.pathType === PropertyPathTypeEnum.ProcessStepPath) {
        path.unshift((<ProcessStepPath>propPath).processStepRefName);
      }
      const joinedPath = path.join('_');
      return joinedPath;
    }
    return '';
  }

  /**
   * this is for populating the grid columns,
   */
  initDefaultGrid(): void {
    let columns: ColumnSettings[] = this.gridColumnFields
      ?.filter((field) => {
        return field.type !== FieldTypeIds.ListOfLinksField && field.type !== FieldTypeIds.EmbededField;
      })
      .map((field) => {
        let fieldKey = field.isSystemField ? field.fieldName : this.getPathString(field.propertyPath);

        let columnTitle =
          this.source.reportType === ReportTypeEnum.GRID
            ? `${field.columnTitle || fieldKey}`
            : `${field.columnTitle || fieldKey} ${this.getFieldAggregationLabel(field)}`;

        return <ColumnSettings>{
          type: field.type,
          field: field.fieldName,
          title: columnTitle,
          reorderable: true,
          _width: 190,
          sortable: true
        };
      });

    this.gridSettings = {
      columnsConfig: columns,
      state: {
        sort: [],
        skip: 0,
        take: 50
      }
    };
  }

  onDataStateChanged(event: DataStateChangeEvent): void {
    if (event.take !== this.gridSettings.state.take) {
      this.gridSettings.state.take = event.take;
    }

    if (event.skip !== this.gridSettings.state.skip) {
      this.gridSettings.state.skip = event.skip;
    }

    if (this.source.reportType == ReportTypeEnum.AGGREGATION) {
      // pagination for aggregated reports is supported by BE
      this.loadData();
    } else {
      // pagination for grid reports is done at UI, manually
      this.populateGroupsAndAggregates();
    }
    this.saveGridSettingsLocally();
  }

  applyPagingIfApplicable(gridDataResult: GridDataResult): GridDataResult {
    const copyData = cloneDeep(gridDataResult);
    if (this.source.reportType === ReportTypeEnum.AGGREGATION) {
      return copyData;
    } else if (this.source.reportType === ReportTypeEnum.GRID) {
      return {
        data: gridDataResult.data.slice(this.gridSettings.state.skip, this.gridSettings.state.skip + this.gridSettings.state.take),
        total: gridDataResult.total
      };
    }
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
    this.persistingService.set(`${reportGridSettingsKey}_${this.source.id}`, this.gridSettings);
    this.gridChanges$.next(`${reportGridSettingsKey}_${Math.round(Math.random() * 100)}`);
  }

  onCellClick(event: any): void {
    this.gridData.data.forEach((x) => {
      if (x.publicId === event.dataItem.publicId) {
        x.isActive = !x.isActive;
      } else {
        x.isActive = false;
      }
    });
  }

  isRowActive(context: RowClassArgs): boolean {
    return context.dataItem.isActive || false;
  }

  public rowClassCheckCallback = (context: RowClassArgs) => {
    const activeRow = this.isRowActive(context) ? { active: true } : { default: true };

    return {
      ...activeRow
    };
  };

  populateApiSortingDto(sortFields: SortDescriptor[]): void {
    this.apiSorting = [];
    if (sortFields?.length > 0) {
      sortFields.forEach((sort) => {
        const currentField = this.gridColumnFields.find((f) => sort.field === this.getPathString(f.propertyPath));
        if (currentField) {
          this.apiSorting.push({
            field: this.getPathString(currentField.propertyPath),
            dir: sort.dir
          });
        }
      });
    }
  }

  toggleSearchBar(): void {
    this.isSearchActive = true;
    this.isSearchBarOpen = !this.isSearchBarOpen;
    this.searchBarOpenSubject$.next(this.isSearchBarOpen);
    this.cd.detectChanges();
  }

  closeSearchBar(): void {
    this.isSearchBarOpen = false;
    this.searchBarOpenSubject$.next(this.isSearchBarOpen);
  }

  async onSearch(event: SearchEvent): Promise<void> {
    this.filters = event.filters;
    this.gridSettings.state.skip = 0;
    if (event.refreshData) {
      this.loadData();
    }
    this.cd.detectChanges();
  }

  onDownloadButtonClicked(): void {
    const dto: GridReportQuery = {
      tenantId: this.source.tenantId,
      datasourceId: this.source.id,
      reportType: this.source.reportType,
      filters: { filters: this.filters }
    };
    this.store.dispatch(new ExportReportToCsv({ query: dto, reportName: this.source.name }));
  }

  async resetGridLayoutHandler(): Promise<void> {
    this.applyGridSettings(null);
    this.loadData();
    this.cd.detectChanges();
  }

  public dataStateChange(state: DataStateChangeEvent): void {
    if (state.take !== this.gridSettings.state.take) {
      this.gridSettings.state.take = state.take;
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ResetCurrentGridReport());
  }

  toggleEdit(): void {
    this.modeChanged.emit(true);
    this.isViewModeActivated = false;
    this.isEditActivated = true;
    this.cd.detectChanges();
  }

  toggleView(): void {
    this.modeChanged.emit(false);
    this.isViewModeActivated = true;
    this.isEditActivated = false;
    this.cd.detectChanges();
  }

  removeDatasource(): void {
    this.removeDataSource.emit();
  }

  getKendoAggregationEnum(aggKey: AggregationEnumBackend): AggregationType {
    switch (aggKey) {
      case AggregationEnumBackend.Count:
        return 'count';
      case AggregationEnumBackend.Sum:
        return 'sum';
      case AggregationEnumBackend.Avg:
        return 'average';
      case AggregationEnumBackend.Min:
        return 'min';
      case AggregationEnumBackend.Max:
        return 'max';
      default:
        break;
    }
  }

  hasTotalAggregate(colField: string): boolean {
    return this.total && !isUndefinedOrNull(this.total[colField]);
  }

  hasGroupAggregate(colField: string): boolean {
    return !!this.aggregates && !!this.aggregates?.find((agg) => agg.field === colField);
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

  setGroupsFromGridSettings(data: GridSettings): void {
    this.groups = cloneDeep(data?.groups) || [];
    this.aggregates = cloneDeep(data?.aggregates ? data.aggregates : this.groups[0]?.aggregates ? this.groups[0]?.aggregates : []);
    this.populateGroupAggregates();
  }

  populateGroupsAndAggregates(): void {
    if (this.staticGridData) {
      const paginated = this.applyPagingIfApplicable(this.staticGridData);
      this.gridData = cloneDeep(paginated);
      if (this.aggregates?.length) {
        this.total = aggregateBy(paginated.data, this.aggregates);
      }
      if (this.groups?.length) {
        this.gridData.data = groupBy(paginated.data, this.groups);
      }
      this.cd.detectChanges();
    }
  }

  onGroupChange(groups: GroupDescriptor[]): void {
    this.groups = groups;
    this.populateGroupAggregates();
    this.gridSettings.groups = this.groups;
    this.gridSettings.aggregates = this.aggregates;
    this.saveGridSettingsLocally();
    this.populateGroupsAndAggregates();
  }

  loadWorkflows(): void {
    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length) {
        this.workflows = x.map((menuItem) => menuItem.setting);
        this.caseSchemaId = this.workflows.find((workflow) => workflow.id === this.source?.workflowSchemaId)?.caseSchemaId;
      }
    });
  }
}
