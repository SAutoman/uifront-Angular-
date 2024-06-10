/**
 * global
 */
import { FormlyFieldConfig } from '@ngx-formly/core';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * project
 */
import { AppStatic } from '@wfm/app.static';

import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';
import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';

/**
 * local
 */
import { FormVariableDto } from '../form-variable.dto';
import { FormlyFieldAdapterTypeEnum } from '../formly-field-adapter-type.enum';
import { FormlyFieldAdapter } from '../formly-field.adapter';
import { KeyValueDisabled } from './select-field.adapter';
import { ConnectorRenderTypeEnum } from '@wfm/common/models/connector-field';

export class ConnectorFieldAdapter extends FormlyFieldAdapter<any> {
  private connectorService: WorkflowsConnectorService;
  constructor(formVariable: FormVariableDto) {
    super(formVariable, FormlyFieldAdapterTypeEnum.select);
    this.connectorService = AppStatic.injector.get(WorkflowsConnectorService);
  }

  getConfig(): FormlyFieldConfig {
    const formVariable = this.formVariable;
    const connectorFieldConfig = formVariable?.valueInfo?.connectorFieldConfiguration;

    let options: Observable<KeyValueDisabled[]>;
    if (formVariable?.valueInfo?.options) {
      options = of(formVariable.valueInfo.options);
    } else if (connectorFieldConfig && formVariable.valueInfo.schemaFieldId && !formVariable.valueInfo.isClientId) {
      // get options based on connectoField config
      options = from(
        this.connectorService.getConnectorFieldOptions(formVariable.valueInfo.schemaFieldId, formVariable.valueInfo.dynamicEntityId)
      ).pipe(
        map((data) => {
          let selectOptions = [];
          if (data?.length) {
            selectOptions = data.map((option) => {
              return <KeyValueDisabled>{
                key: option.label,
                value: option.dynamicEntityId,
                disabled: !option.enabled,
                areaType: option.areaType,
                labelFieldsValues: option.labelFieldsValues
              };
            });
          }
          return selectOptions;
        }),
        catchError((error) => {
          console.log('Error when retrieving connector field listOptions', error);
          return of([]);
        })
      );
    } else {
      options = of([]);
    }
    let renderType = FormlyFieldAdapterTypeEnum.connectorSelectbox;
    // use SearchInput for fastCreate widget and in formPreview component, if renderType is SearchInput
    if (
      formVariable.valueInfo.forFastCreate ||
      (formVariable.valueInfo.forFormPreview && connectorFieldConfig.renderType === ConnectorRenderTypeEnum.SearchInput)
    ) {
      renderType = FormlyFieldAdapterTypeEnum.connectorSearchInput;
    }
    const config: FormlyFieldConfig = {
      key: formVariable.name,
      type: renderType,
      validation: {
        messages: {
          required: ErrorMessageGenerator.get(ErrorMessageTypeEnum.required)
        }
      },
      templateOptions: {
        label: formVariable.label,
        required: formVariable.required,
        readonly: formVariable.readonly,
        disabled: formVariable.disabled || formVariable.readonly,
        options: options,
        multiple: connectorFieldConfig.allowMultipleSelection || false,
        isHighlighted: formVariable.isHighlighted,
        highlightColor: formVariable.highlightColor,
        readonlySetExplicitly: formVariable.readonly,
        allowDisablingOptions: formVariable.allowDisablingOptions,
        exposedFieldsData: formVariable.valueInfo.exposedFieldsData,
        disableButtons: formVariable.disableButtons,
        schemaFieldId: formVariable.valueInfo.schemaFieldId,
        forFastCreate: formVariable.valueInfo.forFastCreate,
        dynamicEntityId: formVariable.valueInfo.dynamicEntityId
      }
    };
    if (formVariable.value) {
      config.defaultValue = formVariable.value;
    }
    return config;
  }
}
