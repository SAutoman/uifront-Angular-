/**
 * global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */
import {
  loggedInState,
  InvitationsState,
  SendRegistrationInvitation,
  invitationOperationMsgSelector,
  ResetInvitationOperationMsg
} from '../../store';
import { Roles, UserGroupsService, UserGroupsDto, CreateInvitationDto } from '@wfm/service-layer';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * local
 */

@Component({
  selector: 'app-invitation-tool',
  templateUrl: './invitation-tool.component.html',
  styleUrls: ['./invitation-tool.component.scss']
})
export class InvitationToolComponent implements OnInit, OnDestroy {
  invitation: FormGroup;
  slicedRoles: Roles[] = [];
  tenantId: string;
  tenantName: string;
  userGroups: UserGroupsDto[] = [];
  componentId = '77def6f0-9a73-465c-bccb-6379c1bf66f3';
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'Invite Users' } as AppBarData;
  protected destroyed$ = new Subject<any>();
  get roles() {
    return Roles;
  }

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<InvitationsState>,
    private snackbar: MatSnackBar,
    private sharedService: SharedService,
    private userGroupsService: UserGroupsService
  ) {
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));

    this.sharedService.setAppBarData(this.appBarData);
    this.store.pipe(select(invitationOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.snackbar.open(x, 'Ok', { duration: 3000 });
        this.store.dispatch(new ResetInvitationOperationMsg());
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetInvitationOperationMsg());
      }
    });
  }

  ngOnInit() {
    this.invitation = this.formBuilder.group({
      emailAddress: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      userGroupId: [''],
      multipleRegistrations: [false]
    });

    this.store.pipe(select(loggedInState)).subscribe((user) => {
      this.tenantId = user.currentTenantSystem.tenant.tenantId;
      this.tenantName = user.currentTenantSystem.tenant.tenantName;
    });

    const sliced = [];
    for (let i = 1; i <= 4; i++) {
      sliced[i] = this.roles[i];
    }
    this.slicedRoles = sliced;

    this.fetchUserGroups();
  }

  getEmailDomain(email: string): string | null {
    const parts = email.split('@');
    return parts.length > 1 ? parts[1] : null;
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.invitation.controls[controlName].hasError(errorName);
  };

  async fetchUserGroups(): Promise<void> {
    const result = await this.userGroupsService.getUserGroups(this.tenantId);
    this.userGroups = result.items;
  }

  onSubmit(formValue: CreateInvitationDto): void {
    this.store.dispatch(new SendRegistrationInvitation({ tenantId: this.tenantId, invitations: formValue }));
  }

  openSnackBar(message: string, action: string): void {
    this.snackbar.open(message, action, {
      duration: 3000
    });
  }
}
