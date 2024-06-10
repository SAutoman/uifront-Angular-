/**
 * global
 */
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

/**
 * project
 */
import { SharedService } from '@wfm/service-layer/services/shared.service';
import { LanguageOption, LanguagesList } from '@wfm/service-layer/models/languages';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';

/**
 * local
 */
import {
  DocumentUploadService,
  SidebarLinksService,
  TranslationService,
  APP_CLIENT_ID,
  WorkflowSimplifiedDto,
  SentryService
} from './../../../service-layer';
import { loggedInState, AuthState, Logout } from './../../../store';
import { usersMainRoute, usersProfileRoute } from '../../../users/users.routing';
import { notificationMainRoute, NotificationsRoute, messageRoute } from '../../../notification-message/notification-message.routing';
import { convertTenantName } from '../../../shared/utils';
import { TenantComponent } from '../../../shared/tenant.component';
import { GlobalCaseCreateComponent } from './global-case-create/global-case-create.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class AppHeaderComponent extends TenantComponent implements OnInit {
  @Input() isMobileView: boolean = false;
  userProfileLink = '/' + convertTenantName(this.sidebarLinksService.tenantName) + '/' + usersMainRoute + '/' + usersProfileRoute;
  notificationLink = '/' + notificationMainRoute + '/' + NotificationsRoute;
  messageLink = '/' + notificationMainRoute + '/' + messageRoute;
  @Output() toggleProfile: EventEmitter<string> = new EventEmitter();
  authState: AuthState;
  image: string;
  userName: string;
  selectedLanguage: LanguageOption;
  languageList: LanguageOption[] = LanguagesList;

  createCaseDialog: MatDialogRef<any, any>;
  allWorkflows: WorkflowSimplifiedDto[];

  constructor(
    private sidebarLinksService: SidebarLinksService,
    private store: Store<any>,
    private uploadService: DocumentUploadService,
    private sharedService: SharedService,
    private router: Router,
    private translate: TranslateService,
    private translateService: TranslationService,
    private sentryService: SentryService,
    private dialog: MatDialog,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    @Inject(APP_CLIENT_ID) readonly appId: string
  ) {
    super(store);

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
      this.authState = state;
    });
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.userName = data.profile.name + ' ' + data.profile.lastName;
        if (data.profile?.photoId) this.buildImage(data.profile.photoId);
      }
    });
    this.sharedService
      .getUpdateUserImage()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.image = data?.image;
      });

    this.schemaPermissionsHelper
      .getAllowedWorkflowsForCaseCreate(this.tenant)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (x) => {
        this.allWorkflows = await x;
      });
  }

  ngOnInit(): void {
    this.setSelectedLanguage(this.translate.currentLang);
  }

  async buildImage(photoId: string): Promise<void> {
    this.image = this.uploadService.buildImage(photoId, this.authState.sessionId);
  }

  onSignOut(): void {
    this.store.dispatch(new Logout());
  }

  routeProfile() {
    this.router.navigate([this.userProfileLink]);
  }

  changeLanguage(newLanguage: string): void {
    this.setSelectedLanguage(newLanguage);
    const userId = this.authState.profile.id;
    this.translateService.storePreferredLanguage(userId, newLanguage);
    window.location.reload();
    // const currentTenant = this.authState.currentTenantSystem.tenant.tenantName;
    // this.translateService.setTranslationsByTenant(currentTenant, userId);
  }

  setSelectedLanguage(langKey: string): void {
    this.selectedLanguage = this.languageList.find((lang) => lang.key === langKey);
  }

  onWorkflowSelect(wf: WorkflowSimplifiedDto): void {
    this.createCaseDialog = this.dialog.open(GlobalCaseCreateComponent, {
      width: '500px',
      maxHeight: '95vh',
      maxWidth: '95vw',
      panelClass: [],
      disableClose: true
    });
    this.createCaseDialog.componentInstance.selectedWorkflow = wf;
  }

  public reportProblemAction(): void {
    this.sentryService.reportProblem();
  }
}
