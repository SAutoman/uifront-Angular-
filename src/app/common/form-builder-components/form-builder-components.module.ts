/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';

import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
/**
 * project
 */
import { ListItemModule } from '@wfm/common/list-items';
import { FieldModule } from '@wfm/common/field';
import { FormlyAutocompleteModule } from '@wfm/common/vendor/formly-autocomplete/formly-autocomplete.module';
import { SharedModule } from '@wfm/shared/shared.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
/**
 * local
 */
import { FormBuilderFormComponent } from './form-builder-form/form-builder-form.component';

@NgModule({
  declarations: [FormBuilderFormComponent],
  imports: [
    SharedModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    DragDropModule,
    FormlyModule.forChild({
      // good for function/formula performance,
      // !!! may cause issues in areas where the expressionProps are added after formlyModel is initialized
      extras: {
        checkExpressionOn: 'modelChange'
      }
    }),
    FormlyMaterialModule,
    FormlyAutocompleteModule,
    ListItemModule,
    FieldModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [FormBuilderFormComponent, TranslateModule]
})
export class FormBuilderComponentsModule {}
