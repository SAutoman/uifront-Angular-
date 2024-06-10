/**
 * global
 */
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { from } from 'rxjs';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { Company, GridConfiguration, CompanyService, companyGridSettings, Paging, MappingsService } from '../../service-layer';
/**
 * local
 */
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { defaultCompanyGridSettings } from '@wfm/shared/default-grid-settings';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { BaseComponent } from '@wfm/shared/base.component';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs/operators';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

@Component({
  selector: 'app-companies-kendo-grid',
  templateUrl: './companies-kendo-grid.component.html',
  styleUrls: ['./companies-kendo-grid.component.scss']
})
export class CompaniesKendoGridComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('companyGrid') grid: WfmGridComponent;
  gridData: GridDataResultEx<Company>;

  companyGridSettingId: string;
  companyGridSettingsConf: GridConfiguration = defaultCompanyGridSettings;
  loading: boolean = true;
  gridActions: GridAction[];

  constructor(
    private companyService: CompanyService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private router: Router,
    private ts: TranslateService,
    private mappingsService: MappingsService
  ) {
    super();
  }

  async ngOnInit() {
    this.initGridActions();
    this.companyGridSettingsConf.girdSettingKeyName = companyGridSettings;
    this.companyGridSettingsConf.gridToolbarSettings.toolbarHidden = false;
  }

  initGridActions(): void {
    this.gridActions = [
      {
        title: 'Delete Company',
        actionId: 'delete',
        icon: 'trash',
        color: 'warn'
      },
      {
        title: 'Edit Company',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      }
    ];
  }

  async loadGridData(paging: Paging) {
    this.loading = true;

    const data = await this.companyService.search(paging);

    this.gridData = {
      data: data.items,
      total: data.total
    };

    this.loading = false;
  }

  async ngAfterViewInit(): Promise<void> {
    const paging = this.grid.gridPaging;
    this.loadGridData(paging);
    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadGridData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  async onSaveGridSettings(): Promise<void> {}

  onActionClick(actionEvent: ActionEvent): void {
    switch (actionEvent.actionId) {
      case 'delete':
        if (actionEvent?.raw?.usersCount === 0) this.onDelete(actionEvent.raw);
        else this.showWarningMessage(actionEvent.raw?.usersCount);
        break;
      case 'edit':
        this.router.navigate([`tenants/companies/edit/${actionEvent.raw.id}`]);
        break;
      default:
        break;
    }
  }

  showWarningMessage(usersCount: number): void {
    this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: `This company can not be deleted, as it has ${usersCount} registered users.`
      }
    });
  }

  /**
   * 1 - to check if supplier/ auditor mapping exists by using the curl provided in the comments.
   * 2 - If no existing mapping, delete directly. If mapping found, show alert before deleting.
   */
  async onDelete(data: any): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) {
          this.checkForMappings(data?.id);
        }
      });
  }

  async checkForMappings(companyId: string): Promise<void> {
    try {
      const result = Promise.all([this.getSupplierMappings(companyId), this.getAuditorMappings(companyId)]);
      result?.then((x) => {
        if (x[0] > 0 || x[1] > 0) {
          this.showExistingMappingWarning(companyId);
        } else {
          this.deleteCompany(companyId);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async getSupplierMappings(companyId: string): Promise<number> {
    try {
      const result = await this.mappingsService.getTenantsWithCompanyMappingForSupplier(companyId);
      return result?.tenantsCount;
    } catch (error) {
      console.log(error);
    }
  }

  async getAuditorMappings(companyId: string): Promise<number> {
    try {
      const result = await this.mappingsService.getTenantsWithCompanyMappingForAuditors(companyId);
      return result?.tenantsCount;
    } catch (error) {
      console.log(error);
    }
  }

  showExistingMappingWarning(companyId: string): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: this.ts.instant(`All existing mappings would be deleted`),
        showProceedBtn: true
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.deleteCompany(companyId);
      }
    });
  }

  deleteCompany(companyId: string): void {
    from(this.companyService.deleteById(companyId)).subscribe((result) => {
      if (result.status.toString().toLowerCase() === 'success')
        this.snackbar.open(this.ts.instant('Company Deleted'), 'OK', { duration: 2000 });
      const paging = this.grid.gridPaging;
      this.loadGridData(paging);
    });
  }

  toCreatePage(value: boolean): void {
    if (value) {
      this.router.navigate([`tenants/companies/create`]);
    }
  }
}
