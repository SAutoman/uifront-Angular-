/**
 * global
 */
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

/**
 * project
 */
import { FieldTypeIds } from '../../service-layer';
import { RuleOperatorHandler, IRuleOperatorHandler } from '@wfm/forms-flow-struct/interface/expression/expressionOperator.handler';
import { RuleCustomOperatorEnum, RuleSetCustomCondition } from '../models/expressionModel';
import { ISchemaFieldRule, IRuleSet } from '@wfm/forms-flow-struct';
import { FormlyModel } from '@wfm/common/models';
import { CurrentUserData, ExpressionSystemFieldEnum } from '@wfm/forms-flow-struct/form-function-builder/system-fields';
import { Store } from '@ngrx/store';
import { ApplicationState, userSystemDataSelector } from '@wfm/store';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { isUndefinedOrNull } from '@wfm/shared/utils';

@Injectable({
  providedIn: 'root'
})
export class ExpressionEvaluatorService {
  private operatorHandler: IRuleOperatorHandler;
  userData: CurrentUserData;

  constructor(private store: Store<ApplicationState>) {
    this.operatorHandler = new RuleOperatorHandler();
    this.store
      .select(userSystemDataSelector)
      .pipe()
      .subscribe((result) => {
        this.userData = result;
      });
  }

  evalStringOperator(x: ISchemaFieldRule, fieldValue: string): boolean {
    const operation = this.operatorHandler.getStringOperation(x.operator);
    const ruleValue: string = x.value;
    return operation(ruleValue, fieldValue);
  }

  evalListOperator(x: ISchemaFieldRule, fieldValue: string): boolean {
    switch (x.operator) {
      case RuleCustomOperatorEnum.Equal:
        return fieldValue ? x.value === fieldValue : false;
      case RuleCustomOperatorEnum.NotEqual:
        return fieldValue ? x.value !== fieldValue : false;
      case RuleCustomOperatorEnum.IsEmpty:
        return !fieldValue ? true : false;
      case RuleCustomOperatorEnum.IsNotEmpty:
        return fieldValue ? true : false;
    }
    return false;
  }

  evalMultipleSelectOperator(x: ISchemaFieldRule, fieldValue: any[]): boolean {
    switch (x.operator) {
      case RuleCustomOperatorEnum.In:
        // at least one selected option is available in rule value
        return fieldValue?.length ? fieldValue.some((itemId) => x.value.includes(itemId)) : false;
      case RuleCustomOperatorEnum.NotIn:
        // none of selected options is available in rule value
        return fieldValue?.length ? !fieldValue.some((itemId) => x.value.includes(itemId)) : true;
      case RuleCustomOperatorEnum.IsEmpty:
        return !fieldValue || !fieldValue.length;
      case RuleCustomOperatorEnum.IsNotEmpty:
        return fieldValue && !!fieldValue.length;
    }
    return false;
  }

  evalIntOperator(x: ISchemaFieldRule, fieldValue: number): boolean {
    const operation = this.operatorHandler.getNumberOperation(x.operator);

    return operation(fieldValue, x.value);
  }

  evalDecimalOperator(x: ISchemaFieldRule, fieldValue: number): boolean {
    const operation = this.operatorHandler.getNumberOperation(x.operator);
    return operation(fieldValue, x.value);
  }

  evalBoolOperator(x: ISchemaFieldRule, fieldValue: boolean): boolean {
    if (x.operator === RuleCustomOperatorEnum.IsEmpty) {
      return isUndefinedOrNull(fieldValue);
    } else if (x.operator === RuleCustomOperatorEnum.IsNotEmpty) {
      return !isUndefinedOrNull(fieldValue);
    } else {
      const ruleValue = +x.value;
      const actualValue = +fieldValue;
      const operation = this.operatorHandler.getNumberOperation(x.operator);
      return operation(actualValue, ruleValue);
    }
  }
  evalDateOperator(x: ISchemaFieldRule, fieldValue: Date): boolean {
    if (x.operator === RuleCustomOperatorEnum.IsEmpty) {
      return isUndefinedOrNull(fieldValue);
    } else if (x.operator === RuleCustomOperatorEnum.IsNotEmpty) {
      return !isUndefinedOrNull(fieldValue);
    } else {
      if (!fieldValue) {
        return false;
      }
      const actualValue = DateTimeFormatHelper.parseToLuxon(fieldValue)?.startOf('day').toUnixInteger();
      const ruleValue = DateTimeFormatHelper.parseToLuxon(x.value)?.startOf('day').toUnixInteger();
      const operation = this.operatorHandler.getNumberOperation(x.operator);
      return operation(actualValue, ruleValue);
    }
  }

  evalDateTimeOperator(x: ISchemaFieldRule, fieldValue: Date): boolean {
    if (x.operator === RuleCustomOperatorEnum.IsEmpty) {
      return isUndefinedOrNull(fieldValue);
    } else if (x.operator === RuleCustomOperatorEnum.IsNotEmpty) {
      return !isUndefinedOrNull(fieldValue);
    } else {
      if (!fieldValue) {
        return false;
      }
      const actualValue = DateTimeFormatHelper.parseToLuxon(fieldValue)?.startOf('minute').toUnixInteger();
      const ruleValue = DateTimeFormatHelper.parseToLuxon(x.value)?.startOf('minute').toUnixInteger();
      const operation = this.operatorHandler.getNumberOperation(x.operator);
      return operation(actualValue, ruleValue);
    }
  }

