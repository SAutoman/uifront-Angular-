// /**
//  * global
//  */
// import { Router } from '@angular/router';
// import { Component, OnInit, Inject } from '@angular/core';

// /**
//  * project
//  */
// import { SidebarLinksService } from '../../../service-layer/services/sidebar-links.service';
// import { convertTenantName } from '../../../shared/utils';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-quick-info',
//   templateUrl: './quick-info.component.html',
//   styleUrls: ['./quick-info.component.scss']
// })
// export class QuickInfoComponent implements OnInit {
//   componentId = '7d56c3de-2c68-466f-a838-ff12236c040b';

//   constructor(
//     @Inject(MAT_DIALOG_DATA) public data,
//     public dialogRef: MatDialogRef<QuickInfoComponent>,
//     private router: Router,
//     private sidebarLinksService: SidebarLinksService
//   ) {}

//   ngOnInit() {}

//   redirect() {
//     this.router.navigate([`${convertTenantName(this.sidebarLinksService.tenantName)}/cases/work-on-case/${this.data.caseId}`]);
//     this.dialogRef.close();
//   }
// }
