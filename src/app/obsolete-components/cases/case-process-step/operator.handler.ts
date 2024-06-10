// import { OperatorEnum } from '@wfm/common/models/operator.enum';

// const OperatorMap: Map<string, OperatorEnum> = (() => {
//   const operators = new Map<string, OperatorEnum>();
//   [
//     OperatorEnum.equal,
//     OperatorEnum.notEqual,
//     OperatorEnum.moreThan,
//     OperatorEnum.moreThanOrEqual,
//     OperatorEnum.lessThan,
//     OperatorEnum.lessThanOrEqual
//   ].map((x) => operators.set(x, x));
//   return operators;
// })();
// const NumberOperations: Map<OperatorEnum, (a: number, b: number) => boolean> = (() => {
//   const operators = new Map<OperatorEnum, (a: number, b: number) => boolean>();
//   operators.set(OperatorEnum.equal, (a, b) => a === b);
//   operators.set(OperatorEnum.notEqual, (a, b) => a !== b);
//   operators.set(OperatorEnum.moreThan, (a, b) => a > b);
//   operators.set(OperatorEnum.moreThanOrEqual, (a, b) => a >= b);
//   operators.set(OperatorEnum.lessThan, (a, b) => a < b);
//   operators.set(OperatorEnum.lessThanOrEqual, (a, b) => a <= b);
//   return operators;
// })();
// const StringOperations: Map<OperatorEnum, (a: string, b: string) => boolean> = (() => {
//   const operators = new Map<OperatorEnum, (a: string, b: string) => boolean>();
//   operators.set(OperatorEnum.equal, (a, b) => a === b);
//   operators.set(OperatorEnum.notEqual, (a, b) => a !== b);
//   operators.set(OperatorEnum.moreThan, (a, b) => a > b);
//   operators.set(OperatorEnum.moreThanOrEqual, (a, b) => a >= b);
//   operators.set(OperatorEnum.lessThan, (a, b) => a < b);
//   operators.set(OperatorEnum.lessThanOrEqual, (a, b) => a <= b);
//   return operators;
// })();

// export interface IOperatorHandler {
//   isOperator(value: string): boolean;
//   isExpected(value: string, expectedValue: OperatorEnum): boolean;
//   getOperatorEnum(value: string): OperatorEnum;
//   toSaveValue(value?: string): string;
//   isContainOperator(operators: OperatorEnum[], value: string): boolean;
//   getOperators(): OperatorEnum[];
//   getNumberOperation(operator: string): (a: number, b: number) => boolean;
//   getStringOperation(operator: string): (a: string, b: string) => boolean;
// }
// export class OperatorHandler implements IOperatorHandler {
//   isOperator(value: string): boolean {
//     return OperatorMap.has(this.toSaveValue(value));
//   }
//   isExpected(value: string, expectedValue: OperatorEnum): boolean {
//     if (!value || !expectedValue || !this.isOperator(value) || !this.isOperator(expectedValue)) {
//       return false;
//     }
//     const expected = this.toSaveValue(value);
//     return OperatorMap.get(this.toSaveValue(value)) === expected;
//   }
//   getOperatorEnum(value: string): OperatorEnum {
//     return OperatorMap.get(this.toSaveValue(value));
//   }
//   toSaveValue(value?: string): string {
//     if (typeof value === 'object') {
//       return '';
//     }
//     return (value || '').toString().trim();
//   }
//   isContainOperator(operators: OperatorEnum[], value: string): boolean {
//     const operator = this.getOperatorEnum(value);
//     return (operators || []).some((x) => x === operator);
//   }
//   getOperators(): OperatorEnum[] {
//     return [...OperatorMap.values()];
//   }
//   getNumberOperation(operator: string): (a: number, b: number) => boolean {
//     if (!this.isOperator(operator)) {
//       return () => false;
//     }
//     return NumberOperations.get(this.getOperatorEnum(operator));
//   }
//   getStringOperation(operator: string): (a: string, b: string) => boolean {
//     if (!this.isOperator(operator)) {
//       return () => false;
//     }
//     return StringOperations.get(this.getOperatorEnum(operator));
//   }
// }
