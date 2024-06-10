// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormGroup } from '@angular/forms';

// /**
//  * project
//  */
// import { IMinMaxValidatorUi } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-int-field',
//   templateUrl: './int-field.component.html',
//   styleUrls: ['./int-field.component.scss']
// })
// export class IntFieldComponent implements OnInit {
//   @Input() model: IMinMaxValidatorUi<number>;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   fieldForm: FormGroup;
//   componentId = '07153713-421a-4cdb-8338-2e7fd6bfde73';

//   constructor() {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//   }

//   onChange(): void {
//     this.isChanged.emit(true);
//   }
// }
