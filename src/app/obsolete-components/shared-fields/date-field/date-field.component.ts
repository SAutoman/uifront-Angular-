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
//   selector: 'app-date-field',
//   templateUrl: './date-field.component.html',
//   styleUrls: ['./date-field.component.scss']
// })
// export class DateFieldComponent implements OnInit {
//   @Input() model: IMinMaxValidatorUi<Date>;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   componentId = 'd6e97b66-1bb3-4930-b1aa-5647a516e7e4';

//   constructor() {}

//   ngOnInit() {
//     this.model.isValid = true;
//   }

//   onChange() {
//     this.isChanged.emit(true);
//   }
// }
