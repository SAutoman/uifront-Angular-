// /**
//  * global
//  */
// import { Injectable } from '@angular/core';

// import { moveItemInArray } from '@angular/cdk/drag-drop';
// import { GridDataResult } from '@progress/kendo-angular-grid';

// import { Effect, Actions, ofType } from '@ngrx/effects';
// import { Store } from '@ngrx/store';

// import { cloneDeep } from 'lodash-core';
// import { tap } from 'rxjs/operators';

// /**
//  * project
//  */
// import {
//   CasesService,
//   CaseProcessStepFormService,
//   ProcessStep,
//   CaseProcessStepForm,
//   Paging,
//   FieldMetadataDto,
//   FormMetadataDto,
//   CaseStatus,
//   UpdateCaseProcessStepPositionsDto,
//   ProcessStepNames,
//   SubmitCaseProcessStepFormCommandDto,
//   CaseProcessStepFieldValueDto,
//   FieldDtoUI,
//   FieldMetadataDtoUI,
//   FieldId,
//   FuncFieldProps,
//   FormDtoUI,
//   CaseProcessStepFieldValueDtoUI,
//   FormMetadataDtoUI,
//   isFreeField,
//   ListsService,
//   ListItemDto,
//   PagedData,
//   Roles,
//   UsersService,
//   CaseProcessStepFormResponse,
//   CaseProcessFormDataDto,
//   RawDataStatus,
//   TenantsService,
//   RAW_DATA_FIELDS_VISIBILITY_KEY,
//   ProcessFlowService,
//   UpdateCaseNameModel,
//   CacheService,
//   OperationService,
//   TenantSettingsService
// } from '@wfm/service-layer';

// import {
//   ProcessStepUIModel,
//   ProcessStepUI,
//   ProcessStepFieldModel,
//   ProcessStepFormDtoUI,
//   CaseFormWrapper,
//   CaseFormFieldType
// } from '@wfm/process-step/models';

// import { ConfirmRawDataDeleteComponent } from '@wfm/cases/work-on-case/confirm-raw-data-delete/confirm-raw-data-delete.component';
// // import { RenameCaseNameComponent } from '@wfm/cases/work-on-case/rename-case-name/rename-case-name.component';
// import { FunctionEvaluateService, IGetValue } from '@wfm/cases/case-process-step/function-evaluate.service';

// import { FieldPropertyType, Expression } from '@wfm/forms/models';

// import { convertRawDataStatus } from '@wfm/shared/utils';

// /**
//  * local
//  */
// import {
//   WorkOnCaseTypes,
//   LoadCaseData,
//   LoadCaseDataSuccess,
//   LoadCaseDataFailure,
//   LoadCaseProcessStepData,
//   LoadCaseProcessStepDataSuccess,
//   LoadCaseProcessStepDataFailure,
//   OnProcessStepAdd,
//   OnProcessStepAddFailure,
//   OnProcessStepAddSuccess,
//   OnProcessStepRemove,
//   OnProcessStepRemoveSuccess,
//   OnProcessStepRemoveFailure,
//   OnChangedStatus,
//   OnChangedStatusSuccess,
//   OnChangedStatusFailure,
//   OnRawDataDelete,
//   OnRawDataDeleteSuccess,
//   OnRawDataDeleteFailure,
//   OnPageChange,
//   OnPageChangeSuccess,
//   OnPageChangeFailure,
//   CdkDropListDropped,
//   CdkDropListDroppedSuccess,
//   CdkDropListDroppedFailure,
//   RenameCase,
//   RenameCaseFailure,
//   RenameCaseSuccess,
//   CaseProcessStepOnSave,
//   CaseProcessStepOnSaveSuccess,
//   CaseProcessStepOnSaveFailure,
//   UpdateValues,
//   UpdateValuesSuccess,
//   UpdateValuesFailure,
//   SearchSteps,
//   SearchStepsSuccess,
//   SearchStepsFailure,
//   OnFormSave,
//   OnFormSaveSuccess,
//   OnFormSaveFailure
// } from './work-on-case.actions';
// import { WorkOnCaseState } from './work-on-case.reducer';

// class ValueAcc implements IGetValue {
//   constructor(private model: ProcessStepUIModel) {}
//   public getValue(x: FieldId): FieldDtoUI {
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

//   public getForm(x: FieldId): FormDtoUI {
//     const form = this.model.caseFormWrapper.filter((o) => o.form).find((j) => j.form.metadata.id === x.formId);

//     if (form) {
//       return form.form;
//     }

//     return;
//   }
// }

// const expirationMin = 10;

