/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';

/**
 * project
 */
import { MaterialModule } from '@wfm/material-module';
import { IconModule } from '@wfm/shared/icon/icon.module';

/**
 * local
 */

import { FormlySelectboxComponent } from './formly-selectbox/formly-selectbox.component';
import { FormlySelectModule } from '@ngx-formly/core/select';
import { MatPseudoCheckboxModule } from '@angular/material/core';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';

@NgModule({
  declarations: [FormlySelectboxComponent],
  providers: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatPseudoCheckboxModule,
    FormlyMatFormFieldModule,
    FormlySelectModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.select, component: FormlySelectboxComponent, wrappers: ['form-field'] }]
    }),
    IconModule
  ]
})
export class FormlyListModule {}
