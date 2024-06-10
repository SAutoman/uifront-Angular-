// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { FormControl } from '@angular/forms';
// import { CdkDragDrop } from '@angular/cdk/drag-drop';

// import { Store, select } from '@ngrx/store';
// import { GridDataResult } from '@progress/kendo-angular-grid';

// import { takeUntil, debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
// import { keyBy, keys } from 'lodash-core';
// import { Actions } from '@ngrx/effects';

// /**
//  * project
//  */
// import { FieldSettingUI } from '@wfm/tenant-admin/models';
// import { LikeFilter, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';

// import {
//   UpdateCaseStatusDto,
//   Roles,
//   Profile,
//   Paging,
//   CaseStatus,
//   ProcessStep,
//   ProcessStepNames,
//   FieldTypeIds,
//   SettingsUI,
//   CasesService,
//   TranslationService,
//   RawDataFieldsService,
//   RawDataFieldInfo
// } from '@wfm/service-layer';

// import { ProcessStepUIModel } from '@wfm/process-step/models';

// import {
//   AuthState,
//   loggedInState,
//   userProfile,
//   getDateFormatSettingsSelector,
//   ApplicationState,
//   getWorkOnCaseData,
//   getWorkOnCaseErrorMsg,
//   getWorkOnCaseSuccessMsg,
//   LoadCaseData,
//   OnProcessStepAdd,
//   OnProcessStepRemove,
//   OnChangedStatus,
//   OnRawDataDelete,
//   OnPageChange,
//   CdkDropListDropped,
//   RenameCase,
//   SearchSteps,
//   ClearMessages,
//   WorkOnCaseTypes
// } from '@wfm/store';

// import { TenantComponent } from '@wfm/shared/tenant.component';

// import { RawdataInfoComponent } from '../rawdata-info/rawdata-info.component';
// import { transformGridDate } from '@wfm/shared/utils';

// /**
//  * local
//  */
// import { ConfirmDoneStatusComponent } from './confirm-done-status/confirm-done-status.component';
// import { ConfirmStepDeleteComponent } from './confirm-step-delete/confirm-step-delete.component';

// @Component({
//   selector: 'app-work-on-case',
//   templateUrl: './work-on-case.component.html',
//   styleUrls: ['./work-on-case.component.scss']
// })
// export class WorkOnCaseComponent extends TenantComponent implements OnInit {
//   caseId: string;
//   caseName: string = '';
//   caseStatus: CaseStatus;
//   caseAuthor: string;
//   selectedRole: Roles;
//   items: FieldSettingUI[] = [];
//   itemsWithValues = [];
//   gridData: GridDataResult;
//   availableProcessSteps: ProcessStep[] = [];
//   stepData: ProcessStepUIModel[] = [];
//   authState: AuthState;
//   doneDisabled = true;
//   reopenDisabled = true;
//   approveDisabled = true;

//   userProfile: Profile;
//   canEditCase = false;
//   canEditCaseError: string = '';
//   searchField: FormControl;
//   length = 0;
//   pageSize = 6;
//   sliced: ProcessStepNames[] = [];
//   userId: string;
//   isChangedFields: boolean;
//   isChangedFormFields: boolean;
//   dateFormatDb: SettingsUI;
//   processStepNames: ProcessStepNames[] = [];
//   searchModel: LikeFilter<string>;

//   pageSizeOptions = [6, 15, 25];
//   pageEvent: PageEvent;
//   counter: number = 0;

//   disabled: boolean;
//   rawDataColumns: RawDataFieldInfo[];
//   componentId = 'f258a845-3133-4735-bc5d-0bfdd4aa6285';

//   get caseStatusTypes() {
//     return CaseStatus;
//   }
//   get tenantId(): string {
//     return this.tenant;
//   }

//   constructor(
//     private route: ActivatedRoute,
//     private store: Store<ApplicationState>,
//     private snackBar: MatSnackBar,
//     private dialog: MatDialog,
//     private translate: TranslationService,
//     private rawDataFieldsService: RawDataFieldsService,
//     private casesService: CasesService,
//     private action$: Actions
//   ) {
//     super(store);
//     this.caseId = this.route.snapshot.params['id'];
//   }

//   async ngOnInit() {
//     this.rawDataColumns = await this.rawDataFieldsService.getFieldsByTenant(this.tenant);

