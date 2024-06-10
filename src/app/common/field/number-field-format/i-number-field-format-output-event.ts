export interface NumberFormatSettings {
  minFractionDigits: number;
  maxFractionDigits: number;
  minIntegerDigits: number;
}

export interface INumberFormatOutput extends NumberFormatSettings {
  dirty: boolean;
  valid: boolean;
}
