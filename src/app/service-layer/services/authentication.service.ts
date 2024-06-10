/**
 * global
 */
import { Injectable } from '@angular/core';

import { UserManager, UserManagerSettings, User, WebStorageStateStore, Profile } from 'oidc-client';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * project
 */
import { IdentityServerConfig } from '../models';

/**
 * local
 */
import { AppConfigService } from './app-config.service';

export interface UserOverrideService {
  getUser(): string;
  setUser(userName: string);
}

@Injectable({ providedIn: 'root' })
export class UserOverrideServiceImpl implements UserOverrideService {
  private _userName: string;

  setUser(userName: string) {
    this._userName = userName;
  }

  getUser(): string {
    return this._userName;
  }
}

export interface AuthenticationService {
  getUser(): User;
  getAuthorizationHeaderValue(): string;
  isLoggedIn(): Promise<boolean>;
  getClaims(): any;
  startAuthentication(): Promise<void>;
  completeAuthentication(): Promise<User>;
  logout(): Promise<any>;
  clear();
  isEmailDomainAndUserRoleInClaims(): boolean;
  getTenantIdFromClaims(): Promise<string>;
  getLanguageFromClaims(): string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationServiceImpl implements AuthenticationService {
  private manager: UserManager;
  public user: User = null;
  public claims: Profile;
  private idToken: string;

  private userSubject = new BehaviorSubject<User>(null);
  user$: Observable<User>;

  constructor(private appConfig: AppConfigService) {
    this.user$ = this.userSubject.asObservable();
    const config = appConfig.config.identityConfig;
    this.manager = new UserManager(this.getClientSettings(config));
    this.manager.getUser().then((user) => {
      this.user = user;
      if (!!this.user) {
        this.claims = this.getClaims();
        this.idToken = this.user.id_token;
      }
      this.userSubject.next(user);
    });
  }

  isLoggedIn(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const validate = (user: User) => {
        return this.user != null && !this.user.expired;
      };

      if (!this.user) {
        this.manager.getUser().then((user) => {
          this.user = user;
          this.userSubject.next(user);
          resolve(validate(this.user));
        });
      } else {
        resolve(validate(this.user));
      }
    });
  }

  getClaims(): Profile {
    return this.user.profile;
  }

  getAuthorizationHeaderValue(): string {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  startAuthentication(): Promise<void> {
    return this.manager.signinRedirect();
  }

  completeAuthentication(): Promise<User> {
    return this.manager.signinRedirectCallback().then((user) => {
      this.user = user;
      this.claims = this.getClaims();
      if (!!this.claims['ccx.userRole'] && !!this.claims['ccx.emailDomain']) {
        localStorage.setItem('isRegistrationRequest', JSON.stringify(true));
      }
      this.idToken = user.id_token;
      return this.user;
    });
  }

  logout(): Promise<any> {
    this.clear();
    return this.manager.signoutRedirect({ id_token_hint: this.idToken });
  }

  clear() {
    this.manager.removeUser();
    this.user = null;
    this.userSubject.next(this.user);
  }

  private getClientSettings(config: IdentityServerConfig): UserManagerSettings {
    const sett = {
      authority: config.identityEndpoint,
      client_id: config.clientId,
      redirect_uri: `${config.hostUrl}auth_callback?`,
      post_logout_redirect_uri: `${config.hostUrl}signout-callback.html`,
      silent_redirect_uri: `${config.hostUrl}renew-callback.html`,
      response_type: config.responseType,
      scope: config.requiredScopes,
      filterProtocolClaims: true,
      loadUserInfo: true,
      automaticSilentRenew: false,
      userStore: new WebStorageStateStore({ store: window.localStorage })
    };
    return sett;
  }
  getUser(): User {
    return this.user;
  }

  getLanguageFromClaims(): string {
    try {
      return this.claims[this.appConfig.config.claimsTypeConfig.language];
    } catch (err) {
      return 'en';
    }
  }

  isEmailDomainAndUserRoleInClaims(): boolean {
    try {
      return !!this.claims[this.appConfig.config.claimsTypeConfig.userRole] && !!this.appConfig.config.claimsTypeConfig.emailDomain;
    } catch (err) {
      return false;
    }
  }

  getTenantIdFromClaims(): Promise<string> {
    return this.claims[this.appConfig.config.claimsTypeConfig.tenant];
  }
}
