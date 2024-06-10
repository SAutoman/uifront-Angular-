/**
 * global
 */
import { NgModule } from '@angular/core';

/**
 * project
 */
import { SharedModule } from '@wfm/shared/shared.module';

/**
 * local
 */
import { UsersRoutingModule } from './users.routing';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { RegistrationComponent } from './registration/registration.component';
import { CompanyComponent } from './company/company.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';

import { ClearStorageComponent } from './clear-storage/clear-storage.component';
import { DateFormatComponent } from './date-format/date-format.component';
import { UploadProfilePictureComponent } from './upload-profile-picture/upload-profile-picture.component';
import { UsersGridComponent } from './users-grid/users-grid.component';
import { InvalidUserPopupComponent } from './invalid-user-popup/invalid-user-popup.component';
import { UserGroupsPageComponent } from './user-groups-page/user-groups-page.component';
import { UserGroupsViewerComponent } from './user-groups-viewer/user-groups-viewer.component';
import { UserGroupEditorDialogComponent } from './user-group-editor-dialog/user-group-editor-dialog.component';
import { UsersGridSearchComponent } from './users-grid/users-grid-search/users-grid-search.component';
import { CreateCompanyComponent } from './create-company/create-company.component';
import { DeactivatedUsersListComponent } from './deactivated users/deactivated-users-list/deactivated-users-list.component';
import { NotificationTopicsSettingComponent } from './notification-topics-setting/notification-topics-setting.component';
import { UserSortingSettingsComponent } from './user-sorting-settings/user-sorting-settings.component';
import { EvokedAnswerSettingsComponent } from './evoked-answer-settings/evoked-answer-settings.component';

@NgModule({
  declarations: [
    UsersGridComponent,
    UserProfileComponent,
    RegistrationComponent,
    CompanyComponent,
    UserSettingsComponent,
    ClearStorageComponent,
    DateFormatComponent,
    UploadProfilePictureComponent,
    InvalidUserPopupComponent,
    UserGroupsPageComponent,
    UserGroupsViewerComponent,
    UserGroupEditorDialogComponent,
    UsersGridSearchComponent,
    CreateCompanyComponent,
    DeactivatedUsersListComponent,
    NotificationTopicsSettingComponent,
    UserSortingSettingsComponent,
    EvokedAnswerSettingsComponent
  ],
  imports: [UsersRoutingModule, SharedModule],
  // entryComponents: [UserGroupEditorDialogComponent],
  exports: [UsersGridComponent, UserProfileComponent, RegistrationComponent]
})
export class UsersModule {}
