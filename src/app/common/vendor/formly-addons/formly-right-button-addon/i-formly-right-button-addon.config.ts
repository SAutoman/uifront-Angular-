import { FormlyTemplateOptions } from '@ngx-formly/core';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { FormlyRightButtonAddonComponent } from './formly-right-button-addon.component';

export interface IFormlyRightButtonAddonConfig {
  color?: ColorEnum;
  fontSize?: number;
  isFormGroup?: boolean;
  icon?: string;
  cssClass?: string;
  tooltip?: string;
  onClick?: (opts: FormlyTemplateOptions, component: FormlyRightButtonAddonComponent, event: Event) => void;
}
