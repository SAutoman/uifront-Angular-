/**
 * global
 */

/**
 * project
 */
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';

/**
 * local
 */
import { DataEntity } from './model';

export enum SearchProfileType {
  Unknown = 0,
  RawDataListSearchProfile = 1,
  CaseListSearchProfile = 2
}

export interface SearchProfile extends DataEntity {
  name: string;
}

export interface DynamicEntitySearchProfile extends SearchProfile {
  search: SearchFieldModel[]; // contain search fields of any kind rawdatasearchfields and so on
  schemaId: string;
}

export interface DynamicEntitySearchProfileUI {
  id: string;
  name: string;
  searchFields: SearchFieldModel[];
  fromUser: string;
  fromGroup: string;
  schemaId?: string;
}
