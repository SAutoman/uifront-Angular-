// /**
//  * global
//  */
// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// import { FormBuilder, FormControl } from '@angular/forms';
// import { MatSnackBar } from '@angular/material/snack-bar';
// import { remove, cloneDeep, uniqBy } from 'lodash-core';

// /**
//  * project
//  */
// import { FormFieldModel, FieldTypeIds, ListItemDto, FormsService, ListsService, Form, PagedData } from '@wfm/service-layer';

// import { Expression, OutputField, RuleSetCustom, CustomRule, CustomOption, FieldPropertyType } from '@wfm/obsolete-components/forms/models';

// import { QueryBuilderConfig, Field } from '@wfm/obsolete-components/query-builder/components/query-builder/query-builder.interfaces';
// import { SelectType, ProcessStepFormDto } from '@wfm/obsolete-components/process-step/models';
// import { FunctionFieldModel } from '../function-builder-wrapper/function-builder-wrapper.component';

// /**
//  * local
//  */
// export const formFieldDelimiter = ' | ';

// @Component({
//   selector: 'app-function-builder',
//   templateUrl: './function-builder.component.html',
//   styleUrls: ['./function-builder.component.scss']
// })
// export class FunctionBuilderComponent implements OnInit {
//   @Input() items: FunctionFieldModel[];
//   @Input() tenant: string;
//   @Input() currentExpression: Expression;
//   @Output() deletedFunction: EventEmitter<Expression> = new EventEmitter();
//   // tmp solution for notify about error in ui
//   @Output() error: EventEmitter<string> = new EventEmitter();

//   queryCtrl: FormControl;
//   config: QueryBuilderConfig = { fields: {}, forms: [] };
//   currentSelectedField: FunctionFieldModel;
//   allowedOperatorsPerFieldType: { [id: string]: string[] } = {};

//   forms: FunctionFieldModel[] = [];
//   fields: FunctionFieldModel[] = [];

//   isDataLoaded = false;
//   functionName: string;

//   selectedItems: OutputField[] = [];
//   query: RuleSetCustom;

//   hasError: boolean;
//   loading: boolean;
//   componentId = '82bbeea0-0971-4a79-bbde-afc5a579ae17';

//   constructor(
//     private formBuilder: FormBuilder,
//     private snackBar: MatSnackBar,
//     private formsService: FormsService,
//     private listsService: ListsService
//   ) {
//     this.allowedOperatorsPerFieldType = {
//       [FieldTypeIds.IntField]: ['=', '!=', '>', '>=', '<', '<='],
//       [FieldTypeIds.DecimalField]: ['=', '!=', '>', '>=', '<', '<='],
//       [FieldTypeIds.StringField]: ['=', '!='],
//       [FieldTypeIds.DateField]: ['=', '>', '>=', '<', '<='],
//       [FieldTypeIds.TextareaField]: ['=', '!='],
//       [FieldTypeIds.ListField]: ['=', '!='],
//       [FieldTypeIds.MultiselectListField]: ['=', '!='],
//       [FieldTypeIds.BoolField]: ['=', '!='],
//       [FieldTypeIds.TimeField]: ['=', '!='],
//       [FieldTypeIds.FileField]: ['=', '!='],
//       [FieldTypeIds.DateTimeField]: ['=', '>', '>=', '<', '<=']
//     };
//     this.error.subscribe(() => {
//       this.hasError = true;
//     });
//     this.loading = true;
//   }

//   async ngOnInit(): Promise<void> {
//     if (this.items.some((x) => x.hasError)) {
//       setTimeout(() => {
//         this.error.next('Some Form or field is empty or invalid');
//       });
//       return;
//     }

//     const forms = this.items.filter((x) => x.selectType === SelectType.Forms);
//     // forms.map((x, i) => x.name = `[${++i}] ${x.name}`);
//     let fields = this.items.filter((x) => x.selectType === SelectType.Fields || x.selectType === SelectType.Lists);
//     fields = uniqBy(fields, 'field.fieldPublicId');

