// /**
//  * global
//  */
// import { Component, Input, OnInit } from '@angular/core';
// import { Router, ActivatedRoute } from '@angular/router';
// import { FormControl } from '@angular/forms';
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
// import { Store, select } from '@ngrx/store';
// import { takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

// /**
//  * project
//  */
// import { loggedInState, AuthState } from '../../store';

// import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

// import {
//   FormFieldModel,
//   DocumentUploadService,
//   FieldTypeIds,
//   ListsService,
//   UpdateFormCommandDTO,
//   FormsService,
//   SidebarLinksService,
//   ListDto,
//   Paging,
//   IFieldBaseDto
// } from '@wfm/service-layer';

// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { convertTenantName } from '@wfm/shared/utils';

// import { UIFormFieldModel, Expression } from '../models';

// import { formsViewRoute } from '../forms.routing';

// import { SearchType, SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { FunctionFieldModel } from '@wfm/shared-fields/function-builder-wrapper/function-builder-wrapper.component';
// import { SelectType } from '@wfm/process-step/models/SelectType';
// import { ProcessStepFormDto } from '@wfm/process-step/models';
// import { TenantAdminFieldsService } from '@wfm/tenant-admin/tenant-admin.service';
// import { Guid } from '@wfm/shared/guid';

// /**
//  * local
//  */

// import { FieldTypeViewMap } from './field-type-view.map';
// import { IFormBuilderViewConfig } from '../form-builder/i-form-builder.view-config';

// @Component({
//   selector: 'app-field-selector',
//   templateUrl: './field-selector.component.html',
//   styleUrls: ['./field-selector.component.scss']
// })
// export class FieldSelectorComponent extends TenantComponent implements OnInit, IFormBuilderViewConfig {
//   @Input() useUploadImageSection?: boolean;
//   @Input() useBuildFunction?: boolean;
//   @Input() snackBarDelayMs?: number = 2000;
//   @Input() searchFieldsDelayMs?: number = 500;
//   @Input() maxImageFileCount?: number = 5;
//   @Input() defaultImageExt?: string = 'png';

//   sourceFields: UIFormFieldModel[];
//   sourceLists: UIFormFieldModel[];
//   formFields: UIFormFieldModel[] = [];
//   interChangeableFields: UIFormFieldModel[] = [];

//   formName: string;
//   editFormId: string;

//   deletedFields: UIFormFieldModel[] = [];
//   image: string;
//   documentId: string;

//   isLists: boolean = false;
//   showTextToggle = 'Lists';

//   length = 0;
//   pageSize = 5;
//   pageSizeOptions: number[] = [5, 10, 25, 100];
//   pageEvent: PageEvent;
//   authState: AuthState;

//   searchFieldFields: FormControl;
//   searchFieldLists: FormControl;
//   functions: Expression[] = [];
//   functionFields: FunctionFieldModel[] = [];
//   isFuncBuilderExpanded: boolean;
//   fieldTypeViewMap: FieldTypeViewMap;
//   selectedFormFieldsId: string;
//   searchModel: SearchFieldModel;
//   componentId = '34125e04-1412-4a95-9c6c-712566fe23cd';

//   private get isNew(): boolean {
//     return !this.editFormId;
//   }

//   constructor(
//     private store: Store<AuthState>,
//     private listsService: ListsService,
//     private formsService: FormsService,
//     private snackBar: MatSnackBar,
//     private router: Router,
//     private route: ActivatedRoute,
//     private fieldService: TenantAdminFieldsService,
//     private uploadService: DocumentUploadService,
//     private sidebarLinksService: SidebarLinksService,
//     private tenantAdminService: TenantAdminFieldsService
//   ) {
//     super(store);
//     this.fieldTypeViewMap = new FieldTypeViewMap();
//     this.editFormId = this.route.snapshot.params['id'];
//     this.selectedFormFieldsId = Guid.createQuickGuidAsString();

//     this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
//       this.authState = state;
//     });
//   }

//   async ngOnInit(): Promise<void> {
//     const dataList = await this.listsService.getLists(this.tenant);
//     this.sourceLists = dataList.items.map((x) => this.mapLists(x));

//     const dataFormFields = await this.fieldService.getFormFieldsByTenant();
//     this.map(dataFormFields.items);

//     this.loadFields();

//     if (this.editFormId) {
//       await this.updateModel();
//     }

//     const model = <LikeFilter<string>>{
//       valueType: FieldTypeIds.StringField,
//       searchType: SearchType.Like
//     };
//     this.searchFields();
//     this.searchLists(model);
//   }

