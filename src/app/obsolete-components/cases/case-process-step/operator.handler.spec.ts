// /**
//  * global
//  */
// import { async } from '@angular/core/testing';

// /**
//  * project
//  */

// /**
//  * local
//  */
// import { OperatorHandler } from './operator.handler';
// import { OperatorEnum } from '@wfm/common/models/operator.enum';

// describe('operator.handler.ts', () => {
//   let handler: OperatorHandler;
//   const _operators = [
//     OperatorEnum.equal,
//     OperatorEnum.notEqual,
//     OperatorEnum.moreThan,
//     OperatorEnum.moreThanOrEqual,
//     OperatorEnum.lessThan,
//     OperatorEnum.lessThanOrEqual
//   ] as OperatorEnum[];
//   beforeEach(async(() => {
//     handler = new OperatorHandler();
//   }));

//   it(`isOperator:[] is correct operatos(['=', '!=', '>', '>=', '<', '<='])  should be Truthy`, () => {
//     const operators = _operators.map((x) => handler.isOperator(x));
//     expect(operators.every((x) => !!x)).toBeTruthy();
//   });

//   it(`isOperator:[] is correct operatos with space([' =', '!= ', '> ', '>= ', ' <', ' <='])  should be Truthy`, () => {
//     const operators = _operators.map((x) => handler.isOperator(x));
//     expect(operators.every((x) => !!x)).toBeTruthy();
//   });

//   it(`isExpected: ('=','')  should be falsy`, () => {
//     expect(handler.isExpected('=', '' as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: is isExpected ('=','undefined')  should be falsy`, () => {
//     expect(handler.isExpected('=', undefined as OperatorEnum)).toBeFalsy();
//   });

//   it(`isExpected: ("=", 'undefined')   should be falsy`, () => {
//     expect(handler.isExpected('=', 'undefined' as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: ("=", '"NaN"')   should be falsy`, () => {
//     expect(handler.isExpected('=', 'NaN' as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: ("=", '"null"')   should be falsy`, () => {
//     expect(handler.isExpected('=', 'null' as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: ('null', 'null')   should be falsy`, () => {
//     expect(handler.isExpected(null, null as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: ("=", 'qwe')   should be falsy`, () => {
//     expect(handler.isExpected('=', 'qwe' as OperatorEnum)).toBeFalsy();
//   });
//   it(`isExpected: ("qwe", '=')   should be falsy`, () => {
//     expect(handler.isExpected('qwe', '=' as OperatorEnum)).toBeFalsy();
//   });

//   it(`getOperatorEnum: operator '=' should be Truthy`, () => {
//     const operator = '=';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`getOperatorEnum operator '!=' should be Truthy`, () => {
//     const operator = '!=';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`getOperatorEnum operator '!=' should be Truthy`, () => {
//     const operator = '!=';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });
//   it(`getOperatorEnum operator '>' should be Truthy`, () => {
//     const operator = '>';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`getOperatorEnum operator '>=' should be Truthy`, () => {
//     const operator = '>=';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`getOperatorEnum operator '<' should be Truthy`, () => {
//     const operator = '<';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`getOperatorEnum operator '<=' should be Truthy`, () => {
//     const operator = '<=';
//     expect(handler.getOperatorEnum(operator)).toEqual(operator);
//     expect(handler.getOperatorEnum(operator + ' ')).toEqual(operator);
//     expect(handler.getOperatorEnum(' ' + operator + ' ')).toEqual(operator);
//   });

//   it(`toSaveValue: '=' should be Truthy`, () => {
//     expect(handler.toSaveValue('=')).toEqual('=');
//   });

//   it(`toSaveValue: '1' should be Truthy`, () => {
//     expect(handler.toSaveValue(1 as any)).toEqual('1');
//   });

//   it(`toSaveValue: '' should be Truthy`, () => {
//     expect(handler.toSaveValue('')).toEqual('');
//   });
//   it(`toSaveValue: ' ' should be Truthy`, () => {
//     expect(handler.toSaveValue(' ')).toEqual('');
//   });
//   it(`toSaveValue: 'null' should be Truthy`, () => {
//     expect(handler.toSaveValue(null)).toEqual('');
//   });
//   it(`toSaveValue: 'undefined' should be Truthy`, () => {
//     expect(handler.toSaveValue(undefined)).toEqual('');
//   });
//   it(`toSaveValue: 'NaN' should be Truthy`, () => {
//     expect(handler.toSaveValue(Number.NaN as any)).toEqual('');
//   });
//   it(`toSaveValue: '{}' should be Truthy`, () => {
//     expect(handler.toSaveValue({} as string)).toEqual('');
//   });

