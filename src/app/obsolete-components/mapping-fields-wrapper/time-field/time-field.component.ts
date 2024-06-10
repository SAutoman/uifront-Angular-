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
//   selector: 'app-mapping-time-field',
//   templateUrl: './time-field.component.html',
//   styleUrls: ['./time-field.component.scss']
// })
// export class TimeFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = 'fbad40ce-fdc5-4a5d-a845-7e0b4e9c9201';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     this.isChanged.emit(true);
//   }
// }