//     const config: QueryBuilderConfig = { fields: {}, forms: [] };

//     // fill fields
//     this.items
//       .filter((x) => x.selectType === SelectType.Fields)
//       .forEach((x) => {
//         config.fields[x.name] = this.buildConfigField(x.name, x.field.typeField, x.field);
//       });

//     // prepare forms
//     const workFormList$: Promise<{
//       input: FunctionFieldModel;
//       detail: Form;
//     } | null>[] = forms.map(async (x) => {
//       try {
//         const data = await this.formsService.getFormFields(this.tenant, x.form.formId);

//         return {
//           input: x,
//           detail: data
//         };
//       } catch (error) {
//         remove(forms, (item: FunctionFieldModel) => item.form && item.form.formId === item.form.formId);
//         x.hasError = true;
//         console.warn('FunctionBuilderComponent:workFormList$', { error, formField: x, message: 'TODO backend throw 500 with empty error' });

//         return null;
//       }
//     });

//     // prepare Lists
//     const formList = await Promise.all(workFormList$);
//     if (formList.some((x) => !x)) {
//       this.error.next('Some Form or field is empty or invalid');
//       return;
//     }
//     const workFormList = formList.filter((x) => !!x);

//     const listCommands = new Map<string, ((items: ListItemDto[]) => void)[]>();

//     const addCommand = (key: string, command: (items: ListItemDto[]) => void) => {
//       if (listCommands.has(key)) {
//         listCommands.get(key).push(command);
//       } else {
//         listCommands.set(key, [command]);
//       }
//     };

//     workFormList.forEach((data) => {
//       const srcForm: FunctionFieldModel = data.input;

//       const detailForm: Form = data.detail;
//       const formKey = srcForm.name + formFieldDelimiter;

//       if (!detailForm.functions) {
//         detailForm.fields.forEach((x) => {
//           const fieldName = formKey + x.fieldName;
//           config.fields[fieldName] = this.buildConfigField(fieldName, x.typeField, x);
//         });
//       } else {
//         detailForm.functions
//           .filter((x) => !!x.function && !!x.function.rules)
//           .forEach((expression) => {
//             const rules = expression.function.rules;
//             rules.forEach((rule) => {
//               const fieldName = [formKey, expression.name, formFieldDelimiter, rule.field].join('');
//               if (rule.fieldRef.typeField === FieldTypeIds.ListField) {
//                 const listId = rule.fieldRef.listPublicId;
//                 addCommand(listId, (listItems) => {
//                   config.fields[fieldName] = this.buildConfigField(
//                     fieldName,
//                     rule.fieldRef.typeField,
//                     rule.fieldRef,
//                     rule.formRef,
//                     listItems
//                   );
//                 });
//               } else {
//                 config.fields[fieldName] = this.buildConfigField(fieldName, rule.fieldRef.typeField, rule.fieldRef, rule.formRef);
//               }
//             });
//           });
//       }
//     });

//     // add lists
//     this.items
//       .filter((x) => x.selectType === SelectType.Lists)
//       .forEach((x) => {
//         const listId = x.field.listPublicId;
//         addCommand(listId, (listItems) => {
//           config.fields[x.name] = this.buildConfigField(x.name, x.field.typeField, x.field, null, listItems);
//         });
//       });

//     const selectList$ = Array.from(listCommands.keys()).map(async (listId: string) => {
//       const page = await this.listsService.getListItems(this.tenant, listId);
//       const commands = listCommands.get(listId);
//       commands.forEach((command) => command(cloneDeep(page.items)));
//       return true;
//     });

//     await Promise.all(selectList$);

//     this.forms = forms;
//     this.fields = fields;
//     this.config = config;

//     this.loadDataEdit();
//     this.loading = false;
//   }

//   mapListItem(x: ListItemDto): CustomOption {
//     return <CustomOption>{
//       listItemsRef: x,
//       name: x.item,
//       value: x.id
//     };
//   }

