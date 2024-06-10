/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { FormVariableDto } from '@wfm/common/vendor';
import { FieldTypeIds, ValidatorType } from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';

/**
 * local
 */
import { builderViewToFormlyFieldConfig, createFormNameField, mapVariableToFormlyConfig } from '../page-form-builder/maps';
import { IFieldSettingsConfig, IFieldSettings } from '../interface/expression/expressionModelUI';
import { IConfigurableListItem } from '@wfm/common/models';

@Component({
  selector: 'app-form-function-field-settings',
  templateUrl: './form-function-field-settings.component.html',
  styleUrls: ['./form-function-field-settings.component.scss']
})
export class FormFunctionFieldSettingsComponent extends BaseComponent implements OnInit {
  @Input() settings$: Observable<IFieldSettings>;
  @Output() update = new EventEmitter();
  @Output() modelChangeEmitter = new EventEmitter();
  form: FormGroup;
  model: IFieldSettingsConfig;
  fields: FormlyFieldConfig[];
  formSubscription: Subscription;

  private settingKeys: {
    [key in keyof IFieldSettingsConfig]: keyof IFieldSettingsConfig;
  };

  constructor(private fb: FormBuilder, private ts: TranslateService) {
    super();
    this.settingKeys = {
      name: 'name',
      defaultValue: 'defaultValue',
      disabled: 'disabled',
      hintMessage: 'hintMessage',
      useDefaultValue: 'useDefaultValue',
      useHintMessage: 'useHintMessage',
      hidden: 'hidden',
      visible: 'visible',
      enabled: 'enabled',
      makeRequired: 'makeRequired',
      makeOptional: 'makeOptional'
    };
  }

  ngOnInit(): void {
    this.settings$
      .pipe(
        takeUntil(this.destroyed$),
        filter((settings) => !!settings)
      )
      .subscribe((settings: IFieldSettings) => {
        this.formSubscription?.unsubscribe();
        this.initFormlyView(settings.field.name, settings.field.type, settings.config, settings.field);
      });
  }

  initFormlyView(fieldName: string, fieldType: FieldTypeIds, config: IFieldSettingsConfig, field: IConfigurableListItem): void {
    this.form = this.fb.group({});
    this.fields = [];

    let defaultConfig = {
      name: fieldName,
      hidden: false,
      disabled: false,
      useHintMessage: false,
      hintMessage: '',
      visible: false,
      enabled: false,
      makeRequired: false,
      makeOptional: false
    };
    if (fieldType !== FieldTypeIds.EmbededField && fieldType !== FieldTypeIds.FileField) {
      defaultConfig['defaultValue'] = undefined;
      defaultConfig['useDefaultValue'] = false;
    }
    this.model = Object.assign(defaultConfig, config || {});

    const nameField = this.createStringField(this.settingKeys.name, '');
    nameField.className = 'd-none';
    nameField.hide = true;
    this.fields.push(nameField);

    const hidden = this.createBoolField(this.settingKeys.hidden, this.ts.instant('Hide'));
    hidden.className = 'col-lg-6';
    this.fields.push(hidden);
    const visible = this.createBoolField(this.settingKeys.visible, this.ts.instant('Show'));
    visible.className = 'col-lg-6';
    this.fields.push(visible);

    const disabled = this.createBoolField(this.settingKeys.disabled, this.ts.instant('Disable'));
    disabled.className = 'col-lg-6';
    this.fields.push(disabled);

    const enabled = this.createBoolField(this.settingKeys.enabled, this.ts.instant('Enable'));
    enabled.className = 'col-lg-6';
    this.fields.push(enabled);

    if (fieldType !== FieldTypeIds.EmbededField && fieldType !== FieldTypeIds.FileField) {
      const useDefaultValue = this.createBoolField(this.settingKeys.useDefaultValue, this.ts.instant('Put default value'));
      useDefaultValue.className = 'col-lg-6';

      const defaultValue = this.createDynamicField(fieldType, this.settingKeys.defaultValue, field, this.ts.instant('Default Value'));
      defaultValue.className = 'col-lg-6';
      this.fields.push(useDefaultValue);
      this.fields.push(defaultValue);
    }

    const useHintMessage = this.createBoolField(this.settingKeys.useHintMessage, this.ts.instant('Show special note message'));
    useHintMessage.className = 'col-lg-6';
    this.fields.push(useHintMessage);

    const hintMessage = this.createStringField(this.settingKeys.hintMessage, this.ts.instant('Note message'));
    hintMessage.className = 'col-lg-6';
    this.fields.push(hintMessage);

    let requiredOptionalFlagField = this.getRequiredOrOptionalFlagField(field);
    this.fields.push(requiredOptionalFlagField);

    setTimeout(() => {
      if (this.form) {
        this.formSubscription = this.form.valueChanges.subscribe((formValues) => {
          const model = this.model;
          const hm = this.getField(this.settingKeys.hintMessage);
          const dv = this.getField(this.settingKeys.defaultValue);

          if (!model.useHintMessage && ((model.hintMessage || '').trim() || hm.formControl.enabled)) {
            hm.formControl.patchValue('', { onlySelf: true, emitEvent: false });
            hm.formControl.disable({ onlySelf: true, emitEvent: false });
          } else if (model.useHintMessage && hm.formControl.disabled) {
            hm.formControl.enable({ onlySelf: true, emitEvent: false });
          }

          if (!model.useDefaultValue) {
            dv?.formControl.patchValue(undefined, { onlySelf: true, emitEvent: false });
            dv?.formControl.disable({ onlySelf: true, emitEvent: false });
          } else if (model.useDefaultValue && dv.formControl.disabled) {
            dv?.formControl.enable({ onlySelf: true, emitEvent: false });
          }
          this.toggleEnableDisable(formValues);
          this.toggleVisibleHidden(formValues);
          this.update.next(this.model);
        });

        setTimeout(() => {
          this.form.updateValueAndValidity();
        });
      }
    });
  }

