import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AggregateDestinationComponent } from './aggregate-destination/aggregate-destination.component';
import { AggregationActionComponent } from './aggregation-action.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { FieldPathGeneratorModule } from '../field-path-generator/field-path-generator.module';
import { FormlyModule } from '@ngx-formly/core';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { RulesBuilderModule } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.module';
import { AggregationSourceModule } from './aggregate-source/aggregation-source.module';

@NgModule({
  declarations: [AggregationActionComponent, AggregateDestinationComponent],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forChild(),
    FieldPathGeneratorModule,
    AggregationSourceModule,
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
  exports: [AggregationActionComponent, AggregateDestinationComponent]
})
export class AggregationActionModule {}
