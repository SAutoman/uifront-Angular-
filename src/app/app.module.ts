/**
 * global
 */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Inject, APP_INITIALIZER, Injector, LOCALE_ID, ErrorHandler } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { StoreModule, Store, select } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule } from '@ngrx/effects';
import { RouterStateSerializer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { filter } from 'rxjs/operators';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule, TranslateLoader, MissingTranslationHandler, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormlyModule } from '@ngx-formly/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

/**
 * locales
 */
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeFr from '@angular/common/locales/fr';
import localeIt from '@angular/common/locales/it';
import localeRu from '@angular/common/locales/ru';
import localeEs from '@angular/common/locales/es';
import localeCs from '@angular/common/locales/cs';
import localeEn from '@angular/common/locales/en';

/**
 * project
 */
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { WindowService } from '@wfm/service-layer/services/window.service';

/**
 * local
 */
import { TenantAdminGuard } from './shared/tenant-admin.guard';
import { SuperAdminGuard } from './tenants/super-admin-guard/super-admin.guard';
import { MissingTranslationSaverService } from './translate/missingtranslationsaver.service';
import { MissingTranslationHandlerService } from './translate/missingtranslationhandler.service';
import { CcxTranslateLoaderService } from './translate/ccxtranslateloader.service';
import { DateFormatEffects } from './store/date-format/date-format.effects';
// import { CasesListEffects } from './obsolete-components/obsolete-store/cases-list/cases-list.effects';
import { ConfirmClearComponent } from './users/clear-storage/confirm-clear/confirm-clear.component';
import { RawDataInCaseInfoDialogComponent } from './raw-data/raw-data-grid/raw-data-in-case-info-dialog/raw-data-in-case-info-dialog.component';
import { ApplicationHttpClientAxiosService } from './service-layer/services/application-http-client-axios.service';

import { rolesSelector, loggedInState } from './store/auth/auth.selectors';

import { ApplicationState } from './store/application-state';
import { CurrentRoleResolver } from './shared/current-role-resolver';

import { reducers, OAuthLogin } from './store';

import { SharedModule } from './shared/shared.module';
import { ServiceLayerModule } from './service-layer/service-layer.module';
import { AuthGuard } from './store/auth/auth.guard';
import { AppStoreModule } from './store/app-store.module';

// App Components
import { AppComponent } from './app.component';
import { FullComponent } from './layouts/full/full.component';
import { AppBlankComponent } from './layouts/blank/blank.component';
import { AppHeaderComponent } from './layouts/full/header/header.component';
import { AppSidebarComponent } from './layouts/full/sidebar/sidebar.component';
import { UnknownUserComponent } from './unknown-user/unknown-user.component';
import { SpinnerComponent } from './shared/spinner.component';

// Routes
import { AppRoutingModule } from './app.routing';
import { AppRoutes } from './app.routes';
import { AppRoutesMultiples } from './app.routes-multiples';

// Environment
import { environment } from '../environments/environment';

// Services
import {
  AppConfigService,
  APP_CONFIG_TOKEN,
  AuthenticationServiceImpl,
  ListsCacheService,
  RolesService,
  SchemasCacheService,
  SentryErrorHandler,
  UserOverrideServiceImpl
} from './service-layer';
// import { TestService } from './service-layer/services/test.service';

