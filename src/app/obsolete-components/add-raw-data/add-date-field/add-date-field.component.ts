// /**
//  * global
//  */
// import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
// import { FormControl } from '@angular/forms';

// import { MomentDateAdapter } from '@angular/material-moment-adapter';
// import { select, Store } from '@ngrx/store';
// import { takeUntil } from 'rxjs/operators';

// import { default as _rollupMoment } from 'moment';

// /**
//  * project
//  */

// import { getDateFormatSettingsSelector, ApplicationState } from '@wfm/store';
// import { Settings, RawDataFieldInfo, DateFormat } from '@wfm/service-layer';
// import { BaseComponent } from '@wfm/shared/base.component';
// import { getDateFormat } from '@wfm/shared/utils';

// /**
//  * local
//  */

// const moment = _rollupMoment || _moment;

// export const DATE_FORMAT = {
//   parse: {
//     dateInput: 'LL'
//   },
//   display: {
//     dateInput: '',
//     monthYearLabel: 'YYYY',
//     dateA11yLabel: 'LL',
//     monthYearA11yLabel: 'YYYY'
//   }
// };

// @Component({
//   selector: 'app-add-date-field',
//   templateUrl: './add-date-field.component.html',
//   styleUrls: ['./add-date-field.component.scss'],
//   providers: [
//     { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
//     { provide: MAT_DATE_FORMATS, useValue: DATE_FORMAT }
//   ]
// })
// /**
//  * @deprecated do not found usage
//  */
// export class AddDateFieldComponent extends BaseComponent implements OnInit {
//   @Input() field: RawDataFieldInfo;
//   @Output() isChanged: EventEmitter<boolean> = new EventEmitter();

//   date: FormControl = new FormControl(moment());
//   dateFormatDb: Settings;
//   get dateFormat(): typeof DateFormat {
//     return DateFormat;
//   }

//   constructor(private store: Store<ApplicationState>) {
//     super();

//     // const locale = window.navigator.language;
//     // _moment.locale(locale);
//   }

//   ngOnInit(): void {
//     this.store.pipe(takeUntil(this.destroyed$), select(getDateFormatSettingsSelector)).subscribe((data) => {
//       if (data.settings) {
//         this.dateFormatDb = data.settings[0];
//         DATE_FORMAT.display.dateInput = this.applyDateFormatToInput(this.dateFormatDb);
//       }
//     });
//   }

//   onChange(): void {
//     this.field.isValid = true;
//     this.isChanged.emit(true);
//   }

//   applyDateFormatToInput(dateFormatDb: Settings): string {
//     return getDateFormat(dateFormatDb);
//   }
// }
