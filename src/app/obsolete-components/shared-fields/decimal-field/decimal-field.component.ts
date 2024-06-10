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
//   selector: 'app-decimal-field',
//   templateUrl: './decimal-field.component.html',
//   styleUrls: ['./decimal-field.component.scss']
// })
// export class DecimalFieldComponent implements OnInit {
//   @Input() model: IMinMaxValidatorUi<number>;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();
//   componentId = 'dc5563d3-313c-4c32-94be-0bd0984d9adf';

//   constructor() {}

//   ngOnInit(): void {
//     this.model.isValid = true;
//   }

//   onChange(): void {
//     this.isChanged.emit(true);
//   }
// }
