/**
 * global
 */
import { Injectable } from '@angular/core';

/**
 * project
 */
import { TenantProfile } from '../models/user-profile';

/**
 * local
 */

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  rolesPerTenant: TenantProfile[];
}
