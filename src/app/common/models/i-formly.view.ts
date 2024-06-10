import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

export interface IFormlyView<T = any> {
  form: FormGroup;
  fields: FormlyFieldConfig[];
  model: T;
}

export interface FormlyModel {
  [key: string]: any;
}
