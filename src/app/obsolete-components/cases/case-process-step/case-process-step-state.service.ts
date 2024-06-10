// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';

// /**
//  * project
//  */
// import { FormDtoUI, FieldDtoUI, FuncFieldProps, FieldId, isFreeField } from '../../service-layer';
// import { ProcessStepUIModel } from '../../process-step/models';

// /**
//  * local
//  */
// import { IGetValue } from './function-evaluate.service';

// class ValueAcc implements IGetValue {
//   constructor(private model: ProcessStepUIModel) {}
//   getValue(x: FieldId): FieldDtoUI {
//     if (isFreeField(x)) {
//       const field = this.model.caseFormWrapper.filter((z) => z.field).map((o) => o.field);
//       const fieldFiind = field.find((j) => j.metadata.id === x.id);
//       return fieldFiind;
//     } else {
//       const form = this.model.caseFormWrapper.filter((o) => o.form).find((j) => j.form.metadata.id === x.formId);
//       const fieldToReturn = form.form.fields.find((j) => j.metadata.id === x.id);
//       return fieldToReturn;
//     }
//   }

//   getForm(x: FieldId): FormDtoUI {
//     const form = this.model.caseFormWrapper.filter((o) => o.form).find((j) => j.form.metadata.id === x.formId);

//     if (form) {
//       return form.form;
//     }

