import { IConfig } from 'ngx-mask';
import { FormlyTemplateOptions } from '@ngx-formly/core';

/**
 * Configuration options for  ngx-mask
 *
 * @link https://www.npmjs.com/package/ngx-mask
 */
export interface IMaskOptions extends Partial<IConfig> {
  mask: string;
}

/**
 * TemplateOptions interface for formlyInputMask fields
 */
export interface IFormlyInputMaskOptions extends FormlyTemplateOptions {
  maskOptions: IMaskOptions;
}
