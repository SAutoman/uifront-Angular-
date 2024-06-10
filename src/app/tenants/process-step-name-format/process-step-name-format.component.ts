// /**
//  * global
//  */
// import { Component, EventEmitter, OnInit, Output } from '@angular/core';
// import { select, Store } from '@ngrx/store';

// /**
//  * project
//  */
// import { Settings, TenantSettingsDto, FieldsInProcessStepName, processStepNameFormat, TenantSettingsService } from '../../service-layer';

// import { ApplicationState, AuthState, FetchTenantSettingsAction, userProfile } from '../../store';
// import { TenantComponent } from '../../shared/tenant.component';
// import { takeUntil } from 'rxjs/operators';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-process-step-name-format',
//   templateUrl: './process-step-name-format.component.html',
//   styleUrls: ['./process-step-name-format.component.scss']
// })
// export class ProcessStepNameFormatComponent extends TenantComponent implements OnInit {
//   fieldPosition: number;
//   truncateSymbols: number;
//   showName: boolean;
//   fields: FieldsInProcessStepName[] = [];
//   setting: FieldsInProcessStepName[];
//   componentId = 'd4630c86-1b9d-4701-ac9a-d2ed6cba4f43';
//   settingId: string;
//   tenantAuthState: AuthState;

//   @Output() unsavedState: EventEmitter<boolean> = new EventEmitter();

//   constructor(private snackbar: MatSnackBar, private tenantsService: TenantSettingsService, private store: Store<ApplicationState>) {
//     super(store);
//     this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).subscribe((data) => {
//       if (data) {
//         this.tenantAuthState = data;
//       }
//     });
//   }

//   async ngOnInit() {
//     const setting = await this.tenantsService.getByTenant(this.tenant);
//     this.settingId = setting?.settings?.filter((s) => s.key === processStepNameFormat)[0]?.id;
//     this.setting = setting?.settings?.filter((s) => s.key === processStepNameFormat)[0]?.value?.fields;

//     if (this.setting) {
//       this.fields = this.setting;
//     }
//   }

//   onAdd() {
//     if (this.truncateSymbols < 0 || this.fieldPosition < 0) {
//       return this.snackbar.open('Value cannot be negative!', 'CLOSE', {
//         duration: 3000
//       });
//     }

//     if (this.fieldPosition < 0 || !this.truncateSymbols || this.showName === undefined) {
//       return this.snackbar.open('Fields Cannot be empty, please fill all the data!', 'CLOSE', {
//         duration: 5000
//       });
//     }

//     const model = {
//       index: this.fieldPosition,
//       showFieldName: this.showName,
//       truncateSymbols: this.truncateSymbols
//     } as FieldsInProcessStepName;

//     this.fields.push(model);
//   }

//   onRemove(field: FieldsInProcessStepName) {
//     const index = this.fields.indexOf(field);
//     this.fields.splice(index, 1);
//     this.emitChangeStatus(true);
//   }

//   async onSave() {
//     const settings = {
//       key: processStepNameFormat,
//       value: {
//         key: processStepNameFormat,
//         fields: this.fields
//       },
//       id: this.settingId
//     } as Settings;

//     const cmd = {
//       tenantId: this.tenant,
//       settings: [settings]
//     } as TenantSettingsDto;

//     await this.tenantsService.update(cmd);
//     this.snackbar.open('Settings Saved!', 'CLOSE', {
//       duration: 3000
//     });
//     this.emitChangeStatus(false);
//     this.refreshTenantSettings();
//   }

//   refreshTenantSettings(): void {
//     this.store.dispatch(
//       new FetchTenantSettingsAction({ tenant: this.tenantAuthState.tenant.tenant, userId: this.tenantAuthState.profile.id })
//     );
//   }

//   emitChangeStatus(val: boolean): void {
//     this.unsavedState.emit(val);
//   }
// }
