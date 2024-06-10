// /**
//  * global
//  */
// import { Component, OnInit, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
// import { takeUntil, filter } from 'rxjs/operators';
// import { Store, select } from '@ngrx/store';

// /**
//  * project
//  */

// import {
//   CasesSearchEventService,
//   UsersService,
//   CasesService,
//   CaseDto,
//   CaseStatus,
//   UserSettingsDto,
//   Settings,
//   appCaseViewLayout,
//   UserCardsSettings,
//   UserSettingsLayout
// } from '@wfm/service-layer';

// import {
//   LoadUserSettings,
//   ResetState,
//   GetSelectedLayout,
//   DeleteLayout,
//   UpdateLayout,
//   SetSelectedLayout,
//   userProfile,
//   AuthState,
//   getUserSettingsLayoutsSelector
// } from '@wfm/store';
// import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';
// import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
// import { FilterType } from '@wfm/shared/filter/filter.component';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { ResizeEvent } from 'angular-resizable-element';
// import { WindowService } from '@wfm/service-layer/services/window.service';
// import { EnumConverter } from '@wfm/common/models';

// /**
//  * local
//  */
// import { CaseViewStatus } from './case-view-status';
// import { FilterOptionsComponent } from '../filter-options/filter-options.component';

// @Component({
//   selector: 'app-cases',
//   templateUrl: './cases.component.html',
//   styleUrls: ['./cases.component.scss']
// })
// export class CasesComponent extends TenantComponent implements OnInit {
//   @ViewChild('openComp') openComp: FilterOptionsComponent;
//   @ViewChild('inProgressComp') inProgressComp: FilterOptionsComponent;
//   @ViewChild('doneComp') doneComp: FilterOptionsComponent;
//   @ViewChild('approvedComp') approvedComp: FilterOptionsComponent;
//   @ViewChild('reopenedComp') reopenedComp: FilterOptionsComponent;

//   cases: CaseDto[];
//   openCases: CaseDto[] = [];
//   inProgressCases: CaseDto[] = [];
//   doneCases: CaseDto[] = [];
//   approvedCases: CaseDto[] = [];
//   reOpenCases: CaseDto[] = [];
//   isLoading: {
//     open: boolean;
//     inProgress: boolean;
//     done: boolean;
//     approved: boolean;
//     reopened: boolean;
//   };
//   userSettings: UserCardsSettings;
//   selectedLayout: UserSettingsLayout;
//   userLayouts: UserSettingsLayout[] = [];

//   isSaveClicked: boolean = false;
//   userId: string;
//   appSettingName: string = appCaseViewLayout;
//   caseViewLayoutForm: FormGroup;

//   filterType: FilterType;
//   isDate: boolean;
//   isName: boolean;
//   isCreator: boolean;
//   searchCaseNames: FormControl;

//   status: CaseViewStatus;
//   searchModel: LikeFilter<string>;

//   layoutId: string;
//   isUpdateClicked: boolean = false;
//   caseViewLayoutFormUpdate: FormGroup;

//   layoutName: string;
//   componentId = '890e19d8-9c38-4a5f-a5bf-cf5981b01b31';
//   searchParam: string;

//   actualWidth = '210px';
//   smallWidth: string = '210px';
//   largeWidth: string = '320px';
//   minResolution: number = 1366;
//   lgScreen: boolean = true;
//   smallestWidth = 210;

//   private snackBarDelay = 3000;

//   constructor(
//     private casesService: CasesService,
//     private snackBar: MatSnackBar,
//     private store: Store<AuthState>,
//     private formBuilder: FormBuilder,
//     private usersService: UsersService,
//     private casesSearchEventService: CasesSearchEventService,
//     private windowService: WindowService
//   ) {
//     super(store);
//   }

//   async ngOnInit(): Promise<void> {
//     /**
//      * use it for clean all data
//      */
//     // await removeAllCasesInTenant(this.casesService);

//     this.caseViewLayoutForm = this.formBuilder.group({
//       name: ['', [Validators.required]]
//     });

