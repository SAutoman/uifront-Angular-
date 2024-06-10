/**
 * Global
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
/**
 * Project
 */
import { ApiClientsListRoute, ApiClientsMainRoute } from '@wfm/api clients/api-clients.constants';
import { SidebarLinksService } from '@wfm/service-layer';
import { CreateApiClient } from '@wfm/service-layer/models/api-clients';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { convertTenantName } from '@wfm/shared/utils';
import { GetApiClients, ResetApiClientOperationMsg } from '@wfm/store/api clients/api-clients-actions';
import { ApiClientState } from '@wfm/store/api clients/api-clients-reducer';
import { apiClientOperationMsgSelector } from '@wfm/store/api clients/api-clients-selector';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
/**
 * Local
 */
@Component({
  selector: 'app-api-client-create',
  templateUrl: './api-client-create.component.html',
  styleUrls: ['./api-client-create.component.scss']
})
export class ApiClientCreateComponent extends TenantComponent implements OnInit {
  apiClientForm: FormGroup;
  loading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private store: Store<ApiClientState>,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private dialog: MatDialog,
    private ts: TranslateService,
    private matDialogRef: MatDialogRef<ApiClientCreateComponent>
  ) {
    super(store);
    this.apiClientForm = this.fb.group({
      name: ['', Validators.required],
      secret: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.store.pipe(select(apiClientOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x?.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.getApiClients();
        this.store.dispatch(new ResetApiClientOperationMsg());
        this.router.navigate([`/${convertTenantName(this.sidebarLinksService.tenantName)}/${ApiClientsMainRoute}/${ApiClientsListRoute}`]);
      }
    });
  }

  isValidForm(): boolean {
    const formValue = this.apiClientForm.value;
    if (!formValue?.name?.trim()?.length || !formValue?.secret?.trim()?.length) return false;
    return true;
  }

  getApiClients(): void {
    this.store.dispatch(new GetApiClients());
  }

  onSave(): void {
    const formValue = this.apiClientForm.value;
    this.showWarning({ name: formValue?.name?.trim(), secret: formValue?.secret?.trim() });
  }

  showWarning(data: CreateApiClient): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: this.ts.instant('Warning'),
        message: this.ts.instant(
          'Make sure you have copy and saved the Secret Key in a separate file as it would not be accessible afterwards'
        ),
        showProceedBtn: true
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.matDialogRef.close(data);
      }
    });
  }
}
