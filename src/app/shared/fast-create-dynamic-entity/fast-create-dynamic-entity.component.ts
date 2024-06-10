import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormlyModel, IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, FormlyFieldAdapterTypeEnum } from '@wfm/common/vendor';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  DynamicEntitiesService,
  FastCreateSettings,
  FieldTypeIds,
  SchemaDto,
  SchemaFieldDto,
  WorkflowSimplifiedDto
} from '@wfm/service-layer';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { TenantComponent } from '../tenant.component';
import { Store } from '@ngrx/store';
import { ApplicationState } from '@wfm/store';
import { CreateWorkflowStates, CreateWorkflowStatesFail, CreateWorkflowStatesSuccess, WorkflowActionTypes } from '@wfm/store/workflow';
import { filter, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { BaseFieldValueType, EmbededFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { isUndefinedOrNull } from '../utils';

@Component({
  selector: 'app-fast-create-dynamic-entity',
  templateUrl: './fast-create-dynamic-entity.component.html',
  styleUrls: ['./fast-create-dynamic-entity.component.scss']
})
export class FastCreateDynamicEntityComponent extends TenantComponent implements OnInit {
  @Input() schema: SchemaDto;
  @Input() workflow?: WorkflowSimplifiedDto;

  barcodeScanningEnabled: boolean;

  view: IFormlyView;
  fastCreateSetting: FastCreateSettings;
  fastCreateFields: IConfigurableListItem[];
  options: FormlyFormOptions = {};
  constructor(
    private store: Store<ApplicationState>,
    private fb: FormBuilder,
    private expressionHelperService: ExpressionHelperService,
    private cd: ChangeDetectorRef,
    private action$: Actions,
    private snackBar: MatSnackBar,
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private ts: TranslateService,
    private dynamicEntitiesService: DynamicEntitiesService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.fastCreateSetting = this.schema.schemaConfiguration.fastCreateSettings;
    this.fastCreateFields = this.populateFastCreateFields();
    this.barcodeScanningEnabled = this.fastCreateSetting.enableBarcodeScanning;

    this.view = {
      fields: this.fastCreateFields.map((f, index) => this.createField(f, index)),
      form: this.fb.group({}),
      model: {}
    };
    this.cd.detectChanges();
  }

  populateFastCreateFields(): IConfigurableListItem[] {
    let fields = [];
    if (this.fastCreateSetting?.fields) {
      this.fastCreateSetting.fields.forEach((propPath) => {
        const options = this.schema.fields.map((f) => BaseFieldConverter.toUi(f));
        const field = this.expressionHelperService.getFieldByPath(propPath.path, options);
        if (field) {
          fields.push(field);
        }
      });
    }
    return fields;
  }

  createField(field: IConfigurableListItem, fieldIndex: number): FormlyFieldConfig {
    const formlyField = FormlyFieldAdapterFactory.createAdapter({
      label: field.viewName,
      name: field.name,
      type: field.type,
      valueInfo: {
        ...field.configuration,
        tenantId: this.tenant,
        ownerSchemaId: this.schema?.id,
        schemaFieldId: field.id,
        forFastCreate: true
      },
      value: null,
      required: false
    });
    const config = adapterToConfig(formlyField, 'horizontalControl');

    config.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.templateOptions = {
          ...field.templateOptions,
          keydown: (field, event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'NumpadEnter' || event.key === 'Enter') {
              if (this.barcodeScanningEnabled) {
                field.focus = false;
                const currentIndexOfField = this.fastCreateFields.findIndex((item) => item.name === field.key);
                if (currentIndexOfField + 1 < this.fastCreateFields.length) {
                  const nextField = this.fastCreateFields[currentIndexOfField + 1];
                  const nextFieldRef = field.parent.fieldGroup.find((f) => f.key === nextField?.name);
                  nextFieldRef.focus = true;
                } else {
                  this.submit();
                }
              } else {
                this.submit();
              }
            }
          }
          // focus: (field: FormlyFieldConfig) => {

          // }
        };
      },
      afterViewInit: (field: FormlyFieldConfig) => {
        if (this.barcodeScanningEnabled && fieldIndex === 0) {
          setTimeout(() => {
            field.focus = true;
          });
        }
      }
    };
    return config;
  }

  async submit(): Promise<void> {
    // wrapping in setTimeout to give time for all the fields to be populated
    setTimeout(() => {
      switch (this.schema.areaType) {
        case AreaTypeEnum.case:
          this.createCaseWithNoRawData();
          break;
        default:
          break;
      }
    }, 500);
  }

  createCaseWithNoRawData(): void {
    try {
      const caseDynamicPayload: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType: AreaTypeEnum.case,
        schemaId: this.schema.id,
        fields: this.populateDynamicEntityFields(this.view.model, this.schema.fields)
      };
      this.store.dispatch(
        new CreateWorkflowStates({
          tenantId: this.tenant,
          case: caseDynamicPayload,
          schemaId: this.workflow.id,
          numberOfItems: 1
        })
      );
      this.action$
        .pipe(
          filter(
            (action) =>
              action.type === WorkflowActionTypes.CreateWorkflowStatesSuccess ||
              action.type === WorkflowActionTypes.CreateWorkflowStatesFail
          ),
          take(1)
        )
        .subscribe((action: CreateWorkflowStatesSuccess | CreateWorkflowStatesFail) => {
          if (action.type === WorkflowActionTypes.CreateWorkflowStatesSuccess) {
            this.snackBar.open(this.ts.instant('Case Created Successfully!'), 'CLOSE', { duration: 2000 });
          } else {
            this.snackBar.open((<CreateWorkflowStatesFail>action).payload.error, 'CLOSE', { duration: 6000 });
          }
          this.resetForm();
        });
    } catch (error) {
      console.log(error);
    }
  }

  resetForm(): void {
    this.options.resetModel();
    this.view.fields.forEach((field) => {
      if (field.type === FormlyFieldAdapterTypeEnum.connectorSearchInput) {
        field.formControl.setValue(undefined);
      }
    });
    if (this.barcodeScanningEnabled) {
      setTimeout(() => {
        this.view.fields[0].focus = true;
      }, 100);
    }
  }

  private populateDynamicEntityFields(formModel: FormlyModel, schemaFields: SchemaFieldDto[]): BaseFieldValueType[] {
    let fields = [];

    schemaFields.forEach((field) => {
      const key = field.fieldName;
      if (field.type !== FieldTypeIds.EmbededField) {
        let data = <BaseFieldValueType>{
          id: key,
          type: field.type
        };
        const value = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
        if (!isUndefinedOrNull(value)) {
          data.value = value;
          fields.push(data);
        }
      } else {
        if (formModel[key]) {
          const embeddedFields = this.populateDynamicEntityFields(formModel[key], field.fields);
          const data = <EmbededFieldValueDto>{
            id: key,
            type: FieldTypeIds.EmbededField,
            value: embeddedFields
          };
          fields.push(data);
        }
      }
    });

    return fields;
  }
}
