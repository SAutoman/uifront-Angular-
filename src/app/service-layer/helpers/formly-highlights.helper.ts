/**
 * global
 */
import { FormControl, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import {
  formlyFieldDefaultClass,
  formlyFieldReadonlyClass
} from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { FormlyModel } from '@wfm/common/models';
import { Addons } from '@wfm/common/vendor';
import { IFormlyNestedCheckboxAddonConfig } from '@wfm/common/vendor/formly-addons/formly-nested-checkbox-addon/i-formly-nested-checkbox-addon.config';

/**
 * local
 */
export const highlightsFormGroupKey = 'highlightsForm';

export class FormlyHighlightsHelper {
  /**
   * generate the field path for the subject fieldConfig (including parent fieldConfig keys)
   */
  static getFieldPath(config: FormlyFieldConfig): string[] {
    let path = [];
    path.unshift(config.key);
    if (config.parent?.key) {
      path.unshift(...this.getFieldPath(config.parent));
    }
    return path;
  }

  /**
   * get a reference to the root formGroup which contains the highlights formGroup
   */
  static findRootForm(config: FormlyFieldConfig): FormGroup {
    let parentConfig = config.parent;
    if (parentConfig.parent) {
      return this.findRootForm(parentConfig);
    } else {
      return (parentConfig.form || parentConfig.formControl) as FormGroup;
    }
  }

  // /**
  //  * recursively find the current field's highlights formControl
  //  */
  // static findFieldHighlightControl(fieldPath: string[], highlightsForm: FormGroup): FormControl {

  // const fieldKey = fieldPath.splice(0, 1);
  // let nestedForm = highlightsForm.get(fieldKey);
  // if (nestedForm) {
  //   if (fieldPath.length >= 1) {
  //     return this.findFieldHighlightControl(fieldPath, nestedForm as FormGroup);
  //   } else {
  //     return nestedForm as FormControl;
  //   }
  // }
  // return null;
  // }

  /**
   * based on highligtModel tree, create a formgroup for highlights
   */
  static addHighlightsControlsRecursively(highlightModel: any, highlightsGroup: FormGroup): void {
    for (const key in highlightModel) {
      if (highlightModel.hasOwnProperty(key)) {
        let nestedModel = highlightModel[key];
        if (typeof nestedModel === 'object') {
          highlightsGroup.addControl(key, new FormGroup({}));
          let nestedFormGroup = highlightsGroup.controls[key] as FormGroup;
          this.addHighlightsControlsRecursively(nestedModel, nestedFormGroup);
        } else {
          highlightsGroup.addControl(key, new FormControl(nestedModel));
        }
      }
    }
  }

  /**
   * create highlightsModel tree
   */
  static populateHighlightsModel(fields: FormlyFieldConfig[], model: FormlyModel): FormlyModel {
    fields.forEach((field) => {
      const key = field.key as string;
      if (field.fieldGroup) {
        model[key] = {};
        this.populateHighlightsModel(field.fieldGroup, model[key]);
      } else {
        model[key] = field.templateOptions.isHighlighted;
      }
    });
    return model;
  }

  /**
   * add highlighting functionality to the top level schema fields
   */
  static addHighlightFunctionality(config: FormlyFieldConfig): FormlyFieldConfig {
    config.templateOptions[Addons.nestedCheckbox] = Object.assign(config.templateOptions[Addons.nestedCheckbox] || {}, {
      label: 'Highlight',
      checked: config.templateOptions?.isHighlighted || false,
      onClick: (to, nestedCheckbox, event) => {
        to.isHighlighted = event.checked;
        this.setDefaultClassNames(config);
        if (to.isHighlighted && to.highlightColor) {
          config.className += ` ${to.highlightColor}`;
        }

        this.updateHighlightFormcontrol(config, event.checked);
      }
    } as IFormlyNestedCheckboxAddonConfig);
    return config;
  }

  /**
   * update the respective field's highlight formcontrol with the isHighlighted value
   */
  static updateHighlightFormcontrol(config: FormlyFieldConfig, isHighlighted: boolean): void {
    const fieldName = config.key as string;
    let highlightsFormGroup = config.parent.formControl.get(highlightsFormGroupKey) as FormGroup;
    highlightsFormGroup?.patchValue({ [fieldName]: isHighlighted }, { onlySelf: false, emitEvent: true });
  }

  /**
   * add highlighting functionality to the nested schema fields
   */
  static addHighlightFunctionalityNestedFields(config: FormlyFieldConfig): FormlyFieldConfig {
    config.templateOptions[Addons.nestedCheckbox] = Object.assign(config.templateOptions[Addons.nestedCheckbox] || {}, {
      label: 'Highlight',
      checked: config.templateOptions?.isHighlighted || false,
      onClick: (to, nestedCheckbox, event) => {
        to.isHighlighted = event.checked;
        this.setDefaultClassNames(config);
        if (to.isHighlighted && to.highlightColor) {
          config.className += ` ${to.highlightColor}`;

          if (config.parent) {
            config.parent.className = `${formlyFieldDefaultClass} ${to.highlightColor}`;
          }
        } else {
          this.highlightFieldGroupWrapper(config.parent);
        }

        this.updateHighlightFormcontrolNested(config, event.checked);
      }
    } as IFormlyNestedCheckboxAddonConfig);
    return config;
  }

  /**
   * if there is any other highlighted field in parentConfig, highlight the parent with the same color
   * @param parentConfig
   */
  static highlightFieldGroupWrapper(parentConfig): void {
    parentConfig.className = formlyFieldDefaultClass;

    const anyHighlightedField = parentConfig.fieldGroup.find((nestedFieldConfig) => {
      return nestedFieldConfig.templateOptions.isHighlighted;
    });
    if (anyHighlightedField) {
      parentConfig.className = `${formlyFieldDefaultClass} ${anyHighlightedField.templateOptions.highlightColor}`;
    }
  }

  /**
   * update the respective nestedSchema field's highlight formcontrol with the isHighlighted value
   */
  static updateHighlightFormcontrolNested(config: FormlyFieldConfig, isHighlighted: boolean): void {
    try {
      let rootForm = this.findRootForm(config);
      let highlightsFormGroup = rootForm?.get(highlightsFormGroupKey) as FormGroup;

      let fieldPath = this.getFieldPath(config);
      if (fieldPath.length && highlightsFormGroup) {
        let fieldHighlightControl = highlightsFormGroup.get(fieldPath) as FormControl;

        // this.findFieldHighlightControl([...fieldPath], highlightsFormGroup) as FormControl;
        fieldHighlightControl?.setValue(isHighlighted, { onlySelf: false, emitEvent: true });
      }
    } catch (error) {
      console.log('Error on updateHighlightFormcontrol', error);
    }
  }

  static setDefaultClassNames(config: FormlyFieldConfig): void {
    if (config.templateOptions?.readonly) {
      config.className = formlyFieldReadonlyClass;
    } else {
      config.className = formlyFieldDefaultClass;
    }
  }
}
