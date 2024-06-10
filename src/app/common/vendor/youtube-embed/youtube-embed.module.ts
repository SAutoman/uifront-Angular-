import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YoutubeEmbedComponent } from './youtube-embed.component';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { MaterialModule } from '@wfm/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { IconModule } from '@wfm/shared/icon/icon.module';

@NgModule({
  declarations: [YoutubeEmbedComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    IconModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.youtubeEmbed, component: YoutubeEmbedComponent, wrappers: ['form-field'] }]
    }),
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [YoutubeEmbedComponent]
})
export class YoutubeEmbedModule {}
