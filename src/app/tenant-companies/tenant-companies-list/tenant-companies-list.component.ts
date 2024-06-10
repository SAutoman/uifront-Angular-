import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { Company, CompanyService, GridConfiguration, Paging, TenantCompaniesWithUsers, User } from '@wfm/service-layer';
import { defaultTenantCompanyGridSettings, defaultTenantCompanyUsersGridSettings } from '@wfm/shared/default-grid-settings';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { ApplicationState } from '@wfm/store';

@Component({
  selector: 'app-tenant-companies-list',
  templateUrl: './tenant-companies-list.component.html',
  styleUrls: ['./tenant-companies-list.component.scss']
})
export class TenantCompaniesListComponent extends TenantComponent implements OnInit, AfterViewInit {
  @ViewChild('companiesTenantGrid') grid: WfmGridComponent;

  companiesGridSettingConfig: GridConfiguration = defaultTenantCompanyGridSettings;
  usersGridSettingsConf: GridConfiguration = defaultTenantCompanyUsersGridSettings;
  header: string = 'Email Audit';
  gridData: GridDataResultEx<TenantCompaniesWithUsers>;
  usersList: GridDataResultEx<User>;

  constructor(private store: Store<ApplicationState>, private companyService: CompanyService) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    const paging: Paging = { skip: 0, take: this.companiesGridSettingConfig.gridSettings.pageSize };
    this.loadData(paging);
  }

  async loadData(paging: Paging): Promise<void> {
    try {
      const result = await this.companyService.getTenantCompanies(this.tenant, paging);
      this.gridData = {
        data: result.items,
        total: result?.total || 0
      };
    } catch (error) {
      console.log(error);
    }
  }

  ngAfterViewInit(): void {
    this.grid.grid.detailExpand.subscribe((x) => {
      this.usersList = { data: [], total: 0 };
      this.getUsersByCompanyId(x?.dataItem?.users);
    });
    this.grid.paginationChange.subscribe((x) => {
      this.loadData(x);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  async getUsersByCompanyId(users: User[]): Promise<void> {
    try {
      this.usersList = {
        data: users || [],
        total: users?.length || 0
      };
    } catch (error) {
      console.log(error);
    }
  }
}
