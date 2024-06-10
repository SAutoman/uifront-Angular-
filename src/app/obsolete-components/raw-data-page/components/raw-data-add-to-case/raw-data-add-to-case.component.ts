// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Router } from '@angular/router';

// /**
//  * project
//  */
// import {
//   CaseWithRawData,
//   UpdateCaseRawData,
//   CaseStatus,
//   Roles,
//   CasesService,
//   SidebarLinksService,
//   UsersService,
//   TranslationService,
//   TenantProfile
// } from '@wfm/service-layer';
// import { casesMainRoute, casesViewRoute } from '@wfm/cases/cases.routing';
// import { FieldSettingUI } from '@wfm/tenant-admin/models/field-setting-ui';
// import { AuthState } from '@wfm/store';

// import { convertTenantName } from '@wfm/shared/utils';
// import { IObjectMap } from '@wfm/common/models';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-raw-data-add-to-case',
//   templateUrl: './raw-data-add-to-case.component.html',
//   styleUrls: ['./raw-data-add-to-case.component.scss']
// })
// /**
//  * Not implemented yet
//  */
// export class RawDataAddToCaseComponent implements OnInit {
//   @Input() selectedRawDataRows: IObjectMap<any>[];
//   @Input() tenantId: string;
//   @Input() authState: AuthState;
//   @Input() rawDataColumns: FieldSettingUI[];
//   @Input() isRawDataOnSingleCase: boolean;
//   cases: CaseWithRawData[] = [];
//   addToCaseForm: FormGroup;
//   isItemsExist = false;

//   isAddRawDataAllowedSupplier: boolean = false;
//   isAddRawDataAllowedAdmin: boolean = false;
//   isAddRawDataAllowedTenant: boolean = false;
//   isDoneApproved: boolean = false;
//   componentId = '8bef03d1-371e-4e17-83f3-e2ffe86c60ec';

//   private rawDataIds = new Map<string, string>();

//   constructor(
//     private casesService: CasesService,
//     private snackBar: MatSnackBar,
//     private sidebarLinksService: SidebarLinksService,
//     private formBuilder: FormBuilder,
//     private router: Router,
//     private usersService: UsersService,
//     private translate: TranslationService
//   ) {}

//   async ngOnInit() {
//     this.addToCaseForm = this.formBuilder.group({
//       case: ['', [Validators.required]]
//     });
//     const data = await this.casesService.getCasesWithRawData(this.tenantId);
//     this.cases = data.items;
//     this.cases = this.cases.filter((x) => x.status !== CaseStatus.Approved);

//     this.translate.translateDefault();
//   }

//   async onCaseSelected(selectedCase: CaseWithRawData): Promise<void> {
//     this.selectedRawDataRows.forEach((x) => {
//       const item = Object.assign(x);
//       this.isItemsExist = selectedCase.rawData.some((j) => j.id === x.id);
//       if (this.isItemsExist) {
//         return;
//       }
//       this.rawDataIds.set(item.id, item.id);
//     });

//     const caseAuthorRole = await this.usersService.getUserRoleById(this.tenantId, selectedCase.authorId);
//     const tenant = this.authState?.tenant?.tenant || ({} as TenantProfile);

//     const hasRole = (roles: Roles[]) => {
//       return roles.some((x) => x === caseAuthorRole);
//     };

//     switch (tenant.roleNum) {
//       case Roles.Supplier:
//         this.isAddRawDataAllowedSupplier = hasRole([Roles.TenantAdmin, Roles.Tenant]);
//         this.isAddRawDataAllowedAdmin = false;
//         this.isAddRawDataAllowedTenant = false;
//       case Roles.TenantAdmin:
//         this.isAddRawDataAllowedSupplier = false;
//         this.isAddRawDataAllowedAdmin = hasRole([Roles.Tenant, Roles.Supplier]);
//         this.isAddRawDataAllowedTenant = false;
//       case Roles.Tenant:
//         this.isAddRawDataAllowedSupplier = false;
//         this.isAddRawDataAllowedAdmin = false;
//         this.isAddRawDataAllowedTenant = hasRole([Roles.TenantAdmin, Roles.Supplier]);
//         break;

//       default:
//         break;
//     }

//     switch (selectedCase.status) {
//       case CaseStatus.Done:
//       case CaseStatus.Approved:
//         this.isDoneApproved = true;
//         break;

//       default:
//         this.isDoneApproved = false;
//         break;
//     }
//   }

//   async onSubmit(selectedCase: CaseWithRawData): Promise<void> {
//     const rawDataIds = [...this.rawDataIds.values()];
//     const cmd: UpdateCaseRawData = { rawDataIds };
//     await this.casesService.updateCaseRawData(this.tenantId, selectedCase.id, cmd);
//     this.snackBar.open('Raw Data Added Successfully', 'CLOSE', { duration: 2000 });
//     this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/${casesMainRoute}/${casesViewRoute}`]);
//   }
// }
