/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';

/**
 * project
 */
import { FormlyMatDateModule } from '@wfm/common/vendor/formly-mat-date/formly-mat-date.module';
import { FormlyAddonsModule } from '@wfm/common/vendor/formly-addons';
import { SharedModule } from '@wfm/shared/shared.module';

/**
 * local
 */
import { FieldEditorComponent } from './field-editor/field-editor.component';
import { FieldValidatorsComponent } from './field-validators/field-validators.component';
import { FormlyFileModule } from '../vendor/formly-file';
import { FormlyListOfEntitesModule } from '../vendor/formly-list-of-entities/formly-list-of-entities.module';
import { FieldDefaultValueComponent } from './field-default-value/field-default-value.component';
import { NumberFieldFormatComponent } from './number-field-format/number-field-format.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FieldHighlightsComponent } from './field-highlights/field-highlights.component';
import { FieldHyperlinkSettingsComponent } from './field-hyperlink-settings/field-hyperlink-settings.component';
import { FormlyListModule } from '../vendor/formly-list/formly-list.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { ConnectorFieldEditorComponent } from './connector-field-editor/connector-field-editor.component';
import { FormlyConnectorModule } from '../vendor/formly-connector/formly-connector.module';
import { ConnectorFieldOptionRulesComponent } from './connector-field-editor/connector-field-option-rules/connector-field-option-rules.component';
import { FormlyInputModule } from '../vendor/formly-input/formly-input.module';
import { AutoIncrementFieldComponent } from './auto-increment-field/auto-increment-field.component';
import { ThumbnailSettingsComponent } from './thumbnail-settings/thumbnail-settings.component';
import { ConnectorFieldOptionsSortingComponent } from './connector-field-editor/connector-field-options-sorting/connector-field-options-sorting.component';
import { RulesBuilderModule } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.module';
import { DynamicRulesBuilderModule } from '@wfm/tenant-admin/workflows/dynamic-rules-builder/dynamic-rules-builder.module';
import { RichTextModule } from '../vendor/formly-rich-text/rich-text.module';
import { SignatureModule } from '@progress/kendo-angular-inputs';
import { FileNameSettingsComponent } from './file-name-settings/file-name-settings.component';
import { YoutubeEmbedModule } from '../vendor/youtube-embed/youtube-embed.module';
import { ConnectorFieldOptionLabelSettingsModule } from './connector-field-editor/connector-field-option-label-settings/connector-field-option-label-settings.module';

@NgModule({
  declarations: [
    FieldEditorComponent,
    FieldValidatorsComponent,
    FieldDefaultValueComponent,
    NumberFieldFormatComponent,
    FieldHighlightsComponent,
    FieldHyperlinkSettingsComponent,
    ConnectorFieldEditorComponent,
    ConnectorFieldOptionRulesComponent,
    AutoIncrementFieldComponent,
    ThumbnailSettingsComponent,
    ConnectorFieldOptionsSortingComponent,
    FileNameSettingsComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyModule.forChild(),
    FormlyMaterialModule,
    FormlyMatDateModule,
    FormlyAddonsModule,
    FormlyFileModule,
    FormlyListOfEntitesModule,
    FormlyListModule,
    FormlyConnectorModule,
    FormlyInputModule,
    RichTextModule,
    SignatureModule,
    YoutubeEmbedModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    RulesBuilderModule,
    DynamicRulesBuilderModule,
    ConnectorFieldOptionLabelSettingsModule
  ],
  exports: [FieldEditorComponent, TranslateModule, ConnectorFieldEditorComponent]
})
export class FieldModule {}
