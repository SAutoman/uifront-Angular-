// /**
//  * global
//  */
// import { TestBed, async } from '@angular/core/testing';

// /**
//  * project
//  */
// import { CustomRule } from '@wfm/forms/models';
// import { FieldTypeIds, FieldValueDto } from '@wfm/service-layer';
// import { OperatorEnum } from '@wfm/common/models';

// /**
//  * local
//  */
// import { FunctionEvaluateService } from './function-evaluate.service';

// const dateFieldFactory: (timestamp: number) => FieldValueDto<Date> = (timestamp: number) => {
//   const date = new Date(timestamp);

//   return {
//     id: '',
//     type: FieldTypeIds.DateField,
//     value: date
//   } as FieldValueDto<Date>;
// };
// const dateRuleFactory: (timestamp: number, operator: string) => CustomRule = (timestamp: number, operator: string) => {
//   const date = new Date(timestamp);
//   return {
//     field: undefined,
//     fieldRef: undefined,
//     formRef: undefined,
//     value: date,
//     operator
//   } as CustomRule;
// };

// describe('function-evaluate.service.ts', () => {
//   let service: FunctionEvaluateService;
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({ providers: [FunctionEvaluateService] });
//     service = TestBed.inject(FunctionEvaluateService);
//   }));

//   it('evalDateOperator: a == b  should be Truthy', () => {
//     const a = dateRuleFactory(1000000, OperatorEnum.equal);
//     const b = dateFieldFactory(1000000);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });
//   it('evalDateOperator: a != b  should be Truthy', () => {
//     const a = dateRuleFactory(5000000000, OperatorEnum.notEqual);
//     const b = dateFieldFactory(6000000000);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });

//   it('evalDateOperator: a > b  should be Truthy', () => {
//     const a = dateRuleFactory(300000000, OperatorEnum.moreThan);
//     const b = dateFieldFactory(20000000);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });

//   it('evalDateOperator: a >= b  should be Truthy', () => {
//     const a = dateRuleFactory(1000000, OperatorEnum.moreThanOrEqual);
//     const b = dateFieldFactory(1000000);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });

//   it('evalDateOperator: a < b  should be Truthy', () => {
//     const a = dateRuleFactory(123456789, OperatorEnum.lessThan);
//     const b = dateFieldFactory(223456789);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });

//   it('evalDateOperator: a <= b  should be Truthy', () => {
//     const a = dateRuleFactory(1000000, OperatorEnum.lessThanOrEqual);
//     const b = dateFieldFactory(1000000);
//     expect(service.evalDateOperator(a, b)).toBeTruthy();
//   });
// });
