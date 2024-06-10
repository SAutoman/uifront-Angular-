// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';

// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// import { Store } from '@ngrx/store';
// import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
// import { cloneDeep, remove } from 'lodash-core';

// /**
//  * project
//  */
// import {
//   ListItemDto,
//   ListsService,
//   FieldTypeIds,
//   SidebarLinksService,
//   FormsService,
//   Paging,
//   DataEntity,
//   IFieldBaseDto,
//   ProcessFlowService
// } from '@wfm/service-layer';

// import { SearchType, LikeFilter, SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { convertTenantName } from '@wfm/shared/utils';
// import { FunctionFieldModel } from '@wfm/shared-fields/function-builder-wrapper/function-builder-wrapper.component';

// import { Expression } from '@wfm/obsolete-components/forms/models/FunctionQuery';
// import { UIFormFieldModel } from '@wfm/obsolete-components/forms/models';

// import { Guid } from '@wfm/shared/guid';
// import { WorkflowIds } from '@wfm/shared/consts/workflow-Ids.enum';

// import { TenantAdminFieldsService } from '@wfm/tenant-admin/tenant-admin.service';
// import { ApplicationState } from '@wfm/store/application/application.reducer';

// /**
//  * local
//  */

// import { SelectType, ProcessStepFieldModel, ProcessStepUpdateModel, UIProcessStepFieldModel } from '../models';
// import { UIFormFieldModelEx } from './models';

// import {
//   mapFieldToUiModel,
//   mapFieldToUiModelCommon,
//   mapProcessStepFieldToUIFormField,
//   mapFormToUiModel,
//   mapFieldModelUpdateCommon,
//   mapListsInitial,
//   mapFormsInitial
// } from './maps';
// import { PageEvent } from '@angular/material/paginator';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { FieldTypeViewMap } from '@wfm/obsolete-components/forms/field-selector/field-type-view.map';

// const findItemPredicate = (a: DataEntity, b: DataEntity): boolean => {
//   return a === b || a.id === b.id;
// };

// @Component({
//   selector: 'app-process-step',
//   templateUrl: './process-step.component.html',
//   styleUrls: ['./process-step.component.scss']
// })
// export class ProcessStepComponent extends TenantComponent implements OnInit {
//   selectableFields: UIProcessStepFieldModel[];
//   selectableLists: UIProcessStepFieldModel[];
//   selectedFields: UIProcessStepFieldModel[] = [];
//   interChangeableFields: UIProcessStepFieldModel[] = [];

//   processName: string;
//   editFormId: string;
//   deletedFields: UIProcessStepFieldModel[] = [];

//   forms: UIProcessStepFieldModel[];
//   term: string;

//   length = 0;
//   pageSize = 5;
//   pageSizeOptions: number[] = [5, 10, 25, 100];
//   pageEvent: PageEvent;

//   searchFieldFields: FormControl;
//   searchFieldLists: FormControl;
//   searchFieldForms: FormControl;

//   listItems: ListItemDto[];
//   functions: Expression[] = [];
//   functionFields: FunctionFieldModel[] = [];
//   isFuncBuilderExpanded: boolean;
//   selectedFormFieldsId: string;
//   selectedType: SelectType = this.selectType.Forms;
//   fieldTypeViewMap: FieldTypeViewMap;
//   searchModel: SearchFieldModel;

//   componentId = '063e0f3d-0b0f-4b3d-adf4-143100175f0a';

//   private supportedFieldTypes = [SelectType.Fields, SelectType.Lists, SelectType.CustomField];

//   get isNew(): boolean {
//     return !this.editFormId;
//   }

//   get FieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }
//   get selectType(): typeof SelectType {
//     return SelectType;
//   }

//   constructor(
//     private fieldService: TenantAdminFieldsService,
//     private listsService: ListsService,
//     private processStepService: ProcessFlowService,
//     private formsService: FormsService,
//     private snackBar: MatSnackBar,
//     private route: ActivatedRoute,
//     private router: Router,
//     private sidebarLinksService: SidebarLinksService,
//     private tenantAdminService: TenantAdminFieldsService,
//     store: Store<ApplicationState>
//   ) {
//     super(store);
//     this.editFormId = this.route.snapshot.params['id'];
//     this.selectedFormFieldsId = Guid.createQuickGuidAsString();
//     this.fieldTypeViewMap = new FieldTypeViewMap();

