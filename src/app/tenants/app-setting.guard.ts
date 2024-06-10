import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSettingGuard implements CanActivate {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const input = prompt('Please provide the password to continue !');
    if (input === null || input === '') {
      alert('No password provided. Cancelling method !');
      return false;
    } else if (input !== 'Hello World!') {
      alert('Invalid Password');
      return false;
    } else if (input === 'Hello World!') return true;
  }
}
