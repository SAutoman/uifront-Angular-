import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { NotificationsTriggerService } from '@wfm/service-layer/services/notifications-trigger.service';
import { TenantComponent } from '@wfm/shared/tenant.component';

@Component({
  selector: 'app-notification-settings',
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.scss']
})
export class NotificationSettingsComponent extends TenantComponent implements OnInit {
  loading: boolean;

  constructor(
    store: Store<any>,
    private nfTriggerService: NotificationsTriggerService,
    private snackbar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  ngOnInit(): void {}

  async triggerNotification(): Promise<void> {
    this.loading = true;
    try {
      await this.nfTriggerService.triggerSendingNotifications(this.tenant);
      this.loading = false;
      this.snackbar.open('Operation completed successfully', 'Ok', { duration: 2000 });
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      this.loading = false;
    }
  }
}
