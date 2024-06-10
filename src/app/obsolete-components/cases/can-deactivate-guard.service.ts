// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { CanDeactivate } from '@angular/router';

// import { Subject } from 'rxjs';

// /**
//  * project
//  */

// /**
//  * local
//  */
// import { ConfirmNavigationComponent } from './work-on-case/confirm-navigation/confirm-navigation.component';
// import { WorkOnCaseComponent } from './work-on-case/work-on-case.component';

// // TO DO: Refactor to use generic implementation with this interface
// @Injectable({
//   providedIn: 'root'
// })
// export class CustomConfirmGuard implements CanDeactivate<WorkOnCaseComponent> {
//   confirmDlg: MatDialogRef<ConfirmNavigationComponent>;

//   constructor(private dialog: MatDialog) {}

//   canDeactivate(component: WorkOnCaseComponent) {
//     const subject = new Subject<boolean>();

//     if (component.isChangedFields || component.isChangedFormFields) {
//       this.confirmDlg = this.dialog.open(ConfirmNavigationComponent, { disableClose: true });
//       this.confirmDlg.componentInstance.subject = subject;
//       return subject.asObservable();
//     }

//     return true;
//   }
// }
