/**
 * global
 */
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { FieldWrapper } from '@ngx-formly/core';

/**
 * project
 */

/**
 * local
 */
import { Addons } from '../addonNames';
import { IFormlyNestedCheckboxAddonConfig } from './i-formly-nested-checkbox-addon.config';
@Component({
  selector: 'app-formly-nested-checkbox-addon',
  templateUrl: './formly-nested-checkbox-addon.component.html',
  styleUrls: ['./formly-nested-checkbox-addon.component.scss']
})
export class FormlyNestedCheckboxAddonComponent extends FieldWrapper implements OnInit {
  config: IFormlyNestedCheckboxAddonConfig;
  @ViewChild('customMatSuffix') customMatSuffix: TemplateRef<any>;
  constructor() {
    super();
  }
  ngOnInit(): void {
    this.config = this.to[Addons.nestedCheckbox];
  }

  checkboxChanged(e: MatCheckboxChange): void {
    if (this.config.onClick) {
      this.config.onClick(this.to, this, e);
    }
  }

  onCheckboxClicked(e: Event): void {
    e.stopPropagation();
  }
}