//   async loadFields() {
//     const paging = <Paging>{ skip: 0, take: this.pageSize };
//     const data = await this.tenantAdminService.getFieldsByAppId(paging);
//     this.interChangeableFields = data.items.map((f) => this.mapFieldToUiModelCommon(f));
//     this.length = data.total;
//   }

//   mapLists(x: ListDto): UIFormFieldModel {
//     const d = <UIFormFieldModel>(<any>{ ...x });
//     d.model = <FormFieldModel>{};
//     d.model.listPublicId = x.id;
//     d.model.typeField = FieldTypeIds.ListField;
//     d.model.fieldName = x.name;
//     d.model.isCustom = false;
//     d.type = FieldTypeIds.ListField;
//     d.model.validators = [];
//     d.isValid = true;
//     return d;
//   }

//   onCreate(field: UIFormFieldModel): void {
//     field.isValid = true;
//     this.formFields.push(field);
//     this.isFuncBuilderExpanded = false;
//     this.functionFields.push(<FunctionFieldModel>{ field: field.model, name: field.name, selectType: SelectType.Fields });
//     this.snackBar.open('Field added successfully', 'CLOSE', {
//       duration: this.snackBarDelayMs
//     });
//   }

//   async onPageChange(event: PageEvent) {
//     const startIndex = event.pageIndex * event.pageSize;
//     let endIndex = startIndex + event.pageSize;
//     if (endIndex > this.length) {
//       endIndex = this.length;
//     }

//     if (this.isLists) {
//       this.interChangeableFields = this.sourceLists.slice(startIndex, endIndex);
//     } else {
//       if (this.searchModel) {
//         const paging = { skip: startIndex, take: event.pageSize } as Paging;
//         this.interChangeableFields = (await this.tenantAdminService.getFieldsByAppId(paging, null, [this.searchModel])).items.map((f) =>
//           this.mapFieldToUiModelCommon(f)
//         );
//       } else {
//         const paging = { skip: startIndex, take: event.pageSize } as Paging;
//         this.interChangeableFields = (await this.tenantAdminService.getFieldsByAppId(paging, null, [])).items.map((f) =>
//           this.mapFieldToUiModelCommon(f)
//         );
//       }
//     }
//   }

//   async onSelectableFieldsAdd(field: UIFormFieldModel, currentIndex?: number): Promise<void> {
//     transferArrayItem(
//       this.interChangeableFields,
//       this.formFields,
//       this.interChangeableFields.findIndex((x) => x === field),
//       currentIndex || 0
//     );

//     this.deletedFields = this.deletedFields.filter((x) => x === field);
//     this.isFuncBuilderExpanded = false;

//     if (field.type === FieldTypeIds.ListField && !field.listItems) {
//       const data = await this.listsService.getListItems(this.tenant, field.id);
//       field.listItems = data.items;
//       this.functionFields.push(<FunctionFieldModel>{
//         field: field.model,
//         name: field.name,
//         selectType: SelectType.Lists,
//         listItems: data.items
//       });
//       return;
//     }

//     this.functionFields.push(<FunctionFieldModel>{ field: field.model, name: field.name, selectType: SelectType.Fields });
//   }

//   onSelectedFieldRemove(field: UIFormFieldModel): void {
//     transferArrayItem(
//       this.formFields,
//       this.interChangeableFields,
//       this.formFields.findIndex((x) => x === field),
//       0
//     );

//     this.deletedFields.push(field);
//   }

//   async drop(event: CdkDragDrop<string[]>): Promise<void> {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//     } else {
//       if (event.previousContainer.id === this.selectedFormFieldsId) {
//         this.onSelectedFieldRemove(<UIFormFieldModel>event.item.data);
//       } else {
//         await this.onSelectableFieldsAdd(<UIFormFieldModel>event.item.data, event.currentIndex);
//       }
//     }
//   }

//   async onFormSubmited(): Promise<void> {
//     if (this.isNew) {
//       const validFields = this.formFields.filter((x) => x.isValid);
//       const fields = validFields.map((field) => field.model);
//       fields.forEach((x, idx) => (x.position = idx));

//       const tempForm = await this.formsService.createForm(
//         this.tenant,
//         this.formName,
//         this.maxImageFileCount,
//         this.defaultImageExt,
//         <FormFieldModel[]>fields,
//         this.documentId,
//         this.functions
//       );
//       if (this.functions.length) {
//         await this.updateFuncOutputFields(tempForm.id);
//       }

//       this.snackBar.open('Form Added Successfully', 'CLOSE', { duration: this.snackBarDelayMs });
//       this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/${formsViewRoute}`]);
//     } else {
//       // update

