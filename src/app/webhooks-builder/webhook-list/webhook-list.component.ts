/**
 *  Global
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';
/**
 * Project
 */
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration, StatePersistingService } from '@wfm/service-layer';
import { defaultWebHooksGridSettings } from '@wfm/shared/default-grid-settings';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
import { DeleteWebHook, GetWebHooks, ResetWebHookOperationMsg } from '@wfm/store/webhooks-builder/webhooks-builder-actions';
import { WebHookBuilderState } from '@wfm/store/webhooks-builder/webhooks-builder-reducer';
import {
  webHooksListSelector,
  webHooksLoadingSelector,
  webHooksOperationMsgSelector
} from '@wfm/store/webhooks-builder/webhooks-builder-selector';
import { WebhooksBuilderMainRoute, WebhooksEditRoute } from '../webhook-builder-constants';
import { convertTenantName } from '@wfm/shared/utils';
import { tenantNameKey } from '@wfm/store';

@Component({
  selector: 'app-webhook-list',
  templateUrl: './webhook-list.component.html',
  styleUrls: ['./webhook-list.component.scss']
})
export class WebhookListComponent extends TenantComponent implements OnInit {
  @ViewChild('webHooks') grid: WfmGridComponent;
  webHookGridSettings: GridConfiguration = defaultWebHooksGridSettings;

  gridData: GridDataResultEx<any>;
  gridActions: GridAction[];
  loading$: Observable<boolean>;

  constructor(
    private store: Store<WebHookBuilderState>,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router,
    private statePersistingService: StatePersistingService,
    private ts: TranslateService
  ) {
    super(store);

    this.loading$ = this.store.pipe(select(webHooksLoadingSelector), takeUntil(this.destroyed$));

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

    this.getWebHooks();
  }

  getWebHooks(): void {
    this.store.dispatch(
      new GetWebHooks({
        data: {
          paging: { skip: 0, take: 9999 }
        }
      })
    );
  }

  ngOnInit(): void {
    this.store.pipe(select(webHooksListSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.gridData = {
          data: x,
          total: x.length
        };
      }
    });

    this.store.pipe(select(webHooksOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        if (x.toLowerCase().includes('success')) {
          this.snackbar.open(this.ts.instant('Deleted'), 'Ok', { duration: 2000 });
          this.getWebHooks();
        }
        this.store.dispatch(new ResetWebHookOperationMsg());
      }
    });
  }

  onActionClick(event: ActionEvent): void {
    switch (event.actionId) {
      case 'edit':
        const tenantName: string = this.statePersistingService.get(tenantNameKey);
        this.router.navigateByUrl(convertTenantName(tenantName) + `/${WebhooksBuilderMainRoute}/${WebhooksEditRoute}/${event.raw?.id}`);
        break;
      case 'delete':
        this.confirmDelete(event.raw?.id);
        break;
      default:
        break;
    }
  }

  confirmDelete(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.deleteWebHook(id);
    });
  }

  deleteWebHook(id: string): void {
    this.store.dispatch(new DeleteWebHook({ id: id }));
  }

  toCreatePage(value: boolean): void {
    if (value) {
      const tenantName: string = this.statePersistingService.get(tenantNameKey);
      this.router.navigateByUrl(convertTenantName(tenantName) + `/${WebhooksBuilderMainRoute}/create`);
    }
  }
}
