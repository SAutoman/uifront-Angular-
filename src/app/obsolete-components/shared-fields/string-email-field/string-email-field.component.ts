// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IEmailValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-string-email-field',
//   templateUrl: './string-email-field.component.html',
//   styleUrls: ['./string-email-field.component.scss']
// })
// export class StringEmailFieldComponent implements OnInit {
//   @Input() model: IEmailValidatorUi;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = '7870ed17-0c68-4538-ae04-6438de123d3f';

//   constructor() {}

//   ngOnInit(): void {
//     this.isChanged.emit(true);
//     this.model.isValid = true;
//   }

//   onChange(): void {
//     this.isChanged.emit(true);
//   }
// }
