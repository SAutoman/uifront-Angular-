import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { TenantsSettingsComponent } from './tenants-settings/tenants-settings.component';

@Injectable({
  providedIn: 'root'
})
export class TenantSettingsDeactivateGuard implements CanDeactivate<TenantsSettingsComponent> {
  constructor(private dialog: MatDialog) {}

  async canDeactivate(component: TenantsSettingsComponent) {
    if (
      component.isSchemaCreationInvalid ||
      component.isTenantSettingsCardDirty ||
      component.isThemeApplicationHasChanges ||
      component.isProcessStepNameFormatHasChanges ||
      component.searchTimePeriodHasChanges ||
      component.startOfWeekHasChanges ||
      component.caseGroupSettingHasChanges
    ) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{
          title: 'Alert',
          message: unsavedDataWarningMessage,
          showProceedBtn: true
        }
      });
      return await dialogRef.afterClosed().toPromise();
    }
    return true;
  }
}