// @Injectable()
// export class WorkOnCaseEffects {
// Load Cases Data
// @Effect({ dispatch: false })
// LoadCaseData = this.actions$.pipe(
//   ofType<LoadCaseData>(WorkOnCaseTypes.LoadCaseData),
//   tap(async (action) => {
//     try {
//       const data = await this.caseService.getCaseById(action.payload.tenant, action.payload.caseId);

//       if (action.payload.dateFormatDb) {
//         data.rawData.forEach((i) => {
//           if (!action.payload.dateFormatDb) {
//             return;
//           }
//         });
//       }

//       const tenantSettings = await this.tenantSettingsService.getByTenant(action.payload.tenant);
//       const rawDataFieldsSettings = tenantSettings.settings.find((x) => x.key === RAW_DATA_FIELDS_VISIBILITY_KEY);

//       if (!rawDataFieldsSettings) {
//         return;
//       }

//       const items = rawDataFieldsSettings.value[RAW_DATA_FIELDS_VISIBILITY_KEY];
//       const ids = await this.caseProcessStepFormService.getAllProcessStepsInCase(action.payload.tenant, action.payload.caseId);

//       if (!ids) {
//         return;
//       }

//       const stepData: ProcessStepUIModel[] = [];
//       for (const id of ids) {
//         const processStepData = await this.processStepService.getProcessStepById(action.payload.tenant, id.processStepId);
//         stepData.push(this.mapStepToUI(processStepData, id));
//       }

//       const paging = <Paging>{ skip: 0, take: action.payload.pageSize };
//       const stepNamesResult = await this.processStepService.getProcessStepNames(action.payload.tenant, paging);
//       const processStepNames = stepNamesResult.items;
//       const length = stepNamesResult.total;

//       processStepNames.sort((a, b) => {
//         if (a.name.toLowerCase() > b.name.toLowerCase()) {
//           return 1;
//         }
//         if (a.name.toLowerCase() < b.name.toLowerCase()) {
//           return -1;
//         }
//         return 0;
//       });

//       const sliced = processStepNames;

//       const itemsWithValues = data.rawData;

//       itemsWithValues.forEach((i) => {
//         i.status = convertRawDataStatus(<RawDataStatus>(<any>i.status));
//         i['rawDataId'] = i.id;
//         i['rawDataEntity'] = i;

//         if (i.extra) {
//           i.extra.forEach((f) => (i[f.name] = f.value));
//         }
//       });

//       const gridData = <GridDataResult>{ total: itemsWithValues.length, data: itemsWithValues };

//       let buttonsResult = await this.setButtons(
//         data.status,
//         action.payload.selectedRole,
//         data.authorId,
//         action.payload.authState,
//         action.payload.tenant
//       );

//       if (!buttonsResult) {
//         buttonsResult = {
//           canEditCase: true,
//           approveDisabled: false,
//           doneDisabled: false,
//           reopenDisabled: true,
//           canEditCaseError: ''
//         };
//       }

//       this.store.dispatch(
//         new LoadCaseDataSuccess({
//           data: data,
//           tenantSettings: tenantSettings,
//           items: items,
//           ids: ids,
//           stepData: stepData,
//           length: length,
//           processStepNames: processStepNames,
//           gridData: gridData,
//           sliced: sliced,
//           approveDisabled: buttonsResult.approveDisabled,
//           canEditCase: buttonsResult.canEditCase,
//           canEditCaseError: buttonsResult.canEditCaseError,
//           doneDisabled: buttonsResult.doneDisabled,
//           reopenDisabled: buttonsResult.reopenDisabled,
//           successMsg: ''
//         })
//       );
//     } catch (error) {
//       this.store.dispatch(new LoadCaseDataFailure({ error }));
//     }
//   })
// );

// Load Case Process Step Data
// @Effect({ dispatch: false })
// LoadCaseProcessStepData = this.actions$.pipe(
//   ofType<LoadCaseProcessStepData>(WorkOnCaseTypes.LoadCaseProcessStepData),
//   tap(async (action) => {
//     try {
//       const currentProcessStep = <ProcessStepUIModel>cloneDeep(action.payload.currentProcessStep);

//       if (!action.payload.currentProcessStep.contentId) {
//         return;
//       }

//       // const data = <CaseProcessStepFormResponse>(
//       //   await this.cacheService.get(action.payload.currentProcessStep.contentId, expirationMin, () =>
//       //     this.caseProcessStepFormService.getProcessStepData(action.payload.tenant, action.payload.currentProcessStep.contentId)
//       //   )
//       // );

//       // currentProcessStep.version = data.version;