// Effects
import { AuthEffects } from './store/auth/auth.effects';
import { UsersEffects } from './store/users/users.effects';
import { CompanyEffects } from './store/company/company.effects';
// import { RawDataFieldsEffects } from './store/raw-data-fields/raw-data-fields.effects';
// import { ListAreaEffects } from './obsolete-components/store/list-area/list-area.effects';
// import { ListAreaItemsEffects } from './store/list-area-items/list-area-items.effects';
import { TenantFieldsEffects } from './store/tenant-fields';
import { TenantListsEffects } from './store/tenant-lists';
import { TenantsEffects } from './store/tenants/tenants.effects';
import { GridLayoutsEffects } from './store/grid-layouts/grid-layouts.effects';
import { MappingsEffects } from './store/mappings/mappings.effects';
import { OperationsEffects } from './store/operations/operations.effects';
import { SchemaEffects } from './store/schema/schema.effects';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { convertTenantName } from './shared/utils';
import { LoginState } from './store/auth/auth.reducer';
import { InvitationsEffects } from './store/invitation-tool/invitation-tool.effects';
import { AuthCallbackComponent } from './layouts/authcallback/authcallback.component';
import { UserProfileSidebarComponent } from './layouts/full/user-profile-sidebar/user-profile-sidebar.component';
import { UserItemsSidebarComponent } from './layouts/full/user-items-sidebar/user-items-sidebar.component';
import { AdminItemsSidebarComponent } from './layouts/full/admin-items-sidebar/admin-items-sidebar.component';
import { API_BASE_URL_TOKEN, SIGNALR_URL_TOKEN } from './service-layer/tokens/api-base-url.token';
import { APP_CLIENT_ID } from './service-layer/tokens/app-client-id.token';
import { AppStatic } from './app.static';
import { WorkflowEffects } from './store/workflow';
import { WorkflowBuilderEffects } from './store/workflow-builder';
import { ServiceWorkerModule } from '@angular/service-worker';
import { WorkflowsCacheService } from './service-layer/services/workflows-cache.service';
import { NotificationBuilderEffects } from './store/notification-builder/notification-builder-effects';
import { CompaniesCacheService } from './service-layer/services/companies-cache.service';
import { WebHooksBuilderEffects } from './store/webhooks-builder/webhooks-builder-effects';
import { CustomRouterStateSerializer } from './store/ui-state/custom-router-serializer';
import { EmailUnsubscribeCallbackComponent } from './email-unsubscribe-callback/email-unsubscribe-callback.component';
import { ExternalLinkParserComponent } from './external-link-parser/external-link-parser.component';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';
import { AppSettingsEffects } from './store/app-settings/app-settings.effects';
import { OrchestratorEffects } from './store/orchestrator';
import { ReportDatasourceEffects } from './store/report-datasource';
import { ApiClientEffects } from './store/api clients/api-clients-effects';
import { GlobalCaseCreateComponent } from './layouts/full/header/global-case-create/global-case-create.component';
import { UserSettingsEffects } from './store/user-settings/user-settings.effects';

registerLocaleData(localeDe, 'de');
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeIt, 'it');
registerLocaleData(localeEs, 'es');
registerLocaleData(localeRu, 'ru');
registerLocaleData(localeCs, 'cs');
registerLocaleData(localeEn, 'en');

// export const metaReducers = [storeFreeze];

