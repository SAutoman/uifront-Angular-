/**
 * global
 */
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { FieldTypeIds } from '@wfm/service-layer/models/FieldTypeIds';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WorkflowState, workflowStatusesSelector } from '@wfm/store/workflow';
import { takeUntil } from 'rxjs/operators';

/**
 * local
 */
import { SchemaDto, SchemaTitleSettingModel, SettingsUI, UiAreasEnum, UploadedFile, WorkflowStatusDto } from '..';
import { BaseFieldValueType } from '../models/FieldValueDto';
import { DynamicGridUiService } from './dynamic-grid-ui.service';

@Injectable({
  providedIn: 'root'
})
export class TitleSettingsHelperService extends TenantComponent {
  statuses: { [key: string]: WorkflowStatusDto };

  constructor(private dynamicGridUiService: DynamicGridUiService, private store: Store<WorkflowState>) {
    super(store);
    this.store.pipe(select(workflowStatusesSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.statuses = x;
    });
  }

  /**
   * filter out the titleFields from dynamicEntity
   * or create an empty field if no value found in dynamicEntity
   *
   */
  populateTitleFields(
    dynamicEntityFields: BaseFieldValueType[],
    titleSettings: SchemaTitleSettingModel,
    systemFields?: SystemFieldsTitleFormatter[]
  ): BaseFieldValueType[] {
    let titleFields = [];
    if (titleSettings && titleSettings.fields) {
      const orderedFields = titleSettings.fields
        .map((field) => {
          return {
            name: field,
            position: titleSettings?.additionalSettings ? titleSettings?.additionalSettings[field]?.position : 0
          };
        })
        .sort((a, b) => {
          return a.position - b.position;
        });
      orderedFields.forEach((field) => {
        let deField = dynamicEntityFields.find((deField) => deField.id === field.name);
        const systemField = systemFields?.find((x) => x.id === field.name);
        if (systemFields?.length && systemField) {
          if (systemField?.id === GridSystemFieldsEnum.STATUS)
            deField = <BaseFieldValueType>{
              id: systemField.id,
              type: systemField.type,
              value: systemField.value ? this.statuses[systemField.value]?.name : null
            };
          else if (systemField?.id === GridSystemFieldsEnum.CREATED_AT)
            deField = <BaseFieldValueType>{
              id: systemField.id,
              type: systemField.type,
              value: systemField.value ? systemField.value : null
            };
          else if (systemField?.id === GridSystemFieldsEnum.UPDATED_AT)
            deField = <BaseFieldValueType>{
              id: systemField.id,
              type: systemField.type,
              value: systemField.value ? systemField.value : null
            };
          deField['isSystem'] = true;
        } else if (!deField) {
          deField = <BaseFieldValueType>{
            id: field.name,
            type: null,
            value: null
          };
        }
        titleFields.push(deField);
      });
    }
    return titleFields;
  }

  /**
   * based on the titleSettings and dynamicEntity.field values and schemaFields create a title
   *
   */
  async populateDynamicEntityTitle(
    titleFields: BaseFieldValueType[],
    titleSettings: SchemaTitleSettingModel,
    schema: SchemaDto,
    isRemoveBr = false
  ): Promise<string> {
    let title = '';
    if (schema && titleFields && titleFields.length && titleSettings) {
      for (const [index, field] of titleFields.entries()) {
        let fieldValue;
        if (!field['isSystem']) {
          fieldValue = await this.dynamicGridUiService.getFormattedValue(field, schema, true);
          if (field.type === FieldTypeIds.FileField) {
            fieldValue = (<UploadedFile>fieldValue)?.fileInfo?.fileName;
          }
        } else {
          fieldValue = field.value;
        }
        const schemaField = schema.fields.find((schemaField) => schemaField.fieldName === field.id);
        let symbolsFieldName = null;
        let symbolsValue = null;
        // if there is additionalSettings for the subject field, show subsctring of the displayName
        if (titleSettings && titleSettings.additionalSettings && titleSettings.additionalSettings[field.id]) {
          symbolsFieldName = titleSettings.additionalSettings[field.id].numberOfSymbolsFieldName;
          // IF the field is hyperLink consider the full string length else truncate.
          symbolsValue = schemaField?.schemaFieldConfiguration?.isHyperlink
            ? fieldValue?.length
            : titleSettings.additionalSettings[field.id].numberOfSymbolsFieldValue;
        }

        const truncatedDisplayName = this.truncateDisplayName(
          schemaField ? schemaField?.displayName : this.getSystemFieldName(field.id),
          symbolsFieldName
        );
        const truncatedValue = this.truncateValue(fieldValue, symbolsValue);
        if (!truncatedDisplayName) {
          title += `${truncatedValue}`;
        } else {
          title += `${truncatedDisplayName} ${titleSettings.keyValueSeparator} ${truncatedValue}`;
        }
        // if the field is not the last one
        if (index < titleFields.length - 1) {
          if (titleSettings.fieldSeparator === 'New Line') {
            if (isRemoveBr) {
              title += '';
            } else {
              if (titleSettings.area === UiAreasEnum.visualUnitDynamicTitle) {
                title += '\n';
              } else {
                title += '<br>';
              }
            }
          } else {
            title += ` ${titleSettings.fieldSeparator} `;
          }
        }
      }
    }
    return title;
  }

  getSystemFieldName(field: string): string {
    switch (field) {
      case GridSystemFieldsEnum.STATUS:
        return 'Status';
      case GridSystemFieldsEnum.CREATED_AT:
        return 'CreatedAt';
      case GridSystemFieldsEnum.UPDATED_AT:
        return 'UpdatedAt';
      default:
        break;
    }
  }

  truncateDisplayName(fieldName: string, numberOfSymbols: number): string {
    let truncatedName = '';
    if (fieldName) {
      if (numberOfSymbols > 0) {
        truncatedName = fieldName.substring(0, numberOfSymbols);
      } else if (numberOfSymbols === 0) {
        truncatedName = fieldName;
      }
    }
    return truncatedName;
  }

  truncateValue(value: string, numberOfSymbols: number): string {
    let truncatedValue = '';
    if (value) {
      if (numberOfSymbols || numberOfSymbols === 0) {
        value = value.toString();
        truncatedValue = value.substring(0, numberOfSymbols);
      } else {
        truncatedValue = value;
      }
    }
    return truncatedValue;
  }

  findApplicableTitleSettings(schemaId: string, allTitleSettings: SettingsUI[], uiArea: UiAreasEnum): SchemaTitleSettingModel {
    let schemaSettings = allTitleSettings?.find((settData) => {
      return settData.key.includes(schemaId);
    });
    let settingsArray = schemaSettings?.value?.schemaTitles;
    return settingsArray?.find((item) => {
      return item.area === uiArea;
    });
  }

  extractStringFromHTML(html: string): string {
    // Create a new div element
    var temporalDivElement = document.createElement('div');
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = html;
    // Retrieve the text property of the element (cross-browser support)
    return temporalDivElement.textContent || temporalDivElement.innerText || '';
  }
}
