/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * project
 */

import { ApplicationState, AuthState, loggedInState } from '../store';
import { TenantComponent } from '../shared/tenant.component';

import { IRequestOptions, AuthenticationService, AppConfigService } from '../service-layer';

/**
 * local
 */

@Injectable()
export class CcxTranslateLoaderService extends TenantComponent {
  apiTranslationUrl: string;
  marketId: string = '';
  locationId: string = '';
  authState: AuthState;

  constructor(
    private http: HttpClient,
    configService: AppConfigService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    private store: Store<ApplicationState>
  ) {
    super(store);
    this.apiTranslationUrl = configService.config.apisConfig.apiTranslateUrl;
  }

  // private getMarketId(terminal: Terminal): string {
  //     const marketId = terminal ? terminal.configuration.market.marketId : '';
  //     return marketId.toString();
  // }

  // private getLocationId(terminal: Terminal): string {
  //     const locationId = terminal ? terminal.configuration.location.locationId : '';
  //     return locationId.toString();
  // }

  getTranslation(lang: string, options?: IRequestOptions): any {
    return this.http.get(`${this.apiTranslationUrl}/translations/${lang}`, this.SetHeaders(options));
  }

  private SetHeaders(options?: IRequestOptions): IRequestOptions {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((s) => !!s)
      )
      .subscribe((state) => {
        this.authState = state;
      });

    const token = this.authService.getAuthorizationHeaderValue();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.append('Authorization', token);
      headers.append('ccx-context', this.marketId);
      headers.append('ccx-subject', this.locationId);
    }

    return <any>{ ...options, headers: headers };
  }
}
