/**
 * global
 */
import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, Observable, of } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { FormlyModel, IConfigurableListItem } from '@wfm/common/models';
import {
  DynamicEntityDto,
  AreaTypeEnum,
  FieldTypeIds,
  SchemaFieldDto,
  UpdateStateCase,
  APP_CLIENT_ID,
  DynamicEntitiesService,
  SchemaDto,
  SchemasCacheService,
  WorkflowDto,
  WorkflowStateDto,
  VirtualFieldValueDto,
  WorkflowStateCaseFieldDto
} from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { BaseFieldValueType, EmbededFieldValueDto, FieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import {
  activatedCaseFieldRulesSelector,
  UpdateWorkflowStateCase,
  WorkflowActionTypes,
  workflowSelector,
  workflowStateSelector
} from '@wfm/store/workflow';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
/**
 * local
 */
import { ValueMap } from '../workflow-state-case/workflow-state-case.component';
import { WorkflowStateUiService } from '../workflow-state-ui.service';
import { FieldLinkRules } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';
import { DynamicEntitySystemFields } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';

@Component({
  selector: 'app-workflow-state-case-edit',
  templateUrl: './workflow-state-case-edit.component.html',
  styleUrls: ['./workflow-state-case-edit.component.scss']
})
export class WorkflowStateCaseEditComponent extends TenantComponent implements OnInit {
  @Output() closeEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  workflowState: WorkflowStateDto;
  workflow: WorkflowDto;
  caseSchema: SchemaDto;
  caseSchemaFields$ = new Observable<IConfigurableListItem[]>();
  caseSchemaId: string;

  caseFields: WorkflowStateCaseFieldDto[];
  caseSystemFields: DynamicEntitySystemFields;
  dynamicEntityMap: ValueMap;
  // store the raw data ids separately and add it to updateCaseDto before api call
  listOfLinksFields: FieldValueDto<string[]>[] = [];
  caseDeId: string;
  caseFieldRules: FieldLinkRules[] = [];
  virtualFields: VirtualFieldValueDto<BaseFieldValueType>[];
  get areaType() {
    return AreaTypeEnum;
  }
  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    public dialog: MatDialog,
    private dynamicEntitiesService: DynamicEntitiesService,
    private adminSchemaService: AdminSchemasService,
    private schemasCacheService: SchemasCacheService,
    public wfStateUiService: WorkflowStateUiService,
    private action$: Actions,
    private snackBar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
  }

  async ngOnInit() {
    this.subscribeToStore();
  }

  async subscribeToStore(): Promise<void> {
    combineLatest([this.store.select(workflowStateSelector), this.store.select(activatedCaseFieldRulesSelector)])
      .pipe(
        filter((x) => !!x[0] && !!x[1]),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.workflowState = cloneDeep(data[0]);
        this.caseFieldRules = cloneDeep(data[1]);

        this.store
          .select(workflowSelector)
          .pipe(
            filter((wf) => !!wf),
            take(1)
          )
          .subscribe(async (wf) => {
            this.workflow = wf;
            this.caseSchemaId = this.workflow.caseSchemaId;
            await this.getDynamicEntity();
            await this.getSchemaAndFields(this.caseSchemaId);
            this.caseFields = this.workflowState.case?.fields ? this.workflowState.case.fields : [];
          });
      });
  }
  /**
   * check fieldLinkRules
   * canEdit:false - field to be disabled
   * canView:false - field to be hidden
   */
  processCaseFieldThroughRules(field: SchemaFieldDto): SchemaFieldDto {
    const rule = this.caseFieldRules.find((fieldRule) => fieldRule.schemaFieldId === field.id);
    if (rule) {
      field.configuration.disabledByRule = !rule.rights.canEdit;
      field.configuration.hiddenByRyRule = !rule.rights.canView;
    }
    return field;
  }

  private async getSchemaAndFields(id: string): Promise<void> {
    this.caseSchema = cloneDeep(
      await this.schemasCacheService.get(id, 60, async () => await this.adminSchemaService.getSchema(this.tenant, AreaTypeEnum.case, id))
    );
    this.caseSchema.fields = this.populateSchemaFieldValues(this.caseSchema.fields, this.dynamicEntityMap);

    this.caseSchemaFields$ = of(
      this.caseSchema.fields
        .filter((f) => {
          f = this.processCaseFieldThroughRules(f);

          if (f.type === FieldTypeIds.ListOfLinksField) {
            this.listOfLinksFields.push({
              id: f.fieldName,
              value: this.dynamicEntityMap ? this.dynamicEntityMap[f.fieldName]?.value : undefined,
              type: f.type
            });
            return false;
          }
          if (f.configuration.hiddenByRyRule) {
            return false;
          }

          return true;
        })
        ?.map((field) => BaseFieldConverter.toUi(field))
    );
  }

  /**
   * create a map of {fieldName: BaseFieldValueType} pairs form dynamicEntityFields (recursion: consider the nested fields)
   * @param de
   * @returns
   */

  private getDynamicEntityMap(dynamicEntityFields: BaseFieldValueType[]): ValueMap {
    let fieldMap = {};
    dynamicEntityFields.forEach((field: BaseFieldValueType) => {
      if (field) {
        if (field.type !== FieldTypeIds.EmbededField) {
          fieldMap[field.id] = { ...field };
        } else {
          fieldMap[field.id] = { ...this.getDynamicEntityMap(<BaseFieldValueType[]>field.value) };
        }
      }
    });
    return fieldMap;
  }

  /**
   * Recursively add values to schema fields (values get from dynamic entity)
   * @param fields
   * @param values
   * @returns
   */

  private populateSchemaFieldValues(fields: SchemaFieldDto[], valuesMap?: ValueMap): SchemaFieldDto[] {
    const fieldsCopy = [...fields];
    if (valuesMap) {
      fieldsCopy.forEach((field) => {
        if (field.type !== FieldTypeIds.EmbededField) {
          field.configuration.value = valuesMap[field.fieldName]?.value;
          if (field.type === FieldTypeIds.ConnectorField && this.virtualFields) {
            field.configuration.exposedFieldsData = this.virtualFields.find((f) => f.fieldName === field.fieldName);
          }
        } else {
          field.fields = this.populateSchemaFieldValues(field.fields, valuesMap[field.fieldName]);
        }
      });
    }
    return fieldsCopy;
  }

  onCaseSubmit(data: FormlyDataOutput): void {
    let fieldValues = this.populateDynamicEntityFields(data.model, this.caseSchema.fields);
    const cmd: UpdateStateCase = {
      workflowStateId: this.workflowState.id,
      tenantId: this.tenant,
      caseDynamicEntity: {
        appId: this.appId,
        tenantId: this.tenant,
        schemaId: this.caseSchemaId,
        areaType: AreaTypeEnum.case,
        //  add list of links fields
        fields: [...fieldValues, ...this.listOfLinksFields]
      },
      schemaId: this.workflow.id
    };
    this.store.dispatch(new UpdateWorkflowStateCase({ data: cmd, workflowStateId: this.workflowState.id }));
    this.listenForCaseUpdateResult();
  }

  listenForCaseUpdateResult() {
    this.action$
      .pipe(
        filter(
          (action) =>
            action.type === WorkflowActionTypes.UpdateWorkflowStateCaseSuccess ||
            action.type === WorkflowActionTypes.UpdateWorkflowStateCaseFail
        ),
        take(1)
      )
      .subscribe((action) => {
        if (action.type === WorkflowActionTypes.UpdateWorkflowStateCaseSuccess) {
          this.snackBar.open(this.ts.instant('Case Updated Successfully!'), 'CLOSE', { duration: 2000 });
          this.closeEvent.emit(false);
        } else {
          this.snackBar.open(this.ts.instant('Failed To Update'), 'CLOSE', { duration: 2000 });
        }
      });
  }

  /**
   *
   * @param formModel: FormGroup.getRawValue()
   * @param schemaFields
   * @returns
   */
  private populateDynamicEntityFields(formModel: FormlyModel, schemaFields: SchemaFieldDto[]): BaseFieldValueType[] {
    let fields = [];
    schemaFields.forEach((field) => {
      const key = field.fieldName;
      if (formModel.hasOwnProperty(key)) {
        if (field.type !== FieldTypeIds.EmbededField) {
          let data = <BaseFieldValueType>{
            id: key,
            type: field.type
          };
          const value = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
          if (value !== undefined) {
            data.value = value;
            fields.push(data);
          }
        } else {
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

  /**
   * get dynamic entity
   */
  async getDynamicEntity(): Promise<void> {
    let caseId = this.workflowState?.case?.id;
    if (caseId) {
      this.caseDeId = caseId;
      const dynamicEntity: DynamicEntityDto = await this.dynamicEntitiesService.getById(
        this.tenant,
        this.workflowState.case?.id,
        this.caseSchemaId,
        AreaTypeEnum.case
      );

      this.dynamicEntityMap = this.getDynamicEntityMap(dynamicEntity.fields);
      this.virtualFields = dynamicEntity.virtualFields;
      this.caseSystemFields = {
        statusId: dynamicEntity.statusId,
        createdAt: dynamicEntity.createdAt,
        updatedAt: dynamicEntity.updatedAt
      };
    }
  }
}
