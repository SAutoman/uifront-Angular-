/**
 * global
 */
import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { rawDataOnSingleCase, TenantSettingsDto, Settings, FieldTypeIds, TenantSettingsService } from '@wfm/service-layer';

import { loggedInState, ApplicationState, AuthState, FetchTenantSettingsAction } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';

import { FormlyFieldAdapterNamespace, FormVariableDto } from '@wfm/common/vendor';
import { IObjectMap } from '@wfm/common/models';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

/**
 * local
 */

interface ViewModel {
  form: FormGroup;
  fields: FormlyFieldConfig[];
  model: { [rawDataOnSingleCase]: boolean };
  tenantId: string;
}

@Component({
  selector: 'app-tenants-settings-card',
  templateUrl: './tenants-settings-card.component.html',
  styleUrls: ['./tenants-settings-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsSettingsCardComponent extends TenantComponent implements OnInit {
  view$: Observable<ViewModel>;
  componentId = '799d1d38-2806-49b3-815b-9a73313d1c27';
  settingId: string;

  tenantAuthState: AuthState;

  @Output() settingsCardformStatus: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private tenantsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private errorHandlerService: ErrorHandlerService,
    private store: Store<ApplicationState>
  ) {
    super(store, false);
  }

  ngOnInit(): void {
    this.view$ = this.tenant$.pipe(
      switchMap((tenantId) => {
        return this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).pipe(
          filter((x) => !!x && !!x.currentTenantSystem && !!x.currentTenantSystem.tenantSettings),
          map((data) => this.createView(data, tenantId))
        );
      })
    );
  }

  async onSubmit(view: ViewModel): Promise<void> {
    const userSettings = <Settings>{
      key: rawDataOnSingleCase,
      value: { rawDataOnSingleCase: view.model[rawDataOnSingleCase] },
      id: this.settingId
    };

    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: view.tenantId
    };
    try {
      const op = await this.tenantsService.update(cmd);
      if (op?.status?.toString()?.toLowerCase() === 'success') {
        this.emitModelChangeStatus(false);
        this.snackBar.open('Tenant Settings Saved Successfully!', 'CLOSE', { duration: 2000 });
        this.refreshTenantSettings();
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  private createView(state: AuthState, tenantId: string): ViewModel {
    this.tenantAuthState = state;
    this.settingId = state.currentTenantSystem.tenantSettings.find((x) => x.key === rawDataOnSingleCase)?.id;
    const settingsUi = state.currentTenantSystem.tenantSettings.find((x) => x.key === rawDataOnSingleCase);
    const section: IObjectMap<boolean> | boolean = settingsUi?.value;
    // TODO SOME ISSUE WITH DYNAMIC VALUE should be {key:bool} but present bool
    let value = false;
    if (typeof section === 'boolean') {
      value = section;
    } else {
      value = !!section && !!section[settingsUi?.key] ? section[settingsUi?.key] : false;
    }

    const fieldVariableDto: FormVariableDto = {
      name: rawDataOnSingleCase,
      label: 'Turn on/off Raw Data on Single Case',
      type: FieldTypeIds.BoolField,
      value: !!value
    };
    const def = FormlyFieldAdapterNamespace.toFormlyDefinition([fieldVariableDto]);
    def.fields[0].templateOptions.color = 'primary';
    const view: ViewModel = {
      fields: def.fields,
      model: def.model,
      form: this.formBuilder.group({}),
      tenantId
    };
    return view;
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  emitModelChangeStatus(val: boolean): void {
    this.settingsCardformStatus.emit(val);
  }
}
