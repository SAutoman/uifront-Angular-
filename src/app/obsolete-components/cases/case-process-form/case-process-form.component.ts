// /**
//  * global
//  */
// import { Component, OnInit, Input, ViewChildren, QueryList, Output, EventEmitter } from '@angular/core';

// import { Store } from '@ngrx/store';

// /**
//  * project
//  */
// import { DocumentUploadService, FieldTypeIds, ValidatorType, FormDtoUI } from '@wfm/service-layer';
// import { ApplicationState, OnFormSave } from '@wfm/store';

// import { CaseFieldWrapperComponent } from '@wfm/shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';
// import { BaseFormComponent, FieldControlApiData } from '@wfm/shared-case-field-wrapper/case-fields/field-control-api-value';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-case-process-form',
//   templateUrl: './case-process-form.component.html',
//   styleUrls: ['./case-process-form.component.scss']
// })
// export class CaseProcessFormComponent extends BaseFormComponent implements OnInit {
//   _form: FormDtoUI;
//   componentId = 'efc1e0b6-eaa5-48f2-9cdc-0bf62901166d';
//   image: string;
//   @Output() isChangedFields: EventEmitter<boolean> = new EventEmitter();
//   @Input() tenant: string;
//   @Input() stepContentId: string;
//   @Input() stepVersion: number;
//   @Input() canEditCase: boolean;
//   @Input() canEditCaseError: boolean;

//   @Input() set form(value: FormDtoUI) {
//     if (!value) {
//       return;
//     }

//     this._form = value;
//   }

//   get form(): FormDtoUI {
//     return this._form;
//   }
//   get FieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }
//   get ValidatorType(): typeof ValidatorType {
//     return ValidatorType;
//   }

//   @ViewChildren(CaseFieldWrapperComponent) wrapperFields: QueryList<CaseFieldWrapperComponent>;

//   constructor(private store: Store<ApplicationState>, private uploadService: DocumentUploadService, private snackBar: MatSnackBar) {
//     super();
//   }

//   ngOnInit(): void {}

//   onChange(): void {}

//   buildImage(documentId: string): string {
//     return (this.image = this.uploadService.buildImage(documentId, 'token'));
//   }

//   trackByItemID(index: number, item: FormDtoUI): string {
//     return item.metadata.id;
//   }

//   onFormSave(): void | MatSnackBarRef<any> {
//     if (!this.form.isValid) {
//       return this.snackBar.open('Please fill the required fields!', 'CLOSE', {
//         duration: 3000
//       });
//     }

//     this.store.dispatch(
//       new OnFormSave({
//         form: this.form,
//         stepContentId: this.stepContentId,
//         version: this.stepVersion,
//         tenant: this.tenant,
//         wrapperFields: this.wrapperFields
//       })
//     );
//     this.isChangedFields.emit(false);
//     this.form.isFormHasAnyValues = true;
//   }

//   onFieldChanged(event: FieldControlApiData): void {
//     this.isChangedFields.emit(true);
//     const wrapperFields = this.wrapperFields.toArray();
//     this.form.isValid = wrapperFields.filter((f) => !f.isValid()).length === 0;
//   }

//   onFormExpanded(): void {
//     this.form.expanded = true;
//     this.buildImage(this.form.metadata.documentId);
//   }
// }
