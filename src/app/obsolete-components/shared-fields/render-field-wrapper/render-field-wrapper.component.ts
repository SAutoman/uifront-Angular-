// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// /**
//  * project
//  */
// import { FieldTypeIds, RenderType, FormFieldModel } from '../../service-layer/models';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-render-field-wrapper',
//   templateUrl: './render-field-wrapper.component.html',
//   styleUrls: ['./render-field-wrapper.component.scss']
// })
// export class RenderFieldWrapperComponent implements OnInit {
//   allowedRenderTypes: RenderType[] = [];

//   @Input() fieldType: FieldTypeIds;
//   @Input() renderType: RenderType;
//   @Input() fieldId: string;
//   @Input() model: FormFieldModel;
//   @Output() currentFieldId: EventEmitter<string> = new EventEmitter();

//   componentId = 'becbec6e-c9a7-4bc0-8a59-5fbd75ed380b';

//   get FieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }

//   constructor() {}

//   ngOnInit(): void {
//     this.allowedRenderTypes = this.initializeRenderTypes(this.fieldType);
//   }

//   renderTypeConverter(renderType: RenderType): string {
//     switch (renderType) {
//       case RenderType.Checkbox:
//         return 'Checkbox';
//       case RenderType.RadioButton:
//         return 'Radio Button';
//       case RenderType.Text:
//         return 'Text';
//       case RenderType.List:
//         return 'List';
//     }
//   }

//   initializeRenderTypes(type: FieldTypeIds): RenderType[] {
//     switch (type) {
//       case FieldTypeIds.BoolField:
//         return <RenderType[]>[RenderType.RadioButton, RenderType.Checkbox];

//       default:
//         return this.allowedRenderTypes;
//     }
//   }

//   onRenderTypeSelected(event?: any): void {
//     this.model.renderType = this.renderType;
//     if (event) {
//       this.currentFieldId.emit(this.fieldId);
//     }
//   }
// }