//     this.caseViewLayoutFormUpdate = this.formBuilder.group({
//       updateName: ['', [Validators.required]]
//     });

//     this.initialState();
//     this.getLayout();
//     this.loadUserId();
//     await this.loadData();
//   }

//   loading(): void {
//     this.isLoading = {
//       open: true,
//       inProgress: true,
//       done: true,
//       approved: true,
//       reopened: true
//     };
//   }

//   loaded(): void {
//     this.isLoading = {
//       open: false,
//       inProgress: false,
//       done: false,
//       approved: false,
//       reopened: false
//     };
//   }

//   private async loadData(): Promise<void> {
//     this.loading();
//     const data = await this.casesService.getCasesWithoutRawData(this.tenant);
//     this.cases = data.items;
//     this.openCases = this.cases.filter((x) => x.status === CaseStatus.Open);
//     this.inProgressCases = this.cases.filter((x) => x.status === CaseStatus.InProgress);
//     this.doneCases = this.cases.filter((x) => x.status === CaseStatus.Done);
//     this.approvedCases = this.cases.filter((x) => x.status === CaseStatus.Approved);
//     this.reOpenCases = this.cases.filter((x) => x.status === CaseStatus.ReOpen);
//     this.loaded();
//   }

//   private getLayout(): void {
//     this.store
//       .pipe(
//         takeUntil(this.destroyed$),
//         select(getUserSettingsLayoutsSelector),
//         filter((x) => !!x)
//       )
//       .subscribe((data) => {
//         this.userLayouts = [];
//         if (data) {
//           data.map((it) => {
//             this.userLayouts.push({
//               id: it.id,
//               name: it.value.name,
//               searchModel: it.value.searchModel,
//               statuses: it.value.statuses
//             });
//           });
//         }
//       });
//   }

//   applyLayout(layout: UserSettingsLayout) {
//     this.selectedLayout = this.userLayouts.find((x) => x.id === layout.id);
//     this.userSettings = layout.statuses;
//     this.layoutId = layout.id;
//     this.layoutName = layout.name;
//     if (this.selectedLayout) {
//       this.searchParam = this.selectedLayout.searchModel;
//       this.filterCases();
//     }
//   }

//   async onDeleteClicked(caseToDelete: CaseDto): Promise<void> {
//     await this.casesService.delete(this.tenant, caseToDelete.id);
//     this.snackBar.open('Case Deleted Successfully', 'CLOSE', { duration: this.snackBarDelay });
//     await this.loadData();
//   }

//   showHide(event: { checked: boolean }, status: string): void {
//     switch (status) {
//       case CaseViewStatus.open:
//         this.userSettings.open.state = event.checked;
//         break;
//       case CaseViewStatus.inProgress:
//         this.userSettings.inProgress.state = event.checked;
//         break;
//       case CaseViewStatus.done:
//         this.userSettings.done.state = event.checked;
//         break;
//       case CaseViewStatus.approved:
//         this.userSettings.approved.state = event.checked;
//         break;
//       case CaseViewStatus.reopened:
//         this.userSettings.reopened.state = event.checked;
//         break;

//       default:
//         break;
//     }
//   }

//   private loadUserId(): void {
//     this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).subscribe((data) => {
//       if (data.profile) {
//         this.userId = data.profile.id;
//       }
//     });
//   }

//   onSaveBtnClicked(): void {
//     this.isSaveClicked = !this.isSaveClicked;
//     this.caseViewLayoutForm.controls.name.reset();
//     this.casesSearchEventService.currentSearchModel.subscribe((searchModel) => {
//       this.searchModel = searchModel;
//     });
//   }

//   async onCreateLayoutClicked(formValue: { name: string }): Promise<void> {
//     if (this.userLayouts.find((x) => x.name === formValue.name)) {
//       this.snackBar.open(`Layout with name "${formValue.name}"  already exists`, 'CLOSE', {
//         duration: this.snackBarDelay
//       });
//       return;
//     }
//     const name = formValue.name;
//     const searchModel = this.searchParam;
//     const filterStatus = this.status;
//     const statuses: UserCardsSettings = this.userSettings;