//       // if (data.fields) {
//       //   data.fields.forEach((field) => {
//       //     const tempField = <FieldDtoUI>{
//       //       metadata: <FieldMetadataDtoUI>{
//       //         ...field.metadata,
//       //         funcFieldProps: this.getFunctionActionFields(),
//       //         fieldId: <FieldId>{ id: field.metadata.id }
//       //       },
//       //       value: field.value
//       //     };

//       //     currentProcessStep.isFreeFields = true;

//       //     const entity = <CaseFormWrapper>{
//       //       elementType: CaseFormFieldType.Field,
//       //       position: field.metadata.position,
//       //       field: tempField
//       //     };

//       //     currentProcessStep.caseFormWrapper.push(entity);
//       //   });
//       // }

//       // if (data.forms) {
//       //   data.forms.forEach((f) => {
//       //     const tempForm = <FormDtoUI>{
//       //       metadata: this.mapFormMetaData(f.metadata),
//       //       fields: f.metadata.fields.map((x) => {
//       //         const filteredField = f.fields ? f.fields.filter((ff) => ff.field) : null;
//       //         const value = filteredField ? filteredField.find((z) => z.field.id === x.id) : null;
//       //         const temp = <CaseProcessStepFieldValueDtoUI>{
//       //           metadata: <FieldMetadataDtoUI>{
//       //             ...x,
//       //             funcFieldProps: this.getFunctionActionFields(),
//       //             fieldId: <FieldId>{ formId: f.metadata.id, id: x.id }
//       //           },
//       //           value: value ? value.field : null,
//       //           position: x.position
//       //         };

//       //         return temp;
//       //       }),
//       //       visible: true,
//       //       editable: true,
//       //       expanded: false,
//       //       isFormHasAnyValues: f.fields && f.fields.length ? true : false
//       //     };
//       //     currentProcessStep.caseFormWrapper.push(<CaseFormWrapper>{
//       //       elementType: CaseFormFieldType.Form,
//       //       position: f.metadata.position,
//       //       form: tempForm
//       //     });
//       //   });
//       // }

//       currentProcessStep.caseFormWrapper.sort((a, b) => a.position - b.position);
//       currentProcessStep.isLoaded = true;

//       // this.caseProcessStepState.next(currentProcessStep);

//       const freeFieldsToEvaluate = currentProcessStep.caseFormWrapper.map((x) => x.field).filter((x) => x);
//       await this.setFieldsListItems(freeFieldsToEvaluate, action.payload.tenant);

//       freeFieldsToEvaluate.forEach((x) => this.funcEvaluate(x, currentProcessStep));

//       const formsToEvaluate = currentProcessStep.caseFormWrapper.map((x) => x.form).filter((x) => x);
//       await this.setFormFieldsListItems(formsToEvaluate, action.payload.tenant);

//       formsToEvaluate.forEach((x) => x.fields.forEach((z) => this.funcEvaluate(z, currentProcessStep)));

//       this.store.dispatch(new LoadCaseProcessStepDataSuccess({ currentProcessStep, successMsg: '' }));
//     } catch (error) {
//       this.store.dispatch(new LoadCaseProcessStepDataFailure({ error }));
//     }
//   })
// );

// // OnProcessStepAdd
// @Effect({ dispatch: false })
// OnProcessStepAdd = this.actions$.pipe(
//   ofType<OnProcessStepAdd>(WorkOnCaseTypes.OnProcessStepAdd),
//   tap(async (action) => {
//     try {
//       const dataStep = await this.processStepService.getProcessStepById(action.payload.tenant, action.payload.processStep.id);
//       const processStep = <ProcessStepUI>cloneDeep(dataStep);
//       const newStepData = <ProcessStepUIModel[]>cloneDeep(action.payload.stepData);

//       const cmd: CaseProcessStepForm = {
//         tenantId: action.payload.tenant,
//         caseId: action.payload.caseId,
//         processStepId: processStep.id,
//         position: action.payload.stepData.length,
//         fieldsMetadata: processStep.fields.map((x) => this.mapFieldToMetadata(x)),
//         formsMetadata: processStep.forms.map((x) => this.mapFormToMetadata(x)),
//         functions: processStep.functions
//       };

//       const mappedStep = this.mapStepToUI(processStep);
//       newStepData.push(mappedStep);

//       const data = await this.caseProcessStepFormService.create(action.payload.tenant, cmd);
//       const updatedStep = newStepData.find((x) => x === mappedStep);
//       updatedStep.contentId = data.contentId;
//       updatedStep.isLoaded = true;
//       updatedStep.id = data.id;
//       this.store.dispatch(new OnProcessStepAddSuccess({ stepData: newStepData, successMsg: 'Process Step Added' }));
//     } catch (error) {
//       this.store.dispatch(new OnProcessStepAddFailure({ error }));
//     }
//   })
// );

