// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { Store } from '@ngrx/store';
// import { Subscription } from 'rxjs';
// import { map } from 'rxjs/operators';
// /**
//  * project
//  */
// import { CasesSearchEventService, CaseStatus, CasesService, FieldTypeIds, PagedData, CaseDto } from '@wfm/service-layer';
// import { ApplicationState } from '@wfm/store/application-state';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { LikeFilter, RangeFilter, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
// import { CaseViewStatus } from '../cases/case-view-status';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-filter-options',
//   templateUrl: './filter-options.component.html',
//   styleUrls: ['./filter-options.component.scss']
// })
// export class FilterOptionsComponent extends TenantComponent implements OnInit {
//   @Input() isName: boolean;
//   @Input() isDate: boolean;
//   @Input() isCreator: boolean;
//   @Input() filterStatus: CaseViewStatus;

//   @Output() update = new EventEmitter<CaseDto[]>();
//   @Output() loading = new EventEmitter<boolean>();

//   searchByName: FormControl;
//   searchByNameSubscription$ = new Subscription();

//   searchCreator: FormControl;
//   searchCreatorSubscription$ = new Subscription();

//   searchFrom: FormControl;
//   searchFromSubscription$ = new Subscription();

//   searchTo: FormControl;
//   searchToSubscription$ = new Subscription();

//   openCases: CaseDto[] = [];
//   inProgressCases: CaseDto[] = [];
//   doneCases: CaseDto[] = [];
//   approvedCases: CaseDto[] = [];
//   reOpenCases: CaseDto[] = [];

//   searchModel: LikeFilter<string>;

//   fromDate: Date;
//   toDate: Date;
//   componentId = '741e8643-fc01-4ebe-9252-a3a28681f234';

//   constructor(
//     private casesService: CasesService,
//     store: Store<ApplicationState>,
//     private casesSearchEventService: CasesSearchEventService
//   ) {
//     super(store);
//   }

//   ngOnInit(): void {
//     this.searchByNameEvent();
//     this.searchByCreator();
//     this.searchByDate();
//     this.casesSearchEventService.currentSearchModel.subscribe((searchModel) => (this.searchModel = searchModel));
//   }

//   searchByNameEvent(): void {
//     this.searchByName = new FormControl('');
//     this.searchByNameSubscription$ = this.searchByName.valueChanges
//       .pipe(
//         debounceTime(500),
//         map((x) => x || ''),
//         distinctUntilChanged()
//       )
//       .subscribe((searchTerm) => {
//         const model = {
//           fieldName: 'Name',
//           valueType: FieldTypeIds.StringField,
//           searchType: SearchType.Like,
//           value: searchTerm
//         } as LikeFilter<string>;

//         this.casesSearchEventService.assignSearchModel(model);
//         this.loadCasesByStatus(model);
//       });
//   }

//   searchByCreator(): void {
//     this.searchCreator = new FormControl('');
//     this.searchCreatorSubscription$ = this.searchCreator.valueChanges
//       .pipe(
//         debounceTime(500),
//         map((x) => x || ''),
//         distinctUntilChanged()
//       )
//       .subscribe((searchTerm) => {
//         const model = {
//           fieldName: 'AuthorFirstName',
//           valueType: FieldTypeIds.StringField,
//           searchType: SearchType.Like,
//           value: searchTerm
//         } as LikeFilter<string>;

//         this.casesSearchEventService.assignSearchModel(model);
//         this.loadCasesByStatus(model);
//       });
//   }

//   searchByDate(): void {
//     this.searchFrom = new FormControl('');
//     this.searchTo = new FormControl('');

//     const model = {
//       fieldName: 'CreatedAt',
//       valueType: FieldTypeIds.DateField,
//       searchType: SearchType.Range,
//       from: undefined,
//       to: undefined
//     } as RangeFilter<Date>;

//     this.searchFromSubscription$ = this.searchFrom.valueChanges
//       .pipe(
//         debounceTime(500),
//         map((x) => x || ''),
//         distinctUntilChanged()
//       )
//       .subscribe((searchTerm) => {
//         model.from = new Date(searchTerm);

//         if (model.from && model.to) {
//           this.loadCasesByStatus(model);
//         }
//       });

//     this.searchToSubscription$ = this.searchTo.valueChanges
//       .pipe(
//         debounceTime(500),
//         map((x) => x || ''),
//         distinctUntilChanged()
//       )
//       .subscribe((searchTerm) => {
//         model.to = new Date(searchTerm);

//         if (model.from && model.to) {
//           this.loadCasesByStatus(model);
//         }
//       });
//   }

//   async loadCasesByStatus(model?: LikeFilter<string> | RangeFilter<Date>): Promise<void> {
//     let data: PagedData<CaseDto>;
//     this.loading.emit(true);
//     if (model) {
//       data = await this.casesService.getCasesWithoutRawData(this.tenant, null, null, [model]);
//     } else {
//       data = await this.casesService.getCasesWithoutRawData(this.tenant);
//     }
//     this.loading.emit(false);
//     const statusKey = 'status';
//     switch (this.filterStatus) {
//       case CaseViewStatus.open:
//         this.openCases = data.items.filter((x) => x.status === CaseStatus.Open);
//         this.openCases[statusKey] = this.filterStatus;
//         this.update.emit(this.openCases);
//         break;

//       case CaseViewStatus.inProgress:
//         this.inProgressCases = data.items.filter((x) => x.status === CaseStatus.InProgress);
//         this.inProgressCases[statusKey] = this.filterStatus;
//         this.update.emit(this.inProgressCases);
//         break;

//       case CaseViewStatus.done:
//         this.doneCases = data.items.filter((x) => x.status === CaseStatus.Done);
//         this.doneCases[statusKey] = this.filterStatus;
//         this.update.emit(this.doneCases);
//         break;

//       case CaseViewStatus.approved:
//         this.approvedCases = data.items.filter((x) => x.status === CaseStatus.Approved);
//         this.approvedCases[statusKey] = this.filterStatus;
//         this.update.emit(this.approvedCases);
//         break;

//       case CaseViewStatus.reopened:
//         this.reOpenCases = data.items.filter((x) => x.status === CaseStatus.ReOpen);
//         this.reOpenCases[statusKey] = this.filterStatus;
//         this.update.emit(this.reOpenCases);
//         break;

//       default:
//         break;
//     }
//   }

//   clear(): void {
//     this.searchByNameSubscription$.unsubscribe();
//     this.searchCreatorSubscription$.unsubscribe();
//     this.searchFromSubscription$.unsubscribe();
//     this.searchToSubscription$.unsubscribe();
//     this.searchByName.setValue('');
//     this.searchCreator.setValue('');
//     this.searchFrom.setValue('');
//     this.searchTo.setValue('');
//     this.searchByNameEvent();
//     this.searchByCreator();
//     this.searchByDate();
//   }
// }
