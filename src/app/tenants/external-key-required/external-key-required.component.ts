// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { select, Store } from '@ngrx/store';
// import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
// import { FormlyFieldConfig } from '@ngx-formly/core';
// import { Observable } from 'rxjs';

// /**
//  * project
//  */
// import {
//   extRefIdRequired,
//   TenantSettingsDto,
//   Settings,
//   FieldTypeIds,
//   rawDataOnSingleCase,
//   TenantSettingsService
// } from '@wfm/service-layer';
// import { userProfile, ApplicationState, AuthState } from '@wfm/store';
// import { TenantComponent } from '@wfm/shared/tenant.component';

// import { FormlyFieldAdapterNamespace, FormVariableDto } from '@wfm/common/vendor';
// import { IObjectMap } from '@wfm/common/models';

// /**
//  * local
//  */
// interface ViewModel {
//   form: FormGroup;
//   fields: FormlyFieldConfig[];
//   model: { [extRefIdRequired]: boolean };
//   tenantId: string;
// }

// @Component({
//   selector: 'app-external-key-required',
//   templateUrl: './external-key-required.component.html',
//   styleUrls: ['./external-key-required.component.scss']
// })
// export class ExternalKeyRequiredComponent extends TenantComponent implements OnInit {
//   view$: Observable<ViewModel>;
//   componentId = '8d2ea1db-a30d-4b40-b74a-970458aec3c3';

//   constructor(
//     private formBuilder: FormBuilder,
//     private tenantSettingsService: TenantSettingsService,
//     private snackBar: MatSnackBar,
//     private store: Store<ApplicationState>
//   ) {
//     super(store, false);
//   }

//   ngOnInit(): void {
//     this.view$ = this.tenant$.pipe(
//       switchMap((tenantId) => {
//         return this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).pipe(
//           filter((x: AuthState) => !!x && !!x.currentTenantSystem && !!x.currentTenantSystem.tenantSettings),
//           map((state: AuthState) => this.createView(state, tenantId))
//         );
//       })
//     );
//   }

//   async onSubmit(view: ViewModel): Promise<void> {
//     const value = view.model[extRefIdRequired];
//     const userSettings = <Settings>{
//       key: extRefIdRequired,
//       value: { [rawDataOnSingleCase]: value, [extRefIdRequired]: value }
//     };

//     const cmd = <TenantSettingsDto>{
//       settings: [userSettings],
//       tenantId: view.tenantId
//     };

//     await this.tenantSettingsService.update(cmd);
//     this.snackBar.open('Tenant Settings Saved Successfully!', 'CLOSE', { duration: 2000 });
//   }

//   private createView(state: AuthState, tenantId: string): ViewModel {
//     const settingsUi = state.currentTenantSystem.tenantSettings.find((x) => x.key === extRefIdRequired);
//     const section: IObjectMap<boolean> | boolean = settingsUi.value;
//     // TODO SOME ISSUE WITH DYNAMIC VALUE should be {key:bool} but present bool
//     let value = false;
//     if (typeof section === 'boolean') {
//       value = section;
//     } else {
//       value = !!section && !!section[extRefIdRequired] ? section[extRefIdRequired] : false;
//     }

//     const fieldVariableDto: FormVariableDto = {
//       name: extRefIdRequired,
//       label: 'External Key Required',
//       type: FieldTypeIds.BoolField,
//       value: !!value
//     };
//     const def = FormlyFieldAdapterNamespace.toFormlyDefinition([fieldVariableDto]);
//     def.fields[0].templateOptions.color = 'primary';
//     const view: ViewModel = {
//       fields: def.fields,
//       model: def.model,
//       form: this.formBuilder.group({}),
//       tenantId
//     };

//     return view;
//   }
// }
