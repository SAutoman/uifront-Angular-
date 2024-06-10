/**
 * global
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { remove, cloneDeep } from 'lodash-core';
import { FormBuilder } from '@angular/forms';
import { lowerFirst } from 'lodash-core';
import { KeyValue } from '@angular/common';
import { Observable } from 'rxjs';
import { debounceTime, filter, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

/**
 * project
 */
import { FieldTypeIds, FieldTypeValidatorMap, ValidatorModelUi, ValidatorType, ValidatorTypeMap } from '@wfm/service-layer';
import { IFormlyView, KeyValueView, IConfigurableListItem } from '@wfm/common/models';

import { Addons, FormlyFieldAdapterFactory, IFormlyRightButtonAddonConfig } from '@wfm/common/vendor';
import { ValidatorFieldAdapter, transformValidatorToKeyValue } from '@wfm/common/field-validators';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

/**
 * local
 */
import { IFieldValidatorsOutputEvent } from './i-field-validators-output.event';

const fieldValidatorsKey = 'fieldValidators';
const selectValidatorKey = 'selectValidator';

@Component({
  selector: 'app-field-validators',
  templateUrl: './field-validators.component.html',
  styleUrls: ['./field-validators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FieldValidatorsComponent implements OnInit {
  @Input() fieldType: Observable<FieldTypeIds>;
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<IFieldValidatorsOutputEvent>();
  view$: Observable<IFormlyView<any>>;
  private _view: IFormlyView<any>;
  private _fieldType: FieldTypeIds;
  constructor(private fb: FormBuilder, private ts: TranslateService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.view$ = this.fieldType.pipe(
      filter((x) => !!x),
      map((fieldType) => {
        this._fieldType = fieldType;
        this._view = this.createValidatorsView();
        return this._view;
      }),
      tap(() => {
        this._view.form.valueChanges.pipe(debounceTime(100)).subscribe((x) => {
          this.update.next(this.createOutputEvent());
        });

        if (this.field) {
          const fieldValidatorsConfig = this.field.configuration.validators || [];
          const selectField = this._view.fields.find((x) => x.key === selectValidatorKey);
          setTimeout(() => {
            fieldValidatorsConfig.forEach((validatorConfig) => {
              selectField.formControl.patchValue(validatorConfig.validatorType);
              this.onValidatorChange(selectField, validatorConfig);
            });
          });
        }
      })
    );
  }
  /**
   * we will have 2 formly fields,
   * 1st is the selector,
   * 2nd is a group of already selected validators
   */
  private createValidatorsView(): IFormlyView<any> {
    const model = {};
    const fields = [];
    const validatorSelector = this.createValidatorSelector(FieldTypeValidatorMap.get(this._fieldType));
    validatorSelector.templateOptions.change = (x) => this.onValidatorChange(x);
    fields.push(validatorSelector);

    const fieldValidatorContainer: FormlyFieldConfig = {
      key: fieldValidatorsKey,
      fieldGroup: [],
      className: 'col-11 mx-auto'
    };

    fields.push(fieldValidatorContainer);
    model[fieldValidatorsKey] = {};
    const view: IFormlyView<any> = {
      fields,
      form: this.fb.group({}),
      model
    };
    return view;
  }

  private createValidatorSelector(options: ValidatorType[]): FormlyFieldConfig {
    const adapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select field Validators'),
      name: selectValidatorKey,
      type: FieldTypeIds.ListField,
      readonly: false,
      required: false,
      value: undefined,
      valueInfo: {
        options: [
          new KeyValueView(undefined, null, 'None'),
          ...options.filter((x) => ValidatorTypeMap.has(x)).map((x) => ValidatorTypeMap.get(x))
        ]
      }
    });
    const config = adapter.getConfig();
    config.templateOptions.labelProp = 'viewValue';
    config.className = 'col-12';

    return config;
  }

  private onValidatorChange(selectFormlyField: FormlyFieldConfig, validatorConfig?: ValidatorModelUi): void {
    const ctrl = selectFormlyField.formControl;
    const validatorType = ctrl.value;
    if (!validatorType) {
      if (validatorType === null) {
        // if the user has selected "None"
        const parent = this.getSelectedValidatorsField();
        parent.fieldGroup = [];
        this._view.model[fieldValidatorsKey] = {};
        this.onValidatorFieldsChange();
      }
    } else {
      try {
        if (!ValidatorTypeMap.has(validatorType)) {
          throw new Error('Empty');
        }

        const validatorKv = ValidatorTypeMap.get(validatorType);
        const isValidatorSelected = this.isValidatorSelected(validatorType);
        if (!isValidatorSelected) {
          const adapter = new ValidatorFieldAdapter(validatorKv.value, {
            ...cloneDeep(this.field || {}),
            name: validatorKv.viewValue,
            type: this._fieldType,
            configuration: cloneDeep(this.field?.configuration || {})
          });

          const cfg = adapter.getConfig();
          if (cfg) {
            // cfg.className = 'd-flex w-100';
            this.addValidatorToSelected(cfg, validatorKv.value, validatorConfig || null);
          }
        }
      } catch (error) {
        console.error('onValidatorChange:else', { selectFormlyField });
      } finally {
        ctrl.patchValue(undefined);
        this.onValidatorFieldsChange();
      }
    }
  }

  private isValidatorSelected(validator: ValidatorType): boolean {
    if (!ValidatorTypeMap.has(validator)) {
      return false;
    }
    const kv = ValidatorTypeMap.get(validator);
    const selectedValidatorsField = this.getSelectedValidatorsField();
    return selectedValidatorsField.fieldGroup.some((x) => x.key === kv.key);
  }

  private addValidatorToSelected(
    selectedValidatorField: FormlyFieldConfig,
    type: ValidatorType,
    fieldValidatorConfig?: ValidatorModelUi
  ): void {
    if (!selectedValidatorField) {
      return;
    }
    if (!selectedValidatorField.templateOptions) {
      selectedValidatorField.templateOptions = {};
    }

    selectedValidatorField = this.addFormlyButton(selectedValidatorField, type);
    const selectedValidatorsField = this.getSelectedValidatorsField();
    if (fieldValidatorConfig) {
      // show the saved validator values for existing field's
      const validatorKey = selectedValidatorField.key as string;
      let validatorSavedValue;
      // format the validator value for formly/ui (it may be in the dto format)
      switch (validatorKey) {
        case 'MinMax':
          validatorSavedValue = { min: fieldValidatorConfig['min'], max: fieldValidatorConfig['max'] };
          break;
        case 'Email':
          validatorSavedValue = fieldValidatorConfig[lowerFirst(validatorKey)] || fieldValidatorConfig['enabled'];
          break;
        default:
          validatorSavedValue = fieldValidatorConfig[lowerFirst(validatorKey)];
          break;
      }
      if (validatorKey && validatorSavedValue) {
        this._view.model[fieldValidatorsKey][validatorKey] = validatorSavedValue;
      }
    }
    selectedValidatorsField.fieldGroup.push(selectedValidatorField);
  }

  private addFormlyButton(validatorField: FormlyFieldConfig, type: ValidatorType): FormlyFieldConfig {
    const btn = (validatorField.templateOptions[Addons.formlyRightBtn] || {}) as IFormlyRightButtonAddonConfig;
    validatorField.templateOptions[Addons.formlyRightBtn] = Object.assign(btn, {
      icon: 'trash',
      color: 'red',
      tooltip: this.ts.instant('Delete field'),
      onClick: () => this.removeValidatorField(type)
    } as IFormlyRightButtonAddonConfig);

    if (!btn.isFormGroup) {
      validatorField.wrappers = [...(validatorField.wrappers || []), 'form-field'];
    }

    return validatorField;
  }

  private removeValidatorField(validator: ValidatorType): void {
    const isExternalFieldIdentifierPresent = this.field.configuration.isExternalIdentifier;
    const validatorKv = ValidatorTypeMap.get(validator);
    const selectedValidatorsField = this.getSelectedValidatorsField();
    const arr = selectedValidatorsField.fieldGroup;

    if (isExternalFieldIdentifierPresent && validatorKv.value === ValidatorType.Required) {
      this.showAlert();
      return;
    }

    const removedItem = remove(arr, (x) => x.key === validatorKv.key);
    if (!!removedItem) {
      this.resetErrors(removedItem);
      delete this._view.model[fieldValidatorsKey][validatorKv.key];
      this.onValidatorFieldsChange();
    }
  }

  showAlert(): void {
    this.dialog.open(ConfirmActionComponent, {
      data: {
        title: this.ts.instant('Alert'),
        message: this.ts.instant('Can not remove required validator for External Identifier field')
      }
    });
  }

  resetErrors(fields: FormlyFieldConfig[]) {
    fields.forEach((field) => {
      field?.formControl?.setErrors(null);
      if (field?.fieldGroup?.length) this.resetErrors(field?.fieldGroup);
    });
  }

  private onValidatorFieldsChange(): void {
    const view = this._view;
    view.fields = [...view.fields];
    view.model = { ...view.model };
    this.update.next(this.createOutputEvent());
  }

  /**
   * get the formly field that is storing the updateable field's validators (inside formGroup)
   */
  private getSelectedValidatorsField(): FormlyFieldConfig {
    return this._view.fields.find((x) => x.key === fieldValidatorsKey);
  }

  private createOutputEvent(): IFieldValidatorsOutputEvent {
    return {
      valid: this._view.form.valid,
      validators: this.getValidators(),
      dirty: this._view.form.dirty
    };
  }

  private getValidators(): KeyValue<ValidatorType, any>[] {
    const model = this._view.model[fieldValidatorsKey];
    const validators = model
      ? Object.keys(model)
          .filter((key) => !!model[key] && ValidatorTypeMap.has(key))
          .map((key) => {
            const transformed = transformValidatorToKeyValue(this._fieldType, key, model[key]);
            return transformed;
          })
      : [];

    return validators;
  }
}
