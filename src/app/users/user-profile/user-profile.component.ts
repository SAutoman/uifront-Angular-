/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { UsersState, loggedInState, authUserProfileSelector, UpdateUserProfile, SetSelectedRawDataSchema } from '@wfm/store';
import { UserProfileService, Profile, CompanyService, Company, User, Roles } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { SetSelectedReport, SetSelectedWorkflow } from '@wfm/store/workflow';

/**
 * local
 */

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent extends TenantComponent implements OnInit {
  userProfileData: Profile;
  companyData: Company;
  userProfile: FormGroup;
  displayedColumnsNotificationTable: string[] = ['select', 'name'];

  isSelectCompanyClicked: boolean = false;
  isCreateCompanyClicked: boolean = false;
  tenantId: string;
  componentId = '748e7750-c1c3-40b4-a8ab-14c5b2173ee7';
  userProfileHasChanges: boolean;
  formSubscriber: Subscription;
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'User Profile' } as AppBarData;
  userId: string;

  constructor(
    public userProfileService: UserProfileService,
    public companyService: CompanyService,
    private store: Store<UsersState>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private sharedService: SharedService,
    private ts: TranslateService
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.sharedService.setAppBarData(this.appBarData);
    this.initProfileForm();
    this.getProfileData();
  }

  initProfileForm(): void {
    this.userProfile = this.formBuilder.group({
      title: [null, [Validators.required]],
      name: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      department: [null, [Validators.required]],
      email: [null, [Validators.required]],
      phone: [null, [Validators.required]],
      country: [null, [Validators.required]],
      city: [null, [Validators.required]],
      address: [null, [Validators.required]],
      photoId: []
    });
  }

  async ngOnInit() {
    this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: null }));
    this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: null }));
    this.store.dispatch(new SetSelectedReport({ selectedReport: null }));
  }

  subscribeToFormChanges(): void {
    this.formSubscriber = this.userProfile.valueChanges.subscribe((x) => {
      this.userProfileHasChanges = true;
      this.formSubscriber.unsubscribe();
    });
  }

  private openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }

  onSubmit(formValue: User): void {
    formValue.isAdmin = this.userProfileData.isAdmin;
    this.store.dispatch(new UpdateUserProfile({ user: formValue, companyId: this.userProfileData.companyPublicId }));
    this.openSnackBar(this.ts.instant('Profile Updated Successfully'), 'CLOSE');
    this.userProfileHasChanges = false;
    this.subscribeToFormChanges();
  }

  selectCompany(): void {
    this.isSelectCompanyClicked = !this.isSelectCompanyClicked;
    this.isCreateCompanyClicked = false;
  }

  createCompany(): void {
    this.isCreateCompanyClicked = !this.isCreateCompanyClicked;
    this.isSelectCompanyClicked = false;
  }

  private getProfileData(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((user) => {
      if (user) {
        this.tenantId = user.currentTenantSystem.tenant.tenantId;
        this.userProfileData = { ...user.profile };
        this.userId = user.profile.id;
        this.getCompanyData();
      }
    });
    this.store.pipe(select(authUserProfileSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.userProfile.patchValue(x);
      this.subscribeToFormChanges();
    });
  }

  private async getCompanyData(): Promise<void> {
    const data = await this.companyService.getById(this.userProfileData.companyPublicId);
    if (data) {
      this.companyData = data;
    }
  }

  onPhotoChange(docId: string): void {
    this.userProfile.controls.photoId.setValue(docId);
    this.onSubmit(this.userProfile.value);
  }

  newChange(flag: boolean): void {
    this.userProfileHasChanges = flag;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.formSubscriber.unsubscribe();
  }
}
