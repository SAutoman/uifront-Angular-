/**
 * global
 */
import { NgModule } from '@angular/core';
/**
 * project
 */
import { NumberRangeFieldComponent } from '@wfm/shared/dynamic-entity-fields/data-grid/number-range-field/number-range-field.component';

/**
 * local
 */
import { DateTimeWrapperComponent } from '../dynamic-entity-field-wrappers/date-time-wrapper/date-time-wrapper.component';
import { DateWrapperComponent } from '../dynamic-entity-field-wrappers/date-wrapper/date-wrapper.component';
import { DecimalWrapperComponent } from '../dynamic-entity-field-wrappers/decimal-wrapper/decimal-wrapper.component';
import { NumberWrapperComponent } from '../dynamic-entity-field-wrappers/number-wrapper/number-wrapper.component';
import { TimeWrapperComponent } from '../dynamic-entity-field-wrappers/time-wrapper/time-wrapper.component';
import { SharedModule } from '../shared.module';
import { AuditorsFieldComponent } from './auditors-field/auditors-field.component';
import { BoolFieldComponent } from './bool-field/boolean-field.component';
import { BoolCheckboxComponent } from './data-grid/bool-checkbox/bool-checkbox.component';
import { DateRangeFieldComponent } from './data-grid/date-range-field/date-range-field.component';
import { StringFieldComponent } from './data-grid/string-field/string-field.component';
import { DateFieldEqualToComponent } from './date-field-equal-to/date-field-equal-to.component';
import { DateFieldComponent } from './date-field/date-field.component';
import { DateTimeFieldEqualToComponent } from './date-time-field-equal-to/date-time-field-equal-to.component';
import { DateTimeFieldComponent } from './date-time-field/date-time-field.component';
import { DecimalFieldEqualToComponent } from './decimal-field-equal-to/decimal-field-equal-to.component';
import { DecimalFieldComponent } from './decimal-field/decimal-field.component';
import { ExternalKeyFieldComponent } from './external-key-field/external-key-field.component';
import { ListFieldComponent } from './list-field/list-field.component';
import { MultiselectListFieldComponent } from './multiselect-list-field/multiselect-list-field.component';
import { NumberFieldEqualToComponent } from './number-field-equal-to/number-field-equal-to.component';
import { NumberFieldComponent } from './number-field/number-field.component';
import { StatusFieldComponent } from './status-field/status-field.component';
import { StrFieldComponent } from './str-field/str-field.component';
import { SuppliersFieldComponent } from './suppliers-field/suppliers-field.component';
import { TextareaFieldComponent } from './textarea-field/textarea-field.component';
import { TimeFieldEqualToComponent } from './time-field-equal-to/time-field-equal-to.component';
import { TimeFieldComponent } from './time-field/time-field.component';
import { ConnectorFieldComponent } from './connector-field/connector-field.component';

@NgModule({
  imports: [SharedModule],
  declarations: [
    //wrappers
    DateTimeWrapperComponent,
    DateWrapperComponent,
    DecimalWrapperComponent,
    NumberWrapperComponent,
    TimeWrapperComponent,
    //fields
    NumberRangeFieldComponent,
    DateRangeFieldComponent,
    StringFieldComponent,
    BoolCheckboxComponent,
    BoolFieldComponent,
    MultiselectListFieldComponent,
    StatusFieldComponent,
    DateFieldComponent,
    DateFieldEqualToComponent,
    DateTimeFieldComponent,
    DateTimeFieldEqualToComponent,
    DecimalFieldComponent,
    DecimalFieldEqualToComponent,
    ExternalKeyFieldComponent,
    ListFieldComponent,
    NumberFieldComponent,
    NumberFieldEqualToComponent,
    StrFieldComponent,
    TimeFieldComponent,
    TimeFieldEqualToComponent,
    SuppliersFieldComponent,
    AuditorsFieldComponent,
    TextareaFieldComponent,
    ConnectorFieldComponent
  ],
  exports: [
    //wrappers
    DateTimeWrapperComponent,
    DateWrapperComponent,
    DecimalWrapperComponent,
    NumberWrapperComponent,
    TimeWrapperComponent,
    //fields
    NumberRangeFieldComponent,
    DateRangeFieldComponent,
    StringFieldComponent,
    BoolCheckboxComponent,
    BoolFieldComponent,
    MultiselectListFieldComponent,
    StatusFieldComponent,
    DateFieldComponent,
    DateFieldEqualToComponent,
    DateTimeFieldComponent,
    DateTimeFieldEqualToComponent,
    DecimalFieldComponent,
    DecimalFieldEqualToComponent,
    ExternalKeyFieldComponent,
    ListFieldComponent,
    NumberFieldComponent,
    NumberFieldEqualToComponent,
    StrFieldComponent,
    TimeFieldComponent,
    TimeFieldEqualToComponent,
    SuppliersFieldComponent,
    AuditorsFieldComponent,
    TextareaFieldComponent,
    ConnectorFieldComponent
  ],
  providers: []
})
export class DynamicEntityFieldsModule {}
