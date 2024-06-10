// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { IFieldBaseDto } from '@wfm/service-layer';

// @Component({
//   selector: 'app-mapping-textarea-field',
//   templateUrl: './textarea-field.component.html',
//   styleUrls: ['./textarea-field.component.scss']
// })
// export class TextareaFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId: string = 'bc026dff-522c-4b1a-993f-ef9ea43c437b';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     this.isChanged.emit(true);
//   }
// }
