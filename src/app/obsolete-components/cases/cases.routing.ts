// /**
//  * global
//  */
// import { WorkOnCaseComponent } from './work-on-case/work-on-case.component';
// import { Routes, RouterModule } from '@angular/router';
// import { CasesComponent } from './cases/cases.component';
// import { NgModule } from '@angular/core';

// /**
//  * project
//  */
// import { CustomConfirmGuard } from './can-deactivate-guard.service';

// export const casesMainRoute = 'cases';
// export const casesViewRoute = 'list';
// export const casesListRoute = 'cases/list';
// export const workOnCaseRoute = 'work-on-case/:id';

// export const CasesRoutes: Routes = [
//   {
//     path: casesViewRoute,
//     component: CasesComponent
//   },
//   {
//     path: workOnCaseRoute,
//     component: WorkOnCaseComponent,
//     canDeactivate: [CustomConfirmGuard]
//   }
// ];

// @NgModule({
//   imports: [RouterModule.forChild(CasesRoutes)],
//   exports: [RouterModule],
//   providers: [CustomConfirmGuard]
// })
// export class CasesRoutingModule {}
