import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration } from '@wfm/service-layer/models/grid-settings';
import { NotificationTemplateDto } from '@wfm/service-layer/models/notificationTemplate';
import { StatePersistingService } from '@wfm/service-layer/services/state-persisting.service';
import { defaultNotificationTemplatesGridSettings } from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { convertTenantName } from '@wfm/shared/utils';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { tenantNameKey } from '@wfm/store';
import {
  NotificationBuilderState,
  nfBuilderLoadingSelector,
  nfTemplatesSelector,
  GetNotificationTemplates,
  nfTemplateMessageSelector,
  ResetNfTemplateOperationMessage,
  DeleteNotificationTemplate
} from '@wfm/store/notification-builder';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationBuilderMainRoute, NotificationTemplatesRoute } from '../notification-builder-constants';

@Component({
  selector: 'app-templates-list',
  templateUrl: './templates-list.component.html',
  styleUrls: ['./templates-list.component.scss']
})
export class TemplatesListComponent extends TenantComponent implements OnInit {
  @ViewChild('notificationTopics') grid: WfmGridComponent;
  notificationTemplatesGridSettings: GridConfiguration = defaultNotificationTemplatesGridSettings;

  gridData: GridDataResultEx<NotificationTemplateDto>;
  gridActions: GridAction[];
  loading$: Observable<boolean>;

  constructor(
    private store: Store<NotificationBuilderState>,
    private router: Router,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private statePersistingService: StatePersistingService
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
    this.store.dispatch(new GetNotificationTemplates({ data: { paging: { skip: 0, take: 9999 } } }));
  }

  ngOnInit(): void {
    this.store.pipe(select(nfTemplatesSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.gridData = {
          data: x,
          total: x.length
        };
      }
    });
    this.store.pipe(select(nfTemplateMessageSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 2000 });
        this.store.dispatch(new GetNotificationTemplates({ data: { paging: { skip: 0, take: 9999 } } }));
        this.store.dispatch(new ResetNfTemplateOperationMessage());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.snackbar.open(x, 'Ok', { duration: 2000 });
        this.store.dispatch(new ResetNfTemplateOperationMessage());
      }
    });
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        const tenantName: string = this.statePersistingService.get(tenantNameKey);
        this.router.navigateByUrl(
          convertTenantName(tenantName) + `/${NotificationBuilderMainRoute}/${NotificationTemplatesRoute}/edit/${event.raw?.id}`
        );
        break;
      case 'delete':
        this.openConfirmation(event.raw?.id);
        break;
      default:
        break;
    }
  }

  openConfirmation(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.deleteNotificationTemplate(id);
    });
  }

  async deleteNotificationTemplate(id: string): Promise<void> {
    this.store.dispatch(new DeleteNotificationTemplate({ id: id }));
  }

  toCreatePage(value: boolean): void {
    if (value) {
      const tenantName: string = this.statePersistingService.get(tenantNameKey);
      this.router.navigateByUrl(convertTenantName(tenantName) + `/${NotificationBuilderMainRoute}/${NotificationTemplatesRoute}/create`);
    }
  }
}
