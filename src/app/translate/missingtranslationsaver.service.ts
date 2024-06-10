/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

import { Store, select } from '@ngrx/store';
import { catchError, exhaustMap, map, takeUntil, filter, take } from 'rxjs/operators';
import { of, interval } from 'rxjs';

/**
 * project
 */
import { AuthenticationService, IRequestOptions, AppConfigService, StatePersistingService } from '../service-layer';
import { ApplicationState, AuthState, tenantNameKey } from '../store';
import { TenantComponent } from '../shared/tenant.component';
import { authUserProfileSelector } from '../store';

/**
 * local
 */

@Injectable()
export class MissingTranslationSaverService extends TenantComponent {
  keys: Array<string> = [];
  authState: AuthState;
  marketId: string;
  locationId: string;
  apiTranslationUrl: string;

  constructor(
    public http: HttpClient,
    configService: AppConfigService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    private store: Store<ApplicationState>,
    private statePersistingService: StatePersistingService,
    private appConfig: AppConfigService
  ) {
    super(store);
    this.apiTranslationUrl = configService.config.apisConfig.apiTranslateUrl;

    this.store
      .pipe(
        select(authUserProfileSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((auth) => {
        // run only for superadmins and in non-localhost environments
        if (auth.isAdmin && !this.appConfig.config.identityConfig.hostUrl.includes('localhost')) {
          const storeInterval = 3000;
          interval(storeInterval)
            .pipe(
              takeUntil(this.destroyed$),
              filter(() => this.keys.length > 0),
              exhaustMap(() => {
                const localKeys = [...this.keys];
                if (localKeys && localKeys.length > 0) {
                  this.keys = [];
                  const context = this.statePersistingService.get(tenantNameKey);
                  // send the missing keys
                  return this.http
                    .post(
                      `${this.apiTranslationUrl}/clients/wfm/translations/missing?context=${context}`,
                      JSON.stringify(localKeys),
                      this.SetHeaders()
                    )
                    .pipe(
                      map(() => {
                        return of(1);
                      }),
                      catchError((error) => {
                        console.log(error);
                        this.keys = [...this.keys, ...localKeys];
                        return of(0);
                      })
                    );
                } else {
                  return of(0);
                }
              })
            )
            .subscribe();
        }
      });
  }

  public addKey(key: string) {
    if (!this.keys.some((x) => x === key)) {
      this.keys.push(key);
    }
  }

  private SetHeaders(options?: IRequestOptions): IRequestOptions {
    const token = this.authService.getAuthorizationHeaderValue();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.append('Authorization', token);
    }

    return <any>{ ...options, headers: headers };
  }
}
