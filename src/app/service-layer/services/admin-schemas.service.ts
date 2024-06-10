/**
 * global
 */
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import {
  IBuilderUiResultModel,
  IFieldSettings,
  IFieldsExpressionView,
  IFunctionItemModel,
  ISchemaFieldRule
} from '@wfm/forms-flow-struct/interface';
import {
  AreaTypeEnum,
  IFieldBaseDto,
  SchemaFieldDto,
  SchemaDto,
  Sorting,
  UpdateSchemaCommand,
  SchemasService,
  SchemasCacheService,
  ListsCacheService,
  ListFullData
} from '@wfm/service-layer';
import { IConfigurableListItem } from '@wfm/common/models';
import {
  AreaTypeOption,
  FieldTypeIds,
  ICreateTenantFieldDto,
  Operation,
  PagedData,
  Paging,
  ValidatSchemasRelation
} from '@wfm/service-layer/models';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { Guid } from '@wfm/shared/guid';
import { Expression } from '@wfm/service-layer/models/expressionModel';
import { getSystemFields } from '@wfm/forms-flow-struct/form-function-builder/system-fields';
/**
 * local
 */
import { AdminTenantFieldsService } from './admin-tenant-fields.service';
import { ListsService } from './lists.service';
import { ErrorHandlerService } from './error-handler.service';

export interface SchemaGridRow {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  srcData: SchemaDto;
  fields: IConfigurableListItem[];
}

@Injectable()
export class AdminSchemasService {
  constructor(
    private schemaService: SchemasService,
    private tenantFieldsService: AdminTenantFieldsService,
    private listService: ListsService,
    private listsCacheService: ListsCacheService,
    private store: Store<any>,
    private schemasCacheService: SchemasCacheService,
    private errorHandlerService: ErrorHandlerService
  ) {}

  getAreaEnumOptions(): Array<AreaTypeOption> {
    return [
      {
        id: -1,
        title: 'All'
      },
      {
        id: AreaTypeEnum.rawData,
        title: 'Raw Data'
      },
      {
        id: AreaTypeEnum.case,
        title: 'Case'
      },
      {
        id: AreaTypeEnum.stepForm,
        title: 'Process Step'
      },
      {
        id: AreaTypeEnum.comment,
        title: 'Comment'
      }
    ];
  }
  /**
   *
   * @param tenantId
   * get array of schemas converted to IConfigurableListItems
   */

  getAllSchemasAsListItems(tenantId: string): Promise<IConfigurableListItem[]> {
    const paging = {
      skip: 0,
      take: Number(1e5)
    };
    const sorting = [];
    return Promise.resolve(this.schemaService.getAllSchemas(tenantId, paging, sorting))
      .then((schemaListRes) => {
        const nestedItemArrays = schemaListRes.items;
        let flattened = nestedItemArrays.reduce((accumulator, arrayOfItems) => accumulator.concat(arrayOfItems), []);
        let items = this.schemaDtoToConfigurableListItem(flattened);
        return items;
      })
      .catch((err) => {
        return err;
      });
  }
  /**
   * get list of schemas by area, formatted to be shown in a grid
   * @param tenantId
   * @param paging
   * @param sorting
   * @param area
   */

  getList(tenantId: string, paging?: Paging, sorting?: Sorting[], area?: AreaTypeEnum): Promise<PagedData<SchemaGridRow>> {
    if (!paging) {
      paging = {
        skip: 0,
        take: Number(1e5)
      };
    }
    if (!sorting) {
      sorting = [];
    }

    return this.schemaService.search(tenantId, area, paging, sorting).then((schemas) => {
      const data: PagedData<SchemaGridRow> = {
        total: schemas.total,
        items: schemas.items.map((x) => this.schemaToFormDto(x))
      };
      return data;
    });
  }

  async delete(tenantId: string, schemaId: string, area: AreaTypeEnum): Promise<Operation> {
    return this.schemaService.deleteById(schemaId, tenantId, area);
  }

