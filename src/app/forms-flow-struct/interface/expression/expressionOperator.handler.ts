import { RuleCustomOperatorEnum } from '@wfm/service-layer/models/expressionModel';
import { isUndefinedOrNull } from '@wfm/shared/utils';

const RuleOperatorMap: Map<number, RuleCustomOperatorEnum> = (() => {
  const operators = new Map<number, RuleCustomOperatorEnum>();
  [
    RuleCustomOperatorEnum.Equal,
    RuleCustomOperatorEnum.NotEqual,
    RuleCustomOperatorEnum.MoreThan,
    RuleCustomOperatorEnum.MoreThanOrEqual,
    RuleCustomOperatorEnum.LessThan,
    RuleCustomOperatorEnum.LessThanOrEqual,
    RuleCustomOperatorEnum.IsEmpty,
    RuleCustomOperatorEnum.IsNotEmpty
  ].map((x) => operators.set(x, x));
  return operators;
})();

const NumberOperations: Map<RuleCustomOperatorEnum, (a: number, b: number) => boolean> = (() => {
  const operators = new Map<RuleCustomOperatorEnum, (a: number, b: number) => boolean>();
  operators.set(RuleCustomOperatorEnum.Equal, (a, b) => a === b);
  operators.set(RuleCustomOperatorEnum.NotEqual, (a, b) => !isUndefinedOrNull(a) && a !== b);
  operators.set(RuleCustomOperatorEnum.MoreThan, (a, b) => !isUndefinedOrNull(a) && a > b);
  operators.set(RuleCustomOperatorEnum.MoreThanOrEqual, (a, b) => !isUndefinedOrNull(a) && a >= b);
  operators.set(RuleCustomOperatorEnum.LessThan, (a, b) => !isUndefinedOrNull(a) && a < b);
  operators.set(RuleCustomOperatorEnum.LessThanOrEqual, (a, b) => !isUndefinedOrNull(a) && a <= b);
  operators.set(RuleCustomOperatorEnum.IsEmpty, (a, b) => isUndefinedOrNull(a));
  operators.set(RuleCustomOperatorEnum.IsNotEmpty, (a, b) => !isUndefinedOrNull(a));

  return operators;
})();

const StringOperations: Map<RuleCustomOperatorEnum, (a: string, b: string) => boolean> = (() => {
  const operators = new Map<RuleCustomOperatorEnum, (a: string, b: string) => boolean>();
  operators.set(RuleCustomOperatorEnum.Equal, (a, b) => a === b);
  operators.set(RuleCustomOperatorEnum.NotEqual, (a, b) => a !== b);
  operators.set(RuleCustomOperatorEnum.MoreThan, (a, b) => a > b);
  operators.set(RuleCustomOperatorEnum.MoreThanOrEqual, (a, b) => a >= b);
  operators.set(RuleCustomOperatorEnum.LessThan, (a, b) => a < b);
  operators.set(RuleCustomOperatorEnum.LessThanOrEqual, (a, b) => a <= b);
  operators.set(RuleCustomOperatorEnum.IsEmpty, (a, b) => b === undefined || b === null || b === '');
  operators.set(RuleCustomOperatorEnum.IsNotEmpty, (a, b) => b !== undefined && b !== null && b !== '');

  return operators;
})();

export interface IRuleOperatorHandler {
  isOperator(value: string | number): boolean;
  // isExpected(value: string|number, expectedValue: RuleCustomOperatorEnum): boolean;
  getOperatorEnum(value: string | number): RuleCustomOperatorEnum;
  // toSaveValue(value?: string|number): string|number;
  // isContainOperator(operators: RuleCustomOperatorEnum[], value: string): boolean;
  // getOperators(): RuleCustomOperatorEnum[];
  getNumberOperation(operator: string | number): (a: number, b: number) => boolean;
  getStringOperation(operator: string | number): (a: string, b: string) => boolean;
}

export class RuleOperatorHandler implements IRuleOperatorHandler {
  isOperator(value: RuleCustomOperatorEnum): boolean {
    return RuleOperatorMap.has(value);
  }
  // isExpected(value: string|number, expectedValue: string|number): boolean {
  //   if (!value || !expectedValue || !this.isOperator(value) || !this.isOperator(expectedValue)) {
  //     return false;
  //   }
  //   const expected = this.toSaveValue(value);
  //   return RuleOperatorMap.get(this.toSaveValue(value)) === expected;
  // }

  getOperatorEnum(value: RuleCustomOperatorEnum): RuleCustomOperatorEnum {
    return RuleOperatorMap.get(value);
  }
  // toSaveValue(value?: string|number): string|number {
  //   if (typeof value === 'object') {
  //     return '';
  //   }
  //   return (value || '').toString().trim();
  // }
  // isContainOperator(operators: string[]|number[], value: string): boolean {
  //   const operator = this.getOperatorEnum(value);
  //   return (operators || []).some((x) => x === operator);
  // }
  // getOperators(): RuleCustomOperatorEnum[] {
  //   return [...RuleOperatorMap.values()];
  // }
  getNumberOperation(operator: RuleCustomOperatorEnum): (a: number, b: number) => boolean {
    if (!this.isOperator(operator)) {
      return () => false;
    }
    return NumberOperations.get(this.getOperatorEnum(operator));
  }
  getStringOperation(operator: RuleCustomOperatorEnum): (a: string, b: string) => boolean {
    if (!this.isOperator(operator)) {
      return () => false;
    }
    return StringOperations.get(this.getOperatorEnum(operator));
  }
}
