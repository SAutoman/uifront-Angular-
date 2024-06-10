import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@wfm/material-module';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { FormlyModule } from '@ngx-formly/core';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { FormlyNumberFieldComponent } from './formly-number-field/formly-number-field.component';
import { IgnoreWheelDirective } from './disable-scroll.directive';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';

@NgModule({
  declarations: [FormlyNumberFieldComponent, IgnoreWheelDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.number, component: FormlyNumberFieldComponent, wrappers: ['form-field'] }]
    }),
    IconModule
  ],
  exports: [FormlyNumberFieldComponent, IgnoreWheelDirective]
})
export class FormlyInputModule {}
