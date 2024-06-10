/**
 * global
 */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { Tenant, CreateTenantModel, APP_CLIENT_ID, Company, UpdateTenantModel } from '../../service-layer';
import {
  CreateTenants,
  LoadTenantsById,
  TenantsState,
  loadedTenantSelector,
  SearchAllCompanyEntities,
  selectCompanyState,
  CompanyState,
  UpdateTenants,
  ResetLoadedTenant,
  tenantOperationMsgSelector,
  ResetTenantOperationMsg
} from '../../store';
import { TenantComponent } from '../../shared/tenant.component';
import { tenantsMainRoute, tenantEditRoute } from '../tenants.routing';
import { TenantViewModel } from '../tenant.model';

/**
 * local
 */

@Component({
  selector: 'app-create-tenant',
  templateUrl: './create-tenant.component.html',
  styleUrls: ['./create-tenant.component.scss']
})
export class CreateTenantComponent extends TenantComponent implements OnInit, OnDestroy {
  createTenantForm: FormGroup;
  loadedTenant: Tenant;
  componentId = '822c3719-4efb-4bf9-9cca-4a9257c326df';
  companiesList: Company[];
  currentTenantId: string;
  timeZoneSelected: string;

  get name() {
    return this.createTenantForm.get('name');
  }

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<TenantsState>,
    private companyStore: Store<CompanyState>,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private router: Router,
    private ts: TranslateService
  ) {
    super(store);

    this.createTenantForm = new FormGroup({
      name: new FormControl(null, Validators.required),
      companyId: new FormControl(''),
      copiedTenantId: new FormControl(null),
      tenantTemplate: new FormControl(null)
    });
    this.currentTenantId = this.route.snapshot.paramMap.get('id');
    if (this.currentTenantId) {
      this.store
        .pipe(
          takeUntil(this.destroyed$),
          select(loadedTenantSelector),
          filter((x) => !!x)
        )
        .subscribe((data) => {
          this.loadedTenant = data;
          this.createTenantForm.patchValue(data);
          this.timeZoneSelected = this.loadedTenant.timeZone;
        });
    }
  }

  ngOnInit() {
    this.store.dispatch(new SearchAllCompanyEntities());
    this.getCompaniesList();
    if (this.currentTenantId) this.store.dispatch(new LoadTenantsById({ id: this.currentTenantId }));
    this.listenForOperationStatus();
  }

  listenForOperationStatus(): void {
    this.store.pipe(select(tenantOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        const msg = x.split('-')[0];
        this.snackbar.open(msg, this.ts.instant('Ok'), { duration: 3000 });
        this.store.dispatch(new ResetTenantOperationMsg());
        if (!this.currentTenantId) this.router.navigate([`/${tenantsMainRoute}/${tenantEditRoute}/${x.split('-')[1]}`]);
      } else if (x && x.toLowerCase().includes('fail')) {
        this.store.dispatch(new ResetTenantOperationMsg());
      }
    });
  }

  getCompaniesList(): void {
    try {
      this.companyStore.pipe(takeUntil(this.destroyed$), select(selectCompanyState)).subscribe((result) => {
        if (result) {
          this.companiesList = result.companies;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  async onSubmit(formData) {
    if (!formData.name) {
      return;
    }
    if (!this.currentTenantId) this.createTenant(formData);
    else this.updateTenant(formData);
  }

  createTenant(formData): void {
    const tenant: CreateTenantModel = {
      name: formData.name?.trim(),
      appPublicId: this.appId,
      companyId: formData?.companyId,
      invitationTemplate: formData?.tenantTemplate?.trim().length ? formData.tenantTemplate.trim() : null,
      timeZone: this.timeZoneSelected
    };
    this.store.dispatch(new CreateTenants(tenant, formData?.copiedTenantId?.id));
  }

  updateTenant(formData): void {
    const tenant = <UpdateTenantModel>{
      name: formData.name?.trim(),
      appPublicId: this.appId,
      id: this.currentTenantId,
      timeZone: this.timeZoneSelected
    };
    this.store.dispatch(new UpdateTenants({ tenants: tenant }));
  }

  showSnackbar(message: string): void {
    this.snackbar.open(message, 'OK', { duration: 2000 });
  }

  onTenantSelected(event: TenantViewModel): void {
    if (event) {
      this.createTenantForm.controls.copiedTenantId.setValue(event);
    }
  }

  timezoneUpdated(event: { timezone: string }): void {
    this.timeZoneSelected = event.timezone;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.store.dispatch(new ResetLoadedTenant());
  }
}
