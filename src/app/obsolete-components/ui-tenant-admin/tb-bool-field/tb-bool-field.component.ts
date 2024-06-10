// import { Component, Input, OnInit } from '@angular/core';
// import { IConfigurableListItem } from '@wfm/common/models';

// @Component({
//   selector: 'app-tb-bool-field',
//   templateUrl: './tb-bool-field.component.html',
//   styleUrls: ['./tb-bool-field.component.scss']
// })
// export class TbBoolFieldComponent implements OnInit {
//   @Input() item: IConfigurableListItem;
//   private initValue?: boolean;
//   componentId = '207af50e-f5cc-49a8-9b2c-07fcee4a30d3';

//   constructor() {}

//   ngOnInit(): void {
//     if (this.item.configuration) {
//       this.initValue = !!this.item.configuration.required;
//     }
//   }

//   onChange(): void {
//     this.item.isChanged = this.item.configuration.required !== this.initValue;
//   }
// }
