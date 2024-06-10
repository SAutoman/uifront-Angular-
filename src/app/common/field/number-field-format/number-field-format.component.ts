import { Component, EventEmitter, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { INumberFormatOutput } from './i-number-field-format-output-event';

type Key = keyof IConfigurableListItem & string;
const minNumberOfDigitsAfterDecimalKey: Key = 'minNumberOfDigitsAfterDecimal';
const maxNumberOfDigitsAfterDecimalKey: Key = 'maxNumberOfDigitsAfterDecimalKey';
const minIntegerDigitsKey: Key = 'minIntegerDigitsKey';

@Component({
  selector: 'app-number-field-format',
  templateUrl: './number-field-format.component.html',
  styleUrls: ['./number-field-format.component.scss']
})
export class NumberFieldFormatComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() fieldType$: Observable<FieldTypeIds>;
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<INumberFormatOutput>();
  localFieldCopy: IConfigurableListItem;

  view: IFormlyView<INumberFormatOutput>;
  staticNumber: number;
  currentNumberFormat: string = '';
  fieldType: FieldTypeIds;

  constructor(
    private fb: FormBuilder,
    store: Store<ApplicationState>,
    @Inject(LOCALE_ID) public locale: string,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    if (this.field) {
      this.localFieldCopy = { ...this.field };
      this.localFieldCopy.configuration = this.localFieldCopy.configuration || {
        position: 0
      };
    }

    this.populateFormlyView();
  }

  populateFormlyView(): void {
    this.fieldType$
      .pipe(
        filter((x) => !!x),
        map((fieldType) => {
          this.fieldType = fieldType;
          this.view = null;

          if (this.localFieldCopy) {
            this.localFieldCopy.type = fieldType;
            this.localFieldCopy.configuration = { ...this.field?.configuration } || {
              position: 0
            };
          }

          if (fieldType === FieldTypeIds.DecimalField || fieldType === FieldTypeIds.IntField) {
            this.createView(fieldType);
          }
        }),
        tap(() => {
          if (this.view) {
            this.view.form?.valueChanges.pipe(debounceTime(100)).subscribe((x) => {
              this.update.next(this.createOutputEvent());
            });
          } else {
            this.update.next(null);
          }
        })
      )
      .subscribe();
  }

  private createView(fieldType: FieldTypeIds): void {
    const model = <INumberFormatOutput>{};
    let fields = [];

    const minNumberOfIntegerDigits = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Min Number Of Digits Before Decimal Point (Integer digits)'),
      name: minIntegerDigitsKey,
      type: FieldTypeIds.IntField,
      readonly: false,
      required: true,
      min: 1,
      value: this.localFieldCopy?.configuration?.numberFormatting?.minIntegerDigits || 1
    }).getConfig();
    minNumberOfIntegerDigits.templateOptions.labelProp = 'viewValue';
    minNumberOfIntegerDigits.className = '';

    if (fieldType === FieldTypeIds.DecimalField) {
      // DECIMAL

      this.staticNumber = 45.23456789;
      const minNumberOfDecimalDigitsField = FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Min Number Of Digits After Decimal Point'),
        name: minNumberOfDigitsAfterDecimalKey,
        type: FieldTypeIds.IntField,
        readonly: false,
        required: true,
        min: 0,

        value: this.localFieldCopy?.configuration?.numberFormatting?.minFractionDigits || 0
      }).getConfig();

      minNumberOfDecimalDigitsField.templateOptions.labelProp = 'viewValue';
      minNumberOfDecimalDigitsField.className = 'col-6';

      const maxNumberOfDecimalDigitsField = FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Max Number Of Digits After Decimal Point'),
        name: maxNumberOfDigitsAfterDecimalKey,
        type: FieldTypeIds.IntField,
        readonly: false,
        required: true,
        min: 0,

        value: this.localFieldCopy?.configuration?.numberFormatting?.maxFractionDigits || 5
      }).getConfig();

      maxNumberOfDecimalDigitsField.templateOptions.labelProp = 'viewValue';
      maxNumberOfDecimalDigitsField.className = 'col-6';

      fields = [minNumberOfIntegerDigits, minNumberOfDecimalDigitsField, maxNumberOfDecimalDigitsField];
    } else {
      // INTEGER
      this.staticNumber = 12345;
      const numberOfDecimalDigitsField = FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Number Of Digits After Decimal Point'),
        name: minNumberOfDigitsAfterDecimalKey,
        type: FieldTypeIds.IntField,
        readonly: false,
        required: true,
        min: 0,
        value: this.localFieldCopy?.configuration?.numberFormatting?.minFractionDigits || 0
      }).getConfig();

      numberOfDecimalDigitsField.templateOptions.labelProp = 'viewValue';
      numberOfDecimalDigitsField.className = 'col-12';

      fields = [minNumberOfIntegerDigits, numberOfDecimalDigitsField];
    }

    this.view = {
      fields,
      form: this.fb.group({}),
      model
    };
  }
  /**
   * passes the default value type and value to the parent component: field-editor.component
   */
  createOutputEvent(): INumberFormatOutput {
    if (this.view && this.view.model) {
      let model = this.view.model;
      let output: INumberFormatOutput = {
        minIntegerDigits: model[minIntegerDigitsKey],
        minFractionDigits: model[minNumberOfDigitsAfterDecimalKey],
        maxFractionDigits:
          this.fieldType === FieldTypeIds.DecimalField ? model[maxNumberOfDigitsAfterDecimalKey] : model[minNumberOfDigitsAfterDecimalKey],
        dirty: this.view.form.dirty,
        valid: this.view.form.valid
      };
      if (this.view.form.valid) {
        this.currentNumberFormat = `${output.minIntegerDigits}.${output.minFractionDigits}-${output.maxFractionDigits}`;
      }

      return output;
    }
    return null;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.update.next(null);
  }
}