//       for (let i = 0; i < this.formFields.length; i++) {
//         if (this.formFields[i].model.position !== i) {
//           this.formFields[i].model.position = i;
//           this.formFields[i].changed = true;
//           this.formFields[i].isValid = true;
//         }
//       }

//       const cmd = <UpdateFormCommandDTO>{
//         id: this.editFormId,
//         name: this.formName,
//         documentId: this.documentId,
//         newFields: this.formFields.filter((field) => !field.model.id && field.isValid).map((f) => f.model),
//         updatedFields: this.formFields.filter((field) => field.changed && field.model.id && field.isValid).map((f) => f.model),
//         deletedFields: this.deletedFields.filter((field) => field.model.id).map((f) => f.model.id),
//         functions: this.functions
//       };

//       await this.formsService.updateForm(this.tenant, cmd);
//       if (this.functions.length) {
//         await this.updateFuncOutputFields(this.editFormId);
//       }
//       this.snackBar.open('Form Updated Successfully', 'CLOSE', { duration: this.snackBarDelayMs });
//       this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/${formsViewRoute}`]);
//     }
//   }

//   async onCopySubmited(): Promise<void> {
//     const fields = this.formFields.filter((x) => x).map((field) => field.model);
//     for (let i = 0; i < fields.length; i++) {
//       fields[i].position = i;
//     }

//     const tempForm = await this.formsService.createForm(
//       this.tenant,
//       this.formName,
//       this.maxImageFileCount,
//       this.defaultImageExt,
//       <FormFieldModel[]>fields,
//       this.documentId,
//       this.functions
//     );
//     if (this.functions) {
//       if (this.functions.length) {
//         await this.updateFuncOutputFields(tempForm.id);
//       }
//     }

//     this.snackBar.open(`Form ${this.formName} Copied Successfully`, 'CLOSE', { duration: 4000 });
//   }

//   async onToggleChecked(event) {
//     this.isLists = event.checked;
//     if (event.checked) {
//       this.showTextToggle = 'Fields';
//       const paging = <Paging>{ skip: 0, take: this.pageSize };
//       const data = await this.tenantAdminService.getFieldsByAppId(paging);
//       this.interChangeableFields = data.items.map((f) => this.mapFieldToUiModelCommon(f));
//       this.length = data.total;
//     } else {
//       this.showTextToggle = 'Lists';
//       this.interChangeableFields = this.sourceFields;
//       this.interChangeableFields = this.sourceFields.slice(0, this.pageSize);
//       this.length = this.sourceFields.length;
//     }
//   }

//   mapFieldToUiModel(x: IFieldBaseDto): UIFormFieldModel {
//     const d = this.mapFieldToUiModelCommon(x);
//     if (x.type === FieldTypeIds.ListField) {
//       d.model.listPublicId = x.id;
//     } else {
//       d.model.fieldPublicId = x.id;
//     }
//     return d;
//   }

//   mapFieldToUiModelCommon(x: IFieldBaseDto): UIFormFieldModel {
//     const d = <UIFormFieldModel>(<any>{ ...x });
//     d.model = <FormFieldModel>{};
//     d.model.typeField = x.type;
//     d.model.fieldName = x.fieldName;
//     d.model.isCustom = false;
//     d.type = x.type;
//     d.model.validators = [];
//     d.isValid = true;
//     return d;
//   }

//   map(data: IFieldBaseDto[]): void {
//     const selectableFields = data.map((x) => this.mapFieldToUiModel(x));
//     if (selectableFields) {
//       // filtering the undefined
//       this.sourceFields = selectableFields.filter((x) => x);
//     }
//   }

//   async updateModel(): Promise<void> {
//     const data = await this.formsService.getFormFields(this.tenant, this.editFormId);
//     this.formName = data.name;
//     this.functions = data.functions;

//     this.documentId = data.documentId;
//     this.image = data.documentId ? this.uploadService.buildImage(data.documentId, this.authState.sessionId) : null;

//     if (data.fields) {
//       this.formFields = data.fields.map((f) => this.mapModelUpdate(<FormFieldModel>f));
//     }

//     for (const x of this.formFields) {
//       if (x.type === FieldTypeIds.ListField) {
//         const listItems = await this.listsService.getListItems(this.tenant, x.id);
//         x.listItems = listItems.items;

//         this.functionFields.push(<FunctionFieldModel>{
//           field: x.model,
//           name: x.name,
//           selectType: SelectType.Lists,
//           listItems: listItems.items
//         });
//       } else {
//         this.functionFields.push(<FunctionFieldModel>{ field: x.model, name: x.name, selectType: SelectType.Fields });
//       }
//     }
//   }

