import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { Subject } from 'rxjs';
/**
 * Global
 */
import { GridConfiguration, PagedData, Paging, User, UsersService } from '@wfm/service-layer';
import { CaseEmailAuditService } from '@wfm/service-layer/services/case-email-audit.service';
import { NotificationTopicDto, NotificationTopicService } from '@wfm/service-layer/services/notification-topic.service';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { defaultEmailAuditGridSettings } from '@wfm/shared/default-grid-settings';
import { EmailAuditFilterData, EmailAuditFiltersComponent } from '@wfm/shared/email-audit-filters/email-audit-filters.component';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { ApplicationState } from '@wfm/store';
import { RawDataEmailAuditService } from '@wfm/service-layer/services/raw-data-email-audit.service';
import { convertRole } from '@wfm/shared/utils';
/**
 * Project
 */
import {
  CaseEmailAuditViewModel,
  emailAuditGridSettings,
  EmailAuditListPageViewModel,
  EmailAuditSearch,
  RawDataEmailAuditViewModel
} from './email-audit.view-models';
/**
 * Local
 */

@Component({
  templateUrl: './email-audit.component.html',
  styleUrls: ['./email-audit.component.scss']
})
export class EmailAuditComponent extends TenantComponent implements OnInit, AfterViewInit {
  model: EmailAuditListPageViewModel;

  emailAuditGridSettingId: string;
  emailAuditGridSettingsConf: GridConfiguration = defaultEmailAuditGridSettings;
  loading: boolean = true;
  @ViewChild('emailAuditGrid') grid: WfmGridComponent;
  header: string = 'Email Audit';
  gridData: GridDataResultEx<CaseEmailAuditViewModel | RawDataEmailAuditViewModel>;
  tenantUsers: User[];
  notificationTopics: NotificationTopicDto[];
  emailAuditSearchQuery: EmailAuditSearch;
  protected destroyed$: Subject<any>;
  componentId: string;
  emailAuditArea: string;

  constructor(
    private caseEailAuditService: CaseEmailAuditService,
    store: Store<ApplicationState>,
    private usersService: UsersService,
    private notificationTopicService: NotificationTopicService,
    private dialog: MatDialog,
    private route: Router,
    private rawDataEmailAuditService: RawDataEmailAuditService
  ) {
    super(store);
    this.emailAuditSearchQuery = {
      from: null,
      to: null
    };
  }

  async ngOnInit(): Promise<void> {
    this.emailAuditGridSettingsConf.girdSettingKeyName = emailAuditGridSettings;
    this.emailAuditGridSettingsConf.gridToolbarSettings.toolbarHidden = false;
    await this.loadTenantUsers();
  }

  async ngAfterViewInit() {
    await this.getNotificationTopics();
    this.emailAuditArea = this.route.url.slice(this.route.url.lastIndexOf('/') + 1, this.route.url.length);
    const paging: Paging = {
      skip: this.emailAuditGridSettingsConf?.gridSettings?.skip,
      take: this.emailAuditGridSettingsConf?.gridSettings?.pageSize
    };
    await this.preparePayloadAndLoadData(paging);
  }

  async loadTenantUsers(): Promise<void> {
    try {
      this.tenantUsers = (await this.usersService.searchByTenant(this.tenant, { skip: 0, take: 9999 })).items || [];
    } catch (error) {
      console.log(error);
    }
  }

  async getNotificationTopics(): Promise<void> {
    try {
      this.notificationTopics =
        (
          await this.notificationTopicService.search(this.tenant, {
            paging: { skip: 0, take: 9999 }
          })
        ).items || [];
    } catch (error) {
      console.log(error);
    }
  }

  async preparePayloadAndLoadData(paging: Paging): Promise<void> {
    const payloadData = {
      from: this.emailAuditSearchQuery?.from?.toISOString() || null,
      to: this.emailAuditSearchQuery?.to?.toISOString() || null,
      notificationTopicIds: this.emailAuditSearchQuery.notificationTopics || [],
      userIds: this.emailAuditSearchQuery.users || [],
      paging: paging
    };
    this.loadData(payloadData);
  }

  async loadData(payload): Promise<void> {
    let emailAuditData: PagedData<CaseEmailAuditViewModel | RawDataEmailAuditViewModel>;
    switch (this.emailAuditArea) {
      case 'raw-data':
        emailAuditData = await this.rawDataEmailAuditService.searchEmailAudits(this.tenant, payload);
        break;
      case 'cases':
        emailAuditData = await this.caseEailAuditService.searchEmailAudits(this.tenant, payload);
        break;
      default:
        break;
    }
    try {
      const notificationTopicsMap = this.notificationTopics?.reduce(
        (obj, cur) => ({
          ...obj,
          [cur.id]: cur.name
        }),
        {}
      );
      emailAuditData?.items.forEach((item) => {
        item['from'] = item.emailAudit?.from || null;
        item['to'] = item.emailAudit?.to || null;
        item['cc'] = item.emailAudit?.cc || null;
        item['corelationId'] = item.emailAudit?.corelationId;
        item.createdAt = this.getFormattedDate(item.emailAudit?.createdAt);
        item['topicName'] = notificationTopicsMap[item?.notificationTopicId] ? notificationTopicsMap[item?.notificationTopicId] : '';
        item.role = convertRole(item?.userRole);
      });
      this.gridData = {
        data: emailAuditData.items,
        total: emailAuditData.total
      };
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  }

  addFilters(): void {
    const searchQuery = Object.assign({}, this.emailAuditSearchQuery);
    const dialogRef = this.dialog.open(EmailAuditFiltersComponent, {
      data: <EmailAuditFilterData>{
        filters: searchQuery,
        tenantUsersList: this.tenantUsers || [],
        notificationTopics: this.notificationTopics || []
      }
    });
    dialogRef.afterClosed().subscribe(async (filters: EmailAuditSearch) => {
      if (filters) {
        this.emailAuditSearchQuery = filters;
        await this.preparePayloadAndLoadData({ skip: 0, take: 10 });
      }
    });
  }

  onOpenFilters(open: boolean): void {
    if (open) {
      this.addFilters();
    }
  }

  getFormattedDate(date: string): string {
    return DateTimeFormatHelper.formatDateTime(date);
  }

  async onPaginationChange(event: PageChangeEvent): Promise<void> {
    await this.preparePayloadAndLoadData(event);
    this.grid.grid.skip = (<PageChangeEvent>event).skip;
  }
}