//     this.store.pipe(takeUntil(this.destroyed$), select(getDateFormatSettingsSelector)).subscribe((data) => {
//       if (data.settings) {
//         this.dateFormatDb = data.settings[0];
//       }
//     });

//     this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).subscribe((data) => {
//       if (data.profile) {
//         this.userId = data.profile.id;
//       }
//     });

//     this.getLoggedInState();
//     this.getWorkOnCaseData();

//     this.translate.translateDefault();
//     this.loadCaseData();
//     this.searchSteps();
//   }

//   private getLoggedInState(): void {
//     this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
//       this.authState = state;
//       this.selectedRole = state.tenant.tenant.roleNum;
//       this.userProfile = state.profile;

//       if (state.tenant.tenant.roleNum === Roles.TenantAdmin) {
//         this.disabled = false;
//       } else if (state.tenant.tenant.roleNum === Roles.Supplier) {
//         this.disabled = false;
//       } else {
//         this.disabled = true;
//       }
//     });
//   }

//   private getWorkOnCaseData(): void {
//     this.store.pipe(takeUntil(this.destroyed$), select(getWorkOnCaseData)).subscribe(async (data) => {
//       if (data) {
//         if (data.caseAuthor) {
//           this.caseName = data.caseName;
//           this.caseStatus = data.caseStatus;
//           this.caseAuthor = data.caseAuthor;

//           if (data.items?.length) {
//             this.items = data.items.filter((x) => x.setting?.details);
//           }

//           this.itemsWithValues = data.itemsWithValues;
//           this.gridData = data.gridData;
//           this.processStepNames = data.processStepNames;
//           this.sliced = data.sliced;
//           this.stepData = data.stepData;
//           this.canEditCase = data.canEditCase;
//           this.canEditCaseError = data.canEditCaseError;
//           this.approveDisabled = data.approveDisabled;
//           this.doneDisabled = data.doneDisabled;
//           this.reopenDisabled = data.reopenDisabled;
//           this.length = data.length;

//           switch (data.caseStatus) {
//             case CaseStatus.InProgress:
//             case CaseStatus.Open:
//             case CaseStatus.ReOpen:
//               this.reopenDisabled = true;
//               break;
//             case CaseStatus.Approved:
//               this.reopenDisabled = false;
//               this.approveDisabled = true;
//             default:
//               break;
//           }

//           const fields = keyBy(this.rawDataColumns, 'id');

//           this.gridData.data.forEach((item) => {
//             if (!this.dateFormatDb) {
//               return;
//             }
//             const itemKeys = keys(item);
//             itemKeys.forEach((key) => {
//               if (fields[key] && fields[key].type === FieldTypeIds.DateField) {
//                 item[key] = DateTimeFormatHelper.transformGridDate(item[key], this.dateFormatDb);
//               }
//               if (fields[key] && fields[key].type === FieldTypeIds.DateTimeField) {
//                 item[key] = DateTimeFormatHelper.transformGridDate(item[key], this.dateFormatDb) + ' ' + moment(item[key]).format('LT');
//               }
//               if (fields[key] && fields[key].type === FieldTypeIds.TimeField) {
//                 item[key] = moment(item[key]).format('LT');
//               }
//             });
//           });

//           const temp = await this.casesService.getProcessStepNames(this.tenant, this.caseId);

//           data.stepData.map((step) => {
//             temp.map((stepName) => {
//               if (step.id === stepName.id) {
//                 step.name = stepName.name;
//               }
//             });
//           });
//         }
//       }
//     });

//     this.store.pipe(takeUntil(this.destroyed$), select(getWorkOnCaseSuccessMsg)).subscribe((data) => {
//       if (data) {
//         this.snackBar.open(data, 'CLOSE', { duration: 2000 });
//         this.store.dispatch(new ClearMessages({}));
//       }
//     });

//     this.store.pipe(takeUntil(this.destroyed$), select(getWorkOnCaseErrorMsg)).subscribe((data) => {
//       if (data) {
//         this.snackBar.open(data, 'CLOSE', { duration: 2000 });
//         this.store.dispatch(new ClearMessages({}));
//       }
//     });
//   }

//   private loadCaseData(): void {
//     this.store.dispatch(
//       new LoadCaseData({
//         tenant: this.tenant,
//         caseId: this.caseId,
//         dateFormatDb: this.dateFormatDb,
//         pageSize: this.pageSize,
//         authState: this.authState,
//         selectedRole: this.selectedRole
//       })
//     );
//   }

