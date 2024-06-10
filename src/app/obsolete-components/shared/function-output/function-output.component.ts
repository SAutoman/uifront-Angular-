// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { trigger, animate, transition, state, style } from '@angular/animations';

// /**
//  * project
//  */
// import { OutputField } from '../../obsolete-components/forms/models/FunctionQuery';
// import { FunctionFieldModel } from '../function-builder-wrapper/function-builder-wrapper.component';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-function-output',
//   templateUrl: './function-output.component.html',
//   styleUrls: ['./function-output.component.scss'],
//   animations: [
//     trigger('collapse', [
//       state('small', style({ height: '0px' })),
//       state('large', style({ height: '630px' })),
//       transition('small <=> large', animate('400ms ease-in'))
//     ])
//   ]
// })
// export class FunctionOutputComponent implements OnInit {
//   _selectedItems: OutputField[];
//   @Input() selectedItemsDefault: FunctionFieldModel[];

//   @Input() set selectedItems(value: OutputField[]) {
//     this._selectedItems = value;
//   }

//   componentId = '66e358f1-deae-494b-b22e-31b71b1a504a';

//   get selectedItems() {
//     return this._selectedItems;
//   }

//   @Output() isOutPutFieldDeleted: EventEmitter<boolean> = new EventEmitter();

//   state: string = 'small';

//   constructor() {}

//   ngOnInit(): void {}

//   animate(): void {
//     this.state = this.state === 'small' ? 'large' : 'small';
//   }

//   onRemoveSelectedOutputItem(item: OutputField): void {
//     const tempIndex = item.isForm
//       ? this.selectedItems.findIndex((x) => x.formId === item.formId)
//       : this.selectedItems.findIndex((x) => x.fieldRef?.id === item.fieldRef?.id);

//     this.selectedItems.splice(tempIndex, 1);
//     this.isOutPutFieldDeleted.emit(true);
//   }

//   getName(x: OutputField): string {
//     return x.fieldName ? x.fieldName : x.formName;
//   }

//   getSelectedItemDefault(x: OutputField): FunctionFieldModel {
//     if (x.fieldRef) {
//       return (
//         this.selectedItemsDefault
//           .filter((l) => l.field)
//           // .find(j => j.field.id === x.fieldRef.id);
//           .find(
//             (j) =>
//               (j.field.fieldPublicId || j.field.listPublicId || j.field.id) ===
//               (x.fieldRef.fieldPublicId || x.fieldRef.listPublicId || x.fieldRef.id)
//           )
//       );
//     }
//     return this.selectedItemsDefault.filter((l) => l.form).find((j) => j.form.formId === x.formId);
//   }
// }