//     this.searchFieldLists = new FormControl('');
//     this.searchFieldFields = new FormControl('');
//     this.searchFieldForms = new FormControl('');
//   }

//   async ngOnInit(): Promise<void> {
//     const dataLists = await this.listsService.getLists(this.tenant);
//     this.selectableLists = dataLists.items.map((x) => mapListsInitial(x));

//     const dataFormFields = await this.fieldService.getFormFieldsByTenant();
//     this.map(dataFormFields.items);

//     if (this.editFormId) {
//       await this.initUpdateModel();
//     }

//     const dataForms = await this.formsService.getForms(this.tenant);
//     this.forms = dataForms.items.map((x) => mapFormsInitial(x));

//     this.interChangeableFields = this.forms;
//     this.length = this.interChangeableFields.length;
//     this.interChangeableFields = this.forms.slice(0, this.pageSize);

//     const model = <LikeFilter<string>>{
//       valueType: FieldTypeIds.StringField,
//       searchType: SearchType.Like
//     };

//     this.initSearchFields();
//     this.initSearchLists(model);
//     this.initSearchForms(model);
//   }

//   onCreate(field: UIFormFieldModel): void {
//     const customField = <UIProcessStepFieldModel>{};
//     customField.field = <ProcessStepFieldModel>{ ...field.model };
//     // UI
//     customField.name = field.name;
//     customField.type = field.type;
//     customField.isValid = true;
//     customField.processStepType = this.selectType.CustomField;

//     this.selectedFields.push(customField);
//     this.isFuncBuilderExpanded = false;
//     this.functionFields.push(<FunctionFieldModel>{ field: field.model, name: field.name, selectType: SelectType.Fields });

//     this.snackBar.open('Field added successfully', 'CLOSE', {
//       duration: 2000
//     });
//   }

//   onFieldChanged(x: UIFormFieldModelEx): void {
//     x.ref.field.fieldName = x.name;
//     x.ref.field.typeField = x.type;

//     x.ref.name = x.name;
//     x.ref.type = x.type;
//     x.ref.changed = true;
//     x.ref.isValid = x.isValid;
//   }

//   async onPageChange(event: PageEvent): Promise<void> {
//     const startIndex = event.pageIndex * event.pageSize;
//     let endIndex = startIndex + event.pageSize;
//     if (endIndex > this.length) {
//       endIndex = this.length;
//     }

//     switch (this.selectedType) {
//       case this.selectType.Forms:
//         this.interChangeableFields = this.forms.slice(startIndex, endIndex);
//         break;
//       case this.selectType.Fields:
//         const paging = { skip: startIndex, take: event.pageSize } as Paging;
//         this.interChangeableFields = (
//           await this.tenantAdminService.getFieldsByAppId(paging, null, this.searchModel ? [this.searchModel] : [])
//         ).items.map((f) => mapFieldToUiModelCommon(f, SelectType.Fields));
//         break;
//       case this.selectType.Lists:
//         this.interChangeableFields = this.selectableLists.slice(startIndex, endIndex);
//         break;
//     }
//   }
//   isSupportedSearchControl(controlType: SelectType): boolean {
//     switch (controlType) {
//       case SelectType.Forms:
//       case SelectType.Fields:
//       case SelectType.Lists:
//         return true;

//       default:
//         return false;
//     }
//   }
//   getSearchControl(controlType: SelectType): FormControl {
//     switch (controlType) {
//       case SelectType.Forms:
//         return this.searchFieldForms;
//       case SelectType.Fields:
//         return this.searchFieldFields;
//       case SelectType.Lists:
//         return this.searchFieldLists;

//       default:
//         throw new Error('getSearchControl:not supported');
//     }
//   }

