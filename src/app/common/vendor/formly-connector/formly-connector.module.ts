import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter/formly-field-adapter-type.enum';
import { MaterialModule } from '@wfm/material-module';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { FormlyConnectorSearchInputComponent } from './formly-connector-search-input/formly-connector-search-input.component';
import { FormlyConnectorComponent } from './formly-connector-selectbox/formly-connector.component';

@NgModule({
  declarations: [FormlyConnectorComponent, FormlyConnectorSearchInputComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormlyModule.forChild({
      types: [
        {
          name: FormlyFieldAdapterTypeEnum.connectorSelectbox,
          component: FormlyConnectorComponent,
          wrappers: ['form-field']
        },
        {
          name: FormlyFieldAdapterTypeEnum.connectorSearchInput,
          component: FormlyConnectorSearchInputComponent,
          wrappers: ['form-field']
        }
      ]
    }),
    FormlyMaterialModule,
    IconModule
  ]
})
export class FormlyConnectorModule {}
