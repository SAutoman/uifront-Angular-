/**
 * global
 */
import { Component, OnInit, Inject, Renderer2, LOCALE_ID } from '@angular/core';
import { Router, RouterEvent, NavigationStart } from '@angular/router';

import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

import { takeUntil, filter } from 'rxjs/operators';
import { Settings as LuxonSettings } from 'luxon';
import { combineLatest } from 'rxjs';

/**
 * project
 */
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { KendoThemeService } from '@wfm/service-layer/services/kendo-theme.service';

/**
 * local
 */
import {
  TranslationService,
  AuthenticationService,
  RolesService,
  headerJson,
  StartPage,
  appStartPage,
  TenantProfile,
  applicationTheme,
  TenantsService,
  Settings,
  Roles,
  SettingsUI,
  startOfWeekSettingsKey
} from './service-layer';

import {
  ApplicationState,
  LoginState,
  AuthState,
  MenuType,
  FetchTenantSettingsAction,
  ChangeMenuAction,
  tenantSettingsSelector,
  SetRawDataMenuOption,
  tenantNameKey,
  tenantIdKey,
  tenantRoleKey,
  showRawDataMenuSelector,
  newTranslationLoadedSelector,
  dateFormatSettingsSelector,
  tenantTimezoneSelector,
  hasRawDataSchemaSelector
} from './store';

import { dataListRoute } from './raw-data/raw-data.routing';

import { loggedInState } from './store/auth/auth.selectors';

