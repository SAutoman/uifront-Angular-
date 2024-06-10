import { CustomSearchType } from './CustomSearchType';
import { SearchFieldModel } from './SearchFieldModel';

export interface CustomSearchFilter extends SearchFieldModel {
  customSearchType: CustomSearchType;
}
