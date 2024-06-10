/**
 * global
 */
import { Injectable } from '@angular/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { IFieldSettings, IFunctionItemModel, IRuleSet } from '@wfm/forms-flow-struct';
import { FieldTypeIds, FieldTypeNameMap, SchemaFieldDto, ValidatorType } from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { ExpressionEvaluatorService } from '@wfm/service-layer/services/expression-evaluator';
import { FormulaEngineService } from '@wfm/service-layer/services/formula-engine';
import { FormulaConfig, FormulaField, stopFormulaCalculationKey } from '@wfm/service-layer/models/formula';
/**
 * local
 */
import { FormlyModel, IConfigurableListItem } from '../models';
import { ComputedValueTriggerEventEnum, DefaultValueTypeEnum } from '../field/field-default-value/FieldDefaultValues';
import { DetailedCellError } from 'hyperformula';
import { KeyValue } from '@angular/common';

interface SimplifiedFunction {
  name: string;
  ruleSet: IRuleSet;
  currentFieldSettings: IFieldSettings;
}
interface FunctionMap {
  [key: string]: Array<SimplifiedFunction>;
}

const descriptionProp = 'descriptionExpressions';
const requiredProp = 'requiredExpressions';
const disabledProp = '.disabledExpressions';
const readonlyProp = 'readonlyExpressions';
const defaultValue = 'defaultValueExpressions';
const visibleProp = 'hideExpressions';

@Injectable({
  providedIn: 'root'
})
export class ExpressionHelperService {
  constructor(private expressionEvaluator: ExpressionEvaluatorService, private formulaEngineService: FormulaEngineService) {}

  addExpressionsRecursively(
    fieldConfig: FormlyFieldConfig,
    schemaFields: IConfigurableListItem[],
    functions: IFunctionItemModel[],
    model: FormlyModel,
    isDisabled?: boolean
  ): FormlyFieldConfig {
    if (fieldConfig.fieldGroup) {
      fieldConfig = this.addExpressionsToField(fieldConfig, schemaFields, functions, model, isDisabled);
      fieldConfig.fieldGroup.forEach((fConfig) => {
        fConfig = this.addExpressionsRecursively(fConfig, schemaFields, functions, model, isDisabled);
      });
    } else {
      fieldConfig = this.addExpressionsToField(fieldConfig, schemaFields, functions, model, isDisabled);
    }
    return fieldConfig;
  }

