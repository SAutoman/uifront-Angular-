import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter/formly-field-adapter-type.enum';
import { FormlyAutocompleteComponent } from './formly-autocomplete.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';

@NgModule({
  declarations: [FormlyAutocompleteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatAutocompleteModule,

    FormlyModule.forChild({
      types: [
        {
          name: FormlyFieldAdapterTypeEnum.autocomplete,
          component: FormlyAutocompleteComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    FormlyMaterialModule
  ]
})
export class FormlyAutocompleteModule {}
