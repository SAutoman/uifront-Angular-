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
//   TranslationService
// } from '@wfm/service-layer';
// import { casesMainRoute, casesViewRoute } from '@wfm/cases/cases.routing';
// import { FieldSettingUI } from '@wfm/tenant-admin/models/field-setting-ui';
// import { AuthState } from '@wfm/store';

// import { convertTenantName } from '@wfm/shared/utils';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-add-to-case',
//   templateUrl: './add-to-case.component.html',
//   styleUrls: ['./add-to-case.component.scss']
// })
// export class AddToCaseComponent implements OnInit {
//   @Input() selectedItems;
//   @Input() tenant: string;
//   @Input() authState: AuthState;
//   @Input() items: FieldSettingUI[];
//   @Input() itemsWithValues;
//   @Input() isRawDataOnSingleCase: boolean;
//   cases: CaseWithRawData[] = [];
//   addToCaseForm: FormGroup;
//   isItemsExist = false;
//   arrOfRawDataIds: string[] = [];
//   isAddRawDataAllowedSupplier: boolean = false;
//   isAddRawDataAllowedAdmin: boolean = false;
//   isAddRawDataAllowedTenant: boolean = false;
//   isDoneApproved: boolean = false;
//   componentId = '8bef03d1-371e-4e17-83f3-e2ffe86c60ec';

//   get rolesPerTenant() {
//     return Roles;
//   }
//   get caseStatus() {
//     return CaseStatus;
//   }

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

//     const data = await this.casesService.getCasesWithRawData(this.tenant);
//     this.cases = data.items;
//     this.cases = this.cases.filter((x) => x.status !== CaseStatus.Approved);

//     this.translate.translateDefault();
//   }

//   async onCaseSelected(selectedCase: CaseWithRawData) {
//     this.selectedItems.forEach((x) => {
//       const item = Object.assign(x);
//       this.isItemsExist = selectedCase.rawData.some((j) => j.id === x.id);
//       if (this.isItemsExist) {
//         return;
//       }
//       this.arrOfRawDataIds.push(item.id);
//     });

//     const caseAuthorRole = await this.usersService.getUserRoleById(this.tenant, selectedCase.authorId);
//     this.isAddRawDataAllowedSupplier =
//       this.authState.tenant.tenant.roleNum === this.rolesPerTenant.Supplier &&
//       (caseAuthorRole === this.rolesPerTenant.TenantAdmin ? true : false || caseAuthorRole === this.rolesPerTenant.Tenant ? true : false);

//     this.isAddRawDataAllowedAdmin =
//       this.authState.tenant.tenant.roleNum === this.rolesPerTenant.TenantAdmin &&
//       (caseAuthorRole === this.rolesPerTenant.Tenant ? true : false || caseAuthorRole === this.rolesPerTenant.Supplier ? true : false);

//     this.isAddRawDataAllowedTenant =
//       this.authState.tenant.tenant.roleNum === this.rolesPerTenant.Tenant &&
//       (caseAuthorRole === this.rolesPerTenant.TenantAdmin ? true : false || caseAuthorRole === this.rolesPerTenant.Supplier ? true : false);

//     this.isDoneApproved =
//       selectedCase.status === this.caseStatus.Done ? true : false || selectedCase.status === this.caseStatus.Approved ? true : false;
//   }

//   async onSubmit(selectedCase: CaseWithRawData) {
//     const cmd: UpdateCaseRawData = { rawDataIds: this.arrOfRawDataIds };
//     await this.casesService.updateCaseRawData(this.tenant, selectedCase.id, cmd);
//     this.snackBar.open('Raw Data Added Successfully', 'CLOSE', { duration: 2000 });
//     this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/${casesMainRoute}/${casesViewRoute}`]);
//   }
// }
