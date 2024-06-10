// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IMinMaxValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-textarea-field',
//   templateUrl: './textarea-field.component.html',
//   styleUrls: ['./textarea-field.component.scss']
// })
// export class TextareaFieldComponent implements OnInit {
//   @Input() model: IMinMaxValidatorUi<number>;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   componentId = '90eeebf8-ce0b-436d-8096-85b275702970';

//   constructor() {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//   }

//   onChange(): void {
//     this.isChanged.emit(true);
//   }
// }
