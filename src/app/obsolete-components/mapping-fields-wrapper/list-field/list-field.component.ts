// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { Store } from '@ngrx/store';
// /**
//  * project
//  */

// import { ListsService, RawDataStatus, ListItemDto, IFieldBaseDto } from '@wfm/service-layer';
// import { ApplicationState } from '../../../store';
// import { TenantComponent } from '../../../shared/tenant.component';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-mapping-list-field',
//   templateUrl: './list-field.component.html',
//   styleUrls: ['./list-field.component.scss']
// })
// export class ListFieldComponent extends TenantComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = '3119a20b-27a7-4a94-ad1c-2d1e0b634211';

//   listItems: ListItemDto[];

//   get rawDataStatus(): typeof RawDataStatus {
//     return RawDataStatus;
//   }

//   constructor(store: Store<ApplicationState>, private listsService: ListsService) {
//     super(store);
//   }

//   async ngOnInit(): Promise<void> {
//     await this.loadListItems();
//     this.onFieldSelected();
//   }

//   onFieldSelected(): void {
//     this.field.isValid = this.field.value || this.field.value === 0 ? true : false;
//     this.isChanged.emit(true);
//   }

//   private async loadListItems(): Promise<void> {
//     const data = await this.listsService.getListItems(
//       this.tenant,
//       this.field.configuration?.listId,
//       this.field.configuration?.parentListId
//     );
//     this.listItems = data.items;
//   }
// }
