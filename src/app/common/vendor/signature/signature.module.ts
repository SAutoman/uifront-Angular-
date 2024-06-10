import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlySignatureComponent } from './formly-signature/formly-signature.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@wfm/material-module';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';
import { FormlyModule } from '@ngx-formly/core';
import { LabelModule } from '@progress/kendo-angular-label';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';

@NgModule({
  declarations: [FormlySignatureComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.signatureInput, component: FormlySignatureComponent, wrappers: ['form-field'] }]
    }),
    LabelModule,
    InputsModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [FormlySignatureComponent]
})
export class SignatureModule {}
