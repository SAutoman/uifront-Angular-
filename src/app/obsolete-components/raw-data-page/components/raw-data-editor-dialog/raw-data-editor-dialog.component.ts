// /**
//  * global
//  */
// import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
// import { FormBuilder } from '@angular/forms';
// import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
// import { BehaviorSubject } from 'rxjs';
// import { cloneDeep, endsWith, upperFirst } from 'lodash-core';

// /**
//  * project
//  */

// import { Animations } from '@wfm/animations/animations';
// import { IConfigurableListItem, IFormlyView, IObjectMap } from '@wfm/common/models';
// import {
//   APP_CLIENT_ID,
//   AreaTypeEnum,
//   CreateDynamicEntityDto,
//   DynamicEntitiesService,
//   DynamicEntityFieldDto,
//   FieldTypeIds,
//   SchemaFieldDto,
//   SchemaDto,
//   SchemasService,
//   CaseStatus
// } from '@wfm/service-layer';
// import { DateTimeAdapterSectionEnum, FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
// import { BaseFieldConverter } from '@wfm/service-layer/helpers';
// import { Guid } from '@wfm/shared/guid';
// import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';

// /**
//  * local
//  */

// interface IView extends IFormlyView {
//   options: FormlyFormOptions;
//   isUpdate: boolean;
//   rawFieldsDefinition: IConfigurableListItem[];
// }

// @Component({
//   selector: 'app-raw-data-editor-dialog',
//   templateUrl: './raw-data-editor-dialog.component.html',
//   styleUrls: ['./raw-data-editor-dialog.component.scss'],
//   animations: Animations,
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class RawDataEditorDialogComponent implements OnInit {
//   inputButtonText: string = 'Save';
//   inputRawFieldsDefinition: IConfigurableListItem[];
//   inputRawItemValues?: IObjectMap<any>;
//   view$ = new BehaviorSubject<IView>(undefined);
//   tenantId: string;
//   pending = false;

//   constructor(
//     private fb: FormBuilder,
//     private dialogRef: MatDialogRef<RawDataEditorDialogComponent>,
//     private schemasService: SchemasService,
//     private dynamicEntitiesService: DynamicEntitiesService,
//     @Inject(APP_CLIENT_ID) readonly appId: string
//   ) {}

//   ngOnInit(): void {
//     let model: IObjectMap<any> = {};
//     if (this.inputRawItemValues) {
//       model = cloneDeep(this.inputRawItemValues);
//     }

//     const copyFields: IConfigurableListItem[] = cloneDeep(this.inputRawFieldsDefinition);
//     const orderedFields = copyFields
//       .filter((x) => !!x.configuration && x.useInObj?.rawData)
//       .sort((a, b) => a.configuration.position - b.configuration.position);

//     const view: IView = {
//       fields: this.mapToFormlyFields(orderedFields, model),
//       form: this.fb.group(model),
//       model,
//       isUpdate: !!this.inputRawItemValues,
//       rawFieldsDefinition: copyFields,
//       options: {
//         formState: {
//           awesomeIsForced: false
//         }
//       }
//     };
//     this.view$.next(view);
//   }

//   async onSave(view: IView): Promise<void> {
//     if (this.pending) {
//       return;
//     }

//     const valueMap = new Map<string, IConfigurableListItem>();

//     view.rawFieldsDefinition.forEach((x) => valueMap.set(x.id, cloneDeep(x)));

//     Object.keys(view.model).forEach((fieldId) => {
//       const srcField = valueMap.get(fieldId);
//       const copy: IConfigurableListItem = cloneDeep(srcField);
//       copy.configuration.value = view.model[fieldId];
//       valueMap.set(fieldId, copy);
//     });

//     const valueFields = [...valueMap.values()];
//     const dynamicValues: BaseFieldValueType[] = [];

//     const fields: SchemaFieldDto[] = valueFields.map((x, idx) => {
//       const dtoModel = BaseFieldConverter.toDto(x);
//       const templateDto: SchemaFieldDto = {
//         ...dtoModel,
//         configuration: {
//           ...dtoModel.configuration
//           //   validators: [] //throw 500 error if exists
//         },
//         schemaFieldConfiguration: undefined
//         // position: idx,
//         // schemaFieldConfiguration: {},
//         // templateFieldValidators: []
//       };

//       const valueDto: BaseFieldValueType = {
//         id: x.id,
//         type: x.type,
//         value: x.configuration.value
//       };
//       dynamicValues.push(valueDto);

//       return templateDto;
//     });

//     const areaType = AreaTypeEnum.rawData;
//     console.log('RawDataEditorDialogComponent:onSave', { view, dynamicValues, valueFields, fieldsToSend: fields });

//     this.pending = true;

//     try {
//       if (view.isUpdate) {
//       } else {
//         const cmd: SchemaDto = {
//           id: undefined,
//           status: CaseStatus.Open,
//           name: Guid.createQuickGuidAsString(),
//           areaType,
//           tenantId: this.tenantId,
//           fields,
//           functions: []
//         };
//         const createOperation = await this.schemasService.create(cmd);

//         const dynamicCmd: CreateDynamicEntityDto = {
//           appId: this.appId,
//           tenantId: this.tenantId,
//           areaType,
//           schemaId: createOperation.targetId,
//           fields: dynamicValues
//         };
//         await this.dynamicEntitiesService.create(dynamicCmd);
//       }
//     } catch (error) {
//       // some message for user?
//       console.error('RawDataEditorDialogComponent:save:CreateOrUpdateError', error);
//       throw error;
//     } finally {
//       this.pending = false;
//     }

//     this.dialogRef.close(true);
//   }

//   private mapToFormlyFields(fields: IConfigurableListItem[], model: IObjectMap<any>): FormlyFieldConfig[] {
//     // const fieldMap = new Map<string, IConfigurableListItem>();
//     // orderedFields.forEach((x) => fieldMap.set(x.id, x));

//     const outputFields: FormlyFieldConfig[] = fields.map((field) => {
//       const formVariableDto: FormVariableDto = {
//         type: field.type,
//         value: model[field.id] || undefined,
//         name: field.id,
//         label: upperFirst(field.viewName),
//         valueInfo: {
//           listId: field.configuration.listId
//         },
//         required: !!field.configuration?.required,
//         readonly: false,
//         min: +field.configuration?.min || undefined,
//         max: +field.configuration?.max || undefined
//       };

//       if (field.type === FieldTypeIds.TimeField && !!formVariableDto.value && endsWith(formVariableDto.value, 'Z')) {
//         // convert to local value
//         const sectionName = DateTimeAdapterSectionEnum.appFormlyMatDatePickerConfig;
//         formVariableDto.valueInfo[sectionName] = {
//           useZeroOffset: true
//         };
//       }

//       const adapter = FormlyFieldAdapterFactory.createAdapter(formVariableDto);
//       const fieldConfig = adapter.getConfig();
//       fieldConfig.className = 'raw-data-field';

//       return fieldConfig;
//     });
//     return outputFields;
//   }
// }