//   private async initUpdateModel(): Promise<void> {
//     const data = await this.processStepService.getProcessStepById(this.tenant, this.editFormId);
//     this.processName = data.name;
//     this.functions = data.functions;

//     this.selectedFields = data.fields.map((f) => this.mapFieldModelUpdate(f));
//     this.selectedFields = this.selectedFields.concat(data.forms.map((f) => mapFormToUiModel(f, this.selectType.Forms)));
//     this.selectedFields.sort((a, b) => {
//       const pos1 = this.isField(a.processStepType) ? a.field.position : a.form.position;
//       const pos2 = this.isField(b.processStepType) ? b.field.position : b.form.position;
//       return pos1 - pos2;
//     });

//     const tempFields = this.selectedFields.filter(
//       (x) => x.processStepType === SelectType.Fields || x.processStepType === SelectType.CustomField
//     );

//     const tempForms = this.selectedFields.filter((x) => x.processStepType === SelectType.Forms);
//     const tempLists = this.selectedFields.filter((x) => x.processStepType === SelectType.Lists);

//     let functionFields = tempFields.map((x) => <FunctionFieldModel>{ field: x.field, name: x.name, selectType: SelectType.Fields });

//     functionFields = functionFields.concat(
//       tempLists.map((x) => <FunctionFieldModel>{ field: x.field, name: x.name, selectType: SelectType.Lists })
//     );

//     functionFields = functionFields.concat(
//       tempForms.map((x) => <FunctionFieldModel>{ form: x.form, name: x.name, selectType: SelectType.Forms })
//     );

//     this.functionFields = functionFields;

//     const promises = this.selectedFields.map(async (f) => {
//       if (f.type === FieldTypeIds.ListField && !f.listItems) {
//         await this.getListItems(f);
//       }
//     });

//     await Promise.all(promises);
//   }

//   private async getListItems(field: UIProcessStepFieldModel): Promise<void> {
//     const data = await this.listsService.getListItems(this.tenant, field.id);
//     field.listItems = data.items;
//     this.listItems = data.items;
//   }

//   private mapFieldModelUpdate(x: ProcessStepFieldModel): UIProcessStepFieldModel {
//     if (x.fieldPublicId) {
//       return mapFieldModelUpdateCommon(x, x.fieldPublicId, SelectType.Fields);
//     } else if (x.listPublicId) {
//       return mapFieldModelUpdateCommon(x, x.listPublicId, SelectType.Lists);
//     } else if (x.isCustom) {
//       return mapFieldModelUpdateCommon(x, x.id, SelectType.CustomField);
//     }

//     throw new Error('Not implemented');
//   }

//   async onSelectableFieldsAdd(field: UIProcessStepFieldModel): Promise<void> {
//     // add field to selected list
//     this.selectedFields.push(cloneDeep(field));

//     // remove field from delete list if it is present
//     this.deletedFields = this.deletedFields.filter((x) => findItemPredicate(x, field));
//     remove(this.interChangeableFields, (x) => findItemPredicate(x, field));

//     if (field.type === FieldTypeIds.ListField && !field.listItems) {
//       const data = await this.listsService.getListItems(this.tenant, field.id);
//       field.listItems = data.items;
//       this.listItems = data.items;

//       this.functionFields.push(<FunctionFieldModel>{
//         field: field.field,
//         name: field.name,
//         selectType: SelectType.Lists,
//         listItems: data.items
//       });
//     }

//     if (field.processStepType === SelectType.Fields) {
//       this.functionFields.push(<FunctionFieldModel>{ field: field.field, name: field.name, selectType: SelectType.Fields });
//     }

//     if (field.processStepType === SelectType.Forms) {
//       this.functionFields.push(<FunctionFieldModel>{ form: field.form, name: field.name, selectType: SelectType.Forms });
//     }

//     this.isFuncBuilderExpanded = false;
//   }

//   onSelectedFieldRemove(field: UIProcessStepFieldModel): void {
//     const currentIndex = this.selectedFields.findIndex((x) => findItemPredicate(x, field));
//     const targetIndex = 0;

//     transferArrayItem(this.selectedFields, this.interChangeableFields, currentIndex, targetIndex);

