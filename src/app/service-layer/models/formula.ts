import { PropertyPath } from './expressionModel';
import { FieldTypeIds } from './FieldTypeIds';

export interface FormulaNamedExpression {
  key: string;
  formula: string;
  position?: number;
}
export interface FormulaField {
  // A1, B1, C1, etc
  key: string;
  fieldPath: PropertyPath;
  fieldType: FieldTypeIds;
}

export interface FormulaConfig {
  fields?: Array<FormulaField>;
  namedExpressions?: Array<FormulaNamedExpression>;
  expression: string;
}

export interface ParamDetails {
  name: string;
  information: string;
}

export interface FormulaDetails {
  name: string;
  description: string;
  formula: string;
  example: string;
  params?: ParamDetails[];
}

export interface FormulaLookupTable {
  [key: string]: FormulaDetails;
}

// use this constant in the formulas if you need to block the progressing of calculation (added for WFM-2915)
export const stopFormulaCalculationKey = '$EXIT'; // !!! DO NOT change the text
