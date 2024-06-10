// // TO BE MOVED TO OBSOLETE FOLDER

// /**
//  * global
//  */
// import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
// import { Store, select } from '@ngrx/store';

// import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { cloneDeep } from 'lodash-core';

// /**
//  * project
//  */

// import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
// import { ApplicationState, userProfile } from '@wfm/store';

// import { WfmGridComponent } from '@wfm/shared/wfm-grid/wfm-grid.component';
// import { GridDataResultEx } from '@wfm/shared/kendo-util';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { defaultSchemasListGridSettings } from '@wfm/shared/default-grid-settings';
// import {
//   UsersService,
//   processStepsGridSettings,
//   ProcessStep,
//   ProcessFlowService,
//   GridConfiguration,
//   StatePersistingService
// } from '@wfm/service-layer';

// import { FormControl } from '@angular/forms';
// import { nameToProperty } from '@wfm/service-layer/helpers';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-process-step-list',
//   templateUrl: './process-step-list.component.html',
//   styleUrls: ['./process-step-list.component.scss']
// })
// export class ProcessStepListComponent extends TenantComponent implements OnInit, AfterViewInit {
//   @ViewChild('processStepGrid') grid: WfmGridComponent;

//   gridData: GridDataResultEx<ProcessStep> = {
//     data: [],
//     total: 0
//   };
//   tenantName: string;
//   userId: string;
//   // processStepsGridSettingId: string;
//   searchTerm: string;
//   searchField: FormControl;
//   searchLength: number = 0;
//   processStepsGridSettingsConf: GridConfiguration = cloneDeep(defaultSchemasListGridSettings);

//   constructor(
//     private processStepService: ProcessFlowService,
//     store: Store<ApplicationState>,
//     private dialog: MatDialog,
//     private persistingService: StatePersistingService,
//     private usersService: UsersService,
//     private snackBar: MatSnackBar
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
//         this.tenantName = nameToProperty(data?.currentTenantSystem?.tenant?.tenantName);
//       });
//   }

//   async ngOnInit(): Promise<void> {
//     await this.searchLists();
//     await this.initGridConfiguration();
//   }

//   async initGridConfiguration(): Promise<void> {
//     this.processStepsGridSettingsConf.girdSettingKeyName = processStepsGridSettings;
//   }

//   async searchLists(): Promise<void> {
//     this.searchField = new FormControl('');
//     this.searchField.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe((searchTerm) => {
//       this.searchTerm = searchTerm;
//       if (searchTerm && searchTerm.length > 2) {
//         this.searchLength = searchTerm.length;
//         this.loadData();
//       } else {
//         if (this.searchLength > searchTerm.length) {
//           this.searchTerm = null;
//           this.loadData();
//         }
//         this.searchLength = 0;
//       }
//     });
//   }

//   async loadData(): Promise<void> {
//     const paging = this.grid.gridPaging;
//     const sorting = this.grid.gridSorting;

//     var filters = this.searchTerm
//       ? [
//           {
//             fieldName: 'name',
//             searchType: 3,
//             valueType: 2,
//             value: this.searchTerm
//           }
//         ]
//       : [];

//     const data = await this.processStepService.getAllProcessSteps(this.tenant, paging, sorting, filters);
//     this.gridData = {
//       data: data.items,
//       total: data.total
//     };
//   }

//   async ngAfterViewInit(): Promise<void> {
//     await this.loadData();

//     this.grid.grid.pageChange.subscribe(() => this.loadData());
//     this.grid.grid.sortChange.subscribe(() => this.loadData());
//   }

//   async onDelete(processStep: ProcessStep): Promise<void> {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent);
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result) {
//         await this.processStepService.deleteById(this.tenant, processStep.id);
//         await this.loadData();
//         this.snackBar.open('Process Step Deleted Successfully', 'CLOSE', { duration: 2000 });
//       }
//     });
//   }
// }
