// /**
//  * global
//  */
// import { Injectable } from '@angular/core';

// /**
//  * project
//  */
// import { RuleSetCustom, CustomRule } from '../../forms/models';
// import { IOperatorHandler, OperatorHandler } from './operator.handler';
// import { OperatorEnum } from '@wfm/common/models';
// import { ListValue } from '@wfm/service-layer/models/FieldValueDto';

// /**
//  * local
//  */
// import { FieldTypeIds, FieldValueDto, FormDtoUI, FieldValueDtoBase, FieldDtoUI, FieldId } from '../../service-layer';

// export interface IGetValue {
//   getValue(x: FieldId): FieldDtoUI;
//   getForm(x: FieldId): FormDtoUI;
// }

// @Injectable({
//   providedIn: 'root'
// })
// export class FunctionEvaluateService {
//   private operatorHandler: IOperatorHandler;
//   constructor() {
//     this.operatorHandler = new OperatorHandler();
//   }

//   evalStringOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const operation = this.operatorHandler.getStringOperation(x.operator);
//     const ruleValue: string = x.value;
//     const actualValue = this.getValue<string>(fieldValue);
//     return operation(ruleValue, actualValue);
//   }

//   evalListOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const listValue = (<FieldValueDto<ListValue>>fieldValue).value;
//     switch (x.operator) {
//       case OperatorEnum.equal:
//         return listValue ? x.value === this.getValue<ListValue>(fieldValue).listItemId : false;
//       case OperatorEnum.notEqual:
//         return listValue ? x.value !== this.getValue<ListValue>(fieldValue).listItemId : false;
//     }
//     return false;
//   }

//   getValue<T>(fieldValue: any): T {
//     return (<FieldValueDto<T>>fieldValue).value;
//   }

//   evalIntOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const operation = this.operatorHandler.getNumberOperation(x.operator);
//     return operation(x.value, this.getValue<number>(fieldValue));
//   }

//   evalDecimalOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const operation = this.operatorHandler.getNumberOperation(x.operator);
//     return operation(x.value, this.getValue<number>(fieldValue));
//   }

//   evalDateOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const ruleValue = moment(x.value).startOf('days').unix();
//     const actualValue = moment(this.getValue<Date>(fieldValue)).startOf('days').unix();
//     const operation = this.operatorHandler.getNumberOperation(x.operator);
//     return operation(ruleValue, actualValue);
//   }

//   evalBoolOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const ruleValue = +x.value;
//     const actualValue = +this.getValue<boolean>(fieldValue);
//     const operation = this.operatorHandler.getNumberOperation(x.operator);
//     return operation(ruleValue, actualValue);
//   }

//   evalTimeFieldOperator(x: CustomRule, fieldValue: FieldValueDtoBase): boolean {
//     const format = 'HH:mm';
//     const ruleValue: string = x.value;
//     const actualValue = moment(this.getValue<Date>(fieldValue)).format(format);
//     const operation = this.operatorHandler.getStringOperation(x.operator);
//     return operation(ruleValue, actualValue);
//   }

//   /**
//    *
//    * @param e
//    * @param valueAcc
//    *
//    */
//   evaluateFunction(expression: RuleSetCustom, valueAcc: IGetValue): boolean {
//     let result = true;
//     const onlyFreeFieldsRules = expression.rules;
//     // const onlyFreeFieldsRules = e.rules.filter(x => !x.formRef);
//     switch (expression.condition) {
//       case 'or':
//         result = this.evaluateCurrentField(onlyFreeFieldsRules, result, valueAcc, false);
//         break;
//       case 'and':
//         result = this.evaluateCurrentField(onlyFreeFieldsRules, result, valueAcc, true);
//         break;
//     }
//     return result;
//   }

//   evaluateCurrentField(onlyFreeFieldsRules: CustomRule[], result: boolean, valueAcc: IGetValue, isAnd: boolean): boolean {
//     for (let i = 0; i < onlyFreeFieldsRules.length; i++) {
//       const rule = onlyFreeFieldsRules[i];

//       const temp = valueAcc.getValue(<FieldId>{
//         id: rule.fieldRef.id,
//         formId: rule.formRef ? rule.formRef.formId : null
//       });

//       if (!temp || !temp.value) {
//         return false;
//       }

//       const fieldToCompareWith = temp.value;

//       switch (rule.fieldRef.typeField) {
//         case FieldTypeIds.StringField:
//           result = result && this.evalStringOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.ListField:
//           result = result && this.evalListOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.IntField:
//           result = result && this.evalIntOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.DecimalField:
//           result = result && this.evalDecimalOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.DateField:
//           result = result && this.evalDateOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.BoolField:
//           result = result && this.evalBoolOperator(rule, fieldToCompareWith);
//           break;
//         case FieldTypeIds.TimeField:
//           result = result && this.evalTimeFieldOperator(rule, fieldToCompareWith);
//       }

//       if (!result && isAnd) {
//         break;
//       }

//       if (result && !isAnd) {
//         break;
//       }
//     }

//     return result;
//   }
// }
