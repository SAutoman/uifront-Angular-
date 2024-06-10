/**
 * global
 */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * project
 */
import { AreaTypeEnum, Company, FieldTypeIds, GridConfiguration, IFilter } from '../../service-layer';
import { WfmGridComponent } from '../../shared/wfm-grid/wfm-grid.component';
import { defaultMappingsGridSettings } from '../../shared/default-grid-settings';

import {
  LoadSuppliers,
  DeleteSupplier,
  LoadAuditors,
  DeleteAuditor,
  LoadMappingsPayload,
  getAllMappingDataSelector,
  MappingsState,
  CompanyState,
  AuthState,
  currentTenantName,
  mappingsOperationMsgSelector,
  ResetMappingsOperationMsg,
  ReapplyAllMappingsSuppliers,
  ReapplyAllMappingsAuditors,
  tenantCompaniesSelector,
  GetTenantMappingCompanies
} from '../../store';

import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { TenantComponent } from '@wfm/shared/tenant.component';

/**
 * local
 */
import { MappingViewModel } from './mapping.view-model';
import { MappingListPageViewModel, MappingsGridActions } from './mapping-list-page.view-model';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { MappingDto, MappingDtoUi } from '@wfm/service-layer/models/mappings';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { MappingManualTriggerComponent } from '../mapping-manual-trigger/mapping-manual-trigger.component';
import { SchemaDto, SchemasService } from '../../service-layer';

@Component({
  selector: 'app-mappings',
  templateUrl: './mappings.component.html',
  styleUrls: ['./mappings.component.scss']
})
export class MappingsComponent extends TenantComponent implements OnInit, AfterViewInit {
  mappingAreaType: AreaTypeEnum;
  mappingAreaName: string;
  mappingFilters: IFilter[];
  model: MappingListPageViewModel;
  @ViewChild('mappingsGrid') grid: WfmGridComponent;
  mappingsGridSettingId: string;
  mappingsGridSettingsConf: GridConfiguration = defaultMappingsGridSettings;
  header: string;
  mappingType: string;
  companies: Company[];
  schemas: SchemaDto[];
  tenantName: string;
  appBarData: AppBarData = {} as AppBarData;
  componentId = 'd7391902-c348-4e51-b403-163f668becf1';
  gridActions: GridAction[];
  addAggregate$: BehaviorSubject<string> = new BehaviorSubject(null);
  title: string;
  constructor(
    private store: Store<MappingsState>,
    private companyStore: Store<CompanyState>,
    private authStateStore: Store<AuthState>,
    private dialog: MatDialog,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private snackbar: MatSnackBar,
    private ts: TranslateService,
    private schemasService: SchemasService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.mappingAreaType = this.getMappingTypeFromUrl();
    this.mappingFilters = [
      {
        fieldName: 'areaType',
        searchType: SearchType.EqualTo,
        valueType: FieldTypeIds.IntField,
        value: this.mappingAreaType
      }
    ];

    this.mappingAreaName = this.mappingAreaType === AreaTypeEnum.rawData ? 'Raw Data' : 'Cases';
    this.initGridActions();
    this.header = this.route.url.includes('auditors') ? 'Auditor' : 'Supplier';
    this.setTitle();
    this.mappingType = this.route.url.includes('supplier') ? 'suppliers' : 'auditors';
    this.appBarData.title = `${this.header} Mappings For ${this.mappingAreaName}`;
    this.sharedService.setAppBarData(this.appBarData);

    this.companyStore.pipe(takeUntil(this.destroyed$), select(tenantCompaniesSelector)).subscribe((result) => {
      if (result?.length) {
        this.companies = result;
        if (this.companies?.length > 0) this.loadGridData();
      } else this.companyStore.dispatch(new GetTenantMappingCompanies({ tenantId: this.tenant }));
    });

    this.authStateStore.pipe(takeUntil(this.destroyed$), select(currentTenantName)).subscribe((tenantName) => {
      if (tenantName) {
        this.tenantName = tenantName;
      }
    });

    await this.initSchemas();

    this.loadGridData();
    this.listenForOperationStatus();
  }

  async initSchemas(): Promise<void> {
    this.schemas = (await this.schemasService.search(this.tenant, this.mappingAreaType, { skip: 0, take: 999 }))?.items;
  }

  setTitle(): void {
    this.title = `${this.header} Mappings For ${this.mappingAreaName}`;
  }