// OnProcessStepRemove
// @Effect({ dispatch: false })
// OnProcessStepRemove = this.actions$.pipe(
//   ofType<OnProcessStepRemove>(WorkOnCaseTypes.OnProcessStepRemove),
//   tap(async (action) => {
//     try {
//       if (!action.payload.processStep.id) {
//         return;
//       }

//       await this.caseProcessStepFormService.delete(action.payload.tenant, action.payload.processStep.id);
//       const updatedStepData = action.payload.stepData.filter(
//         (s) => s !== action.payload.stepData.find((x) => x.id === action.payload.processStep.id)
//       );
//       this.store.dispatch(new OnProcessStepRemoveSuccess({ stepData: updatedStepData, successMsg: 'Process Step Removed' }));
//     } catch (error) {
//       this.store.dispatch(new OnProcessStepRemoveFailure({ error }));
//     }
//   })
// );

// OnChangedStatus
// @Effect({ dispatch: false })
// OnChangedStatus = this.actions$.pipe(
//   ofType<OnChangedStatus>(WorkOnCaseTypes.OnChangedStatus),
//   tap(async (action) => {
//     try {
//       const res = await this.caseService.updateCaseStatus(action.payload.tenant, action.payload.cmd);
//       await this.operationService.waitForSuccessfullOperationAsync(res.id);

//       this.store.dispatch(new OnChangedStatusSuccess({ successMsg: '' }));
//     } catch (error) {
//       this.store.dispatch(new OnChangedStatusFailure({ error }));
//     }
//   })
// );

// OnRawDataDelete
// @Effect({ dispatch: false })
// OnRawDataDelete = this.actions$.pipe(
//   ofType<OnRawDataDelete>(WorkOnCaseTypes.OnRawDataDelete),
//   tap(async (action) => {
//     try {
//       const dialogRef = action.payload.dialog.open(ConfirmRawDataDeleteComponent);
//       dialogRef.componentInstance.name = action.payload.item.article_name;

//       dialogRef.afterClosed().subscribe(async (result) => {
//         if (result) {
//           await this.caseService.deleteCaseRawData(action.payload.tenant, action.payload.caseId, action.payload.item['rawDataId']);
//           // await this.loadCaseData();
//           // this.snackBar.open('Raw Data Deleted Successfully', 'CLOSE', { duration: 2000 });
//         }
//       });

//       this.store.dispatch(new OnRawDataDeleteSuccess({ successMsg: 'Raw Data Deleted Successfully' }));
//     } catch (error) {
//       this.store.dispatch(new OnRawDataDeleteFailure({ error }));
//     }
//   })
// );

// OnPageChange
// @Effect({ dispatch: false })
// OnPageChange = this.actions$.pipe(
//   ofType<OnPageChange>(WorkOnCaseTypes.OnPageChange),
//   tap(async (action) => {
//     try {
//       const event = action.payload.event;
//       let pageSize = action.payload.pageSize;
//       const tenant = action.payload.tenant;
//       let length = action.payload.length;
//       const searchModel = action.payload.searchModel;
//       let processStepNames = action.payload.processStepNames;

//       const startIndex = event.pageIndex * event.pageSize;
//       let endIndex = startIndex + event.pageSize;
//       pageSize = event.pageSize;

//       if (endIndex > length) {
//         endIndex = length;
//       }

//       if (searchModel) {
//         const paging = <Paging>{ skip: startIndex, take: pageSize };
//         const data = await this.processStepService.getProcessStepNames(tenant, paging, null, [searchModel]);
//         length = data.total;
//         processStepNames = data.items;
//       } else {
//         const paging = <Paging>{ skip: startIndex, take: pageSize };
//         const data = await this.processStepService.getProcessStepNames(tenant, paging);
//         length = data.total;
//         processStepNames = data.items;
//       }

//       processStepNames.sort((a, b) => {
//         if (a.name.toLowerCase() > b.name.toLowerCase()) {
//           return 1;
//         }
//         if (a.name.toLowerCase() < b.name.toLowerCase()) {
//           return -1;
//         }
//         return 0;
//       });

//       action.payload.sliced = processStepNames;

//       this.store.dispatch(
//         new OnPageChangeSuccess({
//           length: length,
//           processStepNames: processStepNames,
//           pageSize: pageSize,
//           sliced: action.payload.sliced,
//           successMsg: ''
//         })
//       );
//     } catch (error) {
//       this.store.dispatch(new OnPageChangeFailure({ error }));
//     }
//   })
// );

