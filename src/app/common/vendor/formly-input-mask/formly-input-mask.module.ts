import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { NgxMaskModule } from 'ngx-mask';

import { FormlyInputMaskComponent } from './formly-input-mask.component';

@NgModule({
  declarations: [FormlyInputMaskComponent],
  imports: [
    CommonModule,
    MatInputModule,
    NgxMaskModule.forChild(),
    ReactiveFormsModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: 'formlyInputMask', component: FormlyInputMaskComponent, wrappers: ['form-field'] }]
    })
  ],
  exports: [FormlyInputMaskComponent]
})
/**
 * An input masked textbox module for Angular Formly.
 *
 * Uses package ngx-mask {@link https://www.npmjs.com/package/ngx-mask}
 */
export class FormlyInputMaskModule {}
