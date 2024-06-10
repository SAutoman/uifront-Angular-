// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IFieldBaseDto } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-mapping-datetime-field',
//   templateUrl: './datetime-field.component.html',
//   styleUrls: ['./datetime-field.component.scss']
// })
// export class DateTimeFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = 'fbad40ce-fdc5-4a5d-a845-7e0b4e9c9201';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     if (this.field) {
//       const tempDate = new Date(this.field.value).getDate();
//       moment.utc(this.field.value).set('date', tempDate).toDate();
//     }
//     this.isChanged.emit(true);
//   }
// }
