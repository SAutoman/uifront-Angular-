// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { Router } from '@angular/router';

// import { FormBuilder, Validators } from '@angular/forms';

// /**
//  * project
//  */

// import { AuthState } from '@wfm/store';
// import { BaseComponent } from '@wfm/shared/base.component';
// import { convertTenantName } from '@wfm/shared/utils';

// import {
//   CaseWithRawData,
//   PagedData,
//   SettingsUI,
//   CreateCaseWithRawData,
//   CasesService,
//   SidebarLinksService,
//   AreaTypeEnum
// } from '@wfm/service-layer';
// import { FieldSettingUI } from '@wfm/tenant-admin/models/field-setting-ui';
// import { casesMainRoute } from '@wfm/cases/cases.routing';
// import { ICaseOutputEvent } from '@wfm/case-form-ui/case-form-editor/i-case-output.event';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-create-case',
//   templateUrl: './create-case.component.html',
//   styleUrls: ['./create-case.component.scss']
// })
// export class CreateCaseComponent extends BaseComponent implements OnInit {
//   @Input() selectedItems: any[];
//   @Input() tenant: string;
//   @Input() authState: AuthState;
//   @Input() items: FieldSettingUI[];
//   @Input() itemsWithValues: any[];
//   @Input() isRawDataOnSingleCase: boolean;
//   @Input() cases: PagedData<CaseWithRawData>;

//   caseNames: string[] = [];
//   dateFormatDb: SettingsUI;
//   disabled: boolean = true;
//   buttonText: string = 'Process';
//   arrOfRawDataIds: string[] = [];
//   private caseForm: ICaseOutputEvent;
//   private snackBarDelay = 3000;

//   componentId = '99d47b26-6a50-40c1-9c93-97ddba760a74';
//   get areaType() {
//     return AreaTypeEnum;
//   }
//   constructor(
//     private casesService: CasesService,
//     private router: Router,
//     private snackBar: MatSnackBar,
//     private sidebarLinksService: SidebarLinksService,
//     private fb: FormBuilder
//   ) {
//     super();
//     this.caseForm = this.fb.group({}, [Validators.required]);
//   }

//   ngOnInit(): void {}

//   onCaseUpdate(e: ICaseOutputEvent): void {
//     this.buttonText = 'Process';
//     this.disabled = !e.valid;
//     this.caseForm = e;
//   }

//   async onSubmit(): Promise<void> {
//     const name = this.caseForm.model.find((x) => x.propName === 'name');
//     if (name === undefined) {
//       this.snackBar.open('There was an error! Name field on form is required!', 'CLOSE', { duration: this.snackBarDelay });
//       return;
//     }
//     if (this.isRawDataOnSingleCase || !this.itemsWithValues.length) {
//       this.snackBar.open('There was an error! Please try again!', 'CLOSE', { duration: this.snackBarDelay });
//       return;
//     }
//     if (!this.caseForm.valid) {
//       this.snackBar.open('Please fill Case form!', 'CLOSE', { duration: this.snackBarDelay });
//       return;
//     }

//     this.itemsWithValues.forEach((i) => {
//       this.arrOfRawDataIds.push(i.id);
//     });

//     if (this.caseNames.includes(name.value)) {
//       this.snackBar.open('Case with this name already exists!', 'CLOSE', { duration: this.snackBarDelay });
//     } else {
//       const cmd = <CreateCaseWithRawData>{
//         name: name.value,
//         supplierId: this.authState.profile.companyPublicId,
//         rawDataIds: this.arrOfRawDataIds
//         // new fields
//         // fieldValues
//         // caseBuilderPublicId:
//       };

//       this.buttonText = 'Loading...';
//       this.disabled = true;
//       const operation = await this.casesService.create(this.tenant, cmd);
//       this.snackBar.open('Case Added Successfully', 'CLOSE', { duration: this.snackBarDelay });

//       if (operation.targetId) {
//         this.router.navigate([
//           `${convertTenantName(this.sidebarLinksService.tenantName)}/${casesMainRoute}/work-on-case/${operation.targetId}`
//         ]);
//       }
//     }
//   }

//   removeItem(dataItem: any): void {
//     this.arrOfRawDataIds = [];

//     this.selectedItems.forEach((x) => {
//       const item = Object.assign(x);
//       if (item === dataItem) {
//         const index = Array.from(this.selectedItems.keys()).indexOf(item.id);
//         this.itemsWithValues.splice(index, 1);
//       }
//     });

//     this.itemsWithValues.forEach((i) => {
//       this.arrOfRawDataIds.push(i.id);
//     });
//   }
// }
