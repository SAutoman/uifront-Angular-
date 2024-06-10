/**
 * global
 */
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  NgZone,
  Renderer2,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { TimeZone } from '@vvo/tzdb';
import { DateTime } from 'luxon';

/**
 * project
 */

import { MenuType, AuthState, loggedInState, tenantSettingsSelector, tenantTimezoneSelector } from '@wfm/store';

import { tenantLogo, TenantProfile, Roles, DocumentUploadService } from '@wfm/service-layer';

import { BaseComponent } from '@wfm/shared/base.component';
import { convertTenantName } from '@wfm/shared/utils';

import { usersMainRoute, usersProfileRoute } from '@wfm/users/users.routing';
import { UserProfileSidebarView } from '../sidebar.models';
import { SharedService } from '@wfm/service-layer/services/shared.service';
import { getTimeZoneByName } from '@wfm/tenants/time-zone/timezone.helper';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * local
 */

@Component({
  selector: 'app-user-profile-sidebar',
  templateUrl: './user-profile-sidebar.component.html',
  styleUrls: ['./user-profile-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileSidebarComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('timeElement') timeElement: ElementRef;
  userProfileLink: string;
  suppliersMappingsLink: string;
  auditorsMappingsLink: string;
  _tenant: UserProfileSidebarView;
  documentId: string;
  image: string;
  authState: AuthState;
  role: string | Roles;
  timeZoneInfo: TimeZone;
  timeIntervalId;
  userDateTimeFormat: string;
  @Output() selectedTenant: EventEmitter<TenantProfile> = new EventEmitter();
  @Output() menuTypeOutput: EventEmitter<MenuType> = new EventEmitter();
  @Output() signOutEmitter: EventEmitter<void> = new EventEmitter();

  @Input() set tenant(value: UserProfileSidebarView) {
    if (value) {
      this._tenant = value;
      this.userProfileLink = '/' + convertTenantName(this._tenant.tenant.tenantName) + '/' + usersMainRoute + '/' + usersProfileRoute;
    }
  }

  get roles(): typeof Roles {
    return Roles;
  }
  get menuType(): typeof MenuType {
    return MenuType;
  }
  get tenant(): UserProfileSidebarView {
    return this._tenant;
  }

  constructor(
    private uploadService: DocumentUploadService,
    private store: Store<AuthState>,
    private cd: ChangeDetectorRef,
    private sharedService: SharedService,
    private zone: NgZone,
    private renderer: Renderer2
  ) {
    super();
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
      this.authState = state;
    });

    this.setTenantTimeInfo();
    this.sharedService
      .getUpdateTenantImage()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        if (data?.image) {
          this.image = data?.image;
        }
      });
  }

  ngOnInit(): void {
    // to do refactor
    // if (this.profile && this.profile.lastName) {
    //   if (this.profile.lastName.length >= 12 && this.profile.lastName.length < 18) {
    //     this.shortName = this.profile.name.substr(0, 1) + '.';
    //   } else if (this.profile.lastName.length >= 18) {
    //     this.userProfileSidebarView.name = this.profile.name.substr(0, 1) + '.';
    //     // this.name = this.profile.name.substr(0, 1) + '.';
    //     this.userProfileSidebarView.lastName = this.profile.lastName.substr(0, 15) + '...';
    //   }
    // }
    this.checkRoleForTenantsMenu();
    this.buildImage();
  }

  setTenantTimeInfo(): void {
    this.store
      .select(tenantTimezoneSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((tz) => {
        if (tz) {
          this.timeZoneInfo = getTimeZoneByName(tz);
          setTimeout(() => {
            this.setTimeContentInHtml(tz);
          });
          if (this.timeIntervalId) {
            clearInterval(this.timeIntervalId);
            this.timeIntervalId = null;
          }
          // do not trigger changeDetection every 30 second, just update this one element
          this.zone.runOutsideAngular(() => {
            this.timeIntervalId = setInterval(() => {
              this.setTimeContentInHtml(tz);
            }, 30000);
          });
        }
      });
  }

  setTimeContentInHtml(tz: string): void {
    if (this.timeElement) {
      const dateString = this.userDateTimeFormat
        ? DateTime.now().setZone(tz).toFormat(this.userDateTimeFormat)
        : DateTime.now().setZone(tz).toLocaleString(DateTime.DATETIME_SHORT);
      this.renderer.setProperty(this.timeElement.nativeElement, 'textContent', `${dateString}`);
    }
  }

  signOut(): void {
    this.signOutEmitter.emit();
  }

  onSwitchSystem(role: TenantProfile): void {
    this.selectedTenant.emit(role);
  }

  // changeMenuToAdmin(): void {
  //   this.menuTypeOutput.emit(MenuType.AdminMenu);
  // }

  // changeMenu(): void {
  //   this.menuTypeOutput.emit(MenuType.UserMenuActivated);
  // }

  hyphenateUrlParams(str: string): string {
    return str.replace(' ', '-');
  }

  async buildImage(): Promise<void> {
    const tenantName = this.hyphenateUrlParams(this.tenant.tenant.tenantName);
    this.suppliersMappingsLink = `/${tenantName}/suppliers/grid`;
    this.auditorsMappingsLink = `/${tenantName}/auditors/grid`;
    this.store
      .pipe(
        select(tenantSettingsSelector),
        takeUntil(this.destroyed$),
        filter((x) => !!x && !!x.length),
        take(1)
      )
      .subscribe((data) => {
        const tenantLogoSetting = data.find((s) => s.key === tenantLogo);

        tenantLogoSetting ? (this.documentId = tenantLogoSetting.value.documentId) : null;
        tenantLogoSetting ? (this.image = this.uploadService.buildImage(this.documentId, this.authState.sessionId)) : null;
        this.cd.detectChanges();
      });
  }

  checkRoleForTenantsMenu(): void {
    for (const [key, value] of Object.entries(this.roles)) {
      if (this.tenant.tenant.role === key) {
        this.role = value;
      }
    }
  }
}
