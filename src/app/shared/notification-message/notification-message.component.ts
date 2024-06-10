import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { tenantNameKey } from '@wfm/store';
import { SharedService } from '../../service-layer/services/shared.service';

@Component({
  selector: 'app-notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss']
})
export class NotificationMessageComponent implements OnInit {
  isSeen: boolean = false;
  isMessage: boolean = false;
  message: string;
  lsKey: string;
  type: string;
  componentId = '5cc74132-a945-4750-aff8-0a69c5ed1f90';
  showMessage: boolean = false;

  constructor(private sharedService: SharedService, private router: Router) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/data/list')) {
          this.isMessage = true;
        } else {
          this.isMessage = false;
        }
      }
    });
    this.sharedService.getNotificationMessage().subscribe((data) => {
      this.message = data?.message;
      this.lsKey = data?.lsKey;
      this.type = data?.type;
      this.isMessage = true;
      if (localStorage.getItem(this.lsKey) == null) {
        this.isSeen = false;
      } else {
        this.isSeen = true;
      }
    });
    if (localStorage.getItem(tenantNameKey) === 'GDC') this.showMessage = true;
  }

  ngOnInit(): void {}

  hideMessage() {
    this.isSeen = true;
    localStorage.setItem(this.lsKey, this.isSeen + '');
  }
}
