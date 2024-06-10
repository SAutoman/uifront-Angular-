// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { IFieldBaseDto, RawDataFieldInfo } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-mapping-date-field',
//   templateUrl: './date-field.component.html',
//   styleUrls: ['./date-field.component.scss']
// })
// export class DateFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = 'fbad40ce-fdc5-4a5d-a845-7e0b4e9c9201';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     if (this.field.value) {
//       const tempDate = new Date(this.field.value).getDate();
//       this.field.value = moment.utc(this.field.value).set('date', tempDate).seconds(0).minutes(0).hours(0).toDate();
//     }
//     this.isChanged.emit(true);
//   }
// }
