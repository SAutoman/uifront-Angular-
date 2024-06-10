// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { Store, select } from '@ngrx/store';

// /**
//  * project
//  */
// import { TenantProfile } from '@wfm/service-layer';
// import { userProfile, ApplicationState, AuthState } from '../../../store';

// /**
//  * local
//  */
// @Component({
//   selector: 'app-confirm-done-status',
//   templateUrl: './confirm-done-status.component.html',
//   styleUrls: ['./confirm-done-status.component.scss']
// })
// export class ConfirmDoneStatusComponent implements OnInit {
//   rolesPerTenant: TenantProfile[] = [];
//   user: AuthState;
//   message: string;
//   componentId = '130dc93a-7d77-4aae-bf64-d1c2176e069e';

//   constructor(private store: Store<ApplicationState>) {}

//   ngOnInit(): void {
//     this.store.pipe(select(userProfile)).subscribe((user) => {
//       this.user = user;
//       if (user.rolesPerTenant) {
//         this.rolesPerTenant = user.rolesPerTenant;
//       }
//     });
//   }
// }
