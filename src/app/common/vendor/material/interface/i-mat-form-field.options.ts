import { MatFormFieldAppearance } from '@angular/material/form-field';
import { FloatLabelType, ThemePalette } from '@angular/material/core';

export interface IMatFormFieldOptions {
  appearance?: MatFormFieldAppearance;
  color?: ThemePalette;
  floatLabel?: FloatLabelType;
  hideRequiredMarker?: boolean;
  hintLabel?: string;
}
