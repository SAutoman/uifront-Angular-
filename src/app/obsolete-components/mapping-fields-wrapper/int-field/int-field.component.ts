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
//   selector: 'app-mapping-int-field',
//   templateUrl: './int-field.component.html',
//   styleUrls: ['./int-field.component.scss']
// })
// export class IntFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = '002ccaf7-b200-4dce-8f05-7847f2a66e1a';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value || this.field.value === 0 ? true : false;
//     this.isChanged.emit(true);
//   }
// }
