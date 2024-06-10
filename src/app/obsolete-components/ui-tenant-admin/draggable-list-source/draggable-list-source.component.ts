// /**
//  * global
//  */
// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { PageEvent } from '@angular/material/paginator';
// import { CdkDragDrop } from '@angular/cdk/drag-drop';
// import { FormControl } from '@angular/forms';

// import { Store, select, MemoizedSelector, State } from '@ngrx/store';
// import { takeUntil, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
// import { cloneDeep } from 'lodash-core';
// import { Observable } from 'rxjs';

// import { SortDescriptor } from '@progress/kendo-data-query';
// import { State as DataState } from '@progress/kendo-data-query/dist/npm/state';

// /**
//  * project
//  */

// import { BaseComponent } from '@wfm/shared/base.component';
// import { IConfigurableListItem } from '@wfm/common/models';

// /**
//  * local
//  */
// import { IDraggableList, IDropHandler } from '@wfm/tenant-admin/shared';
// import { TenantAdminFieldsService } from '@wfm/tenant-admin/tenant-admin.service';
// import { SortDirectionValue } from '@wfm/service-layer';

// @Component({
//   selector: 'app-draggable-list-source',
//   templateUrl: './draggable-list-source.component.html',
//   styleUrls: ['./draggable-list-source.component.scss']
// })
// /**
//  * @deprecated
//  */
// export class DraggableListSourceComponent extends BaseComponent implements OnInit, IDraggableList, IDropHandler<IConfigurableListItem> {
//   @Input() listId: string;
//   @Input() connectedTo?: string[] = [];
//   @Input() stateSelector: MemoizedSelector<State<any>, IConfigurableListItem[]>;
//   @Input() fieldSelector?: (item: IConfigurableListItem) => boolean;

//   @Input() pageSize = 10;
//   @Input() pageSizeOptions: number[] = [5, 10, 25, 100];
//   @Output() updatePositions = new EventEmitter();
//   @Output() fieldsChange = new EventEmitter<IConfigurableListItem[]>();
//   @Output() itemDrop = new EventEmitter<CdkDragDrop<IConfigurableListItem[]>>();

//   length = 0;

//   fields: IConfigurableListItem[] = [];

//   viewFields$: Observable<IConfigurableListItem[]>;

//   state: DataState = {
//     skip: 0,
//     take: this.pageSize
//   };

//   sort: SortDescriptor[] = [
//     {
//       field: '',
//       dir: SortDirectionValue.asc
//     }
//   ];

//   searchField: FormControl;
//   componentId = 'b53eba96-eb4b-4286-9892-bcc11f2f1f32';

//   private filterPredicate: (item: IConfigurableListItem) => boolean = () => true;

//   constructor(private store: Store<any>, private tenantFieldsService: TenantAdminFieldsService) {
//     super();
//     this.viewFields$ = this.fieldsChange.asObservable();
//     this.searchField = new FormControl('');
//     this.filterPredicate = () => true;
//   }

//   ngOnInit(): void {
//     this.store
//       .pipe(
//         takeUntil(this.destroyed$),
//         select(this.stateSelector),
//         filter((x) => !!x)
//       )
//       .subscribe((data) => {
//         const fields: IConfigurableListItem[] = cloneDeep<IConfigurableListItem[]>(data);
//         fields.forEach((x) => {
//           if (!x.configuration) {
//             x.configuration = <any>{};
//           }
//         });

//         if (this.fieldSelector) {
//           this.filterPredicate = (x) => this.fieldSelector(x);
//         }

//         this.fields = fields.filter((x) => this.filterPredicate(x));

//         this.length = this.fields.length;
//         this.fieldsChange.next(this.sliceFields(this.fields, 0, this.pageSize));
//       });

//     this.initSearch();
//   }

//   async onPageChange(event: PageEvent) {
//     this.pageSize = event.pageSize;
//     const startIndex = event.pageIndex * event.pageSize;

//     const searchValue = (<string>(this.searchField.value || '')).trim().toLocaleLowerCase();
//     const values = this.fields.filter((x) => {
//       const name = x.name.toLocaleLowerCase();
//       if (name.indexOf(searchValue) > -1) {
//         return true;
//       }
//       return false;
//     });

//     this.length = values.length;
//     this.fieldsChange.next(this.sliceFields(values, startIndex, startIndex + this.pageSize));
//   }

//   drop(event: CdkDragDrop<IConfigurableListItem[]>): void {
//     this.itemDrop.next(event);
//   }

//   private sliceFields(fields: IConfigurableListItem[], startIndex: number, endIndex: number): IConfigurableListItem[] {
//     return fields.slice(startIndex, endIndex);
//   }

//   initSearch(): void {
//     this.searchField.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
//       this.onPageChange({
//         length: 0,
//         pageIndex: 0,
//         pageSize: this.pageSize
//       });
//     });
//   }

//   clear(): void {
//     this.searchField.setValue('');
//   }
// }
