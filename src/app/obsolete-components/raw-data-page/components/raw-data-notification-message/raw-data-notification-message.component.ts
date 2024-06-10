// import { Component, Input, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-raw-data-notification-message',
//   templateUrl: './raw-data-notification-message.component.html',
//   styleUrls: ['./raw-data-notification-message.component.scss']
// })
// export class RawDataNotificationMessageComponent implements OnInit {
//   @Input() message: string;
//   @Input() lsKey: string;
//   hide: boolean;
//   componentId = '5cc74132-a945-4750-aff8-0a69c5ed1f90';

//   constructor() {}

//   ngOnInit(): void {
//     this.hide = !!localStorage.getItem(this.lsKey);
//   }

//   hideMessage() {
//     this.hide = true;
//     localStorage.setItem(this.lsKey, this.hide + '');
//   }
// }