  listenForOperationStatus(): void {
    this.store.pipe(select(mappingsOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x?.toLowerCase()?.includes('success')) {
        this.snackbar.open(this.ts.instant(x), 'Ok', { duration: 2000 });
        const paging = this.grid.gridPaging;
        this.store.dispatch(new ResetMappingsOperationMsg());
        this.loadData(paging);
      } else if (x && x?.toLowerCase()?.includes('fail')) {
        this.store.dispatch(new ResetMappingsOperationMsg());
      }
    });
  }

  getMappingTypeFromUrl(): AreaTypeEnum {
    return this.route.url.includes('case') ? AreaTypeEnum.case : AreaTypeEnum.rawData;
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Delete Mapping',
        actionId: MappingsGridActions.DELETE,
        icon: 'trash',
        color: 'warn',
        hideTitle: true
      },
      {
        title: 'Edit Mapping',
        actionId: MappingsGridActions.EDIT,
        icon: 'edit',
        color: 'primary',
        hideTitle: true
      },
      {
        title: 'Reapply Mapping',
        actionId: MappingsGridActions.APPLY,
        icon: 'refresh-layout',
        color: 'primary',
        hideTitle: true
      }
    ];
  }

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case MappingsGridActions.DELETE:
        this.onDelete(<MappingDto>actionEvent.raw);
        break;
      case MappingsGridActions.EDIT:
        this.route.navigate(['edit', actionEvent.raw?.id], {
          relativeTo: this.activatedRoute
        });
        break;
      case MappingsGridActions.APPLY:
        this.openMappingManualRunner(<MappingDto>actionEvent.raw);
        break;
      case MappingsGridActions.ReApply_ALL_Mappings:
        this.confirmReapplyAllMappings();
      default:
        break;
    }
  }

  confirmReapplyAllMappings(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) {
          if (this.mappingType === 'suppliers') this.reapplySuppliersMappings();
          else this.reapplyAuditorsMappings();
        }
      });
  }

  reapplySuppliersMappings(): void {
    this.store.dispatch(new ReapplyAllMappingsSuppliers({ areaType: this.mappingAreaType, tenantId: this.tenant }));
  }

  reapplyAuditorsMappings(): void {
    this.store.dispatch(new ReapplyAllMappingsAuditors({ areaType: this.mappingAreaType, tenantId: this.tenant }));
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.route.navigate(['..', `${this.mappingType}`, 'create'], {
        relativeTo: this.activatedRoute
      });
    }
  }

  async ngAfterViewInit(): Promise<void> {
    const paging = this.grid.gridPaging;
    this.loadData(paging);
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  loadData(paging): void {
    // const paging = <Paging>{ skip: this.model.paging.skip, take: this.model.paging.take };

    if (this.route.url.includes('suppliers')) {
      this.store.dispatch(
        new LoadSuppliers(<LoadMappingsPayload>{
          tenantId: this.tenant,
          paging,
          filters: this.mappingFilters
        })
      );
    } else if (this.route.url.includes('auditors')) {
      this.store.dispatch(
        new LoadAuditors(<LoadMappingsPayload>{
          tenantId: this.tenant,
          paging,
          filters: this.mappingFilters
        })
      );
    }

    this.loadGridData();
  }

  loadGridData() {
    this.store.pipe(takeUntil(this.destroyed$), select(getAllMappingDataSelector)).subscribe((result) => {
      if (result) {
        this.model = cloneDeep(result.mappingListPageViewModel);

        if (this.model.gridData.total) {
          this.model = this.mapTenantAndCompany(this.model);
        }
      }
    });
  }

  mapTenantAndCompany(mappingListPageViewModel: MappingListPageViewModel): MappingListPageViewModel {
    const gridData = cloneDeep(mappingListPageViewModel.gridData);
    gridData.data.forEach((row: MappingDtoUi) => {
      if (this.companies?.length > 0) {
        const company = this.companies.find((c) => c.id === row.companyId);
        if (this.schemas) {
          const mappingSchema = this.schemas.find((schema) => schema.id === row.schemaId);
          row.schemaName = mappingSchema.name;
        }

        row.companyName = company?.name || '';
        row.tenantName = this.tenantName;
        row.filters = JSON.stringify(row.searchMask?.filters || '');
      }
    });

    mappingListPageViewModel = {
      ...mappingListPageViewModel,
      gridData: gridData
    };
    return mappingListPageViewModel;
  }

  onSaveGridSettings(): void {}

  onDelete(mappingViewModel: MappingViewModel): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        if (this.route.url.includes('suppliers')) {
          this.store.dispatch(new DeleteSupplier({ tenantId: this.tenant, id: mappingViewModel.id }));
        } else if (this.route.url.includes('auditors')) {
          this.store.dispatch(new DeleteAuditor({ tenantId: this.tenant, id: mappingViewModel.id }));
        }
      }
    });
  }

  onSortChange(sort: SortDescriptor[]): void {
    // TODO:
  }

  openMappingManualRunner(mapping: MappingDto): void {
    const dialogRef = this.dialog.open(MappingManualTriggerComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.mapping = cloneDeep(mapping);
  }

  addAggregate(): void {
    this.addAggregate$.next(`${Math.round(Math.random() * 100)}`);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
