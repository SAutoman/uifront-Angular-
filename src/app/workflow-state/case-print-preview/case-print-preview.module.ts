import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { CasePrintPreviewComponent } from './case-print-preview.component';
import { SharedModule } from '@wfm/shared/shared.module';

@NgModule({
  declarations: [CasePrintPreviewComponent],
  imports: [
    CommonModule,
    MaterialModule,
    IconModule,
    SharedModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [CasePrintPreviewComponent]
})
export class CasePrintPreviewModule {}
