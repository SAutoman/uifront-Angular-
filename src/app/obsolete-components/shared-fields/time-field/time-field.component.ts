// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IMinMaxValidatorUi } from '@wfm/service-layer/models';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-time-field',
//   templateUrl: './time-field.component.html',
//   styleUrls: ['./time-field.component.scss']
// })
// export class TimeFieldComponent implements OnInit {
//   _model: IMinMaxValidatorUi<Date>;

//   @Input() set model(value: IMinMaxValidatorUi<Date>) {
//     this._model = value;

//     if (!this._model.min || !this._model.max) {
//       return;
//     }

//     this.minInput = moment(this._model.min).format('LT');
//     this.maxInput = moment(this._model.max).format('LT');
//   }

//   get model(): IMinMaxValidatorUi<Date> {
//     return this._model;
//   }

//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   minInput: string;
//   maxInput: string;
//   componentId = '18060c40-a429-4ae7-923a-90ac9b3ffa88';

//   constructor() {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//   }

//   onChangeMin(): void {
//     const date = moment(this.minInput, 'LT').toDate();
//     this.model.min = date;
//     this.isChanged.emit(true);
//   }

//   onChangeMax(): void {
//     const date = moment(this.maxInput, 'LT').toDate();
//     this.model.max = date;
//     this.isChanged.emit(true);
//   }
// }