// CdkDropListDropped
// @Effect({ dispatch: false })
// CdkDropListDropped = this.actions$.pipe(
//   ofType<CdkDropListDropped>(WorkOnCaseTypes.CdkDropListDropped),
//   tap(async (action) => {
//     try {
//       let event = action.payload.event;
//       if (event.previousContainer === event.container) {
//         moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

//         const temp = <UpdateCaseProcessStepPositionsDto>{
//           caseId: action.payload.caseId,
//           caseProcessStepIds: action.payload.stepData.map((x) => x.id)
//         };

//         await this.caseProcessStepFormService.updatePositions(action.payload.tenant, temp);
//       } else {
//         if (event.previousContainer.id === 'selectedStep') {
//           this.store.dispatch(
//             new OnProcessStepRemove({
//               processStep: action.payload.stepData[event.previousIndex],
//               stepData: action.payload.stepData,
//               tenant: action.payload.tenant
//             })
//           );
//         } else {
//           const dataStep = await this.processStepService.getProcessStepById(action.payload.tenant, event.item.data.id);
//           const step = <ProcessStepNames>cloneDeep(dataStep);

//           this.store.dispatch(
//             new OnProcessStepAdd({
//               tenant: action.payload.tenant,
//               caseId: action.payload.caseId,
//               processStep: step,
//               stepData: action.payload.stepData
//             })
//           );
//         }
//       }

//       this.store.dispatch(new CdkDropListDroppedSuccess({ successMsg: '' }));
//     } catch (error) {
//       this.store.dispatch(new CdkDropListDroppedFailure({ error }));
//     }
//   })
// );

// RenameCase
// @Effect({ dispatch: false })
// RenameCase = this.actions$.pipe(
//   ofType<RenameCase>(WorkOnCaseTypes.RenameCase),
//   tap(async (action) => {
//     try {
//       if (!action.payload.canEditCase) {
//         return this.store.dispatch(new RenameCaseFailure({ error: 'Only the author of the case can edit it!' }));
//       }

//       const dialogRefRenameCaseName = action.payload.dialog.open(RenameCaseNameComponent, {
//         width: '600px',
//         data: {
//           name: action.payload.caseName,
//           tenantId: action.payload.tenantId,
//           caseId: action.payload.caseId
//         }
//       });
//       dialogRefRenameCaseName.afterClosed().subscribe(async (result: UpdateCaseNameModel) => {
//         if (result !== null && result !== undefined) {
//           action.payload.caseName = result.name;
//           this.store.dispatch(new RenameCaseSuccess({ caseName: action.payload.caseName, successMsg: 'Name updated successfully' }));
//         } else if (result === null) {
//           this.store.dispatch(new RenameCaseFailure({ error: 'Error the name has not been changed' }));
//         }
//       });
//     } catch (error) {
//       this.store.dispatch(new RenameCaseFailure({ error: error }));
//     }
//   })
// );

// CaseProcessStepOnSave
// @Effect({ dispatch: false })
// CaseProcessStepOnSave = this.actions$.pipe(
//   ofType<CaseProcessStepOnSave>(WorkOnCaseTypes.CaseProcessStepOnSave),
//   tap(async (action) => {
//     try {
//       const tempFreeFields: CaseProcessStepFieldValueDto[] = [];

//       const wrapperFields = action.payload.wrapperFields.toArray();
//       for (const wrapperField of wrapperFields) {
//         const field = await wrapperField.getValueAndUpdate();
//         const fieldMetadata = wrapperField.getFieldMetadataDto();
//         tempFreeFields.push(<CaseProcessStepFieldValueDto>{ position: fieldMetadata.position, field });
//       }

//       const cmd: SubmitCaseProcessStepFormCommandDto = {
//         contentId: action.payload.currentProcessStep.contentId,
//         tenantId: action.payload.tenant,
//         version: action.payload.currentProcessStep.version,
//         formValues: [],
//         fieldValues: tempFreeFields
//       };

//       const stepsNames = await this.casesService.getProcessStepNames(action.payload.tenant, action.payload.caseId);
//       const step = stepsNames.filter((s) => action.payload.currentProcessStep.id === s.id);

//       if (step) {
//         action.payload.currentProcessStep.name = step[0].name;
//       }

//       const updatedValue = await this.caseProcessStepFormService.submitProcessStepData(action.payload.tenant, cmd);
//       // this.cacheService.update(action.payload.currentProcessStep.contentId, updatedValue);
//       this.store.dispatch(new CaseProcessStepOnSaveSuccess({ successMsg: 'Free Fields Values Saved Successfully' }));
//       //this.snackBar.open('Free Fields Values Saved Successfully', 'CLOSE', { duration: 2000 });
//     } catch (error) {
//       this.store.dispatch(new CaseProcessStepOnSaveFailure({ error }));
//     }
//   })
// );

