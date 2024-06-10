/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

/**
 * project
 */
import { AuthenticationService } from '@wfm/service-layer';

@Injectable({
  providedIn: 'root'
})
export class RegistrationGuard implements CanActivate {
  constructor(@Inject('AuthenticationService') private authService: AuthenticationService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('Registration guard');
    if (this.authService.isEmailDomainAndUserRoleInClaims()) {
      return true;
    }
    this.router.navigateByUrl('/');
    return false;
  }
}