//     return;
//   }
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class CaseProcessStepState {
//   private caseProcessStepState: BehaviorSubject<ProcessStepUIModel> = new BehaviorSubject<ProcessStepUIModel>(<ProcessStepUIModel>{
//     caseFormWrapper: []
//   });

//   get caseProcessStepState$(): Observable<ProcessStepUIModel> {
//     return this.caseProcessStepState.asObservable();
//   }
//   constructor() {}

// setFuncFields(): FuncFieldProps {
//   return <FuncFieldProps>{
//     visible: true,
//     editable: true,
//     hintMessage: null,
//     defaultValue: null
//   };
// }

// public async loadProcessStepData(tenant: string, processStep: ProcessStepUIModel) {
//   const currentProcessStep = processStep;

//   if (!currentProcessStep.contentId) {
//     return;
//   }

//   const data = await this.caseProcessStepFormService.getProcessStepData(tenant, currentProcessStep.contentId);

//   currentProcessStep.version = data.version;

//   data.fields.forEach(f => {
//     const tempField = <FieldDtoUI>{
//       metadata: <FieldMetadataDtoUI>{ ...f.metadata, funcFieldProps: this.setFuncFields(), fieldId: <FieldId>{ id: f.metadata.id } },
//       value: f.value,
//     };

//     currentProcessStep.isFreeFields = true;

//     let entity = <CaseFormWrapper>{
//       elementType: CaseFormFieldType.Field,
//       position: f.metadata.position,
//       field: tempField
//     };

//     currentProcessStep.caseFormWrapper.push(entity);
//   });

//   data.forms.forEach(f => {
//     const tempForm = <FormDtoUI>{
//       metadata: this.mapFormMetaData(f.metadata),
//       fields: f.metadata.fields.map(x => {
//         const filteredField = f.fields ? f.fields.filter(ff => ff.field) : null;
//         const value = filteredField ? filteredField.find(z => z.field.id === x.id) : null;
//         const temp = <CaseProcessStepFieldValueDtoUI>{
//           metadata: <FieldMetadataDtoUI>{ ...x, funcFieldProps: this.setFuncFields(), fieldId: <FieldId>{ formId: f.metadata.id, id: x.id } },
//           value: value ? value.field : null,
//           position: x.position
//         };

//         return temp;
//       }),
//       visible: true,
//       editable: true,
//       expanded: false,
//       isFormHasAnyValues: (f.fields && f.fields.length) ? true : false
//     };
//     currentProcessStep.caseFormWrapper.push(
//       <CaseFormWrapper>{ elementType: CaseFormFieldType.Form, position: f.metadata.position, form: tempForm });
//   });

//   currentProcessStep.caseFormWrapper.sort((a, b) => a.position - b.position);
//   currentProcessStep.isLoaded = true;

//   this.caseProcessStepState.next(currentProcessStep);

//   const freeFieldsToEvaluate = currentProcessStep.caseFormWrapper.map(x => x.field).filter(x => x);
//   await this.setFieldsListItems(freeFieldsToEvaluate, tenant);
//   freeFieldsToEvaluate.forEach(x => this.funcEvaluate(x));

//   const formsToEvaluate = currentProcessStep.caseFormWrapper.map(x => x.form).filter(x => x);
//   await this.setFormFieldsListItems(formsToEvaluate, tenant);
//   formsToEvaluate.forEach(x => x.fields.forEach(z => this.funcEvaluate(z)));
// }

// private async setFieldsListItems(fields: FieldDtoUI[], tenant: string) {
//   for (const field of fields) {
//     if (field.metadata.sourceListId) {
//       const temp = await this.listService.getListItems(tenant, field.metadata.sourceListId);
//       field.metadata.listItems = temp.items;
//     }
//   }
// }

// private async setFormFieldsListItems(formsToEvaluate: FormDtoUI[], tenant: string) {
//   for (const form of formsToEvaluate) {
//     await this.setFieldsListItems(form.fields, tenant);
//   }
// }

// private mapFormMetaData(x: FormMetadataDto): FormMetadataDtoUI {
//   return <FormMetadataDtoUI>{
//     ...x,
//     fields: x.fields.map(f => <FieldMetadataDtoUI>
//       {
//         ...f,
//         fieldId: <FieldId>{ id: f.id, formId: x.id }
//       }),
//   };
// }

// private getExpressionsPerField(f: FieldMetadataDtoUI, processStep: ProcessStepUIModel): Expression[] {
//   const functionsPerField: Expression[] = [];

//   if (isFreeField(f.fieldId)) {
//     processStep.functions.forEach(x => {
//       if (x.function !== undefined) {
//         const temp = x.function.rules.find(z => z.fieldRef.id === f.id);
//         if (temp) {
//           functionsPerField.push(x);
//         }
//       }
//     });
//   } else {
//     const tempForm = processStep.caseFormWrapper.filter(x => x.form).find(x => x.form.metadata.id === f.fieldId.formId);
//     tempForm.form.metadata.functions.forEach(x => {
//       const temp = x.function.rules.find(z => z.fieldRef.id === f.id);
//       if (temp) {
//         functionsPerField.push(x);
//       }
//     });
//   }

//   return functionsPerField;
// }

// public updateValues(event: FieldControlApiData) {
//   if (isFreeField(event.fieldMetadata.fieldId)) {
//     const temp = this.caseProcessStepState.value.caseFormWrapper
//       .filter(x => x.field).find(x => x.field.metadata.id === event.fieldMetadata.id);
//     temp.field.value = event.fieldValue;

//    // this.funcEvaluate(temp.field);

//   } else {
//     const temp = this.caseProcessStepState.value.caseFormWrapper
//       .filter(x => x.form).find(x => x.form.metadata.id === event.fieldMetadata.fieldId.formId);
//     const foundField = temp.form.fields.find(x => x.metadata.id === event.fieldMetadata.id);
//     foundField.value = event.fieldValue;
//     temp.form.isFormHasAnyValues = true;
//     //this.funcEvaluate(foundField);
//   }

// }

// public funcEvaluate(event: FieldDtoUI) {
//   const processStep = this.caseProcessStepState.value;
//   const processStepClone = (<ProcessStepUIModel>_.cloneDeep(this.caseProcessStepState.value));
//   const expressionsPerCurrentField = this.getExpressionsPerField(event.metadata, processStep);
//   const formsSet = new Set();
//   const fieldsSet = new Set();

//   expressionsPerCurrentField.forEach(e => {

//     const funcResult = this.functionEvaluateService.evaluateFunction(e.function, new ValueAcc(processStep));

//     e.outputFields.forEach(f => {

//       const acc = new ValueAcc(processStep);
//       const xx = acc.getValue(<FieldId>{
//         id: f.fieldRef.id,
//         formId: f.formId,
//       });

//       if (funcResult) {
//         fieldsSet.add(f.fieldRef + f.formId);
//         xx.metadata.funcFieldProps.visible = f.propertyTypes.some(x => x === FieldPropertyType.Visible) ? true : false;
//         xx.metadata.funcFieldProps.editable = f.propertyTypes.some(x => x === FieldPropertyType.Editable) ? true : false;
//         xx.metadata.funcFieldProps.defaultValue =
//           f.propertyTypes.some(x => x === FieldPropertyType.DefaultValues) ? f.defaultValue : null;
//         xx.metadata.funcFieldProps.hintMessage = f.propertyTypes.some(x => x === FieldPropertyType.HintMessage) ? f.hintMessage : null;
//       } else {
//         if (!fieldsSet.has(f.fieldRef + f.formId)) {
//           xx.metadata.funcFieldProps.visible = true;
//           xx.metadata.funcFieldProps.editable = true;
//           xx.metadata.funcFieldProps.defaultValue = f.propertyTypes.some(x => x === FieldPropertyType.DefaultValues) ? null : f.defaultValue;
//           xx.metadata.funcFieldProps.hintMessage = null;
//         }
//       }

//     });

//     e.outputForms.forEach(f => {
//       const acc = new ValueAcc(processStep);
//       const xx = acc.getForm(<FieldId>{
//         formId: f.formId,
//       });

//       if (!xx) {
//         return;
//       }

//       if (funcResult) {
//         formsSet.add(f.formId);
//         xx.visible = f.propertyTypes.some(x => x === FieldPropertyType.Visible) ? true : false;
//         xx.editable = f.propertyTypes.some(x => x === FieldPropertyType.Editable) ? true : false;
//         xx.fields.forEach(x => x.metadata.funcFieldProps.editable = false);
//       } else {
//         if (!formsSet.has(f.formId)) {
//           xx.visible = f.propertyTypes.some(x => x === FieldPropertyType.Visible) ? false : true;
//           xx.editable = f.propertyTypes.some(x => x === FieldPropertyType.Editable) ? false : true;
//           xx.fields.forEach(x => x.metadata.funcFieldProps.editable = true);
//         }
//       }

//     });

//   });

//   this.caseProcessStepState.next(processStep);
// }

// private setDefaultFieldValue(x: FieldMetadataDto): FieldValueDtoBase {
//   return <FieldValueDtoBase>{
//     id: x.id,
//     type: x.type,
//     value: null
//   };
// }
// }
