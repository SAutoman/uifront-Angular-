// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// /**
//  * global
//  */
// /**
//  * local
//  */
// import { FieldTypeIds, RawDataFieldInfo } from '../../service-layer';

// @Component({
//   selector: 'app-mapping-fields-wrapper',
//   templateUrl: './mapping-fields-wrapper.component.html',
//   styleUrls: ['./mapping-fields-wrapper.component.scss']
// })
// export class MappingFieldsWrapperComponent implements OnInit {
//   @Input() field: RawDataFieldInfo;
//   @Output() isChanged: EventEmitter<RawDataFieldInfo> = new EventEmitter();

//   constructor() {}

//   ngOnInit(): void {
//     if (!this.field.valueType) {
//       this.field.valueType = this.field['type'];
//     }
//   }

//   onChange(): void {
//     this.field = this.mapField(this.field);
//     this.isChanged.emit(this.field);
//   }

//   mapField(field: RawDataFieldInfo): RawDataFieldInfo {
//     let f: RawDataFieldInfo = { ...field };

//     return f;
//   }

//   get fieldTypeIds() {
//     return FieldTypeIds;
//   }
// }