//   it(`isContainOperator: (['=', '!=', '>', '>=', '<', '<='],'<='") should be Truthy`, () => {
//     const operators = _operators as OperatorEnum[];
//     expect(handler.isContainOperator(operators, '<=')).toBeTruthy();
//   });
//   it(`isContainOperator: (['=', '!=', '>', '>=', '<', '<='],'a'") should be Falsy`, () => {
//     expect(handler.isContainOperator(_operators, 'a')).toBeFalsy();
//   });
//   it(`isContainOperator: (['=', '!=', '>', '>=', '<', '<='],'1'") should be Falsy`, () => {
//     expect(handler.isContainOperator(_operators, 1 as any)).toBeFalsy();
//   });

//   it(`getOperators: should be Truthy`, () => {
//     expect(handler.getOperators()).toEqual(_operators);
//   });

//   it(`getNumberOperation: equal (5,5) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.equal);
//     expect(operation(5, 5)).toBeTruthy();
//   });

//   it(`getNumberOperation: notEqual (5,6) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.notEqual);
//     expect(operation(5, 6)).toBeTruthy();
//   });

//   it(`getNumberOperation: lessThan (5,6) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.lessThan);
//     expect(operation(5, 6)).toBeTruthy();
//   });
//   it(`getNumberOperation: lessThan (6,6) should be Falsy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.lessThan);
//     expect(operation(6, 6)).toBeFalsy();
//   });

//   it(`getNumberOperation: lessThanOrEqual (6,6) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.lessThanOrEqual);
//     expect(operation(6, 6)).toBeTruthy();
//   });

//   it(`getNumberOperation: lessThanOrEqual (5,6) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.lessThanOrEqual);
//     expect(operation(5, 6)).toBeTruthy();
//   });

//   it(`getNumberOperation: moreThan (6,6) should be Falsy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.moreThan);
//     expect(operation(6, 6)).toBeFalsy();
//   });
//   it(`getNumberOperation: moreThan (6,5) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.moreThan);
//     expect(operation(6, 5)).toBeTruthy();
//   });

//   it(`getNumberOperation: moreThanOrEqual (6,5) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.moreThanOrEqual);
//     expect(operation(6, 5)).toBeTruthy();
//   });
//   it(`getNumberOperation: moreThanOrEqual (6,6) should be Truthy`, () => {
//     const operation = handler.getNumberOperation(OperatorEnum.moreThanOrEqual);
//     expect(operation(6, 6)).toBeTruthy();
//   });

//   it(`getStringOperation: equal ("abcd","abcd") should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.equal);
//     expect(operation('abcd', 'abcd')).toBeTruthy();
//   });

//   it(`getStringOperation: equal ("abcd","abcd ") should be Falsy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.equal);
//     expect(operation('abcd', 'abcd ')).toBeFalsy();
//   });

//   it(`getStringOperation: equal ("1","1") should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.equal);
//     expect(operation(1 as any, 1 as any)).toBeTruthy();
//   });

//   it(`getStringOperation: notEqual ("1","1") should be Falsy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.notEqual);
//     expect(operation(1 as any, 1 as any)).toBeFalsy();
//   });

//   it(`getStringOperation: notEqual ('abcd', 'abcd ') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.notEqual);
//     expect(operation('abcd', 'abcd ')).toBeTruthy();
//   });

//   it(`getStringOperation: lessThan ('abcd', 'qwert') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.lessThan);
//     expect(operation('abcd', 'qwert')).toBeTruthy();
//   });

//   it(`getStringOperation: lessThan ('abcd', 'qwer') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.lessThan);
//     expect(operation('abcd', 'qwer')).toBeTruthy();
//   });
//   it(`getStringOperation: lessThan ('qwer' , 'abcd') should be Falsy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.lessThan);
//     expect(operation('qwer', 'abcd')).toBeFalsy();
//   });

//   it(`getStringOperation: lessThanOrEqual ('abcd', 'qwerty') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.lessThanOrEqual);
//     expect(operation('abcd', 'qwerty')).toBeTruthy();
//   });
//   it(`getStringOperation: lessThanOrEqual ('abcd', 'abcd') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.lessThanOrEqual);
//     expect(operation('abcd', 'abcd')).toBeTruthy();
//   });

//   it(`getStringOperation: moreThan ('abcd', 'aaa') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.moreThan);
//     expect(operation('abcd', 'aaa')).toBeTruthy();
//   });

//   it(`getStringOperation: moreThan ('abcd', 'aaaa') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.moreThan);
//     expect(operation('abcd', 'aaaa')).toBeTruthy();
//   });
//   it(`getStringOperation: moreThan ('aaaa' , 'abcd') should be Falsy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.moreThan);
//     expect(operation('aaaa', 'abcd')).toBeFalsy();
//   });

//   it(`getStringOperation: moreThanOrEqual ('abcde', 'qwerty') should be Falsy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.moreThanOrEqual);
//     expect(operation('abcde', 'qwerty')).toBeFalsy();
//   });
//   it(`getStringOperation: moreThanOrEqual ('abcd', 'abcd') should be Truthy`, () => {
//     const operation = handler.getStringOperation(OperatorEnum.moreThanOrEqual);
//     expect(operation('abcd', 'abcd')).toBeTruthy();
//   });
// });
