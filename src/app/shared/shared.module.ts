/**
 * global
 */

// import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GridModule, ExcelModule, PDFModule } from '@progress/kendo-angular-grid';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

/**
 * project
 */
import { FormlyAddonsModule } from '@wfm/common/vendor/formly-addons/formly-addons.module';
import { FormlyMatDateModule } from '@wfm/common/vendor/formly-mat-date/formly-mat-date.module';
import { FormlyFileModule } from '@wfm/common/vendor/formly-file';
import { MaterialModule } from '@wfm/material-module';
import { OrderByPipe } from '@wfm/pipes/order-by.pipe';

/**
 * local
 */
import { CaseGridComponent } from './case-grid/case-grid.component';
import { WfmPaginatorComponent } from './wfm-paginator/wfm-paginator.component';

import { GridLayoutOptionsComponent } from './grid-layout-options/grid-layout-options.component';
import { WfmGridComponent } from './wfm-grid/wfm-grid.component';
import { MenuItems } from './menu-items/menu-items';
import { AccordionAnchorDirective, AccordionLinkDirective, AccordionDirective } from './accordion';
import { PopupConfirmComponent } from './popup-confirm/popup-confirm.component';
import { PopupAlertComponent } from './popup-alert/popup-alert.component';
import { DynamicEntityShareSearchProfileDialogComponent } from './dynamic-entity-search-mask/dynamic-entity-share-search-profile-dialog/dynamic-entity-share-search-profile-dialog.component';
import { LogoComponent } from './logo/logo.component';
import { AvatarComponent } from './avatar/avatar.component';
import { ActionsComponent } from './actions/actions.component';
import { NotificationMessageComponent } from './notification-message/notification-message.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageCropperComponent } from './image-cropper/image-cropper.component';
import { IconModule } from './icon/icon.module';
import { MathExpressionActionComponent } from './actions/math-expression-action/math-expression-action.component';
import { DifferenceCalculationActionComponent } from './actions/difference-calculation-action/difference-calculation-action.component';
import { WebhookActionComponent } from './actions/webhook-action/webhook-action.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CaseToStepActionComponent } from './actions/case-to-step-action/case-to-step-action.component';
import { CustomNumberInputComponent } from './custom-number-input/custom-number-input.component';
import { NotificationLogsComponent } from './notification-logs/notification-logs.component';
import { FormulaGeneratorComponent } from './formula-generator/formula-generator.component';
import { SettingConfirmationPopupComponent } from './setting-confirmation-popup/setting-confirmation-popup.component';
import { CopyFieldsActionComponent } from './actions/copy-fields-action/copy-fields-action.component';
import { FormulaHintComponent } from './formula-generator/formula-hint/formula-hint.component';
import { FormulaAutocompleteComponent } from './formula-generator/formula-autocomplete/formula-autocomplete.component';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { AddAggregateComponent } from './add-aggregate/add-aggregate.component';
import { CustomNumberFormatPipe } from '../pipes/custom-number-format.pipe';
import { EmailAuditFiltersComponent } from './email-audit-filters/email-audit-filters.component';
import { TenantSearchAutoCompleteComponent } from './tenant-search-auto-complete/tenant-search-auto-complete.component';
import { FormlyListModule } from '@wfm/common/vendor/formly-list/formly-list.module';
import { BooleanFormatterPipe } from '@wfm/pipes/boolean-formatter.pipe';
import { CustomDateFormatPipe } from '@wfm/pipes/custom-date-format.pipe';
import { CustomDateTimePickerComponent } from './custom-dateTime-picker/custom-dateTime-picker.component';
import { FormlyConnectorModule } from '@wfm/common/vendor/formly-connector/formly-connector.module';
import { SanitizePipe } from '@wfm/pipes/sanitize.pipe';
import { RegisteredUsersGridComponent } from './registered-users-grid/registered-users-grid.component';
import { SendEmailActionComponent } from './actions/send-email-action/send-email-action.component';
import { FastCreateDynamicEntityComponent } from './fast-create-dynamic-entity/fast-create-dynamic-entity.component';
import { FormlyListOfEntitesModule } from '@wfm/common/vendor/formly-list-of-entities/formly-list-of-entities.module';
import { FormlyInputModule } from '@wfm/common/vendor/formly-input/formly-input.module';
import { AggregationActionModule } from './actions/aggregation-action/aggregation-action.module';
import { FieldPathGeneratorModule } from './actions/field-path-generator/field-path-generator.module';
import { AutoIncrementActionComponent } from './actions/auto-increment-action/auto-increment-action.component';
import { AutoIncrementFieldSelectorComponent } from './actions/auto-increment-field-selector/auto-increment-field-selector.component';
import { RulesBuilderModule } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.module';
import { FormBuilderFormPreviewComponent } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { RichTextModule } from '@wfm/common/vendor/formly-rich-text/rich-text.module';
import { RawDataToStepActionComponent } from './actions/raw-data-to-step-action/raw-data-to-step-action.component';
import { CopyToRepeatableComponent } from './actions/raw-data-to-step-action/copy-to-repeatable/copy-to-repeatable.component';
import { ExpressionBuilderModule } from '@wfm/tenant-admin/workflows/expression-builder/expression-builder.module';
import { BrowserActionComponent } from './actions/browser-action/browser-action.component';
import { SignatureModule } from '@wfm/common/vendor/signature/signature.module';
import { YoutubeVideoComponent } from './youtube-video/youtube-video.component';
import { YoutubeEmbedModule } from '@wfm/common/vendor/youtube-embed/youtube-embed.module';

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Material
    MaterialModule,

    // KENDO UI
    ButtonsModule,
    DropDownsModule,
    GridModule,
    ExcelModule,
    PDFModule,

    // formly
    FormlyModule.forChild(),
    FormlyMaterialModule,
    FormlyAddonsModule,
    FormlyMatDateModule,
    FormlyFileModule,
    FormlyListModule,
    FormlyConnectorModule,
    FormlyListOfEntitesModule,
    NgxMaterialTimepickerModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    ImageCropperModule,
    FormlyInputModule,
    RichTextModule,
    SignatureModule,
    YoutubeEmbedModule,
    //icon
    IconModule,
    FieldPathGeneratorModule,
    AggregationActionModule,
    RulesBuilderModule,
    ExpressionBuilderModule
  ],
  declarations: [
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CustomNumberFormatPipe,
    CustomDateFormatPipe,
    BooleanFormatterPipe,
    CaseGridComponent,
    WfmPaginatorComponent,
    GridLayoutOptionsComponent,
    WfmGridComponent,
    PopupConfirmComponent,
    PopupAlertComponent,
    OrderByPipe,
    DynamicEntityShareSearchProfileDialogComponent,
    LogoComponent,
    AvatarComponent,
    NotificationMessageComponent,
    ActionsComponent,
    MathExpressionActionComponent,
    DifferenceCalculationActionComponent,
    CaseToStepActionComponent,
    CopyFieldsActionComponent,
    ImageCropperComponent,
    WebhookActionComponent,
    CustomNumberInputComponent,
    NotificationLogsComponent,
    FormulaGeneratorComponent,
    FormulaHintComponent,
    FormulaAutocompleteComponent,
    SettingConfirmationPopupComponent,
    AddAggregateComponent,
    EmailAuditFiltersComponent,
    TenantSearchAutoCompleteComponent,
    CustomDateTimePickerComponent,
    SanitizePipe,
    RegisteredUsersGridComponent,
    SendEmailActionComponent,
    FastCreateDynamicEntityComponent,
    AutoIncrementActionComponent,
    AutoIncrementFieldSelectorComponent,
    FormBuilderFormPreviewComponent,
    RawDataToStepActionComponent,
    CopyToRepeatableComponent,
    BrowserActionComponent,
    YoutubeVideoComponent
  ],
  exports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MaterialModule,
    // formly
    FormlyModule,
    FormlyMaterialModule,
    FormlyAddonsModule,
    FormlyMatDateModule,
    FormlyFileModule,
    FormlyListModule,
    FormlyConnectorModule,
    FormlyListOfEntitesModule,
    NgxMaterialTimepickerModule,
    FormlyInputModule,
    RichTextModule,
    SignatureModule,
    YoutubeEmbedModule,
    // KENDO UI
    ButtonsModule,
    DropDownsModule,
    GridModule,
    ExcelModule,
    PDFModule,
    // app components
    AccordionAnchorDirective,
    AccordionLinkDirective,
    AccordionDirective,
    CustomNumberFormatPipe,
    CustomDateFormatPipe,
    BooleanFormatterPipe,
    CaseGridComponent,
    WfmPaginatorComponent,
    GridLayoutOptionsComponent,
    WfmGridComponent,
    PopupConfirmComponent,
    PopupAlertComponent,
    OrderByPipe,
    LogoComponent,
    AvatarComponent,
    ActionsComponent,
    MathExpressionActionComponent,
    DifferenceCalculationActionComponent,
    CaseToStepActionComponent,
    CopyFieldsActionComponent,
    WebhookActionComponent,
    CustomNumberInputComponent,
    // TRANSLATION
    TranslateModule,
    NotificationMessageComponent,
    NotificationLogsComponent,
    ImageCropperModule,
    FormulaGeneratorComponent,
    FormulaHintComponent,
    FormulaAutocompleteComponent,
    //icon module
    IconModule,
    TenantSearchAutoCompleteComponent,
    CustomDateTimePickerComponent,
    SanitizePipe,
    FastCreateDynamicEntityComponent,
    FormBuilderFormPreviewComponent,
    RawDataToStepActionComponent,
    CopyToRepeatableComponent,
    BrowserActionComponent
  ],
  providers: [MenuItems, { provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue: {} }]
})
export class SharedModule {}
