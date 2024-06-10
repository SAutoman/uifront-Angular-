/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { SharedModule } from '../shared/shared.module';

/**
 * local
 */
import { TenantsListComponent } from './tenants-list/tenants-list.component';
import { TenantsRoutingModule } from './tenants.routing';

import { TenantsSettingsComponent } from './tenants-settings/tenants-settings.component';
import { CreateTenantComponent } from './create-tenant/create-tenant.component';
import { UploadTenantLogoComponent } from './upload-tenant-logo/upload-tenant-logo.component';
import { InvitationPopupComponent } from './invitation-popup/invitation-popup.component';
import { FieldsComponent } from './fields/fields.component';
// import { ExternalKeyRequiredComponent } from './external-key-required/external-key-required.component';
import { TenantsMenuComponent } from './tenants-menu/tenants-menu.component';
import { EditFieldComponent } from './fields/edit-field/edit-field.component';
import { ApplicationThemeComponent } from './application-theme/application-theme.component';

// import { TenantsSettingsCardComponent } from './tenants-settings-card/tenants-settings-card.component';
import { SchemaSelectionComponent } from './schema-selection/schema-selection.component';
import { ManualCreationSettingsBySchemaComponent } from './manual-creation-settings-by-schema/manual-creation-settings-by-schema.component';
import { DynamicEntityTitleFormatterComponent } from './dynamic-entity-title-formatter/dynamic-entity-title-formatter.component';
import { TitleFormatterPerSchemaComponent } from './dynamic-entity-title-formatter/title-formatter-per-schema/title-formatter-per-schema.component';
import { ProcessStepsRelocationComponent } from './process-steps-relocation/process-steps-relocation.component';
import { NotificationSettingsComponent } from './notification-settings/notification-settings.component';
import { TenantRawDataSettingComponent } from './tenant-raw-data-setting/tenant-raw-data-setting.component';
import { TenantsListSearchComponent } from './tenants-list-search/tenants-list-search.component';
import { DocumentManagementComponent } from './document-management/document-management.component';
import { SearchTimePeriodComponent } from './search-time-period/search-time-period.component';
import { TimeZoneSelectComponent } from './time-zone/time-zone-select.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { BasicAppSettingComponent } from './basic-app-setting/basic-app-setting.component';
import { StartOfWeekComponent } from './start-of-week/start-of-week.component';
import { CasesSettingComponent } from './cases-setting/cases-setting.component';
import { CreateAnotherComponent } from './manual-creation-settings-by-schema/create-another/create-another.component';
import { SelectSearchProfileComponent } from './manual-creation-settings-by-schema/select-search-profile/select-search-profile.component';
import { SchemaRightsComponent } from './manual-creation-settings-by-schema/schema-rights/schema-rights.component';
import { LayoutSettingsComponent } from './manual-creation-settings-by-schema/layout-settings/layout-settings.component';
import { FieldPathGeneratorModule } from '@wfm/shared/actions/field-path-generator/field-path-generator.module';
import { PrintPreviewSettingComponent } from './print-preview-setting/print-preview-setting.component';
import { InvitationsComponent } from './invitations/invitations.component';
import { SelectCaseStatusesComponent } from './manual-creation-settings-by-schema/select-case-statuses/select-case-statuses.component';

@NgModule({
  declarations: [
    TenantsListComponent,
    TenantsSettingsComponent,
    CreateTenantComponent,
    UploadTenantLogoComponent,
    InvitationPopupComponent,
    FieldsComponent,
    // ExternalKeyRequiredComponent,
    TenantsMenuComponent,
    EditFieldComponent,
    ApplicationThemeComponent,
    // TenantsSettingsCardComponent,
    SchemaSelectionComponent,
    ManualCreationSettingsBySchemaComponent,
    DynamicEntityTitleFormatterComponent,
    TitleFormatterPerSchemaComponent,
    ProcessStepsRelocationComponent,
    NotificationSettingsComponent,
    TenantRawDataSettingComponent,
    TenantsListSearchComponent,
    DocumentManagementComponent,
    SearchTimePeriodComponent,
    TimeZoneSelectComponent,
    AppSettingsComponent,
    BasicAppSettingComponent,
    StartOfWeekComponent,
    CasesSettingComponent,
    CreateAnotherComponent,
    SelectSearchProfileComponent,
    SchemaRightsComponent,
    LayoutSettingsComponent,
    PrintPreviewSettingComponent,
    InvitationsComponent,
    SelectCaseStatusesComponent
  ],
  imports: [TenantsRoutingModule, SharedModule, FieldPathGeneratorModule]
})
export class TenantsModule {}
