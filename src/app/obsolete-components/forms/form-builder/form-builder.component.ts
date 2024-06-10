// import { Component, Input, OnInit } from '@angular/core';
// import { IFormBuilderViewConfig } from './i-form-builder.view-config';

// @Component({
//   selector: 'app-form-builder',
//   templateUrl: './form-builder.component.html',
//   styleUrls: ['./form-builder.component.scss']
// })
// export class FormBuilderComponent implements OnInit {
//   @Input() inputConfig?: IFormBuilderViewConfig;
//   viewConfig: IFormBuilderViewConfig;
//   sampleImagesForm = [
//     {
//       name: 'Default form',
//       url: 'http://www.welie.com/patterns/images/form-iht.png'
//     },
//     {
//       name: 'Default form 2',
//       url: 'https://d3kf5b36mae37a.cloudfront.net/static/images/features/form-img.png'
//     }
//   ];

//   constructor() {}

//   ngOnInit(): void {
//     this.viewConfig = Object.assign({}, this.createDefaultConfig(), this.inputConfig || {});
//   }
//   private createDefaultConfig(): IFormBuilderViewConfig {
//     const inst: IFormBuilderViewConfig = {} as any;
//     inst.useUploadImageSection = true;
//     inst.useBuildFunction = true;
//     return inst;
//   }
// }
