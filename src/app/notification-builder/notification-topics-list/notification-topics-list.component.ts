/**
 * Global
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Project
 */
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { Roles, StatePersistingService } from '@wfm/service-layer';
import { GridConfiguration } from '@wfm/service-layer/models/grid-settings';
import { NotificationTopicDto } from '@wfm/service-layer/services/notification-topic.service';
import { defaultNotificationTopicsGridSettings } from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { convertTenantName } from '@wfm/shared/utils';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import {
  DeleteNotificationTopic,
  GetNotificationTopics,
  nfBuilderLoadingSelector,
  nfTopicMessageSelector,
  nfTopicsSelector,
  NotificationBuilderState,
  ResetNfTopicOperationMessage,
  TriggerNotificationTopic
} from '@wfm/store/notification-builder';

/**
 * Local
 */
import { NotificationBuilderMainRoute, NotificationTopicRoute } from '../notification-builder-constants';
import { topicKinds } from '../notification-builder-settings/notification-builder-settings.component';
import { isSuperAdminSelector, tenantNameKey } from '@wfm/store';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notification-topics-list',
  templateUrl: './notification-topics-list.component.html',
  styleUrls: ['./notification-topics-list.component.scss']
})
export class NotificationTopicsListComponent extends TenantComponent implements OnInit {
  @ViewChild('notificationTopics') grid: WfmGridComponent;
  notificationTopicsGridSettings: GridConfiguration = defaultNotificationTopicsGridSettings;

  gridData: GridDataResultEx<NotificationTopicDto>;
  gridActions: GridAction[];
  loading$: Observable<boolean>;

  constructor(
    private store: Store<NotificationBuilderState>,
    private router: Router,
    private statePersistingService: StatePersistingService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private ts: TranslateService
  ) {
    super(store);
    this.loading$ = this.store.pipe(select(nfBuilderLoadingSelector), takeUntil(this.destroyed$));

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
        icon: 'delete',
        color: 'warn'
      }
    ];

    this.store.pipe(select(isSuperAdminSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.gridActions.push({
          title: 'Trigger notification topic',
          actionId: 'trigger',
          icon: 'notifications',
          color: 'primary'
        });
      }
    });
  }

  ngOnInit(): void {
    this.getNotificationTopics();
    this.store.pipe(select(nfTopicsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        const data = cloneDeep(x);
        data.forEach((item) => {
          item.notificationTopic = topicKinds.filter((x) => item.topicKind === x.value)[0].label;
          const roles = item.roles.map((role) => {
            return Roles[role];
          });
          item.userRoles = roles?.length > 1 ? roles.join(', ') : roles[0];
        });
        this.gridData = {
          data: data,
          total: x.length
        };
      }
    });

    this.store.pipe(select(nfTopicMessageSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        if (x && x.toLowerCase().includes('success')) {
          this.snackbar.open(x, this.ts.instant('Ok'), { duration: 2000 });
          this.getNotificationTopics();
        } else this.snackbar.open(x, this.ts.instant('Ok'), { duration: 2000 });
        this.store.dispatch(new ResetNfTopicOperationMessage());
      }
    });
  }

  async getNotificationTopics(): Promise<void> {
    this.store.dispatch(new GetNotificationTopics({ data: { skip: 0, take: 9999 } }));
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        const tenantName: string = this.statePersistingService.get(tenantNameKey);
        this.router.navigateByUrl(
          convertTenantName(tenantName) + `/${NotificationBuilderMainRoute}/${NotificationTopicRoute}/edit/${event.raw?.id}`
        );
        break;
      case 'delete':
        this.openConfirmation(event.raw?.id);
        break;
      case 'trigger':
        this.triggerNotificationTopic(event.raw?.id);
        break;
      default:
        break;
    }
  }

  openConfirmation(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.deleteNotificationTopic(id);
    });
  }

  async deleteNotificationTopic(id: string): Promise<void> {
    this.store.dispatch(new DeleteNotificationTopic({ id: id }));
  }

  triggerNotificationTopic(topicId: string): void {
    this.store.dispatch(new TriggerNotificationTopic({ topicId: topicId }));
  }

  toCreatePage(value: boolean): void {
    if (value) {
      const tenantName: string = this.statePersistingService.get(tenantNameKey);
      this.router.navigateByUrl(convertTenantName(tenantName) + `/${NotificationBuilderMainRoute}/${NotificationTopicRoute}/create`);
    }
  }
}
