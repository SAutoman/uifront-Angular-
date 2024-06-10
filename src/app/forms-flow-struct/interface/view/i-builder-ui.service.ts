import { Observable, Subject } from 'rxjs';

import { IConfigurableListItem } from '@wfm/common/models';
import { IFunctionItemModel } from '../expression/expressionModelUI';
import { SchemaConfiguration } from '@wfm/service-layer';

/**
 * TODO  update logic for new design
 * https://www.figma.com/file/r3LgxbfdKixRA690CLgJPb/Cargoclix?node-id=66%3A1176
 * https://jira.cargoclix.com/browse/WFM-890
 */

/**
 * Output result of model
 */
export interface IBuilderUiResultModel {
  /**
   * Id of group (form|process...)
   */
  id?: string;
  // tmp value which  exists only  for component model
  tenantId: string;
  isUpdateMode: boolean;

  /**
   * name of group  (form|process...)
   */
  name: string;
  fields: IConfigurableListItem<any>[];
  /**
   * image for this group (form|process...)
   */
  imageId?: string;

  functions?: IFunctionItemModel[];
  schemaConfiguration?: SchemaConfiguration;
}

export enum BuilderToolbarFeature {
  setFormName = 'setFormName',
  addField = 'addField',
  manageFunctions = 'manageFunctions',
  addImage = 'addImage',
  updateForm = 'updateForm',
  saveForm = 'saveForm',
  conditionalFormatting = 'conditionalFormatting',
  fastCreateSettings = 'fastCreateSettings',
  linkedListFields = 'linkedListFields',
  dataLifetimeSettings = 'dataLifetimeSettings',
  schemaValidators = 'schemaValidators',
  fieldsVisibilityInGrid = 'fieldsVisibilityInGrid'
}
export interface IToolBarActions {
  show?: boolean;
  features?: BuilderToolbarFeature[];
}
export interface IBuilderUiLayoutSettings {
  newFormTitle?: string;
  updateFormTitle?: string;
  formPreviewTitle?: string;
  schemaNameFieldLabel?: string;
  toolBarActions?: IToolBarActions;
}
export interface IBuilderUiPageData {
  name?: string;
  /**
   * fields that user can select to be added to the schema
   */
  selectFields?: IConfigurableListItem[];
  /**
   * selected fields in schema
   */
  formFields?: IConfigurableListItem[];
}
export interface IAddRequiredFieldsEvent {
  tenantId: string;
  items: IConfigurableListItem[];
}

export interface IBuilderUiService {
  /**
   * optional properties for layout
   */
  layoutSettings?: IBuilderUiLayoutSettings;
  pageData$?: Subject<IBuilderUiPageData>;
  cmdAddRequiredFields$?: Subject<IAddRequiredFieldsEvent>;

  /**
   * @description Initialize  model for work
   * @param tenantId
   * @param itemId if exists use existing model, else create empty
   */
  init(tenantId: string, entityId?: string): void;

  /**
   * @description upsert method, use it for save created or updated data
   * @param model
   * @returns success of fail result
   */
  createOrUpdate(model: IBuilderUiResultModel, tenantId?: string): Observable<boolean>;
}
