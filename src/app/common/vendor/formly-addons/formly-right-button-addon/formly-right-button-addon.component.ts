/**
 * global
 */
import { ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

/**
 * project
 */

/**
 * local
 */
import { Addons } from '../addonNames';
import { IFormlyRightButtonAddonConfig } from './i-formly-right-button-addon.config';
@Component({
  selector: 'app-formly-right-button-addon',
  templateUrl: './formly-right-button-addon.component.html',
  styleUrls: ['./formly-right-button-addon.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyRightButtonAddonComponent extends FieldWrapper implements OnInit {
  config: IFormlyRightButtonAddonConfig;
  @ViewChild('customMatSuffix') customMatSuffix: TemplateRef<any>;
  constructor() {
    super();
  }
  ngOnInit(): void {
    this.config = this.to[Addons.formlyRightBtn];
  }

  addonRightClick(e: Event): void {
    e.stopPropagation();
    if (this.config.onClick) {
      this.config.onClick(this.to, this, e);
    }
  }
}