  /**
   *
   * @param config
   * add expressionsProperties to the fields that are a target to any function
   */
  private addExpressionsToField(
    config: FormlyFieldConfig,
    fields: IConfigurableListItem[],
    functions: IFunctionItemModel[],
    model: FormlyModel,
    isDisabled?: boolean
  ): FormlyFieldConfig {
    if (functions && functions.length) {
      const ownModel = model;
      const modelKey = <string>config.key;
      // find all the functions with current field as the target
      const foundFunctions = functions.filter((f: IFunctionItemModel) => {
        if (!f.fieldsSettings || !f.fieldsSettings.length) {
          return false;
        }
        const relatedFunction = f.fieldsSettings.find((sett) => {
          const targetField = this.getFieldByPath(sett.fieldPath?.path, fields);
          return targetField && (targetField.name === config.key || targetField.fieldName === config.key);
        });
        return !!relatedFunction;
      });
      if (foundFunctions && foundFunctions.length) {
        const ownModelString = `model.${modelKey}`;
        const functionMap = this.setupFunctionMap(foundFunctions, config);

        config.expressionProperties = {
          ...config.expressionProperties
        };

        for (const key in functionMap) {
          if (functionMap.hasOwnProperty(key) && functionMap[key].length) {
            const relatedFunctions = functionMap[key];
            switch (key) {
              case descriptionProp:
                config.expressionProperties['templateOptions.description'] = () => {
                  for (let i = 0; i < relatedFunctions.length; i++) {
                    const func = relatedFunctions[i];
                    if (func.currentFieldSettings.config.useHintMessage && this.evaluateExpression(func.ruleSet, ownModel)) {
                      return func.currentFieldSettings.config.hintMessage;
                    }
                  }
                };
                break;
              case requiredProp:
                // if there is config to set/reset the required validator dynamically, do it, otherwise check for static required validator
                config.expressionProperties['templateOptions.required'] = () => {
                  for (let i = 0; i < relatedFunctions.length; i++) {
                    const func = relatedFunctions[i];

                    if (func.currentFieldSettings.config.makeRequired && this.evaluateExpression(func.ruleSet, ownModel)) {
                      return true;
                    } else if (func.currentFieldSettings.config.makeOptional && this.evaluateExpression(func.ruleSet, ownModel)) {
                      return false;
                    } else {
                      return func.currentFieldSettings.field.configuration?.validators?.find(
                        (val) => val.validatorType === ValidatorType.Required
                      );
                    }
                  }
                };
                break;
              case disabledProp:
                // if the form is to be disabled gloabally, we will do it explicitly

                if (!isDisabled) {
                  // enable/disable
                  config.expressionProperties['templateOptions.disabled'] = () => {
                    let toBeDisabled = false;
                    for (let i = 0; i < relatedFunctions.length; i++) {
                      const func = relatedFunctions[i];

                      if (func.currentFieldSettings.config.disabled && this.evaluateExpression(func.ruleSet, ownModel)) {
                        toBeDisabled = true;
                      } else if (func.currentFieldSettings.config.enabled && this.evaluateExpression(func.ruleSet, ownModel)) {
                        toBeDisabled = false;
                      }
                    }
                    return toBeDisabled;
                  };
                }
                break;
              case readonlyProp:
                if (!isDisabled) {
                  config.expressionProperties['templateOptions.readonly'] = () => {
                    let toBeMadeReadonly = config.templateOptions.readonlySetExplicitly;
                    for (let i = 0; i < relatedFunctions.length; i++) {
                      const func = relatedFunctions[i];

                      if (func.currentFieldSettings.config.enabled && this.evaluateExpression(func.ruleSet, ownModel)) {
                        toBeMadeReadonly = false;
                      }
                    }
                    return toBeMadeReadonly;
                  };
                }
                break;
              case defaultValue:
                if (!config.fieldGroup) {
                  config.expressionProperties[ownModelString] = (model) => {
                    for (let i = 0; i < relatedFunctions.length; i++) {
                      const func = relatedFunctions[i];

                      // return the user's filled value if it exists
                      if (config.defaultValue != null) {
                        return config.defaultValue;
                      }
                      if (func.currentFieldSettings.config.useDefaultValue && this.evaluateExpression(func.ruleSet, ownModel)) {
                        return func.currentFieldSettings.config.defaultValue;
                      }
                    }
                  };
                }
                break;
              case visibleProp:
                // hidden
                config.hideExpression = () => {
                  let toBeHidden = false;
                  for (let i = 0; i < relatedFunctions.length; i++) {
                    const func = relatedFunctions[i];

                    if (func.currentFieldSettings.config.hidden && this.evaluateExpression(func.ruleSet, ownModel)) {
                      toBeHidden = true;
                    } else if (func.currentFieldSettings.config.visible && this.evaluateExpression(func.ruleSet, ownModel)) {
                      toBeHidden = false;
                    }
                  }
                  return toBeHidden;
                };
                break;
              default:
                break;
            }
          }
        }
      }
    }
    return config;
  }

  generateSimplifiedFunction(func: IFunctionItemModel, setting: IFieldSettings): SimplifiedFunction {
    return {
      name: func.name,
      ruleSet: func.ruleSet,
      currentFieldSettings: setting
    };
  }

