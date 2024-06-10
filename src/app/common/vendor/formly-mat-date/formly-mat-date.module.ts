/**
 * global
 */
import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MissingTranslationHandler, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LuxonDateAdapter, MAT_LUXON_DATE_ADAPTER_OPTIONS } from '@angular/material-luxon-adapter';

/**
 * project
 */
import { DateTimeAdapterEnum } from '../date-time';
import { MaterialModule } from '@wfm/material-module';
import { MissingTranslationHandlerService } from '@wfm/translate/missingtranslationhandler.service';
import { MissingTranslationSaverService } from '@wfm/translate/missingtranslationsaver.service';
import { IconModule } from '@wfm/shared/icon/icon.module';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
/**
 * local
 */
import { FormlyMatDatePickerComponent } from './formly-mat-date-picker/formly-mat-date-picker.component';
import { FormlyMatDateTimePickerComponent } from './formly-mat-date-time-picker/formly-mat-date-time-picker.component';
import { FormlyMatTimePickerComponent } from './formly-mat-time-picker/formly-mat-time-picker.component';

// navigator.language
@NgModule({
  declarations: [FormlyMatDatePickerComponent, FormlyMatDateTimePickerComponent, FormlyMatTimePickerComponent],
  providers: [
    {
      provide: MAT_DATE_LOCALE,
      useFactory: (x) => x,
      deps: [LOCALE_ID]
    },
    { provide: DateAdapter, useClass: LuxonDateAdapter, deps: [MAT_DATE_LOCALE, MAT_LUXON_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: DateTimeFormatHelper.getDateFormatConfig() },
    { provide: MAT_LUXON_DATE_ADAPTER_OPTIONS, useValue: DateTimeFormatHelper.getLuxonAdapterOptions() }
  ],
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    FormlyMaterialModule,
    MatFormFieldModule,
    NgxMaterialTimepickerModule,
    MatButtonModule,
    MaterialModule,
    IconModule,
    FormlyModule.forChild({
      types: [
        { name: DateTimeAdapterEnum.appFormlyMatDatePicker, component: FormlyMatDatePickerComponent, wrappers: ['form-field'] },
        { name: DateTimeAdapterEnum.appFormlyMatTimePicker, component: FormlyMatTimePickerComponent, wrappers: ['form-field'] },
        { name: DateTimeAdapterEnum.appFormlyMatDateTimePicker, component: FormlyMatDateTimePickerComponent, wrappers: ['form-field'] }
      ]
    }),
    TranslateModule.forChild({
      extend: true,
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationHandlerService,
        deps: [MissingTranslationSaverService]
      }
    })
  ],
  exports: [FormlyMatDatePickerComponent, FormlyMatDateTimePickerComponent, FormlyMatTimePickerComponent]
})
export class FormlyMatDateModule {}
