import { Component, Input, OnInit } from '@angular/core';

import { EmailAuditViewModel } from '@wfm/email-audit/email-audit/email-audit.view-models';
import { AreaTypeEnum } from '@wfm/service-layer';
import { CaseEmailAuditService } from '@wfm/service-layer/services/case-email-audit.service';
import { RawDataEmailAuditService } from '@wfm/service-layer/services/raw-data-email-audit.service';

import DateTimeFormatHelper from '../dateTimeFormatHelper';

interface NotificationLog extends EmailAuditViewModel {
  createDateTime: string;
}
@Component({
  selector: 'app-notification-logs',
  templateUrl: './notification-logs.component.html',
  styleUrls: ['./notification-logs.component.scss']
})
export class NotificationLogsComponent implements OnInit {
  @Input() dynamicEntityId: string;
  @Input() areaType: AreaTypeEnum;
  @Input() tenantId: string;
  notificationIds: string[];
  notifications: NotificationLog[];
  isLoading: boolean;
  userDateTimeFormat: string;

  constructor(private rawDataEmailAuditService: RawDataEmailAuditService, private caseEmailAuditService: CaseEmailAuditService) {}

  ngOnInit() {
    this.getNotifications();
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  async getNotifications(): Promise<void> {
    let notifications: EmailAuditViewModel[] = [];
    try {
      this.isLoading = true;
      if (this.areaType === AreaTypeEnum.rawData) {
        notifications = await this.rawDataEmailAuditService.getAllEmailAuditsByRawDataId(this.tenantId, this.dynamicEntityId);
      } else {
        notifications = await this.caseEmailAuditService.getAllEmailAuditsByCaseId(this.tenantId, this.dynamicEntityId);
      }
      this.mapForUi(notifications);
      this.isLoading = false;
    } catch (error) {
      console.log(error);
      this.isLoading = false;
    }
  }

  mapForUi(notifications: EmailAuditViewModel[]): void {
    this.notifications = notifications.map((notification) => {
      return {
        ...notification,
        createDateTime: DateTimeFormatHelper.formatDateTime(notification.createdAt)
      };
    });
  }
}
