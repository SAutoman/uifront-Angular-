/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
/**
 * project
 */
/**
 * local
 */
import { FormlyListOfEntitiesComponent } from './formly-list-of-entities.component';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';

@NgModule({
  declarations: [FormlyListOfEntitiesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.listOfLinks, component: FormlyListOfEntitiesComponent }]
    })
  ],
  exports: [FormlyListOfEntitiesComponent]
})
export class FormlyListOfEntitesModule {}
