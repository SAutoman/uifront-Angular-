import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyRichTextComponent } from './formly-rich-text.component';
import { EditorModule } from '@progress/kendo-angular-editor';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { MaterialModule } from '@wfm/material-module';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter';

@NgModule({
  declarations: [FormlyRichTextComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [{ name: FormlyFieldAdapterTypeEnum.richTextInput, component: FormlyRichTextComponent, wrappers: ['form-field'] }]
    }),
    EditorModule
  ],
  exports: [FormlyRichTextComponent]
})
export class RichTextModule {}
