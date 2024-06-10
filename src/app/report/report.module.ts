/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, MissingTranslationHandler } from '@ngx-translate/core';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { DynamicEntitySearchMaskModule } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.module';

/**
 * local
 */
import { ReportGridComponent } from './report-grid/report-grid.component';
import { DatasourceBuilderComponent } from './datasource-builder/datasource-builder.component';
import { ReportDatasourceComponent } from './report-datasource/report-datasource.component';
import { ReportsRoutingModule } from './report.routing';
import { FieldPathGeneratorModule } from '@wfm/shared/actions/field-path-generator/field-path-generator.module';

@NgModule({
  declarations: [ReportDatasourceComponent, DatasourceBuilderComponent, ReportGridComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReportsRoutingModule,
    SharedModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    DynamicEntitySearchMaskModule,
    FieldPathGeneratorModule
  ],
  providers: [],
  exports: []
})
export class ReportModule {}
