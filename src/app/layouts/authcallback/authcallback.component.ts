import { Component, OnInit, Inject } from '@angular/core';
import * as Oidc from 'oidc-client';

import { AuthenticationService } from '../../service-layer';

@Component({
  selector: 'ccx-auth-callback',
  template: ''
})
export class AuthCallbackComponent implements OnInit {
  constructor(@Inject('AuthenticationService') private authService: AuthenticationService) {}

  ngOnInit(): void {
    if (!!this.authService.getUser()) {
      const url = window.localStorage.getItem('backUrl') || '/';
      window.localStorage.removeItem('backUrl');
      window.location.href = url;
    } else {
      const config = {
        userStore: new Oidc.WebStorageStateStore({ store: window.localStorage })
      };
      if (Oidc && Oidc.Log && Oidc.Log.logger) {
        Oidc.Log.logger = console;
      }
      const isPopupCallback = JSON.parse(window.localStorage.getItem('ngoidc:isPopupCallback'));
      if (isPopupCallback) {
        new Oidc.UserManager(config).signinPopupCallback();
      } else {
        new Oidc.UserManager(config).signinRedirectCallback().then((): void => {
          window.location.href = '/';
        });
      }
    }
  }
}
