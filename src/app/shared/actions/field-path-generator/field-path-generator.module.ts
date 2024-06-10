import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { FieldPathGeneratorComponent } from './field-path-generator.component';
import { FormlyModule } from '@ngx-formly/core';
import { TreeSelectboxComponent } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { IconModule } from '@wfm/shared/icon/icon.module';

@NgModule({
  declarations: [FieldPathGeneratorComponent, TreeSelectboxComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forChild(),
    IconModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [FieldPathGeneratorComponent, TreeSelectboxComponent]
})
export class FieldPathGeneratorModule {}