// @Effect({ dispatch: false })
// UpdateValues = this.actions$.pipe(
//   ofType<UpdateValues>(WorkOnCaseTypes.UpdateValues),
//   tap(async (action) => {
//     const clonedProcessStep = <ProcessStepUIModel>cloneDeep(action.payload.processStep);

//     try {
//       const event = action.payload.event;
//       if (isFreeField(event.fieldMetadata.fieldId)) {
//         const temp = clonedProcessStep.caseFormWrapper.filter((x) => x.field).find((x) => x.field.metadata.id === event.fieldMetadata.id);
//         temp.field.value = event.fieldValue;

//         this.funcEvaluate(temp.field, clonedProcessStep);
//       } else {
//         const temp = clonedProcessStep.caseFormWrapper
//           .filter((x) => x.form)
//           .find((x) => x.form.metadata.id === event.fieldMetadata.fieldId.formId);
//         const foundField = temp.form.fields.find((x) => x.metadata.id === event.fieldMetadata.id);
//         foundField.value = event.fieldValue;
//         temp.form.isFormHasAnyValues = true;
//         this.funcEvaluate(foundField, clonedProcessStep);
//       }

//       this.store.dispatch(new UpdateValuesSuccess({ processStep: clonedProcessStep, successMsg: 'Values Updated Successfully' }));
//     } catch (error) {
//       this.store.dispatch(new UpdateValuesFailure({ error }));
//     }
//   })
// );

// @Effect({ dispatch: false })
// SearchSteps = this.actions$.pipe(
//   ofType<SearchSteps>(WorkOnCaseTypes.SearchSteps),
//   tap(async (action) => {
//     try {
//       if (action.payload.paging && action.payload.model) {
//         const processSteps = await this.processStepService.getAllProcessSteps(action.payload.tenant, action.payload.paging, null, [
//           action.payload.model
//         ]);
//         const data = await this.processStepService.getProcessStepNames(action.payload.tenant, action.payload.paging, null, [
//           action.payload.model
//         ]);
//         const length = data.total;
//         const processStepNames = data.items;
//         const searchModel = action.payload.model;
//         this.store.dispatch(
//           new SearchStepsSuccess({
//             length: length,
//             processStepNames: processStepNames,
//             searchModel: searchModel,
//             processSteps: processSteps.items,
//             successMsg: ''
//           })
//         );
//       }
//     } catch (error) {
//       this.store.dispatch(new SearchStepsFailure({ error }));
//     }
//   })
// );

// @Effect({ dispatch: false })
// OnFormSave = this.actions$.pipe(
//   ofType<OnFormSave>(WorkOnCaseTypes.OnFormSave),
//   tap(async (action) => {
//     try {
//       const tempFormFields: CaseProcessStepFieldValueDto[] = [];

//       const wrapperFields = action.payload.wrapperFields.toArray();
//       for (const wrapperField of wrapperFields) {
//         const field = await wrapperField.getValueAndUpdate();
//         const position = wrapperField.getFieldMetadataDto().position;
//         tempFormFields.push(<CaseProcessStepFieldValueDto>{ position, field });
//       }

//       const formValues: CaseProcessFormDataDto[] = [
//         <CaseProcessFormDataDto>{
//           position: action.payload.form.metadata.position,
//           formId: action.payload.form.metadata.id,
//           fields: tempFormFields
//         }
//       ];

//       const cmd: SubmitCaseProcessStepFormCommandDto = {
//         contentId: action.payload.stepContentId,
//         tenantId: action.payload.tenant,
//         version: action.payload.version,
//         formValues: formValues,
//         fieldValues: []
//       };

//       await this.caseProcessStepFormService.submitProcessStepData(action.payload.tenant, cmd);
//       this.store.dispatch(new OnFormSaveSuccess({ successMsg: 'Form Saved Successfully' }));
//     } catch (error) {
//       this.store.dispatch(new OnFormSaveFailure({ error }));
//     }
//   })
// );
// constructor(
//   private actions$: Actions,
//   private caseService: CasesService,
//   private tenantSettingsService: TenantSettingsService,
//   private caseProcessStepFormService: CaseProcessStepFormService,
//   private processStepService: ProcessFlowService,
//   private listService: ListsService,
//   private casesService: CasesService,
//   private usersService: UsersService,
//   private functionEvaluateService: FunctionEvaluateService,
//   private store: Store<WorkOnCaseState>,
//   // private cacheService: CacheService,
//   private operationService: OperationService
// ) {}

