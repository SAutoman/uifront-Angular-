/**
 * Global
 */
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * Project
 */
import { TenantComponent } from '@wfm/shared/tenant.component';
import { UsersState, UserSubscription } from '@wfm/store/users/users.reducer';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { userSubscriptionOperationMsgSelector, userSubscriptionsList } from '@wfm/store/users/users.selectors';
import { GetUserSubscriptions, ResetSubscriptionOperationMsg, SubscribeUser, UnsubscribeUser } from '@wfm/store';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-notification-topics-setting',
  templateUrl: './notification-topics-setting.component.html',
  styleUrls: ['./notification-topics-setting.component.scss']
})
export class NotificationTopicsSettingComponent extends TenantComponent implements OnInit {
  @Input() userId: string;
  loading$: Observable<boolean>;
  userSubscriptions: UserSubscription[];

  constructor(private store: Store<UsersState>, private dialog: MatDialog, private snackbar: MatSnackBar) {
    super(store);
    this.store.pipe(select(userSubscriptionOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetSubscriptionOperationMsg());
        this.store.dispatch(new GetUserSubscriptions(this.tenant));
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetSubscriptionOperationMsg());
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(new GetUserSubscriptions(this.tenant));
    this.store.pipe(select(userSubscriptionsList), takeUntil(this.destroyed$)).subscribe((x) => {
      this.userSubscriptions = x;
    });
  }

  toggleSubscription(event: MatSlideToggleChange, userSubscription: UserSubscription) {
    if (!userSubscription.subscribed) {
      this.subscribeUser(userSubscription.id);
    } else {
      this.confirmUnsubscribe(userSubscription.id, event);
    }
  }

  confirmUnsubscribe(id: string, event: MatSlideToggleChange): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Warning',
        message: 'Are you sure you want to unsubscribe?',
        showProceedBtn: true
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.removeSubscription(id);
      else event.source.checked = true;
    });
  }

  removeSubscription(topicId: string): void {
    this.store.dispatch(new UnsubscribeUser({ id: topicId, tenantId: this.tenant, userId: this.userId }));
  }

  subscribeUser(topicId: string): void {
    this.store.dispatch(new SubscribeUser({ topicId: topicId, tenantId: this.tenant, userId: this.userId }));
  }
}
