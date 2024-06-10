/**
 * global
 */
import { OnInit, Component, ChangeDetectorRef, ElementRef, HostListener } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * project
 */

import { AllowedGridOperations, AreaTypeEnum, FieldTypeIds, SchemaDto, SchemaFieldDto } from '@wfm/service-layer';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { rawDataMenuItemsSelector, rawDataSelectedSchemaIdSelector, SetSelectedRawDataSchema } from '@wfm/store';
import { SetSelectedReport, SetSelectedWorkflow } from '@wfm/store/workflow';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

/**
 * local
 */

@Component({
  selector: 'app-raw-data-grid',
  templateUrl: './raw-data-grid.component.html',
  styleUrls: ['./raw-data-grid.component.scss']
})
export class RawDataGridComponent extends TenantComponent implements OnInit {
  isMobile: boolean;
  mainPanelWidth: number;
  get areaType() {
    return AreaTypeEnum;
  }

  componentId = 'ee532569-c6f9-4ab0-b6db-97440909397c';
  schemaId: string;
  rawDataSchema: SchemaDto;

  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'Raw Data' } as AppBarData;
  schemaIdFromParams: string;

  allowedGridOperations: AllowedGridOperations = {
    actionsColumn: true,
    menuColumn: true,
    exportActions: true,
    infoColumn: true,
    layoutActions: true,
    crudOperations: true,
    allowSharing: true,
    allowSearching: true,
    enableMasterDetail: false,
    enableGrouping: true
  };
  allRawDataSchemas: SchemaDto[] = [];

  @HostListener('window:resize', ['$event']) onResize() {
    this.getPanelWidth();
  }

  constructor(
    private store: Store<ApplicationState>,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private adminSchemaService: AdminSchemasService,
    public breakpointObserver: BreakpointObserver,
    private el: ElementRef
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.sharedService.setAppBarData(this.appBarData);
  }

  ngOnInit(): void {
    this.store
      .pipe(
        select(rawDataMenuItemsSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((allSchemas) => {
        this.allRawDataSchemas = allSchemas.map((item) => {
          return item.setting;
        });
        this.checkRoute();
      });

    this.showNotification();
    this.subscribeToRawDataSchemaSelection();
  }

  subscribeToRawDataSchemaSelection(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(rawDataSelectedSchemaIdSelector)).subscribe((selectedSchemaId) => {
      if (selectedSchemaId && this.schemaIdFromParams) {
        // to ensure that dynamic-entity-grid component does not render too early
        this.schemaId = selectedSchemaId;
        this.getNestedRawDataFields();
        this.cd.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    this.breakpointObserver
      .observe(['(max-width:660px)'])
      .pipe(debounceTime(100), takeUntil(this.destroyed$))
      .subscribe((state: BreakpointState) => {
        if (state.matches === true) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
          this.mainPanelWidth = this.el.nativeElement.offsetWidth;
        }
      });
  }

  /**
   * it is possible we may have rawData reference in a parent rawData
   */
  async getNestedRawDataFields(): Promise<void> {
    this.rawDataSchema = await this.adminSchemaService.getSchema(this.tenant, AreaTypeEnum.rawData, this.schemaId);

    const nestedRawDataFields =
      this.rawDataSchema?.fields?.filter((field) => {
        return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
      }) || [];

    if (nestedRawDataFields.length) {
      this.allowedGridOperations.enableMasterDetail = true;
    } else {
      this.allowedGridOperations.enableMasterDetail = false;
    }
  }

  checkRoute(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe((paramsMap) => {
      this.schemaIdFromParams = paramsMap['rawDataSchemaId'];
      if (!this.schemaIdFromParams) {
        this.addRawDataIdParam();
      } else if (this.schemaId !== this.schemaIdFromParams) {
        this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: this.schemaIdFromParams }));
        this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: null }));
        this.store.dispatch(new SetSelectedReport({ selectedReport: null }));
      }
    });
  }

  addRawDataIdParam(): void {
    if (this.allRawDataSchemas.length) {
      this.router.navigate([this.allRawDataSchemas[0]?.id], { relativeTo: this.activatedRoute });
    }
  }

  showNotification(): void {
    this.sharedService.setNotificationMessage(
      'Select all items with the same supply chain and open a new case.',
      '357b901a-f796-45e1-bf5e-355a7ac3057b',
      'info'
    );
  }

  getPanelWidth(): void {
    this.mainPanelWidth = this.el.nativeElement.offsetWidth;
  }
}
