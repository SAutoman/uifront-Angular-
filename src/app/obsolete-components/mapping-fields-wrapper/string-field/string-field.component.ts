// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { IFieldBaseDto, RawDataFieldInfo } from '@wfm/service-layer';

// @Component({
//   selector: 'app-mapping-string-field',
//   templateUrl: './string-field.component.html',
//   styleUrls: ['./string-field.component.scss']
// })
// export class StringFieldComponent implements OnInit {
//   @Input() field: IFieldBaseDto;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   componentId = '2db07898-133a-4d70-9e89-f820d48beddf';

//   constructor() {}

//   ngOnInit(): void {
//     this.onChange();
//   }

//   onChange(): void {
//     this.field.isValid = this.field.value ? true : false;
//     this.isChanged.emit(true);
//   }
// }
