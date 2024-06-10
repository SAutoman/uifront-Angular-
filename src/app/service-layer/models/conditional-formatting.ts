export interface ConditionalFormatting {
  name?: string;
  conditionFormula: string; // stringified FormulaConfig
  formatting?: Formatting;
  isDisabled?: boolean;
}

export interface Formatting {
  types: [FormattingType];
  className: string;
}

export enum FormattingType {
  Other = 0,
  Grid = 1,
  Kanban = 2
  // can be extended
}