/**
 * return the properties for function actions, the ones that are applied when rules are met
 */
// getFunctionActionFields(): FuncFieldProps {
//   return {
//     visible: true,
//     editable: true,
//     hintMessage: null,
//     defaultValue: null
//   };
// }

// mapStepToUI(data: ProcessStep, response?: CaseProcessStepForm): ProcessStepUIModel {
//   const uiStep = <ProcessStepUIModel>{};
//   uiStep.name = data.name;
//   uiStep.id = response ? response.id : null;
//   uiStep.caseFormWrapper = [];
//   uiStep.contentId = response ? response.contentId : null;
//   uiStep.isLoaded = response ? true : false;
//   uiStep.functions = data.functions;

//   return uiStep;
// }

// mapFieldToMetadata(field: ProcessStepFieldModel): FieldMetadataDto {
//   const d = <FieldMetadataDto>(<any>{ ...field });
//   d.sourceFieldId = field.fieldPublicId;
//   d.sourceListId = field.listPublicId;
//   d.type = field.typeField;
//   d.name = field.fieldName;
//   d.renderType = field.renderType;
//   return d;
// }

// mapFormToMetadata(form: ProcessStepFormDtoUI): FormMetadataDto {
//   const d = <FormMetadataDto>(<any>{ ...form });
//   d.id = form.formId;
//   d.fields = form.fields.map((f) => this.mapFieldToMetadata(f));
//   return d;
// }
// /**
//  *
//  * @param fields
//  * @param tenant
//  * mutates the fields argument by additng the list items/options to list tppe fields
//  */
// async setFieldsListItems(fields: FieldDtoUI[], tenant: string) {
//   for (const field of fields) {
//     const key = field.metadata.sourceListId;
//     if (key) {
//       // const result = <PagedData<ListItemDto>>(
//       //   await this.cacheService.get(key, expirationMin, () => this.listService.getListItems(tenant, field.metadata.sourceListId))
//       // );
//       // field.metadata.listItems = result.items;
//     }
//   }
// }

// async setFormFieldsListItems(formsToEvaluate: FormDtoUI[], tenant: string) {
//   for (const form of formsToEvaluate) {
//     await this.setFieldsListItems(form.fields, tenant);
//   }
// }

// mapFormMetaData(x: FormMetadataDto): FormMetadataDtoUI {
//   return <FormMetadataDtoUI>{
//     ...x,
//     fields: x.fields.map(
//       (f) =>
//         <FieldMetadataDtoUI>{
//           ...f,
//           fieldId: <FieldId>{ id: f.id, formId: x.id }
//         }
//     )
//   };
// }

// getExpressionsPerField(f: FieldMetadataDtoUI, processStep: ProcessStepUIModel): Expression[] {
//   const functionsPerField: Expression[] = [];

//   if (isFreeField(f.fieldId)) {
//     processStep.functions.forEach((x) => {
//       if (x.function !== undefined) {
//         const temp = x.function.rules.find((z) => z.fieldRef.id === f.id);
//         if (temp) {
//           functionsPerField.push(x);
//         }
//       }
//     });
//   } else {
//     const tempForm = processStep.caseFormWrapper.filter((x) => x.form).find((x) => x.form.metadata.id === f.fieldId.formId);
//     tempForm.form.metadata.functions.forEach((x) => {
//       const temp = x.function.rules.find((z) => z.fieldRef.id === f.id);
//       if (temp) {
//         functionsPerField.push(x);
//       }
//     });
//   }

//   return functionsPerField;
// }

// /**
//  *
//  * @param field
//  * @param currentProcessStep
//  * based on the subject fields' function rules (rules are met or not)
//  * change the process steps fields' and forms's visibility, editablilty,
//  * default value and hint message
//  *
//  */
// funcEvaluate(field: FieldDtoUI, currentProcessStep: ProcessStepUIModel) {
//   const expressionsPerCurrentField = this.getExpressionsPerField(field.metadata, currentProcessStep);
//   const formsSet = new Set();
//   const fieldsSet = new Set();

//   expressionsPerCurrentField.forEach((e: Expression) => {
//     const areFuncRulesMet = this.functionEvaluateService.evaluateFunction(e.function, new ValueAcc(currentProcessStep));

//     e.outputFields.forEach((f) => {
//       const acc = new ValueAcc(currentProcessStep);
//       const xx = acc.getValue(<FieldId>{
//         id: f.fieldRef.id,
//         formId: f.formId
//       });

