import { NgModule } from '@angular/core';
import { ConnectorFieldOptionLabelSettingsComponent } from './connector-field-option-label-settings.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';

@NgModule({
  declarations: [ConnectorFieldOptionLabelSettingsComponent],
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
  exports: [ConnectorFieldOptionLabelSettingsComponent]
})
export class ConnectorFieldOptionLabelSettingsModule {}
