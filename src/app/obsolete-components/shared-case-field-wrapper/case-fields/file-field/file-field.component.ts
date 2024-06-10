// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { FormBuilder } from '@angular/forms';

// /**
//  * project
//  */
// import {
//   AllowedFileType,
//   ValidatorType,
//   IAllowedTypesValidatorUi,
//   IMinMaxNumberValidator,
//   FieldMetadataDto,
//   FieldValueDtoBase,
//   UploadedFile,
//   DocumentUploadService,
//   OperationService
// } from '@wfm/service-layer';
// import { allowedFileTypes } from '@wfm/shared/utils';
// import { FieldControlApiData, FieldControlApiValue, BaseFieldComponent } from '../field-control-api-value';
// import { CaseFieldWrapperComponent } from '@wfm/obsolete-components/shared-case-field-wrapper/case-field-wrapper/case-field-wrapper.component';
// import { FileFieldValueDto, FileValue } from '@wfm/service-layer/models/FieldValueDto';

// /**
//  * local
//  */
// export interface FileUI {
//   name: string;
//   file: File;
//   documentId: string;
// }

// @Component({
//   selector: 'app-file-field-case-wrapper',
//   templateUrl: './file-field.component.html',
//   styleUrls: ['./file-field.component.scss']
// })
// export class FileFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   private _isValid: boolean = true;
//   _fieldControlApiData: FieldControlApiData;
//   files: FileUI[] = [];
//   acceptedFiles: string[] = [];
//   showRequiredError: boolean;
//   componentId = '19ca03d1-a8c6-4637-bc28-290de0cfc4d2';

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }
//     this._fieldControlApiData = value;
//     let fvalue: FileValue[] = null;
//     this.getAllowedFileTypes();
//     this.showRequiredError =
//       this._fieldControlApiData.fieldMetadata.validators.find((x) => x.validatorType === ValidatorType.Required) !== undefined;

//     if (<FileFieldValueDto>this._fieldControlApiData.fieldValue) {
//       fvalue = (<FileFieldValueDto>this._fieldControlApiData.fieldValue).value;
//     }

//     if (!fvalue) {
//       this.files = [];
//       return;
//     }
//     this.files = fvalue.map((x) => <FileUI>{ name: x.name, documentId: x.documentId, file: null });
//   }

//   get fieldControlApiData() {
//     return this._fieldControlApiData;
//   }

//   selectableAllowedfiletypes: AllowedFileType[] = allowedFileTypes();

//   constructor(private uploadService: DocumentUploadService, private operationService: OperationService, formBuilder: FormBuilder) {
//     super(formBuilder);
//   }

//   ngOnInit() {}

//   getFieldMetadataDto(): FieldMetadataDto {
//     return this.fieldControlApiData.fieldMetadata;
//   }

//   async getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     const d = <FileFieldValueDto>{};
//     d.id = this.fieldControlApiData.fieldMetadata.id;
//     d.type = this.fieldControlApiData.fieldMetadata.type;
//     d.value = [];

//     for (const file of this.files) {
//       if (file.file) {
//         const formData = new FormData();
//         formData.append('file', file.file);
//         const response = <UploadedFile>await this.onUpload(formData);
//         d.value.push(<FileValue>{ documentId: response.id, name: response.fileInfo.fileName });
//         file.file = null;
//         file.documentId = response.id;
//         file.name = response.fileInfo.fileName;
//       } else {
//         d.value.push(<FileValue>{ documentId: file.documentId, name: file.name });
//       }
//     }

//     return d;
//   }

//   isValid(): boolean {
//     return this._isValid;
//   }

//   validate() {
//     this.fieldControlApiData.fieldMetadata.validators.forEach((x) => {
//       switch (x.validatorType) {
//         case ValidatorType.Required:
//           this._isValid = this.files.length > 0;
//           break;
//         case ValidatorType.MinMax:
//           const validator = <IMinMaxNumberValidator>x;
//           this._isValid = this.files.length >= validator.min && this.files.length <= validator.max;
//           break;
//       }
//     });
//   }

//   getAllowedFileTypes(): string[] {
//     if (!this._fieldControlApiData.fieldMetadata.validators.length) {
//       return;
//     }

//     const val = <IAllowedTypesValidatorUi>(
//       this._fieldControlApiData.fieldMetadata.validators.find((v) => v.validatorType === ValidatorType.AllowedTypes)
//     );

//     if (!val) {
//       return;
//     }

//     val.allowedFileTypes.forEach((id) => {
//       this.acceptedFiles = this.acceptedFiles.concat(
//         this.selectableAllowedfiletypes.find((x) => x.id === id).extensions.map((y) => y.name)
//       );
//     });

//     this.acceptedFiles = this.acceptedFiles.map((x) => `.${x}`);
//     return this.acceptedFiles;
//   }

//   async upload(files: FileList) {
//     if (files.length === 0) {
//       return;
//     }

//     Array.from(files).forEach((f) =>
//       this.files.push(<FileUI>{
//         name: f.name,
//         file: f
//       })
//     );

//     this.showRequiredError = this.files.length === 0;
//     this.fieldControlApiData.fieldValue = await this.getValueAndUpdate();
//     this.setChanged(this.fieldControlApiData);
//   }

//   onSelectedFileRemove(item: FileUI) {
//     this.files = this.files.filter((x) => x !== item);
//     this.showRequiredError = this.files.length === 0;
//     this.fieldControlApiData.fieldValue['value'] = this.fieldControlApiData.fieldValue['value'].filter(
//       (f) => f.documentId !== item.documentId
//     );
//     this.setChanged(this.fieldControlApiData);
//   }

//   onFileOpen(item: FileUI) {
//     const image = this.uploadService.buildImage(item.documentId, 'token');
//     const newWindow = window.open(image);
//     newWindow.opener = null;
//   }

//   isOpenVisible(item: FileUI): boolean {
//     return !!item.documentId;
//   }

//   async onUpload(formData: FormData) {
//     return await this.uploadService.upload(formData);
//   }
// }