//   trackByStepID(index: number, item: ProcessStepUIModel): string {
//     return item.id;
//   }

//   onProcessStepAddClicked(processStep: ProcessStepNames): void {
//     this.store.dispatch(
//       new OnProcessStepAdd({ caseId: this.caseId, stepData: this.stepData, processStep: processStep, tenant: this.tenant })
//     );
//   }

//   onProcessStepRemove(processStep: ProcessStepUIModel): void {
//     if (!processStep.id) {
//       return;
//     }

//     const dialogRef = this.dialog.open(ConfirmStepDeleteComponent);
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result) {
//         this.store.dispatch(new OnProcessStepRemove({ processStep: processStep, stepData: this.stepData, tenant: this.tenant }));
//       }
//     });
//   }

//   drop(event: CdkDragDrop<string[]>) {
//     this.store.dispatch(
//       new CdkDropListDropped({ caseId: this.caseId, dialog: this.dialog, event: event, stepData: this.stepData, tenant: this.tenant })
//     );
//   }

//   async onChangedStatus(changedStatus: CaseStatus) {
//     const cmd: UpdateCaseStatusDto = {
//       status: changedStatus,
//       caseId: this.caseId
//     };

//     let dialogRef;
//     let onDone = () => {};
//     if (changedStatus === this.caseStatusTypes.Done) {
//       dialogRef = this.dialog.open(ConfirmDoneStatusComponent);
//     } else if (changedStatus === this.caseStatusTypes.Approved) {
//       dialogRef = this.dialog.open(ConfirmDoneStatusComponent);
//       dialogRef.componentInstance.message = 'Are you sure you want to approve this case?';
//       onDone = () => {
//         this.snackBar.open('Case is approved successfully', 'CLOSE', { duration: 2000 });
//       };
//     } else {
//       dialogRef = this.dialog.open(ConfirmDoneStatusComponent);
//       dialogRef.componentInstance.message = 'Are you sure you want to change te status?';
//     }
//     const result = await dialogRef.afterClosed().toPromise();
//     if (result) {
//       this.caseStatus = changedStatus;
//       this.store.dispatch(new OnChangedStatus({ tenant: this.tenant, cmd: cmd }));

//       await this.action$
//         .pipe(
//           filter((action) => action.type === WorkOnCaseTypes.OnChangedStatusSuccess),
//           take(1)
//         )
//         .toPromise();
//       onDone();
//       this.loadCaseData();
//     }
//   }

//   onRawDataDelete(item) {
//     this.store.dispatch(new OnRawDataDelete({ caseId: this.caseId, dialog: this.dialog, item: item, tenant: this.tenant }));
//   }

//   onRawDataInfo(item, title: string) {
//     const dialogRef = this.dialog.open(RawdataInfoComponent);
//     dialogRef.componentInstance.item = item['rawDataEntity'];
//     dialogRef.componentInstance.tenant = this.tenant;
//     dialogRef.componentInstance.title = title;
//   }

//   searchSteps() {
//     this.searchField = new FormControl('');
//     this.searchField.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchTerm) => {
//       const model = <LikeFilter<string>>{
//         valueType: FieldTypeIds.StringField,
//         searchType: SearchType.Like,
//         value: searchTerm
//       };

//       this.searchModel = model;
//       const paging = <Paging>{ skip: 0, take: this.pageSize };
//       this.store.dispatch(new SearchSteps({ paging: paging, model: model, tenant: this.tenant }));
//     });
//   }

//   onPageChange(event: PageEvent) {
//     this.store.dispatch(
//       new OnPageChange({
//         event: event,
//         sliced: this.sliced,
//         length: this.length,
//         pageSize: this.pageSize,
//         processStepNames: this.processStepNames,
//         searchModel: this.searchModel,
//         tenant: this.tenant
//       })
//     );
//   }

//   onFieldChanged(event) {
//     this.isChangedFields = event;
//   }

//   onFormFieldsChanged(event) {
//     this.isChangedFormFields = event;
//   }

//   clear() {
//     this.searchField.setValue('');
//   }

//   renameCase() {
//     this.store.dispatch(
//       new RenameCase({
//         canEditCase: this.canEditCase,
//         caseId: this.caseId,
//         tenantId: this.tenantId,
//         caseName: this.caseName,
//         dialog: this.dialog
//       })
//     );
//   }
// }
