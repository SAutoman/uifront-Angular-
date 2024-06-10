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
//   selector: 'app-mapping-decimal-field',
//   templateUrl: './decimal-field.component.html',
//   styleUrls: ['./decimal-field.component.scss']
// })
// export class DecimalFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = 'ed3ac82e-12b0-4975-9a63-8a8b1c1c6711';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value || this.field.value === 0 ? true : false;
//     this.isChanged.emit(true);
//   }
// }
