// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';

// /**
//  * project
//  */
// import { ListItemDto, ListsService, PagedData } from '../../service-layer';
// import { Expression } from '../../obsolete-components/forms/models';
// import { ProcessStepFormDto, SelectType, ProcessStepFieldModel } from '../../obsolete-components/process-step/models';

// /**
//  * local
//  */

// export interface FunctionFieldModel {
//   field: ProcessStepFieldModel;
//   form: ProcessStepFormDto;
//   name: string;
//   selectType: SelectType;
//   listItems?: ListItemDto[];
//   hasError?: boolean;
// }

// @Component({
//   selector: 'app-function-builder-wrapper',
//   templateUrl: './function-builder-wrapper.component.html',
//   styleUrls: ['./function-builder-wrapper.component.scss']
// })
// export class FunctionBuilderWrapperComponent implements OnInit {
//   @Input() items: FunctionFieldModel[];
//   @Input() tenant: string;
//   @Input() functions: Expression[];
//   functionErrors = new Map<string, string>();
//   componentId = 'e5c70411-6317-4b61-8300-bbbdbb217029';

//   constructor(private listsService: ListsService) {}

//   ngOnInit(): void {}

//   onAddFunction(): void {
//     this.functions.forEach((x) => (x.expanded = false));
//     this.functions.push(<Expression>{ name: `Function ${this.functions.length + 1}`, outputFields: [], expanded: true });
//   }

//   onDeletedFunction(func: Expression): void {
//     const funcIndex = this.functions.indexOf(func);
//     this.functions.splice(funcIndex, 1);
//   }

//   async onFunctionExpanded(item: Expression): Promise<void> {
//     if (this.functionErrors.has(item.id)) {
//       return;
//     }
//     const promises = this.items.map(async (f) => {
//       if (f) {
//         let data: PagedData<ListItemDto>;
//         if (f.field) {
//           if (f.field.listPublicId) {
//             data = await this.listsService.getListItems(this.tenant, f.field.listPublicId);
//             f.listItems = data.items;
//           }
//         }
//       }
//     });

//     await Promise.all(promises);

//     item.expanded = true;
//   }

//   onFunctionCollapse(item: Expression): void {
//     item.expanded = false;
//   }
// }
