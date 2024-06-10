/**
 * global
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatInput } from '@angular/material/input';
import { FieldType } from '@ngx-formly/material/form-field';
import { cloneDeep } from 'lodash-core';
import { select, Store } from '@ngrx/store';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { AuthState, loggedInState } from '@wfm/store';
import { DocumentUploadService, FileInfoExtDto, FilesData, tenantDocumentManagementSettingKey, UploadedFile } from '@wfm/service-layer';
import { FileValueUi } from '@wfm/service-layer/models/FieldValueDto';
import { FilePreviewOverlayRef } from './file-preview/file-preview-overlay-ref';
import { FilePreviewOverlayService } from './file-preview/file-preview-overlay.service';
import { SharedService, UploadImageData, ImageData } from '@wfm/service-layer/services/shared.service';
import { DocumentCacheService } from '@wfm/service-layer/services/document.cache.service';
import { BlockedFileExtensionsEnum, FileExtensionsEnum } from '@wfm/shared/utils';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { MatDialog } from '@angular/material/dialog';
import { ImageCropperComponent } from '@wfm/shared/image-cropper/image-cropper.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { CameraDialogComponent } from './camera-dialog/camera-dialog.component';
import { Platform } from '@angular/cdk/platform';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { FileNameSettingEnum } from '@wfm/common/field/file-name-settings/file-name-settings.component';

/**
 * local
 */

