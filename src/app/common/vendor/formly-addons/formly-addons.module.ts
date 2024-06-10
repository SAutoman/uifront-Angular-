/**
 * global
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
/**
 * project
 */
import { FormlyRightButtonAddonComponent } from './formly-right-button-addon/formly-right-button-addon.component';
import { addonsExtension } from './addonsExtension';
import { Addons, ADDON_NAMES } from './addonNames';
import { FormlyFieldGroupWrapperComponent } from '../formly-field-group-wrapper/formly-field-group-wrapper';
import { MaterialModule } from '@wfm/material-module';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '@wfm/shared/icon/icon.module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
/**
 * local
 */
import { FormlyNestedCheckboxAddonComponent } from './formly-nested-checkbox-addon/formly-nested-checkbox-addon.component';
import { FormlyHyperlinkAddonComponent } from './formly-hyperlink-addon/formly-hyperlink-addon.component';

/**
 * local
 */

@NgModule({
  declarations: [
    FormlyRightButtonAddonComponent,
    FormlyNestedCheckboxAddonComponent,
    FormlyFieldGroupWrapperComponent,
    FormlyHyperlinkAddonComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyMaterialModule,
    MatIconModule,
    IconModule,
    MatButtonModule,
    MaterialModule,
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    }),
    FormlyModule.forChild({
      extras: { lazyRender: true },
      wrappers: [
        { name: Addons.formlyRightBtn, component: FormlyRightButtonAddonComponent },
        { name: Addons.nestedCheckbox, component: FormlyNestedCheckboxAddonComponent },
        { name: Addons.hyperlink, component: FormlyHyperlinkAddonComponent },
        { name: 'fieldGroupWrapper', component: FormlyFieldGroupWrapperComponent }
      ],
      extensions: ADDON_NAMES.map((x) => {
        return {
          name: x,
          extension: { onPopulate: addonsExtension }
        };
      })
    })
  ],
  exports: [
    FormlyRightButtonAddonComponent,
    FormlyNestedCheckboxAddonComponent,
    FormlyFieldGroupWrapperComponent,
    FormlyHyperlinkAddonComponent
  ]
})
export class FormlyAddonsModule {}
