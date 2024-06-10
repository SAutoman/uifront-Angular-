import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AppConfigService } from '@wfm/service-layer';

@Injectable({
  providedIn: 'root'
})
export class DevModeGuard implements CanActivate {
  constructor(private appConfig: AppConfigService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.appConfig.config.production) {
      return true;
    } else {
      this.router.navigateByUrl('error/404');
      return false;
    }
  }
}
