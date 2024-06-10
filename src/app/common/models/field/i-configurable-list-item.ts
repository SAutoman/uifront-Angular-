import { DataEntity, AreaTypeEnum, FieldTypeIds, IAreaTypeObj } from '@wfm/service-layer';
import { IFieldConfiguration } from './i-field.configuration';

/**
 * local
 */
export interface IConfigurableListItem<T = IFieldConfiguration> extends DataEntity {
  /**
   * normalized field name, use convertFieldName  for normalize it from viewName
   * on in lists whe have only this name
   */
  name: string;
  /**
   * User entered field name, connect this field with form
   */
  viewName?: string;
  /**
   * all related information about field, this section used in Formly config for build field, options and validations
   */
  configuration?: T;
  /**
   * ui field, put true if model has been changed
   */
  isChanged?: boolean;
  /**
   * this field is required for all field dto
   */
  type?: FieldTypeIds | number | string | any;
  /**
   * ui field put as true for new client model, if present, before send request to server reset this.id = undefined
   */
  isClientId?: boolean;
  /**
   * ui field, connect this value with validations
   */
  isValid?: boolean;
  /**
   * if present will ignore this.configuration.validators
   */
  skipValidators?: boolean;
  /**
   * it means this field is disabled for changes, use it for static models which required for forms of processes
   */
  isLockedField?: boolean;
  /**
   * related collection of areas where possible to use this field
   */
  useIn?: AreaTypeEnum[];
  /**
   * ui field, mapped object value from this.useIn
   */
  useInObj?: IAreaTypeObj<boolean>;
  /**
   * all dynamical  information  about field designed for ui behavior, but in some  case we can put there  specific related values from server
   */
  [key: string]: any;
  /**
   * mapable if needed
   */
  areaTypeNames?: string[];
}