//   buildConfigField(
//     name: string,
//     type: FieldTypeIds,
//     fieldRef: FormFieldModel,
//     formRef?: ProcessStepFormDto,
//     listItems?: ListItemDto[]
//   ): Field {
//     return <Field>{
//       name,
//       type: this.getHtmlType(type),
//       operators: this.allowedOperatorsPerFieldType[type],
//       options: type === FieldTypeIds.ListField ? listItems?.map((x) => this.mapListItem(x)) : null,
//       fieldRef,
//       formRef
//     };
//   }

//   async onFieldSelected(field: FunctionFieldModel): Promise<void> {
//     if (field.selectType === SelectType.Fields) {
//       const tempFieldId = field.field.isCustom ? field.field.id : field.field.fieldPublicId;
//       const foundField = this.selectedItems.filter((x) => !x.isForm).find((x) => x.fieldRef.fieldPublicId === tempFieldId);

//       if (!foundField) {
//         this.selectedItems.push(<OutputField>{
//           fieldName: field.name,
//           fieldRef: field.field,
//           propertyTypes: [FieldPropertyType.Visible, FieldPropertyType.Editable]
//         });
//       }
//     } else {
//       const foundList = this.selectedItems.find((x) => x.fieldRef?.listPublicId === field.field.listPublicId);
//       if (!foundList) {
//         this.selectedItems.push(<OutputField>{
//           fieldName: field.name,
//           fieldRef: field.field,
//           propertyTypes: [FieldPropertyType.Visible, FieldPropertyType.Editable]
//         });
//       }
//     }
//   }

//   onFormSelected(form: FunctionFieldModel): void {
//     const foundForm = this.selectedItems.find((x) => x.formId === form.form.formId);

//     if (!foundForm) {
//       this.selectedItems.push(<OutputField>{
//         formName: form.name,
//         formId: form.form.formId,
//         propertyTypes: [FieldPropertyType.Visible, FieldPropertyType.Editable],
//         isForm: true
//       });
//     }
//   }

//   async loadDataEdit(): Promise<void> {
//     if (this.currentExpression.function) {
//       this.isDataLoaded = true;
//       this.query = this.currentExpression.function;
//       this.functionName = this.currentExpression.name;

//       this.selectedItems = this.currentExpression.outputFields;
//       this.selectedItems = this.selectedItems.concat(this.currentExpression.outputForms);
//     } else {
//       this.query = <RuleSetCustom>{
//         condition: 'and',
//         rules: <CustomRule[]>[]
//       };

//       this.isDataLoaded = true;
//     }
//     this.queryCtrl = this.formBuilder.control(this.query);
//   }

//   getHtmlType(type: FieldTypeIds): string {
//     switch (type) {
//       case FieldTypeIds.StringField:
//         return 'string';
//       case FieldTypeIds.IntField:
//       case FieldTypeIds.DecimalField:
//         return 'number';
//       case FieldTypeIds.BoolField:
//       case FieldTypeIds.FileField:
//         return 'boolean';
//       case FieldTypeIds.DateField:
//       case FieldTypeIds.DateTimeField:
//         return 'date';
//       case FieldTypeIds.TextareaField:
//         return 'textarea';
//       case FieldTypeIds.ListField:
//       case FieldTypeIds.MultiselectListField:
//         return 'category';
//       case FieldTypeIds.TimeField:
//         return 'time';
//     }
//   }

//   onSave(): void {
//     this.currentExpression.function = this.query;
//     this.currentExpression.name = this.functionName;
//     this.currentExpression.outputFields = this.selectedItems.filter((x) => !x.isForm);
//     this.currentExpression.outputForms = this.selectedItems.filter((x) => x.isForm);
//     this.snackBar.open('Function Saved Successfully', 'CLOSE', { duration: 2000 });
//   }

//   onDeletedFunction(): void {
//     this.deletedFunction.emit(this.currentExpression);
//   }

//   onOutPutFieldDeleted(event: any): void {
//     this.currentSelectedField = null;
//   }
// }
