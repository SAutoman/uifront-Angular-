import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';

import { FormlyFileComponent } from './formly-file.component';
import { FormlyFileUploaderComponent } from './formly-file-uploader/formly-file-uploader.component';
import { FilePreviewOverlayComponent } from './file-preview/file-preview-overlay.component';
import { FilePreviewOverlayService } from './file-preview/file-preview-overlay.service';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { FormlyDropZoneComponent } from './formly-drop-zone/formly-drop-zone.component';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';
import { CameraDialogComponent } from './camera-dialog/camera-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatRadioModule } from '@angular/material/radio';

@NgModule({
  declarations: [
    FormlyFileComponent,
    FormlyFileUploaderComponent,
    FilePreviewOverlayComponent,
    FormlyDropZoneComponent,
    CameraDialogComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.file, component: FormlyFileComponent, wrappers: ['form-field'] }]
    }),
    IconModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    UploadsModule,
    MatDialogModule,
    FormsModule,
    MatRadioModule
  ],
  providers: [FilePreviewOverlayService],
  exports: [FormlyFileComponent, FormlyFileUploaderComponent]
})
/**
 * File upload field for Angular Formly
 */
export class FormlyFileModule {}