@Component({
  selector: 'app-formly-file',
  templateUrl: './formly-file.component.html',
  styleUrls: ['./formly-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFileComponent extends FieldType implements OnInit, OnDestroy {
  @ViewChild(MatInput) formFieldControl!: MatInput;
  filesData: FilesData = {
    items: []
  };

  fileNotFoundDescription = 'No file selected';
  loading: boolean;
  value: FileValueUi[];
  fileInfo$: Observable<FilesData>;
  private fileInfo: BehaviorSubject<FilesData>;
  private destroy$ = new Subject();
  private auth: AuthState;
  maxAllowedFileSize: number = 10;
  isThumbnailEnabled?: boolean;
  aspectRatio?: string;
  isPlatformMobile?: boolean = false;
  fileNameSetting: FileNameSettingEnum;

  constructor(
    private store: Store<AuthState>,
    private fileService: DocumentUploadService,
    private cd: ChangeDetectorRef,
    private previewDialog: FilePreviewOverlayService,
    private sharedService: SharedService,
    private snackBar: MatSnackBar,
    private documentCache: DocumentCacheService,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService,
    private dialog: MatDialog,
    private pl: Platform
  ) {
    super();
    this.fileInfo = new BehaviorSubject<FilesData>(null);
    this.fileInfo$ = this.fileInfo.asObservable();
    this.store.pipe(takeUntil(this.destroy$), select(loggedInState)).subscribe((auth) => {
      this.auth = auth;
      if (this.auth.currentTenantSystem.tenantSettings?.length > 0) {
        this.filterDocumentSetting();
      }
    });
    if (this.pl.ANDROID || this.pl.IOS) {
      this.isPlatformMobile = true;
    }
  }

  filterDocumentSetting(): void {
    const settings = this.auth.currentTenantSystem.tenantSettings;
    const documentSetting = settings.find(
      (x) => x.key === `${tenantDocumentManagementSettingKey}_${this.auth.currentTenantSystem.tenant.tenantId}`
    );
    if (documentSetting) {
      this.maxAllowedFileSize = documentSetting.value?.fileSize;
    }
  }

  async ngOnInit(): Promise<void> {
    super.ngOnInit();
    this.isThumbnailEnabled = this.to.thumbnailEnabled || false;
    this.aspectRatio = this.to.aspectRatio;
    this.field.templateOptions.floatLabel = 'always';
    if (!this.to.formlyFileOptions) {
      this.to.formlyFileOptions = {};
    }
    let filesData: FileInfoExtDto[] = [];
    if (this.value && this.value.length) {
      this.setLoading(true);
      for (let index = 0; index < this.value.length; index++) {
        const fileValueItem = this.value[index];
        const result = await this.downloadFileInfo(fileValueItem.documentId, true);
        if (result) filesData.push(result);
      }
      this.value = this.removeInvalidFiles(this.value, filesData);
    } else if (this.field.defaultValue?.value?.length) {
      this.setLoading(true);
      for (let index = 0; index < this.field?.defaultValue?.length; index++) {
        const fileValueItem = this.field?.defaultValue[index];
        const result = await this.downloadFileInfo(fileValueItem.documentId, true);
        if (result) filesData.push(result);
      }
      this.field.defaultValue = this.removeInvalidFiles(<FileValueUi[]>this.field.defaultValue, filesData);
    }
    if (filesData.length) {
      this.setLoading(false);
      if (filesData?.length) {
        this.processFilesData(filesData, true);
      }
    }

    this.field.formControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (!value) {
        // reset the files if the formControl is reset from external
        this.fileInfo.next(null);
      }
    });
    this.fileNameSetting = this.to?.fileNameSetting ? this.to?.fileNameSetting : FileNameSettingEnum.default;
  }

  removeInvalidFiles(data: FileValueUi[], activeFiles: FileInfoExtDto[]): FileValueUi[] {
    const activeFilesId = activeFiles?.map((x) => x.id);
    const filteredData = data?.filter((x) => activeFilesId.includes(x?.documentId));
    return filteredData || [];
  }

  private downloadFileInfo(fileId: string, isExisting?: boolean): Promise<FileInfoExtDto> {
    return this.getDocumentInfo(fileId);
  }

  getFileType(file: FileInfoExtDto): String {
    return this.sharedService.getFileType(file);
  }

  onFilesAdded(event: File[]): void {
    this.onFileSelected(event);
  }

  async onFileSelected(files: File[]): Promise<void> {
    const filesSelected = files ? cloneDeep(files) : [];
    if (this.to?.max && this.filesData.items.length && this.filesData.items.length + filesSelected.length > this.to.max) {
      this.snackBar.open(this.ts.instant('Maximum allowed limit is') + ' ' + this.to.max, this.ts.instant('Ok'), { duration: 3000 });
      return;
    }
    const totalNumber = this.filesData?.items?.length ? this.filesData.items.length + filesSelected.length : filesSelected.length;
    if (this.isMinMaxValidationPassed(totalNumber)) {
      if (filesSelected.length) {
        const validFiles = this.addFilesForUpload(filesSelected);
        if (validFiles.length) {
          // if it is image AND thumbnail is enabled
          if (validFiles[0]?.type?.includes('image') && this.isThumbnailEnabled) {
            this.cropFile(validFiles);
          } else {
            this.uploadFilesDirectly(validFiles);
          }
        }
      }
    }
  }

  uploadFilesDirectly(files: File[]): void {
    let updatedFiles = [];
    if (this.fileNameSetting === FileNameSettingEnum.dateTime) {
      files.forEach((file) => {
        const formattedDateTimeString = this.getDateTimeFileName();
        const nf = new File([file], `${formattedDateTimeString}.${this.getFileExtension(file)}`, { type: file.type });
        updatedFiles.push(nf);
      });
    }
    const filesForUpload = updatedFiles?.length ? updatedFiles : files;
    let promises = filesForUpload.map((fileItem) => {
      return this.uploadFile(fileItem);
    });
    this.setLoading(true);
    let uploadedFiles: FileInfoExtDto[] = [];
    Promise.all(promises)
      .then((uploadedFilesRes) => {
        this.setLoading(false);
        uploadedFilesRes.forEach((file) => {
          let url = this.fileService.buildImage(file.id, this.auth.sessionId);
          uploadedFiles.push({ ...file, url });
        });
        this.processFilesData(uploadedFiles);
      })
      .catch((err) => {
        console.log(err);
        this.setLoading(false);
        this.onErrorActions();
      });
  }

  getDateTimeFileName(): string {
    const date = new Date();
    const seconds = new Date().getSeconds();
    const currentDateTime = DateTimeFormatHelper.getUTCJsDate(date);
    return `${DateTimeFormatHelper.formatDateTime(currentDateTime)}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  getFileExtension(file: File): string {
    if (file.type.includes('image')) return file.type.substring(file.type.lastIndexOf('/') + 1, file.type.length);
    else {
      const fileName = file.name;
      const extension = fileName.split('.')[1];
      return extension;
    }
  }

  async cropFile(files: File[]): Promise<void> {
    const croppedImageData: ImageCroppedEvent = await this.openImageCropper(files[0], null);
    if (croppedImageData?.base64) {
      const fileExtension = files[0].type.slice(files[0].type.indexOf('/') + 1, files[0].type.length);
      const data: UploadImageData = {
        base64: croppedImageData?.base64,
        sessionId: this.auth?.sessionId,
        fileName: this.fileNameSetting === FileNameSettingEnum.default ? files[0].name : `${this.getDateTimeFileName()}${fileExtension}`,
        fileType: files[0].type
      };
      this.uploadCroppedFile(data);
    }
  }

  uploadCroppedFile(data: UploadImageData): void {
    this.sharedService.uploadCroppedImage(data).then((response: ImageData) => {
      let uploadedFiles: FileInfoExtDto[] = [];
      const image = response?.image;
      const uploadedFileData = response?.uploadedFileData;
      uploadedFiles.push({ ...uploadedFileData, url: image });
      this.processFilesData(uploadedFiles);
    });
  }

  addFilesForUpload(files: File[]): File[] {
    let validFiles: File[] = [];
    for (let index = 0; index < files.length; index++) {
      if (this.checkFileValidations(files[index])) {
        validFiles.push(files[index]);
      }
    }
    return validFiles;
  }

  // fileTypeIsNotAccepted(file:File):boolean {
  //   return this.to?.accept &&
  //   ((file.type === FileExtensionsEnum.TXT && !this.to.accept.includes('txt')) ||
  //     (file.type === FileExtensionsEnum.XML && !this.to.accept.includes('xml')) ||
  //     (file.type === FileExtensionsEnum.PDF && !this.to.accept.includes('pdf')) ||
  //     (file.type === FileExtensionsEnum.DOC && !this.to.accept.includes('doc')) ||
  //     (file.type === FileExtensionsEnum.DOCX && !this.to.accept.includes('docx')) ||
  //     (file.type === FileExtensionsEnum.PPT && !this.to.accept.includes('ppt')) ||
  //     (file.type === FileExtensionsEnum.PPTX && !this.to.accept.includes('pptx')) ||
  //     (file.type === FileExtensionsEnum.XLS && !this.to.accept.includes('xls')) ||
  //     (file.type === FileExtensionsEnum.ODT && !this.to.accept.includes('odt')) ||
  //     (file.type === FileExtensionsEnum.ODS && !this.to.accept.includes('ods')) ||
  //     (file.type === FileExtensionsEnum.XLSX && !this.to.accept.includes('xlsx')) ||
  //     (file.type.includes('image') && !this.to?.accept?.includes(file.type.split('/')[1])));
  // }

  fileTypeIsNotInAllowedTypes(file: File): boolean {
    let isNotAllowed = false;
    if (this.to?.accept) {
      switch (file.type) {
        case FileExtensionsEnum.TXT:
          isNotAllowed = !this.to.accept.includes('txt');
          break;
        case FileExtensionsEnum.XML:
          isNotAllowed = !this.to.accept.includes('xml');
          break;
        case FileExtensionsEnum.PDF:
          isNotAllowed = !this.to.accept.includes('pdf');
          break;
        case FileExtensionsEnum.DOC:
          isNotAllowed = !this.to.accept.includes('doc');
          break;
        case FileExtensionsEnum.DOCX:
          isNotAllowed = !this.to.accept.includes('docx');
          break;
        case FileExtensionsEnum.PPT:
          isNotAllowed = !this.to.accept.includes('ppt');
          break;
        case FileExtensionsEnum.PPTX:
          isNotAllowed = !this.to.accept.includes('pptx');
          break;
        case FileExtensionsEnum.XLS:
          isNotAllowed = !this.to.accept.includes('xls');
          break;
        case FileExtensionsEnum.ODT:
          isNotAllowed = !this.to.accept.includes('odt');
          break;
        case FileExtensionsEnum.ODS:
          isNotAllowed = !this.to.accept.includes('ods');
          break;
        case FileExtensionsEnum.XLSX:
          isNotAllowed = !this.to.accept.includes('xlsx');
          break;
        default:
          if (file.type.includes('image')) {
            isNotAllowed = !this.to?.accept?.includes(file.type.split('/')[1]);
          }
          break;
      }
    }
    return isNotAllowed;
  }

  checkFileValidations(filesSelected: File) {
    let validationPassed = true;
    const file = filesSelected;
    if (file.type === BlockedFileExtensionsEnum.WEBP || this.fileTypeIsNotInAllowedTypes(file)) {
      validationPassed = this.showValidationError(file.name);
      return validationPassed;
    }
    if (file.size === 0) {
      this.snackBar.open(`${this.ts.instant('Invalid file size')} ${file.size}`, 'OK', { duration: 3000 });
      validationPassed = false;
      return validationPassed;
      // if the file size is larger than global limi
    } else if (file.size > this.maxAllowedFileSize * 1024 * 1024) {
      this.snackBar.open(`${this.ts.instant('Maximum allowed file size is')} ${this.maxAllowedFileSize} MB`, 'OK', { duration: 3000 });
      validationPassed = false;
      return validationPassed;
      // if the file size is less than global limit, but larger than 50kb AND the file is thumbnai image
    } else if (this.isThumbnailEnabled && file.type.includes('image') && file.size > 50000) {
      this.snackBar.open(`${this.ts.instant('Maximum allowed thumbnai image size is')} 50 KB`, 'OK', { duration: 3000 });
      validationPassed = false;
      return validationPassed;
    }
    return validationPassed;
  }

  showValidationError(fileName: string): boolean {
    this.snackBar.open(`${this.ts.instant('Invalid file type')} ${fileName}`, 'OK', { duration: 3000 });
    return false;
  }

  private isMinMaxValidationPassed(numberOfFiles: number): boolean {
    let validationPassed = true;
    const min = this.to.min;
    const max = this.to.max;
    if (min && numberOfFiles < min) {
      this.field.formControl.setErrors(
        { min: true },
        {
          emitEvent: true
        }
      );
    }
    if (max && numberOfFiles > max) {
      validationPassed = false;
      this.field.formControl.setErrors(
        { max: true },
        {
          emitEvent: true
        }
      );
    }
    return validationPassed;
  }

  private getUrl(fileId: string): string {
    return this.fileService.buildImage(fileId, this.auth.sessionId);
  }

  private uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    this.setLoading(true);
    return this.fileService.upload(formData);
  }

  private async getDocumentInfo(fileId: string): Promise<FileInfoExtDto> {
    try {
      const uploadInfo = await this.documentCache.get(fileId, 60, async () => await this.fileService.getDocumentInfo(fileId).toPromise());
      let url = this.getUrl(fileId);
      return { ...uploadInfo, url };
    } catch (error) {
      return null;
    }
  }

  updateFormControl(filesInfo: FileInfoExtDto[], isExisting: boolean): void {
    const formValue = [];
    filesInfo.forEach((fileItem) => {
      const fileValue: FileValueUi = {
        name: fileItem?.fileInfo?.fileName,
        documentId: fileItem.id
      };
      formValue.push(fileValue);
    });
    this.formControl.setValue(formValue, isExisting ? { emitEvent: false } : {});
  }

  private processFilesData(filesInfo: FileInfoExtDto[], isExisting?: boolean): void {
    this.filesData.items = this.filesData.items.concat(filesInfo);
    this.fileInfo.next(this.filesData);
    this.updateFormControl(this.filesData.items, isExisting);
    if (this.to.formlyFileOptions.onUpload instanceof Function) {
      this.to.formlyFileOptions.onUpload(filesInfo);
    }
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    this.cd.detectChanges();
  }

  private onErrorActions(): void {
    this.fileInfo.next(null);
    this.fileNotFoundDescription = 'File upload error';
  }

  showPreview(file): void {
    const data = {
      url: file
    };
    let dialogRef: FilePreviewOverlayRef = this.previewDialog.open({
      file: data
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    super.ngOnDestroy();
  }

  async resetValue(fileId: string): Promise<void> {
    try {
      const op = await this.fileService.removeFile(fileId);
      if (op.status.toString() === 'success') {
        this.filesData.items = this.filesData.items.filter((file) => file.id !== fileId);
        this.updateFormControl(this.filesData.items, false);
        this.fileInfo.next(this.filesData);
      } else {
        alert(op?.userErrorMsg || op?.errorMsg);
        console.log(op.errorMsg);
      }
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  async openImageCropper(event?: File, base64Image?: string): Promise<ImageCroppedEvent> {
    const dialogRef = this.dialog.open(ImageCropperComponent, {
      panelClass: 'image-crop-dialog',
      width: '480px',
      disableClose: true,
      data: { imageFile: event, isRoundCropper: false, b64: base64Image }
    });
    return dialogRef.afterClosed().toPromise();
  }

  openCameraComponent(): void {
    const dialogRef = this.dialog.open(CameraDialogComponent, {
      width: '500',
      height: '500',
      panelClass: 'camera-dialog',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(async (x) => {
      if (x) {
        const result = await this.openImageCropper(null, x);
        if (result) {
          const type = <string>result?.base64?.slice(result.base64.indexOf(':') + 1, result.base64.indexOf(';'));
          const data: UploadImageData = {
            base64: result?.base64,
            sessionId: this.auth?.sessionId,
            fileName: `${this.getDateTimeFileName()}.jpeg`,
            fileType: type
          };
          this.uploadCroppedFile(data);
        }
      }
    });
  }
}