//     // if (this.interChangeableFields[0].form && field.form) {
//     //   transferArrayItem(
//     //     this.selectedFields,
//     //     this.interChangeableFields,
//     //     this.selectedFields.findIndex(x => x.id === field.id),
//     //     0
//     //   );
//     // } else if ((this.interChangeableFields[0]['appPublicId'] && field['appPublicId'])
//     //   && (this.interChangeableFields[0].type !== this.FieldTypeIds.ListField && field.type !== this.FieldTypeIds.ListField)
//     // ) {
//     //   transferArrayItem(
//     //     this.selectedFields,
//     //     this.interChangeableFields,
//     //     this.selectedFields.findIndex(x => x.id === field.id),
//     //     0
//     //   );
//     // } else if (this.interChangeableFields[0].type === this.FieldTypeIds.ListField && field.type === this.FieldTypeIds.ListField) {
//     //   transferArrayItem(
//     //     this.selectedFields,
//     //     this.interChangeableFields,
//     //     this.selectedFields.findIndex(x => x.id === field.id),
//     //     0
//     //   );
//     // } else {
//     //   this.snackBar.open('Incorrect field list! Please return field to the correct field list!', 'CLOSE', { duration: 6000 });
//     // }

//     this.deletedFields.push(field);
//   }

//   async drop(event: CdkDragDrop<string[]>): Promise<void> {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       if (event.previousContainer.id === this.selectedFormFieldsId) {
//         this.onSelectedFieldRemove(<UIProcessStepFieldModel>event.item.data);
//       } else {
//         await this.onSelectableFieldsAdd(<UIProcessStepFieldModel>event.item.data);
//       }
//     }
//   }

//   private map(data: IFieldBaseDto[]): void {
//     const selectableFields = (data || []).map((x) => mapFieldToUiModel(x)).filter((x) => !!x);

//     if (selectableFields.length) {
//       // filtering the undefined
//       this.selectableFields = selectableFields;
//     }
//   }

//   async onSelectType(selectType: SelectType): Promise<void> {
//     this.selectedType = selectType;

//     if (selectType === this.selectType.Forms) {
//       this.interChangeableFields = this.forms;
//       this.length = this.interChangeableFields.length;
//       this.interChangeableFields = this.forms.slice(0, this.pageSize);
//     } else if (selectType === this.selectType.Fields) {
//       const paging = <Paging>{ skip: 0, take: this.pageSize };
//       const data = await this.tenantAdminService.getFieldsByAppId(paging);
//       this.interChangeableFields = data.items.map((f) => mapFieldToUiModelCommon(f, SelectType.Fields));
//       this.length = data.total;
//     } else if (selectType === this.selectType.Lists) {
//       this.interChangeableFields = this.selectableLists;
//       this.length = this.interChangeableFields.length;
//       this.interChangeableFields = this.selectableLists.slice(0, this.pageSize);
//     }
//   }

//   async onFormSubmited(): Promise<void> {
//     if (this.isNew) {
//       this.setPositions();

//       const fields = this.selectedFields.filter((x) => this.supportedFieldTypes.includes(x.processStepType));

//       const fieldsToSend = fields.filter((x) => x.isValid).map((x) => x.field);
//       const workflowsId = WorkflowIds.processStep;

//       const forms = this.selectedFields.filter((x) => x.processStepType === this.selectType.Forms).map((f) => f.form);
//       try {
//         const stepModel = await this.processStepService.createProcessStep(
//           this.tenant,
//           this.processName,
//           workflowsId,
//           fieldsToSend,
//           forms,
//           this.functions
//         );
//         if (this.functions.length) {
//           await this.updateFuncOutputFields(stepModel.id);
//         }

//         this.snackBar.open('Process Step Added Successfully', 'CLOSE', { duration: 2000 });
//         this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/process-step/created-steps`]);
//       } catch (error) {
//         this.snackBar.open('Something went wrong', 'CLOSE', { duration: 2000, panelClass: ['bg-light', 'text-danger'] });
//       }
//     } else {
//       // update
//       this.updatePositions();

