// /**
//  * global
//  */
// import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
// import { Store, select } from '@ngrx/store';
// import { PageChangeEvent } from '@progress/kendo-angular-grid';
// import { takeUntil, filter } from 'rxjs/operators';

// /**
//  * project
//  */

// import { userProfile } from '@wfm/store';

// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { FormsService } from '@wfm/service-layer/services/forms.service';

// import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
// import { GridDataResultEx } from '@wfm/shared/kendo-util';
// import { defaultFormsGridSettings } from '@wfm/shared/default-grid-settings';
// import {
//   Form,
//   SettingsKeys,
//   formsGridSettings,
//   appFormsGridSettingsExclusive,
//   UsersService,
//   UserSettingsDto,
//   Settings,
//   GridSettingsDto,
//   GridConfiguration,
//   StatePersistingService,
//   Paging
// } from '@wfm/service-layer';
// import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
// import { nameToProperty } from '@wfm/service-layer/helpers';

// @Component({
//   selector: 'app-form-list',
//   templateUrl: './form-list.component.html',
//   styleUrls: ['./form-list.component.scss']
// })
// export class FormListComponent extends TenantComponent implements OnInit, AfterViewInit {
//   @ViewChild('formGrid') grid: WfmGridComponent;

//   gridData: GridDataResultEx<Form>;
//   tenantName: string;
//   userId: string;
//   formsGridSettingId: string;
//   formsGridSettingsConf: GridConfiguration = defaultFormsGridSettings;

//   constructor(
//     store: Store<any>,
//     private formsService: FormsService,
//     private snackBar: MatSnackBar,
//     private dialog: MatDialog,
//     private persistingService: StatePersistingService,
//     private usersService: UsersService
//   ) {
//     super(store);
//     store
//       .pipe(
//         takeUntil(this.destroyed$),
//         select(userProfile),
//         filter((x) => !!x)
//       )
//       .subscribe((data) => {
//         this.userId = data.profile.id;
//         this.tenantName = nameToProperty(data?.tenant?.tenant?.tenantName);
//       });
//   }

//   async ngOnInit() {
//     this.formsGridSettingsConf.girdSettingKeyName = formsGridSettings;
//     const settingsKeys = <SettingsKeys>{ keys: [appFormsGridSettingsExclusive], isExclusive: true };
//     const data = await this.usersService.getUserSettingsByKeys(this.tenant, this.userId, settingsKeys);
//     console.log('data', { data });
//     if (!data.settings.length) {
//       return;
//     }

//     this.formsGridSettingsConf = {
//       ...this.formsGridSettingsConf,
//       gridSettings: (<GridConfiguration>data.settings[0].value).gridSettings,
//       columnSettings: (<GridConfiguration>data.settings[0].value).columnSettings
//     };

//     this.formsGridSettingId = data.settings[0].id;
//   }

//   async loadData(paging: Paging): Promise<void> {
//     const data = await this.formsService.getForms(this.tenant, paging);

//     this.gridData = {
//       data: data.items,
//       total: data.total
//     };
//   }

//   async ngAfterViewInit(): Promise<void> {
//     const paging = this.grid.gridPaging;
//     await this.loadData(paging);
//     this.grid.grid.pageChange.subscribe(async (x) => {
//       this.loadData(x);
//       this.grid.grid.skip = (<PageChangeEvent>x).skip;
//     });
//   }

//   onDelete(dataItem: Form): void {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent);
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result) {
//         await this.formsService.deleteForm(dataItem.id, this.tenant);
//         const paging = this.grid.gridPaging;
//         await this.loadData(paging);
//         this.snackBar.open('Form Deleted Successfully', 'CLOSE', { duration: 2000 });
//       }
//     });
//   }

//   async onSaveGridSettings(): Promise<void> {
//     const tempGridSettings = <GridConfiguration>JSON.parse(this.persistingService.get(formsGridSettings + this.tenantName));

//     const cmd = <UserSettingsDto>{
//       tenantId: this.tenant,
//       userId: this.userId,
//       settings: [
//         <Settings>{
//           key: appFormsGridSettingsExclusive,
//           value: <GridSettingsDto>{
//             gridSettings: tempGridSettings.gridSettings,
//             columnSettings: tempGridSettings.columnSettings
//           },
//           id: this.formsGridSettingId
//         }
//       ]
//     };
//     if (this.formsGridSettingId) {
//       await this.usersService.updateUserSettings(this.tenant, cmd);
//     } else {
//       await this.usersService.createUserSettings(this.tenant, cmd);
//     }
//   }
// }