import { TenantComponent } from './shared/tenant.component';
import { convertTenantName, roleConverter } from './shared/utils';
import { unknownUserRoute, userRegistrationRoute } from './app.route.static';
import { AppRoutes } from './app.routes';
import { usersProfileRoute } from './users/users.routing';
import { convertFieldName, nameToProperty } from './service-layer/helpers';
import { workflowStatesListRoute, workflowStatesMainRoute } from './workflow-state/workflow-state.routing.module';
import { GetStatusList } from './store/workflow';
import { tenantRawDataMenuSetting } from './tenants/tenant-raw-data-setting/tenant-raw-data-setting.component';
import { Platform } from '@angular/cdk/platform';
import { reportsMainRoute } from './report/report.routing';
import { BrowserPostactionHandler } from './service-layer/services/browser-postaction-handler.service';
import { SignalrService } from './services/signalr.service';
import { SentryService } from '@wfm/service-layer/services/sentry.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends TenantComponent implements OnInit {
  tenantName: string;
  userId: string;
  showRawDataMenu: boolean = false;
  hasRawDataSchema: boolean;
  activePlatform: string;
  constructor(
    private store: Store<ApplicationState>,

    @Inject('AuthenticationService') private authService: AuthenticationService,
    @Inject(LOCALE_ID) private locale: string,
    private router: Router,
    private roleService: RolesService,
    translateService: TranslateService,
    private translationService: TranslationService,
    private kendoThemeService: KendoThemeService,
    private tenantsService: TenantsService,
    private sentryService: SentryService,
    private platform: Platform,
    private renderer: Renderer2,
    private browserPostactionHandler: BrowserPostactionHandler,
    private signalR: SignalrService
  ) {
    super(store);
    translateService.setDefaultLang('en');
    if (localStorage.getItem('lastSchemaOpened')) {
      localStorage.removeItem('lastSchemaOpened');
    }
    this.setBodyClass();
    this.browserPostactionHandler.init();
    // this.signalR.startConnection();
  }

  get headerJson() {
    return headerJson;
  }
  get headerTenant() {
    return this.tenant;
  }
  authState: AuthState;

  ngOnInit(): void {
    this.observeDateFormatState();
    this.setTimeZone();
    this.subscribeToRawDataMenuSetting();
    this.sentryService.initSentry();
    this.store
      .pipe(
        select(newTranslationLoadedSelector),
        filter((x) => !!x?.isLoaded),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.translationService.translateDefault();
      });

    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x),
        filter((x) => x.state === LoginState.NoUserInfo || x.state === LoginState.RedirectToRegister)
      )
      .subscribe(() => {
        if (this.authService.isEmailDomainAndUserRoleInClaims()) {
          setTimeout(() => {
            this.router.navigateByUrl(userRegistrationRoute);
          });
        } else {
          this.router.resetConfig(AppRoutes);
          this.router.navigateByUrl(unknownUserRoute);
        }
      });

    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x)
      )
      .subscribe((authState) => {
        this.authState = authState;
        this.userId = authState.profile?.id;
      });

    if (!!this.tenant && !!this.userId) {
      // this.store.dispatch(new LoadUserSettings({ tenantId: this.tenant, userId: this.userId }));
      this.store.dispatch(new GetStatusList({ tenantId: this.tenant }));
    }

    const tenantNameRaw: string = this.tenantsService.getFromStorage(tenantNameKey);
    if (tenantNameRaw !== null) {
      this.tenantName = nameToProperty(tenantNameRaw);
    }

    this.router.resetConfig(AppRoutes);

    this.store
      .pipe(
        select(tenantSettingsSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.applyThemeSetting(data);
        this.fetchRawDataMenuSetting(data);
        this.setFirstDayOfWeek(data);
      });
    if (!JSON.parse(localStorage.getItem('isRegistrationRequest'))) {
      this.subscribeToRouterEvents();
    }
  }

  setBodyClass(): void {
    if (this.platform.IOS) {
      this.activePlatform = 'ios';
    } else if (this.platform.ANDROID) {
      this.activePlatform = 'android';
    } else if (this.platform.isBrowser) {
      this.activePlatform = 'chrome';
    } else if (this.platform.SAFARI) {
      this.activePlatform = 'safari';
    } else if (this.platform.EDGE) {
      this.activePlatform = 'edge';
    } else if (this.platform.FIREFOX) {
      this.activePlatform = 'firefox';
    }
    this.renderer.addClass(document.body, `${this.activePlatform}`);
  }
  applyThemeSetting(data: SettingsUI[]): void {
    const colors = data.filter((s) => s.key === applicationTheme)[0]?.value?.colors;
    if (colors) {
      const theme: ColorEnum = colors.green
        ? ColorEnum.green
        : colors.blue
        ? ColorEnum.blue
        : colors.dark
        ? ColorEnum.dark
        : colors.danger
        ? ColorEnum.red
        : ColorEnum.darkgreen;
      this.kendoThemeService.applyTheme(theme);
    } else {
      this.kendoThemeService.applyTheme(ColorEnum.darkgreen);
    }
  }

  fetchRawDataMenuSetting(data: SettingsUI[]): void {
    const currentSettings = data.find((x) => x.key === `${tenantRawDataMenuSetting}`);
    if (currentSettings) {
      const values = currentSettings.value?.roles;
      if (values) {
        const currentUserRole = convertFieldName(this.authState.currentTenantSystem.tenant.role);
        const showRawData = values[currentUserRole];
        if (showRawData === true || showRawData === false) this.store.dispatch(new SetRawDataMenuOption({ showRawData: showRawData }));
      }
    }
  }

  subscribeToRouterEvents(): void {
    const roles = this.roleService.rolesPerTenant || [];
    const firstRole = roles[0];
    if (firstRole) {
      const storedTenantId: string = this.tenantsService.getFromStorage(tenantIdKey);
      const storedRole: string = this.tenantsService.getFromStorage(tenantRoleKey);

      this.router.events
        .pipe(
          takeUntil(this.destroyed$),
          filter((event: RouterEvent) => event instanceof NavigationStart)
        )
        .subscribe(async (event: NavigationStart) => {
          const activeTenantName = this.tenantName || firstRole.tenantName;
          if (event.url === '/') {
            if (this.tenantName && storedTenantId && storedRole) {
              if (this.authState.currentTenantSystem?.tenant?.tenantId !== storedTenantId) {
                this.store.dispatch(
                  new FetchTenantSettingsAction({
                    tenant: <TenantProfile>{
                      tenantId: storedTenantId,
                      role: storedRole,
                      tenantName: this.tenantName,
                      roleNum: roleConverter(storedRole)
                    },

                    userId: this.authState.profile.id
                  })
                );
              }
            } else {
              // not sure what this does
              if (this.authState.currentTenantSystem?.tenant?.tenantId !== storedTenantId) {
                this.store.dispatch(
                  new FetchTenantSettingsAction({
                    tenant: <TenantProfile>{
                      tenantId: firstRole.tenantId,
                      role: firstRole.role,
                      tenantName: this.tenantName,
                      roleNum: roleConverter(firstRole.role)
                    },
                    userId: this.authState.profile.id
                  })
                );
              }
            }
            const startPage = this.authState.userSettingsMap[appStartPage];
            if (!startPage || startPage?.value === StartPage.CasesList) {
              this.router.navigateByUrl(convertTenantName(activeTenantName) + `/${workflowStatesMainRoute}/${workflowStatesListRoute}`);
            } else if (startPage && this.showRawDataMenu && startPage?.value === StartPage.RawDataList) {
              this.router.navigateByUrl(convertTenantName(activeTenantName) + `/${dataListRoute}`);
            }
          } else {
            this.checkRouteForTenant(event.url);
            this.runRawDataRouteGuard(event.url);
            if (event.url.includes(workflowStatesMainRoute) || event.url.includes(dataListRoute) || event.url.includes(reportsMainRoute)) {
              this.store.dispatch(new ChangeMenuAction({ menuType: MenuType.UserMenu }));
            } else if (roleConverter(storedRole) === Roles.TenantAdmin && !event.url.includes(usersProfileRoute)) {
              this.store.dispatch(new ChangeMenuAction({ menuType: MenuType.AdminMenu }));
            }
          }
        });
    }
  }

  setTimeZone(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(tenantTimezoneSelector)).subscribe((tzName: string) => {
      if (tzName) {
        LuxonSettings.defaultZone = tzName;
        LuxonSettings.defaultLocale = this.locale;
      }
    });
  }

  setFirstDayOfWeek(data: SettingsUI[]): void {
    const currentSettings = data.find((x) => x.key === `${startOfWeekSettingsKey}`);
    if (currentSettings) {
      DateTimeFormatHelper.setFirstDayOfWeek(currentSettings.value?.firstDayOfWeek);
    }
  }

  observeDateFormatState(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(dateFormatSettingsSelector)).subscribe((dateFormatSettings: Settings) => {
      if (dateFormatSettings) {
        DateTimeFormatHelper.setDateFormat(dateFormatSettings);
      }
    });
  }

  checkRouteForTenant(url): void {
    const urlSplits = url.split('/');
    const tenantNameInRoute = urlSplits[1];
    const storedTenantName: string = this.tenantsService.getFromStorage(tenantNameKey);
    const existingTenant = this.authState.rolesPerTenant.find(
      (tenantData) => tenantNameInRoute === convertTenantName(tenantData.tenantName)
    );
    // if the tenant in the route and the tenant in storage are different, switch to the route tenant
    if (existingTenant && tenantNameInRoute !== convertTenantName(storedTenantName)) {
      this.switchTenant(existingTenant);
    }
  }

  switchTenant(tenantData: TenantProfile): void {
    this.tenantsService.setInStorage(tenantIdKey, tenantData.tenantId);
    this.tenantsService.setInStorage(tenantRoleKey, tenantData.role);
    this.tenantsService.setInStorage(tenantNameKey, tenantData.tenantName);
    // load the same URL
    window.location.reload();
  }

  subscribeToRawDataMenuSetting(): void {
    combineLatest([this.store.select(showRawDataMenuSelector), this.store.select(hasRawDataSchemaSelector)])
      .pipe(takeUntil(this.destroyed$))
      .subscribe((settingValue) => {
        this.showRawDataMenu = settingValue[0];
        this.hasRawDataSchema = settingValue[1];

        this.runRawDataRouteGuard(window.location.pathname);
      });
  }

  // if the user tries to load data/list, but RawData menu is disabled OR there are no RawData menu items to show -> navigate the user to workflow-states/list
  runRawDataRouteGuard(path: string): void {
    if (path.includes(dataListRoute) && (!this.showRawDataMenu || this.hasRawDataSchema === false)) {
      const activeTenant = this.tenantName || this.roleService.rolesPerTenant[0]?.tenantName;
      this.router.navigateByUrl(convertTenantName(activeTenant) + `/${workflowStatesMainRoute}/${workflowStatesListRoute}`);
    }
  }
}
