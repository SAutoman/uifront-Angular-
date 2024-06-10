// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { Subject } from 'rxjs';

// /**
//  * project
//  */

// /**
//  * local
//  */
// @Component({
//   selector: 'app-confirm-navigation',
//   templateUrl: './confirm-navigation.component.html',
//   styleUrls: ['./confirm-navigation.component.scss']
// })
// export class ConfirmNavigationComponent implements OnInit {
//   subject: Subject<boolean>;
//   componentId = 'e081cd90-3937-4ad4-a07e-42bebf4ec91d';

//   constructor(private dialogRef: MatDialogRef<ConfirmNavigationComponent>) {}

//   ngOnInit(): void {}

//   onYesResponse(): void {
//     if (this.subject) {
//       this.subject.next(true);
//       this.subject.complete();
//     }
//     this.dialogRef.close(true);
//   }

//   onCancelResponse(): void {
//     if (this.subject) {
//       this.subject.next(false);
//       this.subject.complete();
//     }
//     this.dialogRef.close(false);
//   }
// }