  evalTimeFieldOperator(x: ISchemaFieldRule, fieldValue: string): boolean {
    if (x.operator === RuleCustomOperatorEnum.IsEmpty) {
      return isUndefinedOrNull(fieldValue);
    } else if (x.operator === RuleCustomOperatorEnum.IsNotEmpty) {
      return !isUndefinedOrNull(fieldValue);
    } else {
      if (!fieldValue) {
        return false;
      }
      const format = 'HH:mm';
      const actualValue = DateTime.fromFormat(fieldValue, format).toUnixInteger();
      const ruleValue = DateTime.fromFormat(x.value, format).toUnixInteger();
      const operation = this.operatorHandler.getNumberOperation(x.operator);
      return operation(actualValue, ruleValue);
    }
  }

  evaluateConnectorField(x: ISchemaFieldRule, fieldValue: string): boolean {
    switch (x.operator) {
      case RuleCustomOperatorEnum.IsEmpty:
        return !fieldValue?.length ? true : false;
      case RuleCustomOperatorEnum.IsNotEmpty:
        return fieldValue?.length ? true : false;
    }
  }

  evaluateListOfLinksField(x: ISchemaFieldRule, fieldValue: string): boolean {
    switch (x.operator) {
      case RuleCustomOperatorEnum.IsEmpty:
        return !fieldValue?.length ? true : false;
      case RuleCustomOperatorEnum.IsNotEmpty:
        return fieldValue?.length ? true : false;
    }
  }

  evaluateSignatureField(x: ISchemaFieldRule, fieldValue: string): boolean {
    switch (x.operator) {
      case RuleCustomOperatorEnum.IsEmpty:
        return !fieldValue?.length ? true : false;
      case RuleCustomOperatorEnum.IsNotEmpty:
        return fieldValue?.length ? true : false;
    }
    return;
  }

  evaluateExpression(expression: IRuleSet, formlyModel: any): boolean {
    let result;
    switch (expression.condition) {
      case RuleSetCustomCondition.Or:
        result = this.evaluateCurrentField(expression.rules, formlyModel, false);
        break;
      case RuleSetCustomCondition.And:
        result = this.evaluateCurrentField(expression.rules, formlyModel, true);
        break;
    }
    return result;
  }

  evaluateCurrentField(rules: ISchemaFieldRule[], formlyModel: any, isAnd: boolean): boolean {
    let result = true;
    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i];

      const fieldValueToCompareWith = this.getModelByPath(formlyModel, rule.propertyPath.path);

      if (rule.fieldRef?.configuration?.forExpressions) {
        switch (rule.fieldRef?.id) {
          case ExpressionSystemFieldEnum.companies:
            result = this.evalMultipleSelectOperator(rule, [this.userData.companyId]);
            break;
          case ExpressionSystemFieldEnum.userGroups:
            result = this.evalMultipleSelectOperator(rule, this.userData.userGroups);
            break;
          case ExpressionSystemFieldEnum.roles:
            result = this.evalMultipleSelectOperator(rule, [this.userData.role]);
            break;
          case ExpressionSystemFieldEnum.createdAt:
            result = this.evalDateTimeOperator(rule, fieldValueToCompareWith);
            break;
          case ExpressionSystemFieldEnum.updatedAt:
            result = this.evalDateTimeOperator(rule, fieldValueToCompareWith);
            break;
          case ExpressionSystemFieldEnum.statusId:
            result = this.evalMultipleSelectOperator(rule, fieldValueToCompareWith ? [fieldValueToCompareWith] : undefined);
            break;
        }
      } else {
        switch (rule.fieldRef?.type) {
          case FieldTypeIds.StringField:
          case FieldTypeIds.TextareaField:
            result = this.evalStringOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.IntField:
            result = this.evalIntOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.DecimalField:
            result = this.evalDecimalOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.BoolField:
            result = this.evalBoolOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.DateField:
            result = this.evalDateOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.DateTimeField:
            result = this.evalDateTimeOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.TimeField:
            result = this.evalTimeFieldOperator(rule, fieldValueToCompareWith);
          case FieldTypeIds.ListField:
            result = this.evalListOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.ConnectorField:
            result = this.evaluateConnectorField(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.MultiselectListField:
            result = this.evalMultipleSelectOperator(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.ListOfLinksField:
            result = this.evaluateListOfLinksField(rule, fieldValueToCompareWith);
            break;
          case FieldTypeIds.SignatureField:
            result = this.evaluateSignatureField(rule, fieldValueToCompareWith);
            break;
          // case FieldTypeIds.FileField:
          //   result = this.evalFileOperator(rule, fieldValueToCompareWith);
          //   break;
        }
      }

      // AND: if for some eval the result is false, then ruleSet is not met
      if (!result && isAnd) {
        break;
      }

      // OR: as soon as there is any true result for any rule, the ruleSet is met
      if (result && !isAnd) {
        break;
      }
    }

    return result;
  }

  /**
   * get the value of the respective model key
   * (traversing the model based on path)
   */

  getModelByPath(model: FormlyModel, path: Array<string>): any {
    const copyPath = [...path];
    let pathItem = copyPath.splice(0, 1)[0];
    let modelItem = model[pathItem];
    if (copyPath.length === 0) {
      return modelItem;
    } else {
      return this.getModelByPath(modelItem, copyPath);
    }
  }
}
