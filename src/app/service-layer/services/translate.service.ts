/**
 * global
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

/**
 * local
 */
import { StatePersistingService } from './state-persisting.service';
import { AppConfigService } from './app-config.service';
import { AuthState, SetTranslationLoadedFlag, tenantNameKey } from '@wfm/store';
import { Store } from '@ngrx/store';
import { LanguagesList } from '../models/languages';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  apiTranslationUrl: string;

  constructor(
    private http: HttpClient,
    private configService: AppConfigService,
    private statePersistingService: StatePersistingService,
    private translate: TranslateService,
    private store: Store<AuthState>
  ) {
    this.apiTranslationUrl = configService.config.apisConfig.apiTranslateUrl;
  }

  getTranslationsByContext(clientName: string, langCode: string, context?: string) {
    const params = context ? { params: { context } } : { params: {} };
    return this.http.get<any>(`${this.apiTranslationUrl}/clients/${clientName}/translations/${langCode}`, params);
  }

  setTranslationsByTenant(tenantName: string, userId: string, userProfileLanguage?: string): void {
    const langKey = this.getPreferredLanguage(userId, userProfileLanguage);
    this.translate.use(langKey);
    this.storePreferredLanguage(userId, langKey);
    if (tenantName) {
      tenantName = tenantName.replace(/-+/g, ' ');
      const translationsPerTenantKey = `${tenantName}_translations_${langKey}`;
      const applicationName = this.configService.config.apisConfig.ccxApplicationName.replace(/-\w+/g, '');
      this.getTranslationsByContext(applicationName, langKey, tenantName).subscribe((t) => {
        this.statePersistingService.set(translationsPerTenantKey, t);
        this.store.dispatch(new SetTranslationLoadedFlag(true));
      });
    }
  }

  getTranslationsByTenant(tenantName: string, currentLang: string): Object {
    tenantName = tenantName.replace(/-+/g, ' ');
    const translationOption = `${tenantName}_translations_${currentLang}`;
    const translations = this.statePersistingService.get(translationOption);
    if (translations) {
      return JSON.parse(<string>translations);
    }
    return null;
  }

  translateDefault(): void {
    const tenantName: string = this.statePersistingService.get(tenantNameKey);
    if (tenantName) {
      const currentLang = this.translate.currentLang;
      const translations = this.getTranslationsByTenant(tenantName, currentLang);
      if (translations) {
        this.translate.setTranslation(currentLang, translations);
      }
    }
  }

  storePreferredLanguage(userId: string, preferredLanguage: string): void {
    this.statePersistingService.set(`language_${userId}`, preferredLanguage);
  }

  /**
   * precedence of sources for getting preferred language
   * 1. localstorage
   * 2. ccx.preferredLanguage
   * 3. browser language
   * default: 1st supported language
   */
  getPreferredLanguage(userId: string, claimLanguage?: string): string {
    let preferredLanguage;
    const storedLang = this.statePersistingService.get(`language_${userId}`);
    if (storedLang) {
      preferredLanguage = JSON.parse(<string>storedLang);
    }
    if (!preferredLanguage && claimLanguage) {
      preferredLanguage = LanguagesList.find((lang) => lang.key === claimLanguage)?.key;
    }
    if (!preferredLanguage) {
      const browserLocaleSplits = navigator.language.split('-');
      preferredLanguage = LanguagesList.find((lang) => lang.key === browserLocaleSplits[0])?.key;
    }
    if (!preferredLanguage) {
      preferredLanguage = LanguagesList[0].key;
    }

    return preferredLanguage;
  }
}
