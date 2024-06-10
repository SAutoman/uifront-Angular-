// /**
//  * global
//  */
// import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
// import { Router } from '@angular/router';

// import { select } from '@ngrx/store';
// import { Store } from '@ngrx/store';

// import { GridDataResult } from '@progress/kendo-angular-grid';
// import { takeUntil, filter } from 'rxjs/operators';

// /**
//  * project
//  */
// import {
//   SettingsUI,
//   RawDataStatus,
//   TenantsService,
//   SidebarLinksService,
//   CaseDto,
//   RAW_DATA_FIELDS_VISIBILITY_KEY,
//   RawDataFieldsService,
//   CasesService,
//   FieldTypeIds,
//   RawDataFieldInfo,
//   TenantSettingsService
// } from '@wfm/service-layer';
// import { loggedInState, ApplicationState } from '@wfm/store';

// import { FieldSettingUI } from '@wfm/tenant-admin/models/field-setting-ui';
// import { tenantMainRoute, tenantPreferencesRoute } from '@wfm/tenant-admin/tenant-admin.routing';

// import { convertTenantName, convertRawDataStatus } from '@wfm/shared/utils';
// import { BaseComponent } from '@wfm/shared/base.component';
// import { CustomDatePipe } from '@wfm/shared/date.pipe';

// import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

// /**
//  * local
//  */
// import { QuickInfoComponent } from './quick-info/quick-info.component';

// @Component({
//   selector: 'app-expanded-case',
//   templateUrl: './expanded-case.component.html',
//   styleUrls: ['./expanded-case.component.scss']
// })
// export class ExpandedCaseComponent extends BaseComponent implements OnInit {
//   @Input() cases: CaseDto[];
//   gridData: GridDataResult;
//   @Output() onDeleteCase: EventEmitter<CaseDto> = new EventEmitter();
//   buttonText: string;
//   role: string = '';
//   caseAuthor: string;
//   tenantId: string;
//   authorId: string;
//   userId: string;

//   items: FieldSettingUI[] = [];
//   itemsWithValues = [];

//   overview: SettingsUI;
//   datePipe = new CustomDatePipe();
//   dataFields: RawDataFieldInfo[];

//   canDeleteCase: boolean = false;
//   isLoaded: boolean = false;
//   componentId = 'de5b0e82-8518-4c2a-9751-dbc13d7bebaf';

//   constructor(
//     private tenantSettingsService: TenantSettingsService,
//     private dialog: MatDialog,
//     private store: Store<ApplicationState>,
//     private caseService: CasesService,
//     private router: Router,
//     private sidebarLinksService: SidebarLinksService,
//     private tenantsService: TenantsService,
//     private rawDataFieldsService: RawDataFieldsService
//   ) {
//     super();
//   }

//   async ngOnInit(): Promise<void> {
//     this.store
//       .pipe(
//         select(loggedInState),
//         filter((x) => !!x),
//         takeUntil(this.destroyed$)
//       )
//       .subscribe((userData) => {
//         userData.rolesPerTenant.forEach((role) => {
//           if (userData.tenant.tenant.tenantId === role.tenantId) {
//             this.role = role.role;
//             this.tenantId = role.tenantId;
//             this.authorId = userData.profile.id;
//           }
//         });

//         if (userData.profile) {
//           this.userId = userData.profile.id;
//         }

//         if (userData.tenant.tenantSettings.length) {
//           const overview = userData.tenant.tenantSettings.filter((setting) => setting.key === RAW_DATA_FIELDS_VISIBILITY_KEY);
//           this.overview = overview[0]?.value.filter((o) => o.setting.overview === true);
//         }
//       });

//     this.dataFields = await this.rawDataFieldsService.getFieldsByTenant(this.tenantId);
//   }

//   async onCaseOpened(element: CaseDto): Promise<void> {
//     const data = await this.caseService.getCaseById(this.tenantId, element.id);
//     const openedCase = this.cases.find((c) => c.id === element.id);

//     const tenantSettings = await this.tenantSettingsService.getByTenant(this.tenantId);
//     const rawDataFieldsSettings = tenantSettings.settings.find((x) => x.key === RAW_DATA_FIELDS_VISIBILITY_KEY);

//     if (!rawDataFieldsSettings) {
//       return;
//     }

//     const items = rawDataFieldsSettings.value[RAW_DATA_FIELDS_VISIBILITY_KEY];
//     // this.items = items.filter((x) => x.setting.overview === true);
//     this.items = [];

//     const filteredDataFields = this.dataFields.filter((x) => this.items.some((j) => j.name === x.id));
//     const dateDefinitions = filteredDataFields.filter((x) => x.valueType === FieldTypeIds.DateField);

//     this.itemsWithValues = data.rawData;
//     this.itemsWithValues.forEach((i) => {
//       i.status = convertRawDataStatus(<RawDataStatus>(<any>i.status));

//       if (!i.extra) {
//         return;
//       }

//       i.extra.forEach((f: { name: string; value: string }) => {
//         const temp = dateDefinitions.find((x) => x.id === f.name);
//         i[f.name] = temp ? this.datePipe.transform(new Date(f.value)) : f.value;
//       });
//     });

//     this.caseAuthor = data.authorId;

//     if (this.caseAuthor === this.authorId) {
//       this.canDeleteCase = true;
//       this.buttonText = 'process case';
//       this.isLoaded = true;
//     } else {
//       this.canDeleteCase = false;
//       this.buttonText = 'view case';
//       this.isLoaded = true;
//     }
//   }

//   menuClosed(): void {
//     setTimeout(() => {
//       this.isLoaded = false;
//     }, 100);
//   }

//   onDeleteClicked(element: CaseDto): void {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent);
//     dialogRef.afterClosed().subscribe((result) => {
//       if (result) {
//         this.onDeleteCase.emit(element);
//       }
//     });
//   }

//   redirect() {
//     this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/${tenantMainRoute}/${tenantPreferencesRoute}`]);
//   }

//   onQuickInfo(caseId: string) {
//     this.dialog.open(QuickInfoComponent, {
//       width: '700px',
//       data: {
//         caseId: caseId,
//         items: this.items,
//         itemsWithValues: this.itemsWithValues
//       }
//     });
//   }
// }
