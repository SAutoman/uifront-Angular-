// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IRegExValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-string-regex-field',
//   templateUrl: './string-regex-field.component.html',
//   styleUrls: ['./string-regex-field.component.scss']
// })
// export class StringRegexFieldComponent implements OnInit {
//   @Input() model: IRegExValidatorUi;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   componentId = '513c48a8-6829-4268-8dc4-8ebc18297b63';

//   constructor() {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//   }

//   onChange(): void {
//     this.isChanged.emit(true);
//   }
// }
