import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { FormlyModule } from '@ngx-formly/core';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RulesBuilderModule } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.module';
import { AggregateSourceComponent } from './aggregate-source.component';
import { AggregateSourceFilteringComponent } from './aggregate-source-filtering/aggregate-source-filtering.component';
import { FieldPathGeneratorModule } from '../../field-path-generator/field-path-generator.module';

@NgModule({
  declarations: [AggregateSourceComponent, AggregateSourceFilteringComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forChild(),
    FieldPathGeneratorModule,
    IconModule,
    DragDropModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    RulesBuilderModule
  ],
  exports: [AggregateSourceComponent, AggregateSourceFilteringComponent]
})
export class AggregationSourceModule {}