//   mapModelUpdate(x: FormFieldModel): UIFormFieldModel {
//     if (x.fieldPublicId) {
//       return this.mapModelUpdateCommon(x, x.fieldPublicId);
//     } else if (x.listPublicId) {
//       return this.mapModelUpdateCommon(x, x.listPublicId);
//     } else if (x.isCustom) {
//       return this.mapModelUpdateCommon(x, x.id);
//     }

//     throw new Error('Not implemeted');
//   }

//   mapModelUpdateCommon(x: FormFieldModel, id: string): UIFormFieldModel {
//     const d = <UIFormFieldModel>{};
//     d.model = x;
//     d.name = x.fieldName;
//     d.type = x.typeField;
//     d.id = id;
//     return d;
//   }

//   // onFieldEdited(model: UIFormFieldModel) {
//   //   if (!this.IsNew) {
//   //     model.changed = true;
//   //   }
//   // }

//   async onUpload(formData: FormData) {
//     const result = await this.uploadService.upload(formData);
//     this.documentId = result.id;
//     this.image = this.uploadService.buildImage(this.documentId, this.authState.sessionId);
//   }

//   searchFields() {
//     this.searchFieldFields = new FormControl('');
//     this.searchFieldFields.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(async (searchTerm) => {
//       const model = <LikeFilter<string>>{
//         valueType: FieldTypeIds.StringField,
//         searchType: SearchType.Like,
//         value: searchTerm
//       };

//       this.searchModel = model;

//       const paging = <Paging>{ skip: 0, take: this.pageSize };
//       const data = await this.tenantAdminService.getFieldsByAppId(paging, null, [model]);

//       this.interChangeableFields = data.items.map((f) => this.mapFieldToUiModelCommon(f));
//       this.length = data.total;
//     });
//   }

//   searchLists(model: SearchFieldModel) {
//     this.searchFieldLists = new FormControl('');
//     this.searchFieldLists.valueChanges
//       .pipe(
//         debounceTime(this.searchFieldsDelayMs),
//         distinctUntilChanged(),
//         switchMap((searchTerm) => {
//           (<LikeFilter<string>>model).value = searchTerm;
//           return this.listsService.getLists(this.tenant, null, null, [model]);
//         })
//       )
//       .subscribe((data) => {
//         this.sourceLists = data.items.map((x) => this.mapLists(x));
//         this.interChangeableFields = this.sourceLists.slice(0, this.pageSize);
//       });
//   }

//   clear() {
//     this.searchFieldFields.setValue('');
//     this.searchFieldLists.setValue('');
//   }

//   async updateFuncOutputFields(formId: string) {
//     // updating rules and output fields with db ids
//     const data = await this.formsService.getFormFields(this.tenant, formId);
//     data.functions.forEach((func) => {
//       func.function.rules.forEach((rule) => {
//         if (rule.fieldRef.isCustom) {
//           const customFieldId = data.fields.find((x) => x.fieldName === rule.fieldRef.fieldName);
//           rule.fieldRef = <FormFieldModel>{ ...rule.fieldRef, id: customFieldId.id };
//         } else {
//           const fieldWithId = rule.fieldRef.fieldPublicId ? data.fields.find((x) => x.fieldPublicId === rule.fieldRef.fieldPublicId) : null;
//           const listWithId = data.fields.find((x) => x.listPublicId === rule.fieldRef.listPublicId);
//           rule.fieldRef = <FormFieldModel>{ ...rule.fieldRef, id: fieldWithId ? fieldWithId.id : listWithId.id };
//         }
//         rule.formRef = <ProcessStepFormDto>{ formId: formId, name: data.name };
//       });

//       func.outputFields.forEach((outField) => {
//         if (outField.fieldRef.isCustom) {
//           const customFieldId = data.fields.find((x) => x.fieldName === outField.fieldRef.fieldName);
//           outField.fieldRef = <FormFieldModel>{ ...outField.fieldRef, id: customFieldId.id };
//         } else {
//           const fieldWithId = outField.fieldRef.fieldPublicId
//             ? data.fields.find((x) => x.fieldPublicId === outField.fieldRef.fieldPublicId)
//             : null;
//           const listWithId = data.fields.find((x) => x.listPublicId === outField.fieldRef.listPublicId);
//           outField.fieldRef = <FormFieldModel>{ ...outField.fieldRef, id: fieldWithId ? fieldWithId.id : listWithId.id };
//         }
//         outField.formId = formId;
//       });
//     });

//     const cmd = <UpdateFormCommandDTO>{
//       id: formId,
//       name: this.formName,
//       documentId: this.documentId,
//       functions: data.functions
//     };
//     await this.formsService.updateForm(this.tenant, cmd);
//   }
// }