  /**
   * get schema by id
   * @param tenantId
   * @param area
   * @param schemaId
   */
  getSchema(tenantId, area: AreaTypeEnum, schemaId: string): Promise<SchemaDto> {
    return new Promise(async (res, rej) => {
      try {
        let cachedSchema = await this.schemasCacheService.get(schemaId, 60, async () => {
          const schema = await this.schemaService.getById(schemaId, tenantId, area);
          for (let field of schema.fields) {
            if (field.type === FieldTypeIds.EmbededField) {
              try {
                if (schema.id !== field.configuration.schemaId) {
                  const nestedSchema = await this.getSchema(tenantId, field.configuration.schemaAreaType, field.configuration.schemaId);
                  field.fields = nestedSchema.fields;
                  field.functions = nestedSchema.functions;
                }
              } catch (nestedSchemaGetError) {
                console.log('Failed to retrieve nested schema: ', nestedSchemaGetError);
              }
            } else if (field.type === FieldTypeIds.ListField || field.type === FieldTypeIds.MultiselectListField) {
              try {
                const listData = await this.populateListFullData(field.configuration.listId, tenantId);
                field.configuration.listOptions = listData?.items;
                field.configuration.listData = cloneDeep(listData);
              } catch (error) {
                console.log('Failed to get list data:', error);
              }
            }
          }
          return schema;
        });
        return res(cachedSchema);
      } catch (error) {
        return rej(error);
      }
    });
  }

  /**
   * populate parent list data in listFullData recursively
   */
  async populateListFullData(listId: string, tenantId: string): Promise<ListFullData> {
    try {
      if (listId) {
        let listData = await this.listsCacheService.get(listId, 60, async () => await this.listService.getListData(tenantId, listId));

        if (listData.list.parentListId) {
          try {
            listData.parentList = await this.populateListFullData(listData.list.parentListId, tenantId);
          } catch (error) {
            console.log('Failed to get parent list data:', error);
          }
        }
        return listData;
      } else {
        return null;
      }
    } catch (error) {
      return error;
    }
  }

  /**
   * populate the fields of nested schemas (recursively will do the same for deep nested schema fields)
   */
  async populateNestedFieldsAndFunctions(schemaField: SchemaFieldDto, tenant): Promise<SchemaFieldDto> {
    try {
      const schemaDto = await this.getSchema(
        tenant,
        schemaField.configuration?.schemaAreaType || schemaField.area,
        schemaField.configuration?.schemaId || schemaField.id
      );
      schemaField.fields = schemaDto.fields;
      schemaField.functions = schemaDto.functions;
      return schemaField;
    } catch (err) {
      // skip field population for corrupted ones
      return schemaField;
    }
  }

  /**
   * format schema to be rendered as a grid row
   * @param requestData
   */

  schemaToFormDto(requestData: SchemaDto): SchemaGridRow {
    const form: SchemaGridRow = {
      id: requestData.id,
      name: requestData.name,
      createdAt: requestData.createdAt,
      updatedAt: requestData.updatedAt,
      srcData: requestData,
      fields: requestData.fields
        ? requestData.fields.map((f: SchemaFieldDto) => {
            const field = {
              ...BaseFieldConverter.toUi(f),
              required: true,
              type: f.type
            };
            return field;
          })
        : []
    };
    return form;
  }

  createOrUpdate(model: IBuilderUiResultModel, tenantId: string, area: AreaTypeEnum, schema?: SchemaDto): Promise<string> {
    if (model.isUpdateMode) {
      return this.updateSchema(tenantId, area, model, schema);
    }
    return this.createSchema(area, model);
  }

  private async createTenantFields(fields, area): Promise<SchemaFieldDto[]> {
    let promises = [];
    promises = fields.map(async (field) => {
      return this.createField(field, area);
    });
    return await Promise.all(promises)
      .then((customFieldsRes) => {
        return customFieldsRes.map((field) => {
          return this.mapTenantFieldToSchemaField(field, true);
        });
      })
      .catch((err) => {
        throw new Error(err.message || err);
      });
  }

  /**
   * create new/custom tenant field (also from schemas for nested schema structures)
   * @param field
   * @param area
   */

