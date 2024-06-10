// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';

// /**
//  * project
//  */
// import { IListValidatorUi, ListItemDto } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-listt-field',
//   templateUrl: './listt-field.component.html',
//   styleUrls: ['./listt-field.component.scss']
// })
// export class ListFieldComponent implements OnInit {
//   @Input() model: IListValidatorUi;
//   @Input() listItems: ListItemDto[];
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   fieldForm: FormGroup;
//   componentId = '176ad1df-4daf-4599-9622-a7dc06c6c600';

//   get allowedListItems(): AbstractControl {
//     return this.fieldForm.get('allowedListItems');
//   }

//   constructor(private formBuilder: FormBuilder) {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//     this.fieldForm = this.formBuilder.group({
//       allowedListItems: [this.model.allowedListItemIds ? this.model.allowedListItemIds : null, [Validators.required]]
//     });
//   }

//   onChange(listItemsIds: string[]): void {
//     this.model.allowedListItemIds = listItemsIds;
//     this.isChanged.emit(true);
//   }
// }
