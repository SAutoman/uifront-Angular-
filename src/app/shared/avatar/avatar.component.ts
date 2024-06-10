import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit {
  @Input() avatar_url: string;
  @Input() isCompany: boolean = false;
  constructor() {}

  ngOnInit(): void {}
}
