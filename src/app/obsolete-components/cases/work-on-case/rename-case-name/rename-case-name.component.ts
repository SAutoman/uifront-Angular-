// /**
//  * global
//  */
// import { Component, OnInit, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { UpdateCaseNameModel, CasesService } from '@wfm/service-layer';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-rename-case-name',
//   templateUrl: './rename-case-name.component.html',
//   styleUrls: ['./rename-case-name.component.scss']
// })
// export class RenameCaseNameComponent implements OnInit {
//   componentId = '1ccd95b0-abbb-4aeb-b70d-b3d43e3a0105';

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data: UpdateCaseNameModel,
//     private caseService: CasesService,
//     public dialogRef: MatDialogRef<RenameCaseNameComponent>
//   ) {}

//   ngOnInit() {}
//   async update() {
//     try {
//       await this.caseService.updateCaseName(this.data);
//       this.dialogRef.close(this.data);
//     } catch (Error) {
//       this.dialogRef.close(null);
//     }
//   }
// }
