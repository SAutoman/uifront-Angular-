import { ThemePalette } from '@angular/material/core';

export interface IMatDatetimePickerConfig {
  enableInput?: boolean;
  showSpinners?: boolean;
  showSeconds?: boolean;
  stepHour?: boolean;
  stepMinute?: boolean;
  stepSecond?: boolean;
  touchUi?: boolean;
  color?: ThemePalette;
  enableMeridian?: boolean;
  disableMinute?: boolean;
  hideTime?: boolean;
}
