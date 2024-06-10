/**
 * global
 */
import { NgModule } from '@angular/core';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';
import { FormBuilderComponentsModule } from '@wfm/common/form-builder-components';
import { FieldModule } from '@wfm/common/field';
import { SchemaBuilderService } from '@wfm/service-layer/services/schema-builder.service';
import { ServiceLayerModule } from '@wfm/service-layer/service-layer.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { SchemaEmbeddingTypeSelectComponent } from '@wfm/common/form-builder-components/form-builder-form/schema-embedding-type-select/schema-embedding-type-select.component';
/**
 * local
 */
import { PageFormBuilderComponent } from './page-form-builder/page-form-builder.component';
import { FormsFlowStructRoutingModule } from './forms-flow-struct-routing.module';
import { SchemasListComponent } from './schemas-list/schemas-list.component';
import { FormsFlowStructComponent } from './forms-flow-struct/forms-flow-struct.component';
import { FormFunctionBuilderComponent } from './form-function-builder/form-function-builder.component';
import { FormFieldEditorComponent } from './form-field-editor/form-field-editor.component';
import { FormFunctionItemComponent } from './form-function-item/form-function-item.component';
import { FormFunctionFieldSettingsComponent } from './form-function-field-settings/form-function-field-settings.component';
import { FormRuleBuilderComponent } from './form-rule-builder/form-rule-builder.component';

import { FiltertextPipe } from './form-function-builder/filtertext.pipe';
import { ConditionalFormattingComponent } from './schema-additional-settings/conditional-formatting/conditional-formatting.component';

import { FastCreateSettingComponent } from './schema-additional-settings/fast-create-setting/fast-create-setting.component';
import { SchemaAdditionalSettingsComponent } from './schema-additional-settings/schema-additional-settings.component';
import { ConditionalFormattingListComponent } from './schema-additional-settings/conditional-formatting-list/conditional-formatting-list.component';
import { LinkedListFieldsComponent } from './schema-additional-settings/linked-list-fields/linked-list-fields.component';
import { SchemaValidatorsComponent } from './schema-additional-settings/schema-validators/schema-validators.component';
import { CrossSchemaValidatorComponent } from './schema-additional-settings/schema-validators/cross-schema-validator/cross-schema-validator.component';
import { DynamicRulesBuilderModule } from '@wfm/tenant-admin/workflows/dynamic-rules-builder/dynamic-rules-builder.module';
import { SchemaValidationPopupComponent } from './schema-additional-settings/schema-validators/schema-validation-popup/schema-validation-popup.component';
import { FieldsVisibilityComponent } from './schema-additional-settings/fields-visibility/fields-visibility.component';
import { DataLifetimeComponent } from '@wfm/forms-flow-struct/schema-additional-settings/data-lifetime/data-lifetime.component';

@NgModule({
  declarations: [
    PageFormBuilderComponent,
    SchemasListComponent,
    FormsFlowStructComponent,
    FormFunctionBuilderComponent,
    FormFieldEditorComponent,
    FormFunctionItemComponent,
    FormFunctionFieldSettingsComponent,
    FormRuleBuilderComponent,
    SchemaEmbeddingTypeSelectComponent,
    FiltertextPipe,
    ConditionalFormattingComponent,
    ConditionalFormattingListComponent,
    FastCreateSettingComponent,
    DataLifetimeComponent,
    SchemaAdditionalSettingsComponent,
    LinkedListFieldsComponent,
    SchemaValidatorsComponent,
    CrossSchemaValidatorComponent,
    SchemaValidationPopupComponent,
    FieldsVisibilityComponent
  ],
  imports: [
    FormsFlowStructRoutingModule,
    SharedModule,
    FormBuilderComponentsModule,
    FieldModule,
    ServiceLayerModule,
    DynamicRulesBuilderModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  providers: [SchemaBuilderService]
})
export class FormsFlowStructModule {}
