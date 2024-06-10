import { MatCheckboxChange } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import { FormlyTemplateOptions } from '@ngx-formly/core';
import { FormlyNestedCheckboxAddonComponent } from './formly-nested-checkbox-addon.component';

export interface IFormlyNestedCheckboxAddonConfig {
  color?: ThemePalette;
  fontSize?: number;
  isFormGroup?: boolean;
  label?: string;
  checked?: boolean;
  onClick?: (opts: FormlyTemplateOptions, component: FormlyNestedCheckboxAddonComponent, event: MatCheckboxChange) => void;
}