//     const cmd = <UserSettingsDto>{
//       tenantId: this.tenant,
//       userId: this.userId,
//       settings: [<Settings>{ key: this.appSettingName, value: { name, statuses, searchModel, filterStatus } }]
//     };

//     await this.usersService.createUserSettings(this.tenant, cmd);
//     this.snackBar.open('Layout Saved Successfully', 'CLOSE', {
//       duration: this.snackBarDelay
//     });

//     this.selectedLayout = {
//       id: '',
//       name: name,
//       searchModel: this.searchParam,
//       statuses: this.userSettings
//     };

//     this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: this.userId }));
//     this.isSaveClicked = !this.isSaveClicked;
//     this.casesSearchEventService.onRefresh(true);
//   }

//   async onUpdateLayoutClicked(): Promise<void> {
//     const name = this.layoutName;
//     const searchModel = this.searchParam;
//     const filterStatus = this.status;
//     const statuses: UserCardsSettings = this.selectedLayout.statuses;

//     const cmd = <UserSettingsDto>{
//       tenantId: this.tenant,
//       userId: this.userId,
//       settings: [<Settings>{ id: this.layoutId, key: this.appSettingName, value: { name, statuses, searchModel, filterStatus } }]
//     };

//     const selectedLayout = this.mapToChildrenItems(cmd.settings);

//     await this.store.dispatch(new UpdateLayout({ tenantId: this.tenant, layout: cmd }));
//     this.store.dispatch(new SetSelectedLayout({ tenantId: this.tenant, userId: this.userId, layout: selectedLayout }));
//     this.isUpdateClicked = !this.isUpdateClicked;
//     this.casesSearchEventService.onRefresh(true);
//     this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: this.userId }));
//     this.snackBar.open('Layout Update Successfully', 'CLOSE', {
//       duration: this.snackBarDelay
//     });
//   }

//   private mapToChildrenItems(x: Settings[]): ChildrenItems {
//     return <ChildrenItems>{
//       name: this.layoutName,
//       setting: x,
//       type: 'layout',
//       color: 'primary'
//     };
//   }

//   nameEventHandler($event: FilterType): void {
//     this.filterType = $event;
//     this.status = $event.status as CaseViewStatus;

//     switch (this.filterType.type) {
//       case 'date':
//         this.isDate = this.filterType.isClicked;
//         this.isName = false;
//         this.isCreator = false;
//         break;

//       case 'name':
//         this.isName = this.filterType.isClicked;
//         this.isDate = false;
//         this.isCreator = false;
//         break;

//       case 'creator':
//         this.isCreator = this.filterType.isClicked;
//         this.isDate = false;
//         this.isName = false;
//         break;
//     }
//   }

//   onCasesFilterEvent($event: { status: CaseViewStatus } & CaseDto[]): void {
//     this.displayAllCases();
//     switch ($event.status) {
//       case CaseViewStatus.open:
//         this.openCases = $event;
//         break;

//       case CaseViewStatus.inProgress:
//         this.inProgressCases = $event;
//         break;

//       case CaseViewStatus.done:
//         this.doneCases = $event;
//         break;

//       case CaseViewStatus.approved:
//         this.approvedCases = $event;
//         break;

//       case CaseViewStatus.reopened:
//         this.reOpenCases = $event;
//         break;

//       default:
//         break;
//     }
//   }

//   caseLoading($event: boolean, status: CaseViewStatus): void {
//     const st = $event;
//     switch (status) {
//       case CaseViewStatus.open:
//         this.isLoading.open = st;
//         break;
//       case CaseViewStatus.inProgress:
//         this.isLoading.inProgress = st;
//         break;
//       case CaseViewStatus.done:
//         this.isLoading.done = st;
//         break;
//       case CaseViewStatus.approved:
//         this.isLoading.approved = st;
//         break;
//       case CaseViewStatus.reopened:
//         this.isLoading.reopened = st;
//         break;
//       default:
//         break;
//     }
//   }

