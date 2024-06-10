import { Component, Input, OnInit } from '@angular/core';
import { AreaTypeEnum, DynamicEntityDto, SchemaDto, SchemaFieldDto } from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { LinkedRawDataDetails } from '../workflow-state-case-step.component';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';

@Component({
  selector: 'app-repeatable-step-title',
  templateUrl: './repeatable-step-title.component.html',
  styleUrls: ['./repeatable-step-title.component.scss']
})
export class RepeatableStepTitleComponent implements OnInit {
  @Input() linkedRawDataDetails: LinkedRawDataDetails;
  rawData: DynamicEntityDto;
  repeatableTitle: string = '';
  rawDataSchema: SchemaDto;

  constructor(private dynamicGridUiService: DynamicGridUiService, private adminSchemaService: AdminSchemasService) {}

  async ngOnInit() {
    if (this.linkedRawDataDetails) {
      await this.getRawDataSchema();
      this.rawData = this.linkedRawDataDetails.item;
      if (this.rawData && this.rawDataSchema) {
        this.populateTitle();
      }
    }
  }

  async getRawDataSchema(): Promise<void> {
    if (this.linkedRawDataDetails.schemaId) {
      this.rawDataSchema = await this.adminSchemaService.getSchema(
        this.linkedRawDataDetails.tenantId,
        AreaTypeEnum.rawData,
        this.linkedRawDataDetails.schemaId
      );
    }
  }

  async populateTitle(): Promise<void> {
    try {
      for (const [index, propPath] of this.linkedRawDataDetails.fieldPaths.entries()) {
        const baseField = this.getFieldByPath(propPath.path, this.rawData.fields);
        const data = await this.getSchemaAndField(propPath.path, this.rawDataSchema); // get the schema based on the path

        const formattedValue = baseField ? await this.dynamicGridUiService.getFormattedValue(baseField, data.schema) : '';
        if (data.field) {
          this.repeatableTitle += `<b>${data.field.displayName}</b>: ${formattedValue}`;
          if (index < this.linkedRawDataDetails.fieldPaths.length - 1) {
            this.repeatableTitle += ', ';
          }
        }
      }
    } catch (error) {
      console.log('error in repeatableStep title generator', error);
    }
  }

  async getSchemaAndField(path: string[], schema: SchemaDto): Promise<{ schema: SchemaDto; field: SchemaFieldDto }> {
    const schemaField = schema.fields.find((f) => {
      return f.fieldName === path[0];
    });
    if (schemaField) {
      if (path.length === 1) {
        return {
          schema: schema,
          field: schemaField
        };
      } else {
        const pathCopy = [...path];
        pathCopy.splice(0, 1);
        const embeddedSchema = await this.adminSchemaService.getSchema(
          this.linkedRawDataDetails.tenantId,
          schemaField.configuration.schemaAreaType,
          schemaField.configuration.schemaId
        );
        return await this.getSchemaAndField(pathCopy, embeddedSchema);
      }
    }
    return {
      schema: schema,
      field: null
    };
  }

  getFieldByPath(path: string[], baseFields: BaseFieldValueType[]): BaseFieldValueType {
    if (path?.length) {
      let foundField;
      const pathCopy = [...path];
      let pathItem = pathCopy.splice(0, 1);

      foundField = baseFields?.find((field) => {
        return field.id === pathItem[0];
      });
      if (foundField) {
        if (pathCopy.length === 0) {
          // we are at the end of the path, return the field
          return foundField;
        } else {
          // need to dig deeper in the nested fields/schemas
          return this.getFieldByPath(pathCopy, foundField.value as BaseFieldValueType[]);
        }
      } else {
        return null;
      }
    }
  }
}