//       // fields
//       const newFields = this.selectedFields.filter((f) => this.isField(f.processStepType) && !f.field.id && f.isValid);
//       const updatedFields = this.selectedFields.filter((f) => this.isField(f.processStepType) && f.changed && f.field.id && f.isValid);
//       const deletedFields = this.deletedFields.filter((f) => this.isField(f.processStepType) && f.field.id);
//       // forms

//       const newForms = this.selectedFields.filter((f) => f.processStepType === this.selectType.Forms && f.form && !f.form.id);
//       const updatedForms = this.selectedFields.filter(
//         (f) => f.processStepType === this.selectType.Forms && f.form && f.form.id && f.changed
//       );
//       const deletedForms = this.deletedFields.filter((f) => f.processStepType === this.selectType.Forms && f.form.id);

//       const cmd = <ProcessStepUpdateModel>{
//         id: this.editFormId,
//         name: this.processName,
//         newFields: newFields.map((f) => f.field),
//         updatedFields: updatedFields.map((f) => f.field),
//         deletedFields: deletedFields.map((f) => f.field.id),

//         newForms: newForms.map((f) => f.form),
//         updatedForms: updatedForms.map((f) => f.form),
//         deletedForms: deletedForms.map((f) => f.form.id),

//         functions: this.functions
//       };

//       await this.processStepService.updateProcessStep(this.tenant, cmd, this.editFormId);
//       if (this.functions.length) {
//         await this.updateFuncOutputFields(this.editFormId);
//       }
//       this.snackBar.open(`${this.processName} Updated Successfully`, 'CLOSE', { duration: 2000 });
//       this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/process-step/created-steps`]);
//     }
//   }

//   async onCopySubmited(): Promise<void> {
//     this.setPositions();

//     const fields = this.selectedFields.filter((x) => this.supportedFieldTypes.includes(x.processStepType));

//     const fieldsToSend = fields.filter((x) => x).map((x) => x.field);

//     const workflowsId = WorkflowIds.processStep;
//     const forms = this.selectedFields.filter((x) => x.processStepType === this.selectType.Forms).map((f) => f.form);

//     const stepModel = await this.processStepService.createProcessStep(
//       this.tenant,
//       this.processName,
//       workflowsId,
//       fieldsToSend,
//       forms,
//       this.functions
//     );
//     if (this.functions.length) {
//       await this.updateFuncOutputFields(stepModel.id);
//     }

//     this.snackBar.open(`Process Step ${this.processName} Copied Successfully`, 'CLOSE', { duration: 5000 });
//   }

//   onFieldEdited(model: UIProcessStepFieldModel): void {
//     if (!this.isNew) {
//       model.changed = true;
//     }
//   }

//   private isField(type: SelectType): boolean {
//     if (type === SelectType.CustomField || type === SelectType.Fields || type === SelectType.Lists) {
//       return true;
//     }
//     return false;
//   }

//   private setPositions(): void {
//     for (let i = 0; i < this.selectedFields.length; i++) {
//       switch (this.selectedFields[i].processStepType) {
//         case SelectType.Fields:
//         case SelectType.CustomField:
//         case SelectType.Lists:
//           this.selectedFields[i].field.position = i;
//           break;

//         case SelectType.Forms:
//           this.selectedFields[i].form.position = i;
//           break;
//       }
//     }
//   }

//   private updatePositions(): void {
//     for (let i = 0; i < this.selectedFields.length; i++) {
//       switch (this.selectedFields[i].processStepType) {
//         case SelectType.Fields:
//         case SelectType.CustomField:
//         case SelectType.Lists:
//           if (this.selectedFields[i].field.position !== i) {
//             this.selectedFields[i].field.position = i;
//             this.selectedFields[i].changed = true;
//             this.selectedFields[i].isValid = true;
//           }
//           break;

//         case SelectType.Forms:
//           if (this.selectedFields[i].form.position !== i) {
//             this.selectedFields[i].form.position = i;
//             this.selectedFields[i].changed = true;
//           }
//           break;
//       }
//     }
//   }

