import { IConfigurableListItem } from '../models';

export interface IFormUpdateInfo {
  formFields: IConfigurableListItem[];
  removedFields: IConfigurableListItem[];
  addedFields: IConfigurableListItem[];
  updatedFields: IConfigurableListItem[];
}
export interface IFormEvent<T = any> {
  formRef: T;
  formName: string;
  fields: IConfigurableListItem[];
  valid?: boolean;
  changed?: boolean;
}
