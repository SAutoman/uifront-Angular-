/**
 * global
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { filter, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { KeyValue } from '@angular/common';

/**
 * project
 */

import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import {
  AreaTypeAll,
  AreaTypeEnum,
  GridConfiguration,
  schemasGridStateKey,
  SchemasService,
  Sorting,
  IFilter,
  FieldTypeIds,
  Paging,
  SchemaDto,
  schemasGridSettingsKey
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { GridSelectorData, WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';

import { ApplicationState } from '@wfm/store/application/application.reducer';
import { AdminSchemasService, SchemaGridRow } from '@wfm/service-layer/services/admin-schemas.service';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { defaultSchemasListGridSettings } from '@wfm/shared/default-grid-settings';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { GridDataResultEx, toApiSort } from '@wfm/shared/kendo-util';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { FetchWorkflowMenuData } from '@wfm/store';

@Component({
  selector: 'app-schemas-list',
  templateUrl: './schemas-list.component.html',
  styleUrls: ['./schemas-list.component.scss']
})
export class SchemasListComponent extends TenantComponent implements OnInit {
  @ViewChild('formGrid') grid: WfmGridComponent;

  areaType: AreaTypeEnum | number;
  allSchemas: SchemaGridRow[] = [];
  gridAreaType: string = 'schemas';
  gridActions: GridAction[];
  userId: string;
  gridConfigBase: GridConfiguration;
  gridSettingsKeyBase: string;
  areaTypeList: KeyValue<string, AreaTypeEnum | number>[];
  areaSelectorData: GridSelectorData;
  state: State;
  savedPaginationSettings: State;
  isLoading: boolean;
  gridData: GridDataResultEx<SchemaDto>;

  constructor(
    private schemasService: SchemasService,
    private store: Store<ApplicationState>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private adminService: AdminSchemasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
    this.activatedRoute.queryParamMap.subscribe((queries) => {
      const area = +queries.get('area');
      this.setupAreaSelector(area ? area : AreaTypeAll);
    });
    this.gridConfigBase = { ...defaultSchemasListGridSettings, girdSettingKeyName: schemasGridSettingsKey };
  }

  ngOnInit(): void {
    this.savedPaginationSettings = JSON.parse(localStorage.getItem(schemasGridStateKey));
    this.initGridActions();
    if (this.savedPaginationSettings) {
      this.state = {
        skip: this.savedPaginationSettings.skip,
        take: this.savedPaginationSettings.take,
        sort: this.savedPaginationSettings.sort
      };
    } else {
      this.state = {
        skip: this.gridConfigBase.gridSettings.skip,
        take: this.gridConfigBase.gridSettings.pageSize
      };
    }
    this.loadSchemas();
  }

  setupAreaSelector(area: AreaTypeEnum | number): void {
    this.areaType = +area;
    this.areaTypeList = this.adminService.getAreaEnumOptions().map((option) => {
      return {
        key: option.title,
        value: option.id
      };
    });
    this.areaSelectorData = {
      options: this.areaTypeList,
      label: this.ts.instant('Select Area')
    };
  }

  updateRouteQuery(newArea: AreaTypeEnum): void {
    //for better ux, load the correct area on page refresh or when going back
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { area: newArea },
      queryParamsHandling: 'merge'
    });
  }

  async loadSchemas(): Promise<void> {
    try {
      this.isLoading = true;
      const paging: Paging = { skip: this.state?.skip, take: this.state?.take };
      const sort = this.getSortFields();
      const filters: IFilter[] = this.prepareAreatypeFilter();
      const result = await this.schemasService.getAllSchemas(this.tenant, paging, sort, filters);
      result?.items.forEach((x) => {
        x['areaTypeTitle'] = this.getAreatypeTitle(x.areaType);
      });
      this.gridData = {
        data: result?.items || [],
        total: result.total
      };
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.log(error);
    }
  }

  getSortFields(): Sorting[] {
    return this.state?.sort
      ?.filter((x) => !!x.field && !!x.dir)
      .map((x) => {
        return {
          propertyName: x.field,
          sort: toApiSort(x)
        };
      });
  }

  prepareAreatypeFilter(): IFilter[] {
    const areaFilter: IFilter[] = [
      {
        fieldName: 'areaType',
        searchType: SearchType.EqualTo,
        valueType: FieldTypeIds.IntField,
        value: this.areaType
      }
    ];
    return this.areaType !== AreaTypeAll ? areaFilter : [];
  }

  getAreatypeTitle(area: AreaTypeEnum): string {
    const areaTypes = this.adminService.getAreaEnumOptions();
    return areaTypes.find((x) => x.id === area)?.title || '';
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      },
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'trash',
        color: 'warn'
      }
    ];
  }

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case 'delete':
        this.onDelete(actionEvent.raw);
        break;
      case 'edit':
        localStorage.setItem('lastSchemaOpened', actionEvent?.raw?.id);
        this.router.navigate(['..', 'edit', actionEvent.raw?.id], {
          relativeTo: this.activatedRoute,
          queryParams: { area: actionEvent.raw?.areaType },
          queryParamsHandling: 'merge'
        });
        break;
      default:
        break;
    }
  }

  onDelete(dataItem: SchemaDto): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(
        filter((x) => !!x),
        switchMap(async () => {
          const gridData: SchemaDto[] = this.gridData?.data;
          const areaTypeId = gridData?.filter((x) => x.id === dataItem.id)[0]?.areaType;
          try {
            const result = await this.schemasService.deleteById(dataItem.id, this.tenant, areaTypeId);
            if (result?.status?.toString().toLowerCase() === 'success') {
              this.snackBar.open(this.ts.instant('Deleted Successfully'), 'CLOSE', { duration: 2000 });
              this.loadSchemas();
              this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
            }
          } catch (error) {
            this.errorHandlerService.getAndShowErrorMsg(error);
          }
        })
      )
      .subscribe();
  }

  onSortChange(sort: SortDescriptor[]): void {
    this.state.sort = sort;
    this.loadSchemas();
    localStorage.setItem(schemasGridStateKey, JSON.stringify(this.state));
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.router.navigate(['..', 'build'], { relativeTo: this.activatedRoute });
    }
  }

  onAreaChange(area: AreaTypeEnum): void {
    this.setupAreaSelector(area);
    this.updateRouteQuery(area);
    localStorage.removeItem(schemasGridStateKey);
    this.state = {
      ...this.state,
      skip: this.gridConfigBase.gridSettings?.skip,
      take: this.gridConfigBase.gridSettings?.pageSize
    };
    this.loadSchemas();
  }

  onPaginationChange(event: PageChangeEvent): void {
    this.state = { ...this.state, ...event };
    localStorage.setItem(schemasGridStateKey, JSON.stringify(this.state));
    this.loadSchemas();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
