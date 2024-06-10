// /**
//  * global
//  */
// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { MemoizedSelector, select, State, Store } from '@ngrx/store';
// import { Observable } from 'rxjs';
// import { filter, takeUntil } from 'rxjs/operators';
// import { CdkDragDrop } from '@angular/cdk/drag-drop';
// import { cloneDeep } from 'lodash-core';
// import { MatSnackBar } from '@angular/material/snack-bar';

// /**
//  * project
//  */

// import { FieldTypeIds } from '@wfm/service-layer';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { IConfigurableListItem } from '@wfm/common/models';

// /**
//  * local
//  */
// import { IDraggableList, IDropHandler } from '../../shared';

// @Component({
//   selector: 'app-draggable-list-target',
//   templateUrl: './draggable-list-target.component.html',
//   styleUrls: ['./draggable-list-target.component.scss']
// })
// export class DraggableListTargetComponent extends TenantComponent implements OnInit, IDraggableList, IDropHandler<IConfigurableListItem> {
//   @Input() listId: string;
//   @Input() connectedTo?: string[] = [];
//   @Input() stateSelector: MemoizedSelector<State<any>, IConfigurableListItem[]>;
//   @Input() fieldSelector?: (item: IConfigurableListItem) => boolean;
//   @Input() sortFn?: (a: IConfigurableListItem, b: IConfigurableListItem) => number;

//   @Output() fieldsChange = new EventEmitter<IConfigurableListItem[]>();
//   @Output() saveFields = new EventEmitter<IConfigurableListItem[]>();
//   @Output() itemDrop = new EventEmitter<CdkDragDrop<IConfigurableListItem[]>>();

//   viewFields$: Observable<IConfigurableListItem[]>;
//   componentId = '93d5fe3f-4c6f-426b-8e4a-197ce451af77';

//   get fileTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }

//   constructor(private store: Store<any>, private snackBar: MatSnackBar) {
//     super(store);
//     this.viewFields$ = this.fieldsChange.asObservable();
//     this.viewFields$.subscribe((fields) => {
//       fields.sort((a, b) => {
//         return a.configuration.position - b.configuration.position;
//       });
//     });
//   }

//   ngOnInit(): void {
//     this.store
//       .pipe(
//         takeUntil(this.destroyed$),
//         select(this.stateSelector),
//         filter((x) => !!x)
//       )
//       .subscribe((data) => {
//         const fields: IConfigurableListItem[] = cloneDeep(data);
//         fields.forEach((x) => {
//           if (!x.configuration) {
//             x.configuration = <any>{};
//           }
//           if (!x.configuration.position) {
//             x.configuration.position = 0;
//           }
//         });
//         let filterPredicate: (item: IConfigurableListItem) => boolean = () => true;
//         if (this.fieldSelector) {
//           filterPredicate = this.fieldSelector;
//         }
//         if (this.sortFn) {
//           fields.sort(this.sortFn);
//         }
//         this.fieldsChange.next(fields.filter(filterPredicate));
//       });
//   }

//   drop(event: CdkDragDrop<IConfigurableListItem[]>): void {
//     this.itemDrop.next(event);
//     this.viewFields$.subscribe((fields) => {
//       for (let i = 0; i < fields.length; i++) {
//         if (fields[i].configuration.position !== i) {
//           fields[i].configuration.position = i;
//           fields[i].isChanged = true;
//         }
//       }
//     });
//   }
//   isChangedFields(fields: IConfigurableListItem[]): boolean {
//     return !!this.getChangedFields(fields).length;
//   }
//   async saveSelectedFields(fields: IConfigurableListItem[]) {
//     const changedFields = fields.filter((x) => x.isChanged);

//     for (const field of changedFields) {
//       const tempField = {
//         fieldId: field.rawDataFieldPublicId,
//         configuration: field.configuration
//       };
//       // TODO: check what method needs to be used here
//       // await this.rawDataFieldsService.update(this.tenant, field.rawDataFieldPublicId, tempField);
//       // await this.rawDataFieldsService.updateDeleteMeAfterDemo(this.tenant, field.rawDataFieldPublicId, tempField);
//     }

//     this.snackBar.open(`${changedFields.length} Field(s) Updated Successfully`, 'CLOSE', { duration: 4000 });
//     // this.saveFields.next(this.getChangedFields(fields));
//   }

//   private getChangedFields(fields: IConfigurableListItem[]): IConfigurableListItem[] {
//     return fields.filter((x) => x.isChanged);
//   }
// }
