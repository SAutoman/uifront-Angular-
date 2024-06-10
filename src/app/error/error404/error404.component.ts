import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.component.html',
  styleUrls: ['./error404.component.scss'],
  /**
   * this is static page, avoid changeDetection
   */
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Error404Component {
  componentId = 'a41e76b0-d1b0-4051-a6f4-ea98ff33bd7a';
}