  private async createField(field: IConfigurableListItem, area: AreaTypeEnum): Promise<IFieldBaseDto> {
    const cmd: ICreateTenantFieldDto = {
      ...BaseFieldConverter.toDto(field),
      id: undefined,
      tenantId: field.tenantId,
      isSystem: false,
      areaTypes: [area]
    };

    if (cmd.type === FieldTypeIds.EmbededField || cmd.type === FieldTypeIds.ListOfLinksField) {
      cmd.configuration.schemaId = cmd.configuration.schemaId || field.id;
      cmd.configuration.schemaAreaType = cmd.configuration.schemaAreaType || cmd.area;

      delete cmd.area;
      delete cmd.isSchema;
      delete cmd.fields;
    }
    try {
      const operation = await this.tenantFieldsService.create(cmd);
      if (operation?.status?.toString()?.toLowerCase() === 'success') {
        const result = await this.tenantFieldsService.getById(cmd.tenantId, operation.targetId);
        return result;
      }
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  private async createSchema(area: AreaTypeEnum, model: IBuilderUiResultModel): Promise<string> {
    try {
      model = await this.processSchemaFields(model, area);
      const cmd: SchemaDto = {
        id: undefined,
        status: null,
        name: model.name,
        functions: model.functions ? this.mapFunctionsForBackend(model.functions) : [],
        areaType: area,
        tenantId: model.tenantId,
        fields: model.fields.map((x) => {
          let field;
          if (x.isNewlyCreated) {
            // field is just received from API (it is of type IFieldBaseDto)
            field = {
              ...x,
              schemaFieldConfiguration: undefined
            };
            delete field.isNewlyCreated;
          } else {
            field = {
              ...BaseFieldConverter.toDto(x),
              schemaFieldConfiguration: undefined
            };
          }
          return field as SchemaFieldDto;
        }),
        schemaConfiguration: model.schemaConfiguration
      };
      const operationReq = await this.schemaService.create(cmd);
      if (operationReq?.status?.toString()?.toLowerCase() === 'success') return operationReq?.targetId;
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      throw new Error(error.message);
    }
  }

  private async updateSchema(tenantId: string, area: AreaTypeEnum, newModel: IBuilderUiResultModel, schema: SchemaDto): Promise<string> {
    try {
      newModel = await this.processSchemaFields(newModel, area);
      const newSchema: SchemaDto = {
        ...schema,
        name: newModel.name,
        functions: newModel.functions ? this.mapFunctionsForBackend(newModel.functions) : [],
        fields: newModel.fields.map((x) => {
          let field;
          if (x.isNewlyCreated) {
            // field is just received from API (it is of type IFieldBaseDto)
            field = {
              ...x,
              schemaFieldConfiguration: undefined
            };
            delete field.isNewlyCreated;
          } else {
            field = {
              ...BaseFieldConverter.toDto(x),
              schemaFieldConfiguration: undefined
            };
          }
          return field;
        }),
        schemaConfiguration: newModel.schemaConfiguration
      };
      const cmd: UpdateSchemaCommand = {
        id: schema.id,
        newTemplate: newSchema
      };
      const operationReq = await this.schemaService.update(cmd, tenantId, area);
      if (operationReq?.status?.toString()?.toLowerCase() === 'success') return operationReq?.targetId;
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      throw new Error(error.message || error);
    }
  }

  async processSchemaFields(model: IBuilderUiResultModel, area: AreaTypeEnum): Promise<IBuilderUiResultModel> {
    try {
      let newFields = [];
      let existingFields = [];
      model.fields.forEach((field) => {
        (field.isCustom && field.isClientId) || field.isSchema ? newFields.push(field) : existingFields.push(field);
      });
      newFields = await this.createTenantFields(newFields, area);
      model.fields = [...newFields, ...existingFields];
      return model;
    } catch (error) {
      throw new Error(error.message || error);
    }
  }

  private mapTenantFieldToSchemaField(tenantField: IFieldBaseDto, isNew?: boolean): SchemaFieldDto {
    const mapped: SchemaFieldDto = {
      ...tenantField,
      schemaFieldConfiguration: undefined
    };
    if (isNew) {
      mapped.isNewlyCreated = true;
    }

    return mapped;
  }

  private schemaDtoToConfigurableListItem(schemas: Array<SchemaDto>): Array<IConfigurableListItem> {
    const schemaListItems = schemas.map((schema) => {
      let item = {
        tenantId: schema.tenantId,
        id: schema.id,
        name: schema.name,
        viewName: schema.name,
        configuration: { position: 0 },
        isChanged: false,
        type: FieldTypeIds.SchemaField,
        useIn: [],
        area: schema.areaType,
        fields: schema.fields
      } as IConfigurableListItem;
      return item;
    });
    return schemaListItems;
  }

  /**
   *
   * @param functions
   * remove the fields we do not need, make the changes to the structure
   */
  mapFunctionsForBackend(functions: IFunctionItemModel[]): Expression[] {
    const expressions = functions.map((f: IFunctionItemModel) => {
      const actionSettings = [];
      if (f.fieldsSettings?.length) {
        f.fieldsSettings.forEach((sett) => {
          if (sett) {
            actionSettings.push({
              fieldPath: sett.fieldPath,
              config: sett.config
            });
          }
        });
      }

      let expressionItem = {
        name: f.name,
        ruleSet: {
          condition: f.ruleSet.condition,
          rules: f.ruleSet.rules.map((r) => {
            return {
              operator: r.operator,
              value: r.value,
              propertyPath: r.propertyPath
            };
          })
        },
        forBackend: f.fieldsSettings?.length ? false : true,
        actionSettings: actionSettings.length ? actionSettings : null
      };
      return expressionItem;
    });
    return expressions;
  }

  /**
   *
   * @param expressions
   * add the fields we need for frontend, make the changes to the structure
   */

  mapFunctionForFrontend(schema: SchemaDto, expression: Expression): IFunctionItemModel {
    const f = cloneDeep(expression);
    const expressionModel = <IFunctionItemModel>{
      name: f.name,
      ruleSet: {
        condition: f.ruleSet.condition,
        rules: <ISchemaFieldRule[]>f.ruleSet.rules.map((r) => {
          let ruleField = this.getFieldByPath(r.propertyPath?.path, schema.fields);
          if (!ruleField) {
            ruleField = this.getSystemField(r.propertyPath?.path, getSystemFields());
          }
          return {
            valid: true,
            operator: r.operator,
            value: r.value,
            propertyPath: r.propertyPath,
            fieldRef: ruleField
          };
        }),
        valid: true
      },
      selectedFields: [],
      fieldsSettings: []
    };
    if (!f.forBackend && f.actionSettings?.length) {
      f.actionSettings.forEach((setting) => {
        let targetField: IConfigurableListItem;
        // find the target field by propertyPath (should work for nested fields too)
        targetField = this.getFieldByPath(setting?.fieldPath?.path, schema.fields);
        if (targetField) {
          expressionModel.selectedFields.push(targetField);
          expressionModel.fieldsSettings.push(<IFieldSettings>{
            field: targetField,
            fieldPath: setting?.fieldPath,
            config: setting?.config
          });
        }
      });
    }

    return expressionModel;
  }

  getExpressionsView(schema: SchemaDto, fields: IConfigurableListItem[], tenantId: string): IFieldsExpressionView[] {
    const functions = schema?.functions?.map((f: Expression) => {
      const expressionModel = this.mapFunctionForFrontend(schema, f);
      const uiExpression: IFieldsExpressionView = {
        name: f.name,
        id: f['id'] || Guid.createQuickGuidAsString(),
        selectedFieldIds: expressionModel?.fieldsSettings?.map((sett) => sett?.field?.id || null),
        fieldsUsedInRules: expressionModel?.ruleSet?.rules?.map((r) => r.fieldRef?.id) || [],
        fields: fields,
        tenant: tenantId,
        isValid: true,
        expressionModel: expressionModel,
        // for frontend
        configuration: {
          expanded: false,
          isChanged: false,
          valid: true
        }
      };
      return uiExpression;
    });
    return functions;
  }

  /**
   *
   * @param path
   * @param fields
   * @returns
   * recursively loops through fields and nested fields to
   * find the correct field based on propertyPath
   */
  getFieldByPath(path: Array<string>, fields: SchemaFieldDto[]): IConfigurableListItem {
    if (path) {
      let foundField;
      const pathCopy = [...path];
      let pathItem = pathCopy.splice(0, 1);

      foundField = fields?.find((field) => {
        const fieldName = field.fieldName || field.name;
        return fieldName === pathItem[0];
      });
      if (foundField) {
        if (pathCopy.length === 0) {
          // we are at the end of the path, return the field
          return BaseFieldConverter.toUi(foundField);
        } else {
          // go deeper into the nested fields/schemas
          return this.getFieldByPath(pathCopy, foundField.fields);
        }
      }
      return null;
    }
    return null;
  }

  getSystemField(path: Array<string>, fields: IConfigurableListItem[]): IConfigurableListItem {
    return fields?.find((field) => path[0] === (field.fieldName || field.name)) || null;
  }

  // fetchSchemas(tenantId: string) {
  //   this.store.dispatch(new ClearAllSchemas());
  //   const areaTypes =
  //     this.getAreaEnumOptions()
  //       .filter((x) => x.id.toString() !== AreaTypeAll.toString())
  //       .map((x) => x.id)
  //       .sort((a, b) => {
  //         return a - b;
  //       }) || [];
  //   if (areaTypes.length > 0) {
  //     areaTypes.forEach((x) => {
  //       this.store.dispatch(
  //         new LoadSchemasByAreaType({
  //           tenantId: tenantId,
  //           paging: { skip: 0, take: 999 },
  //           sorting: [],
  //           area: x
  //         })
  //       );
  //     });
  //   }
  // }

  async checkForCircularDependency(tenantId: string, parentSchemaId: string, childSchemaId: string): Promise<boolean> {
    try {
      const response: ValidatSchemasRelation = await this.schemaService.validateSchemasRelation(tenantId, parentSchemaId, childSchemaId);
      return response.isAllowed;
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      return false;
    }
  }

  async cleanupRemovedFieldsFromEntities(tenantId: string, schemaId: string, schemaFieldIds: string[]): Promise<Operation> {
    return await this.schemaService.deleteFieldsValuesFromEntities(tenantId, schemaId, schemaFieldIds);
  }
}
