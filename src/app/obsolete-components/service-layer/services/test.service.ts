// /**
//  * global
//  */
// import { Injectable, Inject } from '@angular/core';
// import { Store, select } from '@ngrx/store';
// import { filter } from 'rxjs/operators';

// /**
//  * project
//  */
// import { currentTenantSelector } from '../../store/auth/auth.selectors';
// import { Paging } from '../models/model';

// /**
//  * local
//  */
// import { RawDataFieldsService } from './raw-data-fields.service';
// import { TenantsService } from './tenants.service';
// import { UsersService } from './users.service';
// import { RawDataEntityService } from './row-data-entity.service';
// import { CompanyService } from './company.service';
// import { AuthenticationService } from './authentication.service';
// import { UserProfileService } from './user-profile.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class TestService {
//   private paging = <Paging>{ skip: 0, take: 10 };
//   private tenant: string;

//   constructor(
//     protected store: Store<any>,
//     private rawDataService: RawDataEntityService,
//     @Inject('AuthenticationService') private authService: AuthenticationService,
//     private companyService: CompanyService,
//     private tenantsService: TenantsService,
//     private usersService: UsersService,
//     private userProfileService: UserProfileService,
//     private rawDataFieldsService: RawDataFieldsService
//   ) {}

//   test() {
//     this.store
//       .pipe(
//         select(currentTenantSelector),
//         filter((id) => id !== undefined)
//       )
//       .subscribe((t) => (this.tenant = t));

//     // this.authService.user$.subscribe(u => {
//     //   if (u) {
//     //     this.rawDataService.search(this.tenant, null, null).subscribe(
//     //       f => {
//     //         console.log(f);
//     //       },
//     //       err => {
//     //         console.log(err);
//     //       }
//     //     );

//     //     this.getFields().subscribe(
//     //       f => {
//     //         console.log(f);
//     //       },
//     //       err => {
//     //         console.log(err);
//     //       }
//     //     );
//     //   }
//     // });
//   }

//   getFields(): Promise<any> {
//     return this.rawDataFieldsService.getFieldsByTenant(this.tenant);
//   }

//   searchRawData(): Promise<any> {
//     return this.rawDataService.search(this.tenant, <Paging>{
//       skip: 0,
//       take: 10
//     });
//   }

//   searchCompanies(): Promise<any> {
//     return this.companyService.search(<Paging>{ skip: 0, take: 10 });
//   }

//   searchTenants(): Promise<any> {
//     return this.tenantsService.search(this.paging);
//   }

//   searchUsers(): Promise<any> {
//     return this.usersService.search(this.paging);
//   }

//   getProfile(): Promise<any> {
//     return this.userProfileService.getProfile();
//   }
// }