  setupFunctionMap(foundFunctions, config): FunctionMap {
    // create a map of functions based on the expressionProp it deals with
    // then just set the expression props that are present in the map

    let functionMap = {};
    for (let i = 0; i < foundFunctions.length; i++) {
      const func = foundFunctions[i];
      const currentFieldSettings = func.fieldsSettings.find((sett) => {
        return sett.field?.name === config.key || sett.field?.fieldName === config.key;
      });
      if (currentFieldSettings.config.useHintMessage) {
        if (!functionMap[descriptionProp]) {
          functionMap[descriptionProp] = [];
        }
        functionMap[descriptionProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
      if (currentFieldSettings.config.disabled) {
        if (!functionMap[disabledProp]) {
          functionMap[disabledProp] = [];
        }
        functionMap[disabledProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
      if (currentFieldSettings.config.enabled) {
        if (!functionMap[disabledProp]) {
          functionMap[disabledProp] = [];
        }
        functionMap[disabledProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));

        if (!functionMap[readonlyProp]) {
          functionMap[readonlyProp] = [];
        }
        functionMap[readonlyProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
      if (currentFieldSettings.config.hidden || currentFieldSettings.config.visible) {
        if (!functionMap[visibleProp]) {
          functionMap[visibleProp] = [];
        }
        functionMap[visibleProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
      if (currentFieldSettings.config.makeOptional || currentFieldSettings.config.makeRequired) {
        if (!functionMap[requiredProp]) {
          functionMap[requiredProp] = [];
        }
        functionMap[requiredProp].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
      if (currentFieldSettings.config.useDefaultValue) {
        if (!functionMap[defaultValue]) {
          functionMap[defaultValue] = [];
        }
        functionMap[defaultValue].push(this.generateSimplifiedFunction(func, currentFieldSettings));
      }
    }
    return functionMap;
  }

  /**
   *
   * @param ruleSet : rules and condition of the subject expression
   * @param model : FormlyField model with key  and value pairs (key: field.id)
   * @param field : current target field
   *
   */
  private evaluateExpression(ruleSet: IRuleSet, model: any): boolean {
    return this.expressionEvaluator.evaluateExpression(cloneDeep(ruleSet), model);
  }

  /**
   * returns field based on path array
   * @param path
   * @param fields
   * @returns
   */

  getFieldByPath(path: Array<string>, fields: IConfigurableListItem[]): IConfigurableListItem {
    if (path?.length) {
      let foundField;
      const pathCopy = [...path];
      let pathItem = pathCopy.splice(0, 1);

      foundField = fields?.find((field) => {
        const fieldName = field.fieldName || field.name;
        return fieldName === pathItem[0];
      });
      if (foundField) {
        if (pathCopy.length === 0) {
          // we are at the end of the path, return the field
          return BaseFieldConverter.toUi(foundField);
        } else {
          // need to dig deeper in the nested fields/schemas
          return this.getFieldByPath(pathCopy, foundField.fields);
        }
      } else {
        return null;
      }
    }
  }

  /**
   * if the field has computed default value set up, we need to add it in the formyFieldConfig.expressionProperties
   */
  addFormulas(fieldConfig: FormlyFieldConfig, schemaFields: IConfigurableListItem[], initialModel: FormlyModel): FormlyFieldConfig {
    const field = schemaFields.find((f) => f.name === fieldConfig.key || f.fieldName === fieldConfig.key);
    if (this.hasFormulaConfig(field)) {
      const modelKey = <string>fieldConfig.key;
      const ownModelString = `model.${modelKey}`;
      if (!fieldConfig.expressionProperties) {
        fieldConfig.expressionProperties = {};
      }

      fieldConfig.expressionProperties[ownModelString] = (model) => {
        const computedValue = this.evaluateFormula(field, schemaFields, model);
        if (computedValue !== stopFormulaCalculationKey) {
          return computedValue;
        }

        if (fieldConfig.defaultValue != null) {
          return fieldConfig.defaultValue;
        }
      };
    }
    return fieldConfig;
  }

  manuallyComputeFieldValue(fieldKey: string, schemaFields: IConfigurableListItem[], formlyModel: FormlyModel): any {
    const field = schemaFields.find((f) => f.name === fieldKey || f.fieldName === fieldKey);

    return this.evaluateFormula(field, schemaFields, formlyModel);
  }

  hasFormulaConfig(field: IConfigurableListItem): boolean {
    return (
      field?.configuration.defaultValueType === DefaultValueTypeEnum.computed &&
      field.configuration.computeDefaultValueFormula &&
      field.configuration.computeTriggerEvent === ComputedValueTriggerEventEnum.Always
    );
  }

  evaluateFormula(field: IConfigurableListItem, schemaFields: IConfigurableListItem[], formlyModel: FormlyModel): any {
    try {
      const formula: FormulaConfig = JSON.parse(field.configuration.computeDefaultValueFormula);
      const values = {};
      formula.fields.forEach((f: FormulaField) => {
        if (f.fieldPath?.path) {
          const fieldValue = this.expressionEvaluator.getModelByPath(formlyModel, f.fieldPath.path);
          if (fieldValue != null) {
            values[f.key] = fieldValue;
          }
        }
      });

      let formulaResult = this.formulaEngineService.evaluateFormula(formula, values, field.type);
      if (formulaResult instanceof DetailedCellError) {
        return null;
      }
      return formulaResult;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  retrieveNestedFieldsHelper(field: SchemaFieldDto | IConfigurableListItem, isNested?: boolean): Array<KeyValue<string, any>> {
    if (field.type === FieldTypeIds.EmbededField) {
      // pushing both the schema and its fields recursively
      let schemaFields = [
        {
          key: field.selectOptionLabel ? field.selectOptionLabel : field.viewName || field.displayName,
          value: isNested ? BaseFieldConverter.toUi(<SchemaFieldDto>field) : field
        }
      ];
      field.fields?.forEach((nestedField) => {
        if (!nestedField.selectOptionLabel) {
          nestedField.selectOptionLabel = this.getFieldLabel(nestedField);

          nestedField.selectOptionLabel += ` => ${field.selectOptionLabel ? field.selectOptionLabel : this.getFieldLabel(field)}`;
        }
        nestedField.parentField = {
          id: field.id,
          fieldName: field.fieldName,
          parentField: field.parentField || undefined
        };
        schemaFields.push(...this.retrieveNestedFieldsHelper(nestedField, true));
      });
      return schemaFields;
    } else {
      return [
        {
          key: field.selectOptionLabel ? field.selectOptionLabel : this.getFieldLabel(field),
          value: isNested ? BaseFieldConverter.toUi(<SchemaFieldDto>field) : field
        }
      ];
    }
  }

  getFieldLabel(field: IConfigurableListItem | SchemaFieldDto): string {
    return `${field.displayName || field.viewName} (${FieldTypeNameMap.get(field.type)?.viewValue})`;
  }
}