//   private initSearchFields(): void {
//     this.searchFieldFields.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(async (searchTerm) => {
//       const model = <LikeFilter<string>>{
//         valueType: FieldTypeIds.StringField,
//         searchType: SearchType.Like,
//         value: searchTerm
//       };

//       this.searchModel = model;

//       const paging = <Paging>{ skip: 0, take: this.pageSize };
//       const data = await this.tenantAdminService.getFieldsByAppId(paging, null, [model]);

//       this.interChangeableFields = data.items.map((f) => mapFieldToUiModelCommon(f, SelectType.Fields));

//       this.length = data.total;
//     });
//   }

//   private initSearchLists(model: SearchFieldModel): void {
//     this.searchFieldLists.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged(),
//         switchMap((searchTerm) => {
//           (<LikeFilter<string>>model).value = searchTerm;
//           return this.listsService.getLists(this.tenant, null, null, [model]);
//         })
//       )
//       .subscribe((data) => {
//         this.selectableLists = data.items.map((x) => mapListsInitial(x));
//         this.interChangeableFields = this.selectableLists.slice(0, this.pageSize);
//       });
//   }

//   private initSearchForms(model: SearchFieldModel): void {
//     this.searchFieldForms.valueChanges
//       .pipe(
//         debounceTime(500),
//         distinctUntilChanged(),
//         switchMap((searchTerm) => {
//           (<LikeFilter<string>>model).value = searchTerm;
//           return this.formsService.getForms(this.tenant, null, null, [model]);
//         })
//       )
//       .subscribe((data) => {
//         this.forms = data.items.map((x) => mapFormsInitial(x));
//         this.interChangeableFields = this.forms.slice(0, this.pageSize);
//       });
//   }

//   mapProcessStepModel(x: UIProcessStepFieldModel): UIFormFieldModelEx {
//     return mapProcessStepFieldToUIFormField(x);
//   }

//   private async updateFuncOutputFields(stepId: string): Promise<void> {
//     // updating rules and output fields with db ids
//     const data = await this.processStepService.getProcessStepById(this.tenant, stepId);
//     data.functions.forEach((func) => {
//       if (func.function !== undefined) {
//         func.function.rules.forEach((rule) => {
//           if (!rule.formRef) {
//             if (rule.fieldRef.isCustom) {
//               const customFieldId = data.fields.find((x) => x.fieldName === rule.fieldRef.fieldName);
//               rule.fieldRef = <ProcessStepFieldModel>{ ...rule.fieldRef, id: customFieldId.id };
//             } else {
//               const fieldWithId = rule.fieldRef.fieldPublicId
//                 ? data.fields.find((x) => x.fieldPublicId === rule.fieldRef.fieldPublicId)
//                 : null;
//               const listWithId = data.fields.find((x) => x.listPublicId === rule.fieldRef.listPublicId);
//               rule.fieldRef = <ProcessStepFieldModel>{ ...rule.fieldRef, id: fieldWithId ? fieldWithId.id : listWithId.id };
//             }
//           }
//         });
//       }

//       func.outputFields.forEach((outField) => {
//         if (outField.fieldRef.isCustom) {
//           const customFieldId = data.fields.find((x) => x.fieldName === outField.fieldRef.fieldName);
//           outField.fieldRef = <ProcessStepFieldModel>{ ...outField.fieldRef, id: customFieldId.id };
//         } else {
//           const fieldWithId = outField.fieldRef.fieldPublicId
//             ? data.fields.find((x) => x.fieldPublicId === outField.fieldRef.fieldPublicId)
//             : null;
//           const listWithId = data.fields.find((x) => x.listPublicId === outField.fieldRef.listPublicId);
//           outField.fieldRef = <ProcessStepFieldModel>{ ...outField.fieldRef, id: fieldWithId ? fieldWithId.id : listWithId.id };
//         }
//       });
//     });

//     const cmd = <ProcessStepUpdateModel>{
//       id: stepId,
//       name: this.processName,
//       functions: data.functions
//     };
//     await this.processStepService.updateProcessStep(this.tenant, cmd, stepId);
//   }
// }
