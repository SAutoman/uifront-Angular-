/**
 * global
 */
import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * project
 */
import {
  AuthenticationService,
  CompanyService,
  UsersService,
  AppConfigService,
  Profile,
  Company,
  IClaimsTypeConfig,
  TenantsService,
  FieldTypeIds
} from '@wfm/service-layer';

import { AuthState, tenantIdKey, tenantNameKey, tenantRoleKey, loggedInState } from '@wfm/store';
import { BaseComponent } from '@wfm/shared/base.component';
import { convertRole } from '@wfm/shared/utils';
import { InvitationUserRole } from '@wfm/service-layer';

/**
 * local
 */
import { InvalidUserPopupComponent } from '../invalid-user-popup/invalid-user-popup.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { IFormlyView, IObjectMap } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Subject } from 'rxjs';

interface ICompanyItem {
  companyName: string;
  companyId: string;
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent extends BaseComponent implements OnInit {
  private claims: any; // Why any?
  private companyData: Company;
  private emailAddressInClaim: string;
  private emailDomain: string;
  private tenantId: string;
  private userProfileData: Profile;
  public alreadyRegistered: boolean = false;
  public companies: ICompanyItem[] = [];
  public companiesData: IObjectMap<Company> = {};
  public selectedCompany: Company;
  public companiesSubj: Subject<ICompanyItem[]> = new Subject();
  public companiesSelect: FormlyFieldConfig;
  public componentId = '94e51196-6ec8-488c-af53-56cfcd4fde7b';
  public emailAddress: string;
  public isCreateCompanyClicked: boolean = false;
  public isInvalidUser = false;
  public view: IFormlyView;
  public processing: boolean;

  constructor(
    @Inject('AuthenticationService') private authService: AuthenticationService,
    private companyService: CompanyService,
    private userService: UsersService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private appConfig: AppConfigService,
    private store: Store<AuthState>,
    private dialog: MatDialog,
    private tenantService: TenantsService,
    private ts: TranslateService,
    private errorHandler: ErrorHandlerService
  ) {
    super();
  }

  private async initData(): Promise<void> {
    this.claims = this.authService.getClaims();
    const cfg: IClaimsTypeConfig = this.getClaimsTypeConfig();
    this.emailDomain = this.claims[cfg.emailDomain];
    this.tenantId = this.claims[cfg.tenant];
    this.emailAddressInClaim = this.claims[cfg.email];
    const isEmailSame = this.checkForInvalidEmail(this.claims[cfg.email], this.claims[cfg.invitationEmail]);
    if (isEmailSame) {
      await this.getCompanyData();
      await this.getProfileData();
    }
  }

  async ngOnInit(): Promise<void> {
    await this.initData();
    this.initFormly();
  }

  initFormly(): void {
    const fields = [];
    const model = this.getDefaultModel();

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Title'),
        name: 'title',
        type: FieldTypeIds.StringField,
        value: model.title,
        readonly: !!model.name
      }).getConfig()
    );

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('First Name'),
        name: 'name',
        required: true,
        type: FieldTypeIds.StringField,
        value: model.name,
        readonly: !!model.name
      }).getConfig()
    );

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Last Name'),
        name: 'lastName',
        required: true,
        type: FieldTypeIds.StringField,
        value: model.lastName,
        readonly: !!model.lastName
      }).getConfig()
    );

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Department'),
        name: 'department',
        type: FieldTypeIds.StringField,
        value: model.department,
        readonly: !!model.department
      }).getConfig()
    );

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Phone'),
        name: 'phone',
        required: true,
        type: FieldTypeIds.StringField,
        value: model.phone,
        readonly: !!model.phone
      }).getConfig()
    );

    const roleCfg = FormlyFieldAdapterFactory.createAdapter({
      label: '',
      name: 'role',
      type: FieldTypeIds.StringField,
      value: model.role
    }).getConfig();
    roleCfg.hideExpression = true;
    fields.push(roleCfg);

    const invitationSettingId = FormlyFieldAdapterFactory.createAdapter({
      label: '',
      name: 'invitationSettingId',
      type: FieldTypeIds.StringField,
      value: model.invitationSettingId
    }).getConfig();
    invitationSettingId.hideExpression = true;
    fields.push(invitationSettingId);

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: '',
        name: 'email',
        type: FieldTypeIds.StringField,
        value: model.email,
        readonly: true
      }).getConfig()
    );

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Role'),
        name: 'roleName',
        required: true,
        disabled: true,
        type: FieldTypeIds.StringField,
        value: model.roleName,
        readonly: !!model.roleName
      }).getConfig()
    );

    this.companiesSelect = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Company'),
      name: 'companyId',
      required: true,
      type: FieldTypeIds.ListField,
      valueInfo: {
        labelProp: 'companyName',
        valueProp: 'companyId'
      },
      value: model.companyId
    }).getConfig();
    this.companiesSelect.templateOptions.options = this.companiesSubj;
    this.companiesSelect.templateOptions.change = (field, $event) => {
      this.selectedCompany = this.companiesData[$event?.value] || null;
    };

    fields.push(this.companiesSelect);

    this.view = {
      fields,
      form: this.formBuilder.group({}),
      model: {}
    };
  }

  getDefaultModel(): any {
    const cfg: IClaimsTypeConfig = this.getClaimsTypeConfig();
    if ((this.companies && this.userProfileData === null) || this.userProfileData === undefined) {
      return {
        title: this.claims[cfg.title],
        name: this.claims[cfg.firstName],
        lastName: this.claims[cfg.lastName],
        department: '',
        email: this.emailAddressInClaim,
        phone: this.claims[cfg.phone]?.replaceAll('-', ''),
        companyId: '',
        role: this.claims[cfg.userRole],
        isAdmin: this.claims[cfg.isAdmin],
        invitationSettingId: this.claims[cfg.invitationSettingId],
        roleName: convertRole(+this.claims[cfg.userRole])
      };
    } else if (!!this.userProfileData) {
      return {
        title: this.userProfileData.title,
        name: this.userProfileData.name,
        lastName: this.userProfileData.lastName,
        department: this.userProfileData.department,
        phone: this.userProfileData.phone,
        companyId: this.companyData?.id,
        role: this.claims[cfg.userRole],
        isAdmin: this.userProfileData.isAdmin,
        invitationSettingId: this.claims[cfg.invitationSettingId],
        roleName: convertRole(+this.claims[cfg.userRole])
      };
    }
  }

  async submit(): Promise<void> {
    try {
      this.view.form.markAllAsTouched();
      if (!this.view.form.valid && !this.view.form.disabled) {
        return;
      }

      if (!this.alreadyRegistered || !this.isInvalidUser) {
        await this.userService.register(this.tenantId, this.view.model);
        this.openSnackBar(this.ts.instant('User registered successfully'), 'CLOSE');
      }
      this.redirectToHomeAfterRegister();
    } catch (error) {
      this.errorHandler.getAndShowErrorMsg(error, 5000);
    }
  }

  redirectToHomeAfterRegister(): void {
    localStorage.removeItem('isRegistrationRequest');
    window.location.href = this.appConfig.config.identityConfig.hostUrl;
  }

  async loadCompanies(): Promise<void> {
    await this.getCompanyData();
    this.isCreateCompanyClicked = false;
  }

  newCompanyCreated(companyData: Company): void {
    this.companies.push({
      companyId: companyData.id,
      companyName: companyData.name
    });
    this.companiesSubj.next(this.companies);
    this.view.form.patchValue({
      companyId: companyData.id
    });
  }

  createCompany(): void {
    this.emailAddress = this.userProfileData?.email || this.emailAddressInClaim;
    this.isCreateCompanyClicked = !this.isCreateCompanyClicked;
  }

  private async getCompanyData(): Promise<void> {
    if (this.emailDomain) {
      const data = await this.companyService.getCompaniesByDomain(this.emailDomain);
      if (data && !!data.items && !!data.total) {
        for (let i = 0; i < data.total; i++) {
          this.companies.push({
            companyId: data.items[i].id,
            companyName: data.items[i].name
          });
          this.companiesData[data.items[i].id] = data.items[i];
        }
      }
      setTimeout(() => this.companiesSubj.next([...this.companies]));
    }
  }

  private getProfileData(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe(async (user) => {
      const cfg: IClaimsTypeConfig = this.getClaimsTypeConfig();
      if (!!user.profile) {
        this.userProfileData = { ...user.profile };
        await this.getUserCompanyData();
      }
      if (!!user.rolesPerTenant && this.claims[cfg.tenant] && this.claims[cfg.userRole]) {
        const tenantFromExistingRoles = user.rolesPerTenant.find((x) => x.tenantId === this.claims[cfg.tenant]);
        if (tenantFromExistingRoles) {
          this.alreadyRegistered = true;
          const validUserRole = tenantFromExistingRoles.role === convertRole(+this.claims[cfg.userRole]);
          if (!validUserRole) {
            // show the popup only once
            if (!this.isInvalidUser) {
              this.isInvalidUser = true;
              this.dialog.open(InvalidUserPopupComponent, {
                data: {
                  tenantName: tenantFromExistingRoles.tenantName,
                  userRole: tenantFromExistingRoles.role,
                  invitationRole: convertRole(+this.claims[cfg.userRole])
                } as InvitationUserRole
              });
            }
          } else {
            // if the user is already registered for the same tenant go to home page directly
            this.tenantService.setInStorage(tenantIdKey, tenantFromExistingRoles.tenantId);
            this.tenantService.setInStorage(tenantRoleKey, tenantFromExistingRoles.role);
            this.tenantService.setInStorage(tenantNameKey, tenantFromExistingRoles.tenantName);
            this.redirectToHomeAfterRegister();
          }
        }
      }
    });
  }

  private async getUserCompanyData(): Promise<void> {
    const data = await this.companyService.getById(this.userProfileData.companyPublicId);
    if (data) {
      this.companyData = data;
      this.view.form.get('companyId').setValue(data.id);
    }
  }

  private getClaimsTypeConfig(): IClaimsTypeConfig {
    return this.appConfig.config.claimsTypeConfig || ({} as IClaimsTypeConfig);
  }

  private openSnackBar(message: string, action: string, duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration
    });
  }

  private checkForInvalidEmail(userEmail: string, invitationEmail: string): boolean {
    if (userEmail && invitationEmail && userEmail.toUpperCase() !== invitationEmail.toUpperCase()) {
      this.dialog.open(InvalidUserPopupComponent, {
        data: {
          userEmail: userEmail,
          invitationEmail: invitationEmail
        } as InvitationUserRole
      });
      return false;
    }
    return true;
  }
}
