// /**
//  * global
//  */
// import {
//   Component,
//   OnInit,
//   Input,
//   ViewChildren,
//   QueryList,
//   Output,
//   EventEmitter,
//   ChangeDetectorRef,
//   ChangeDetectionStrategy
// } from '@angular/core';
// import { Store, select } from '@ngrx/store';

// import { takeUntil } from 'rxjs/operators';

// /**
//  * project
//  */
// import { TenantComponent } from '@wfm/shared/tenant.component';

// import { CaseFieldWrapperComponent } from '@wfm/shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';
// import { FieldControlApiData } from '@wfm/shared-case-field-wrapper/case-fields/field-control-api-value';
// import { ProcessStepUIModel, CaseFormFieldType } from '@wfm/process-step/models/ProcessStepUIModel';

// import { FieldTypeIds } from '@wfm/service-layer/models';

// import {
//   ApplicationState,
//   getWorkOnCaseProcessStepById,
//   getWorkOnCaseErrorMsg,
//   LoadCaseProcessStepData,
//   CaseProcessStepOnSave,
//   UpdateValues,
//   ClearMessages
// } from '@wfm/store';

// /**
//  * local
//  */

// export interface StepNameField {
//   name: string;
//   value: string;
// }

// @Component({
//   selector: 'app-case-process-step',
//   templateUrl: './case-process-step.component.html',
//   styleUrls: ['./case-process-step.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush
// })
// export class CaseProcessStepComponent extends TenantComponent implements OnInit {
//   _currentProcessStep: ProcessStepUIModel;
//   processStep: ProcessStepUIModel;
//   isValid: boolean = false;
//   hasAnyData: boolean = false;
//   hasFullData: boolean = false;
//   componentId = '2d6419e0-4a87-48c6-aa05-9ef04283439f';

//   @Input() set currentProcessStep(value: ProcessStepUIModel) {
//     this._currentProcessStep = value;
//     this.processStep = value;
//   }

//   @ViewChildren(CaseFieldWrapperComponent) wrapperFields: QueryList<CaseFieldWrapperComponent>;
//   @Input() canEditCase: boolean;
//   @Input() canEditCaseError: boolean;
//   @Input() caseId: string;
//   @Output() isChangedFields: EventEmitter<boolean> = new EventEmitter();
//   @Output() isChangedFormFields: EventEmitter<boolean> = new EventEmitter();
//   @Output() emitProcessStep: EventEmitter<ProcessStepUIModel> = new EventEmitter();

//   get FieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }
//   get CaseFormFieldType(): typeof CaseFormFieldType {
//     return CaseFormFieldType;
//   }

//   constructor(private store: Store<ApplicationState>, private changeDetectorRef: ChangeDetectorRef, private snackBar: MatSnackBar) {
//     super(store);
//   }

//   ngOnInit(): void {
//     this.store
//       .pipe(takeUntil(this.destroyed$), select(getWorkOnCaseProcessStepById(), { id: this._currentProcessStep.id }))
//       .subscribe((data) => {
//         if (data) {
//           this.processStep = data;
//           this.changeDetectorRef.detectChanges();
//           this.checkFieldsStatus();
//         }
//       });

//     this.store.pipe(takeUntil(this.destroyed$), select(getWorkOnCaseErrorMsg)).subscribe((data) => {
//       if (data) {
//         this.snackBar.open(data, 'CLOSE', { duration: 2000 });
//         this.store.dispatch(new ClearMessages({}));
//       }
//     });

//     this.store.dispatch(new LoadCaseProcessStepData({ tenant: this.tenant, currentProcessStep: this._currentProcessStep }));
//   }

//   trackByStepID(index: number, item: ProcessStepUIModel): string {
//     return item.id;
//   }

//   onProcessStepExpanded(): void {
//     // Load CaseProcessStepData before expanding in order to display step data
//     // this.store.dispatch(new LoadCaseProcessStepData({ tenant: this.tenant, currentProcessStep: this._currentProcessStep }));
//   }

//   onSave(): void | MatSnackBarRef<any> {
//     if (!this.isValid) {
//       return this.snackBar.open('Please fill the required fields!', 'CLOSE', {
//         duration: 3000
//       });
//     }

//     this.store.dispatch(
//       new CaseProcessStepOnSave({
//         currentProcessStep: this.processStep,
//         tenant: this.tenant,
//         wrapperFields: this.wrapperFields,
//         caseId: this.caseId
//       })
//     );
//     this.isChangedFields.emit(false);
//     this.isChangedFormFields.emit(false);
//   }

//   onFieldChanged(event: FieldControlApiData): void {
//     this.isChangedFields.emit(true);
//     this.checkFieldsStatus();
//     this.store.dispatch(new UpdateValues({ event: event, processStep: this.processStep }));
//   }

//   checkFieldsStatus() {
//     const wrapperFields = this.wrapperFields.toArray();
//     this.isValid = true;
//     this.hasAnyData = false;
//     this.hasFullData = true;

//     wrapperFields.forEach((f) => {
//       this.isValid = this.isValid && f.isValid();
//       this.hasAnyData = this.hasAnyData || f.field.value !== undefined;
//       this.hasFullData = this.hasFullData && f.field.value !== undefined;
//     });
//   }

//   getStateColor(): string {
//     if (this.wrapperFields && this.wrapperFields.length > 0) {
//       if (this.hasFullData && this.isValid) {
//         return '#177D35';
//       } else if (this.hasAnyData) {
//         return '#FABF26';
//       }
//     }

//     return '#AAAAAA';
//   }

//   onFieldChangedForm(event: boolean): void {
//     this.isChangedFormFields.emit(event);
//   }

//   onEmitProcessStep(processStep: ProcessStepUIModel): void {
//     this.emitProcessStep.emit(processStep);
//   }

//   disabledDrag(e): void {
//     e.stopPropagation();
//   }
// }