  /**
   *
   * if the selected field has required validator set,
   * allow making the field optional, and vice versa
   *
   */

  getRequiredOrOptionalFlagField(field: IConfigurableListItem): FormlyFieldConfig {
    let config;

    if (
      field?.configuration?.validators &&
      field.configuration.validators.find((validator) => {
        return validator.validatorType === ValidatorType.Required;
      })
    ) {
      config = this.createBoolField(this.settingKeys.makeOptional, this.ts.instant('Make field optional'));
    } else {
      config = this.createBoolField(this.settingKeys.makeRequired, this.ts.instant('Make field required'));
    }
    config.className = 'col-lg-6';
    return config;
  }

  toggleEnableDisable(formValues) {
    const enableFormControl = this.form.get(this.settingKeys.enabled);
    const disableFormControl = this.form.get(this.settingKeys.disabled);

    if (formValues.enabled) {
      disableFormControl.disable({ onlySelf: true, emitEvent: false });
    } else {
      disableFormControl.enable({ onlySelf: true, emitEvent: false });
    }

    if (formValues.disabled) {
      // hiddenFormControl.patchValue(false, { onlySelf: true, emitEvent: false });
      enableFormControl.disable({ onlySelf: true, emitEvent: false });
    } else {
      enableFormControl.enable({ onlySelf: true, emitEvent: false });
    }
  }

  toggleVisibleHidden(formValues) {
    const visibleFormControl = this.form.get(this.settingKeys.visible);
    const hiddenFormControl = this.form.get(this.settingKeys.hidden);

    if (formValues.hidden) {
      // visibleFormControl.patchValue(false, { onlySelf: true, emitEvent: false });
      visibleFormControl.disable({ onlySelf: true, emitEvent: false });
    } else {
      visibleFormControl.enable({ onlySelf: true, emitEvent: false });
    }

    if (formValues.visible) {
      // hiddenFormControl.patchValue(false, { onlySelf: true, emitEvent: false });
      hiddenFormControl.disable({ onlySelf: true, emitEvent: false });
    } else {
      hiddenFormControl.enable({ onlySelf: true, emitEvent: false });
    }
  }

  private createBoolField(name: keyof IFieldSettingsConfig, label: string): FormlyFieldConfig {
    const visibleDto: FormVariableDto = {
      label: label,
      name: name,
      type: FieldTypeIds.BoolField,
      value: this.model[name]
    };
    return mapVariableToFormlyConfig(visibleDto);
  }

  private createStringField(name: keyof IFieldSettingsConfig, label: string): FormlyFieldConfig {
    const fieldDto = createFormNameField(name, this.model[name], label);
    fieldDto.configuration.readonly = false;
    return builderViewToFormlyFieldConfig(fieldDto);
  }

  private createDynamicField(
    fieldType: FieldTypeIds,
    name: keyof IFieldSettingsConfig,
    field: IConfigurableListItem,
    label: string
  ): FormlyFieldConfig {
    const visibleDto: FormVariableDto = {
      label: label,
      name: name,
      type: fieldType,
      value: this.model[name],
      valueInfo: field?.configuration
    };
    return mapVariableToFormlyConfig(visibleDto);
  }

  private getField(fieldName: keyof IFieldSettingsConfig): FormlyFieldConfig {
    return this.fields.find((x) => x.key === fieldName);
  }

  onModelChange(): void {
    this.modelChangeEmitter.emit(true);
  }
}