//       if (areFuncRulesMet) {
//         fieldsSet.add(f.fieldRef + f.formId);
//         xx.metadata.funcFieldProps.visible = f.propertyTypes.some((x) => x === FieldPropertyType.Visible) ? true : false;
//         xx.metadata.funcFieldProps.editable = f.propertyTypes.some((x) => x === FieldPropertyType.Editable) ? true : false;
//         xx.metadata.funcFieldProps.defaultValue = f.propertyTypes.some((x) => x === FieldPropertyType.DefaultValues)
//           ? f.defaultValue
//           : null;
//         xx.metadata.funcFieldProps.hintMessage = f.propertyTypes.some((x) => x === FieldPropertyType.HintMessage) ? f.hintMessage : null;
//       } else {
//         if (!fieldsSet.has(f.fieldRef + f.formId)) {
//           xx.metadata.funcFieldProps.visible = true;
//           xx.metadata.funcFieldProps.editable = true;
//           xx.metadata.funcFieldProps.defaultValue = f.propertyTypes.some((x) => x === FieldPropertyType.DefaultValues)
//             ? null
//             : f.defaultValue;
//           xx.metadata.funcFieldProps.hintMessage = null;
//         }
//       }
//     });

//     e.outputForms.forEach((f) => {
//       const acc = new ValueAcc(currentProcessStep);
//       const xx = acc.getForm(<FieldId>{
//         formId: f.formId
//       });

//       if (!xx) {
//         return;
//       }

//       if (areFuncRulesMet) {
//         formsSet.add(f.formId);
//         xx.visible = f.propertyTypes.some((x) => x === FieldPropertyType.Visible) ? true : false;
//         xx.editable = f.propertyTypes.some((x) => x === FieldPropertyType.Editable) ? true : false;
//         xx.fields.forEach((x) => (x.metadata.funcFieldProps.editable = false));
//       } else {
//         if (!formsSet.has(f.formId)) {
//           xx.visible = f.propertyTypes.some((x) => x === FieldPropertyType.Visible) ? false : true;
//           xx.editable = f.propertyTypes.some((x) => x === FieldPropertyType.Editable) ? false : true;
//           xx.fields.forEach((x) => (x.metadata.funcFieldProps.editable = true));
//         }
//       }
//     });
//   });

//   // this.caseProcessStepState.next(currentProcessStep);
// }

// async setButtons(caseStatus, selectedRole, caseAuthor, authState, tenant) {
//   if (!selectedRole) {
//     return;
//   }

//   if (!caseAuthor) {
//     return;
//   }

//   let canEditCaseError = '';
//   let canEditCase = false;
//   let reopenDisabled = true;
//   let approveDisabled = true;
//   let doneDisabled = true;

//   switch (selectedRole) {
//     case Roles.Supplier:
//       reopenDisabled = true;
//       approveDisabled = true;
//       doneDisabled = false;

//       if (caseStatus === CaseStatus.Done || caseStatus === CaseStatus.Approved) {
//         doneDisabled = true;
//       }

//       canEditCase =
//         (caseStatus === CaseStatus.Open || caseStatus === CaseStatus.ReOpen || caseStatus === CaseStatus.InProgress) &&
//         authState.profile.id === caseAuthor;
//       break;
//     case Roles.TenantAdmin:
//     case Roles.Tenant:
//       reopenDisabled = caseStatus !== CaseStatus.Done;
//       approveDisabled = caseStatus !== CaseStatus.Done;
//       doneDisabled = caseStatus === CaseStatus.Done || caseStatus === CaseStatus.Approved; // to do check items are done

//       const caseAuthorRole = await this.usersService.getUserRoleById(tenant, caseAuthor);
//       canEditCase =
//         (caseStatus === CaseStatus.Open || caseStatus === CaseStatus.ReOpen || caseStatus === CaseStatus.InProgress) &&
//         (caseAuthorRole === Roles.Tenant || caseAuthorRole === Roles.TenantAdmin);
//       break;
//   }

//   if (
//     (caseStatus === CaseStatus.Open ||
//       caseStatus === CaseStatus.ReOpen ||
//       caseStatus === CaseStatus.InProgress ||
//       caseStatus === CaseStatus.Done ||
//       caseStatus === CaseStatus.Approved) &&
//     authState.profile.id !== caseAuthor
//   ) {
//     canEditCaseError = 'You are not the author of this case! Only the author of the case can edit it!';
//   } else if ((caseStatus === CaseStatus.Done || caseStatus === CaseStatus.Approved) && authState.profile.id === caseAuthor) {
//     canEditCaseError = 'Case can only be edited in status Open, In Progress or Reopend!';
//   }

//   return { canEditCase, canEditCaseError, reopenDisabled, doneDisabled, approveDisabled };
// }
// }