//   onRefreshClicked(status: CaseViewStatus): void {
//     switch (status) {
//       case CaseViewStatus.open:
//         this.openCases = this.cases.filter((x) => x.status === CaseStatus.Open);
//         if (this.openComp) this.openComp.clear();
//         break;

//       case CaseViewStatus.inProgress:
//         this.inProgressCases = this.cases.filter((x) => x.status === CaseStatus.InProgress);
//         if (this.inProgressComp) this.inProgressComp.clear();
//         break;

//       case CaseViewStatus.done:
//         this.doneCases = this.cases.filter((x) => x.status === CaseStatus.Done);
//         if (this.doneComp) this.doneComp.clear();
//         break;

//       case CaseViewStatus.approved:
//         this.approvedCases = this.cases.filter((x) => x.status === CaseStatus.Approved);
//         if (this.approvedComp) this.approvedComp.clear();
//         break;

//       case CaseViewStatus.reopened:
//         this.reOpenCases = this.cases.filter((x) => x.status === CaseStatus.ReOpen);
//         if (this.reopenedComp) this.reopenedComp.clear();
//         break;

//       default:
//         break;
//     }

//     this.snackBar.open('Cases Refreshed', 'CLOSE', {
//       duration: this.snackBarDelay
//     });
//   }

//   clear(): void {
//     this.isCreator = false;
//     this.isDate = false;
//     this.isName = false;
//   }

//   onUpdateButtonClicked(): void {
//     this.isUpdateClicked = !this.isUpdateClicked;
//   }

//   onDeleteButtonClicked(): void {
//     this.store.dispatch(new DeleteLayout({ tenantId: this.tenant, id: this.layoutId }));

//     this.store.dispatch(new ResetState());
//     this.store.dispatch(new GetSelectedLayout({ tenantId: this.tenant, userId: this.userId }));
//     this.store.dispatch(new SetSelectedLayout({ tenantId: this.tenant, userId: this.userId, layout: <ChildrenItems>{} }));

//     this.casesSearchEventService.onRefresh(true);

//     this.snackBar.open('Layout Deleted', 'CLOSE', {
//       duration: this.snackBarDelay
//     });
//     this.displayAllCases();
//   }

//   clearAllCases() {
//     this.userSettings = {
//       open: {
//         state: true,
//         width: this.actualWidth
//       },
//       inProgress: {
//         state: true,
//         width: this.actualWidth
//       },
//       done: {
//         state: true,
//         width: this.actualWidth
//       },
//       approved: {
//         state: true,
//         width: this.actualWidth
//       },
//       reopened: {
//         state: true,
//         width: this.actualWidth
//       }
//     };
//     this.displayAllCases();
//     if (this.openComp) this.openComp.clear();
//     if (this.inProgressComp) this.inProgressComp.clear();
//     if (this.doneComp) this.doneComp.clear();
//     if (this.approvedComp) this.approvedComp.clear();
//     if (this.reopenedComp) this.reopenedComp.clear();
//   }

//   displayAllCases(): void {
//     this.store.dispatch(new SetSelectedLayout({ tenantId: this.tenant, userId: this.userId, layout: <ChildrenItems>{} }));
//     this.initialState();
//     this.filterCases();
//   }

//   initialState(): void {
//     const width = this.windowService.windowRef.innerWidth;
//     this.actualWidth = width > this.minResolution ? this.largeWidth : this.smallWidth;
//     this.lgScreen = width > this.minResolution ? true : false;
//     this.userSettings = {
//       open: {
//         state: this.userSettings ? !!this.userSettings.open?.state : true,
//         width: this.actualWidth
//       },
//       inProgress: {
//         state: this.userSettings ? !!this.userSettings.inProgress?.state : true,
//         width: this.actualWidth
//       },
//       done: {
//         state: this.userSettings ? !!this.userSettings.done?.state : true,
//         width: this.actualWidth
//       },
//       approved: {
//         state: this.userSettings ? !!this.userSettings.approved?.state : true,
//         width: this.actualWidth
//       },
//       reopened: {
//         state: this.userSettings ? !!this.userSettings.reopened?.state : true,
//         width: this.actualWidth
//       }
//     };
//     this.clearSelectedLayout();
//   }

