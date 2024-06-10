import { FormGroup } from '@angular/forms';

export interface IEditableListItemUpdateEvent<T = any> {
  item: T;
  newValue: T;
  valid: boolean;
  form: FormGroup;
}