export function initApplication(store: Store<ApplicationState>, roleService: RolesService): Function {
  return () =>
    new Promise((resolve) => {
      store.dispatch(new OAuthLogin(window.location.href));
      store
        .pipe(
          select(rolesSelector),
          filter((x) => !!x)
        )
        .subscribe((roles) => {
          roles.forEach((r) => {
            AppRoutesMultiples.path = convertTenantName(r.tenantName);
            AppRoutes.unshift({ ...AppRoutesMultiples });
          });
          roleService.rolesPerTenant = roles;
          resolve(true);
        });

      store
        .pipe(
          select(loggedInState),
          filter((x) => !!x),
          filter((x) => x.state === LoginState.NoUserInfo || x.state === LoginState.UserInfoNotNeeded)
        )
        .subscribe(() => {
          resolve(true);
        });
    });
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    FullComponent,
    AppHeaderComponent,
    SpinnerComponent,
    AppBlankComponent,
    AppSidebarComponent,
    UnknownUserComponent,
    ConfirmDialogComponent,
    AuthCallbackComponent,
    RawDataInCaseInfoDialogComponent,
    ConfirmClearComponent,
    UserProfileSidebarComponent,
    UserItemsSidebarComponent,
    AdminItemsSidebarComponent,
    EmailUnsubscribeCallbackComponent,
    ExternalLinkParserComponent,
    GlobalCaseCreateComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,

    AppStoreModule,
    ServiceLayerModule,

    StoreModule.forRoot(reducers, {
      // metaReducers,
    }),
    StoreRouterConnectingModule.forRoot(),

    EffectsModule.forRoot([
      AuthEffects,
      UsersEffects,
      CompanyEffects,
      // RawDataFieldsEffects,
      TenantsEffects,
      // ListAreaEffects,
      // ListAreaItemsEffects,
      TenantFieldsEffects,
      TenantListsEffects,
      InvitationsEffects,
      // CasesListEffects,
      DateFormatEffects,
      GridLayoutsEffects,
      MappingsEffects,
      OperationsEffects,
      SchemaEffects,
      WorkflowEffects,
      WorkflowBuilderEffects,
      NotificationBuilderEffects,
      WebHooksBuilderEffects,
      AppSettingsEffects,
      OrchestratorEffects,
      ReportDatasourceEffects,
      ApiClientEffects,
      UserSettingsEffects
    ]),
    FontAwesomeModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        // useClass: CcxTranslateLoaderService,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      },
      defaultLanguage: 'en'
    }),
    FormlyModule.forRoot({ extras: { lazyRender: true } }),
    !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 25 }) : []
    // comment out to see if the performance gets improved on prod
    // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    SuperAdminGuard,
    TenantAdminGuard,
    CurrentRoleResolver,
    AppConfigService,
    SchemasCacheService,
    ListsCacheService,
    WorkflowsCacheService,
    CompaniesCacheService,
    CcxTranslateLoaderService,
    MissingTranslationHandlerService,
    MissingTranslationSaverService,
    TranslateService,
    // TestService,
    WindowService,
    { provide: RouterStateSerializer, useClass: CustomRouterStateSerializer },
    {
      provide: LOCALE_ID,
      useFactory: () => {
        const n = window.navigator as any;
        const userLocale = n.userLanguage || n.language;
        const userLanguageCode = userLocale?.split('-')[0];
        const locales = [];
        [localeDe, localeFr, localeRu, localeCs, localeEs, localeIt, localeEn].forEach((l) => {
          locales.push(l[0]);
        });
        /**
         * if the user's locale or the language code is one of the registered ones, use the user's locale
         * otherwise 'en' to be used as default
         */

        if (locales.includes(userLocale) || locales.includes(userLanguageCode)) {
          return userLocale;
        }
        return 'en';
      }
    },
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (x) => x,
      deps: [LOCALE_ID]
    },
    // Angular Material Datepicker
    { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: DateTimeFormatHelper.getDateFormatConfig() },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: DateTimeFormatHelper.getLuxonAdapterOptions() },
    { provide: APP_CONFIG_TOKEN, useValue: environment },
    { provide: API_BASE_URL_TOKEN, useValue: environment.apisConfig.apiBaseUrl },
    { provide: SIGNALR_URL_TOKEN, useValue: environment.apisConfig.baseUrl },

    { provide: APP_CLIENT_ID, useValue: environment.appId },
    { provide: 'AuthenticationService', useClass: AuthenticationServiceImpl },
    { provide: 'HttpClientService', useClass: ApplicationHttpClientAxiosService },
    { provide: 'UserOverrideService', useClass: UserOverrideServiceImpl },
    {
      provide: APP_INITIALIZER,
      useFactory: initApplication,
      multi: true,
      deps: [[new Inject(Store)], [new Inject(RolesService)]]
    },
    { provide: ErrorHandler, useClass: SentryErrorHandler }
  ],
  // entryComponents: [ConfirmDialogComponent, FullComponent, RawDataInCaseInfoDialogComponent, ConfirmClearComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    AppStatic.injector = injector;
  }
}
