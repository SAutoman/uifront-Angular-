// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { IFieldBaseDto } from '@wfm/service-layer';

// @Component({
//   selector: 'app-mapping-bool-field',
//   templateUrl: './bool-field.component.html',
//   styleUrls: ['./bool-field.component.scss']
// })
// export class BoolFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = 'c3cce9c0-e5ee-4231-9113-d394fc115a75';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     this.isChanged.emit(true);
//   }
// }
