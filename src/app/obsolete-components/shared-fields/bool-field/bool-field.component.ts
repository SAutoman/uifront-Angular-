// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IRequiredValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-bool-field',
//   templateUrl: './bool-field.component.html',
//   styleUrls: ['./bool-field.component.scss']
// })
// export class BoolFieldComponent implements OnInit {
//   @Input() model: IRequiredValidatorUi;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = '39fdf4f4-360d-42a3-a058-27afc76888ca';

//   constructor() {}

//   ngOnInit() {
//     this.isChanged.emit(true);
//     this.model.isValid = true;
//   }

//   onChange() {
//     this.isChanged.emit(true);
//   }
// }
