/**
 * global
 */
import { KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { FormlyFieldConfig } from '@ngx-formly/core';
import { remove } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { Addons, FormlyFieldAdapterFactory, IFormlyRightButtonAddonConfig } from '@wfm/common/vendor';
import { formValueToValidators, ValidatorFieldAdapter } from '@wfm/common/field-validators';
import { FieldTypeIds, FieldTypeNameMap, FieldTypeValidatorMap, ValidatorType, ValidatorTypeMap } from '@wfm/service-layer';
import { IConfigurableListItem } from '@wfm/common/models';

/**
 * local
 */
import { builderViewToFormlyFieldConfig, createFormNameField } from '../page-form-builder/maps';

import { FormFieldEditorOutputModel, FormFieldEditorFormModel } from './form-field-editor.model';

@Component({
  selector: 'app-form-field-editor',
  templateUrl: './form-field-editor.component.html',
  styleUrls: ['./form-field-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * @deprecated use FieldEditorComponent instant of it
 */
export class FormFieldEditorComponent implements OnInit {
  @Input() field: IConfigurableListItem;

  @Input() config?: FormFieldEditorOutputModel;
  @Output() update = new EventEmitter<FormFieldEditorOutputModel>();

  form: FormGroup;
  model: FormFieldEditorFormModel = {} as any;
  fields: FormlyFieldConfig[];
  private fieldValidatorsKey: keyof FormFieldEditorFormModel;

  constructor(fb: FormBuilder, private ts: TranslateService) {
    this.form = fb.group({});
    this.fieldValidatorsKey = 'fieldValidators';
  }

  ngOnInit(): void {
    this.fields = this.createFields();

    this.form.valueChanges.subscribe(() => {
      this.update.next(this.buildOutput());
    });

    if (!this.field.skipValidators && this.config && this.config.validators && this.config.validators.length) {
      this.config.validators.forEach((x) => {
        const validatorKv = ValidatorTypeMap.get(x.value.validatorType);
        const adapter = new ValidatorFieldAdapter(validatorKv.value, this.field);
        const cfg = adapter.getConfig();
        cfg.defaultValue = x.value[x.key];
        this.addValidatorField(cfg, validatorKv.value);
      });
    }
  }

  private createFields(): FormlyFieldConfig[] {
    const name = this.createTextField('name', this.field.name, 'Field name');
    name.templateOptions.required = false;
    name.templateOptions.disabled = true;

    const typeKv = FieldTypeNameMap.get(this.field.type);
    const type = this.createTextField('type', typeKv.viewValue, 'Field type');
    type.templateOptions.required = false;
    type.templateOptions.disabled = true;

    const fields = [name, type];

    if (!this.field.skipValidators) {
      if (FieldTypeValidatorMap.has(this.field.type)) {
        const validatorsConfig = this.createValidatorList(FieldTypeValidatorMap.get(this.field.type));
        fields.push(validatorsConfig);
        validatorsConfig.templateOptions.change = (x) => this.onValidatorChange(x);
      }

      const fieldValidatorContainer: FormlyFieldConfig = {
        key: this.fieldValidatorsKey,
        fieldGroup: []
      };
      fields.push(fieldValidatorContainer);
    }

    return fields;
  }

  private onValidatorChange(e: FormlyFieldConfig): void {
    const ctrl = e.formControl;
    const value = ctrl.value;
    if (!value) {
      return;
    } else {
      // if ctrl exists - nothing, else add and reset
      try {
        if (!ValidatorTypeMap.has(value)) {
          throw new Error('Empty');
        }

        const validatorKv = ValidatorTypeMap.get(value);
        const hasValidatorField = this.hasValidatorField(value);

        if (!hasValidatorField) {
          const adapter = new ValidatorFieldAdapter(validatorKv.value, this.field);
          const cfg = adapter.getConfig();
          this.addValidatorField(cfg, validatorKv.value);
        }
      } catch (error) {
        console.error('onValidatorChange:else', { e });
      } finally {
        ctrl.reset(undefined, { onlySelf: true });
      }
    }
  }

  private createTextField(key: keyof FormFieldEditorFormModel, value: string, label?: string): FormlyFieldConfig {
    const view = createFormNameField(key, value, label || value);
    return builderViewToFormlyFieldConfig(view);
  }

  private createValidatorList(validatorOptions: ValidatorType[]): FormlyFieldConfig {
    const adapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select field Validators'),
      name: 'selectValidator',
      type: FieldTypeIds.ListField,
      readonly: false,
      required: false,
      value: undefined,
      valueInfo: {
        options: validatorOptions.map((x) => this.mapValidatorToOptions(x)).filter((x) => !!x)
      }
    });
    return adapter.getConfig();
  }

  private mapValidatorToOptions(validator: ValidatorType): KeyValue<string, ValidatorType> {
    if (!ValidatorTypeMap.has(validator)) {
      return null;
    }
    const validatorKv = ValidatorTypeMap.get(validator);
    return {
      key: validatorKv.viewValue,
      value: validatorKv.value
    };
  }

  private hasValidatorField(validator: ValidatorType): boolean {
    if (!ValidatorTypeMap.has(validator)) {
      return false;
    }

    const kv = ValidatorTypeMap.get(validator);
    const parent = this.getFieldValidatorsGroup();
    return parent.fieldGroup.some((x) => x.key === kv.key);
  }

  private getFieldValidatorsGroup(): FormlyFieldConfig {
    return this.fields.find((x) => x.key === this.fieldValidatorsKey);
  }

  private addValidatorField(validatorField: FormlyFieldConfig, type: ValidatorType): void {
    if (!validatorField) {
      return;
    }
    if (!validatorField.templateOptions) {
      validatorField.templateOptions = {};
    }

    validatorField.templateOptions[Addons.formlyRightBtn] = Object.assign(validatorField.templateOptions[Addons.formlyRightBtn] || {}, {
      icon: 'trash',
      color: 'red',
      tooltip: this.ts.instant('Delete field'),
      onClick: () => this.removeValidatorField(type)
    } as IFormlyRightButtonAddonConfig);
    const parent = this.getFieldValidatorsGroup();

    parent.fieldGroup.push(validatorField);

    this.onChange(true);
  }

  private removeValidatorField(validator: ValidatorType): void {
    const validatorKv = ValidatorTypeMap.get(validator);
    const parent = this.getFieldValidatorsGroup();
    const arr = parent.fieldGroup;

    const removed = !!remove(arr, (x) => x.key === validatorKv.key);
    this.onChange(removed);
  }
  private onChange(emit?: boolean): void {
    this.fields = [...this.fields];
    if (emit) {
      this.update.next(this.buildOutput());
    }
  }

  private buildOutput(): FormFieldEditorOutputModel {
    const model: FormFieldEditorOutputModel = {
      fieldId: this.field.id,
      validators: [],
      isValid: this.form.valid || this.form.pristine
    };
    if (!this.field.skipValidators) {
      model.validators = formValueToValidators(this.model.fieldValidators, this.field.type);
      const parent = this.getFieldValidatorsGroup();

      model.validators.forEach((x) => {
        const validatorKv = ValidatorTypeMap.get(x.value.validatorType);
        const ctrl = parent.formControl.get(validatorKv.key);
        x.value.isValid = ctrl.valid || ctrl.disabled;
      });
    }

    return model;
  }
}