//   clearSelectedLayout(): void {
//     this.searchParam = null;
//     this.selectedLayout = {
//       id: null,
//       name: '',
//       searchModel: this.searchParam,
//       statuses: this.userSettings
//     };
//   }

//   filterCases(): void {
//     const term = this.searchParam ? this.searchParam.toLowerCase() : '';
//     this.openCases = this.searchParam
//       ? this.cases.filter((x) => x.status === CaseStatus.Open && x.name.toLowerCase().includes(term))
//       : this.cases.filter((x) => x.status === CaseStatus.Open);
//     this.inProgressCases = this.searchParam
//       ? this.cases.filter((x) => x.status === CaseStatus.InProgress && x.name.toLowerCase().includes(term))
//       : this.cases.filter((x) => x.status === CaseStatus.InProgress);
//     this.doneCases = this.searchParam
//       ? this.cases.filter((x) => x.status === CaseStatus.Done && x.name.toLowerCase().includes(term))
//       : this.cases.filter((x) => x.status === CaseStatus.Done);
//     this.approvedCases = this.searchParam
//       ? this.cases.filter((x) => x.status === CaseStatus.Approved && x.name.toLowerCase().includes(term))
//       : this.cases.filter((x) => x.status === CaseStatus.Approved);
//     this.reOpenCases = this.searchParam
//       ? this.cases.filter((x) => x.status === CaseStatus.ReOpen && x.name.toLowerCase().includes(term))
//       : this.cases.filter((x) => x.status === CaseStatus.ReOpen);
//   }

//   changeContainerSize(): void {
//     this.lgScreen = !this.lgScreen;
//     this.actualWidth = this.lgScreen ? '320px' : '210px';
//     this.userSettings.open.width = this.actualWidth;
//     this.userSettings.inProgress.width = this.actualWidth;
//     this.userSettings.approved.width = this.actualWidth;
//     this.userSettings.reopened.width = this.actualWidth;
//     this.userSettings.done.width = this.actualWidth;
//   }

//   onResizeEnd(event: ResizeEvent, status: string): void {
//     let width;
//     if (event.rectangle.width && event.rectangle.width >= this.smallestWidth) {
//       width = event.rectangle.width + 'px';
//       this.lgScreen = true;
//     } else {
//       width = this.smallestWidth + 'px';
//       this.lgScreen = false;
//     }

//     const converter = new EnumConverter(CaseStatus);
//     const kv = converter.getKeyValue(status);
//     switch (kv.value) {
//       case CaseStatus.Open:
//         this.userSettings.open.width = width;
//         break;
//       case CaseStatus.InProgress:
//         this.userSettings.inProgress.width = width;
//         break;
//       case CaseStatus.Done:
//         this.userSettings.done.width = width;
//         break;
//       case CaseStatus.Approved:
//         this.userSettings.approved.width = width;
//         break;
//       case CaseStatus.ReOpen:
//         this.userSettings.reopened.width = width;
//         break;
//       default:
//         break;
//     }
//   }
// }

// /**
//  * @description  helper for clean all cases
//  * @param tenantId  default is test tenantId 11E9D08FB460EF3EA2F602004C4F4F50
//  */
// async function removeAllCasesInTenant(casesService: CasesService, tenantId = '11E9D08FB460EF3EA2F602004C4F4F50'): Promise<void> {
//   const cases = await casesService.getCasesWithoutRawData(tenantId);
//   cases.items.forEach(async (x) => {
//     try {
//       await casesService.delete(x.tenantPublicId, x.id);
//     } catch (error) {}
//   });
// }
