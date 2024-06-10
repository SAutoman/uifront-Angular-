import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { FormlyModel, IConfigurableListItem } from '@wfm/common/models';
import {
  SchemaDto,
  AreaTypeEnum,
  DynamicEntitiesService,
  APP_CLIENT_ID,
  WorkflowSimplifiedDto,
  CreateDynamicEntityDto,
  FieldTypeIds,
  SchemaFieldDto
} from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { BaseFieldValueType, EmbededFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { CreateWorkflowStates, refreshWorkflowStatesSelector } from '@wfm/store/workflow';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-global-case-create',
  templateUrl: './global-case-create.component.html',
  styleUrls: ['./global-case-create.component.scss']
})
export class GlobalCaseCreateComponent extends TenantComponent implements OnInit {
  @Input() selectedWorkflow: WorkflowSimplifiedDto;

  // schemaId: string;
  caseSchemaFields$: Observable<IConfigurableListItem[]>;
  caseSchema: SchemaDto;
  createCaseDialog: MatDialogRef<any, any>;
  showBuilder: boolean = false;
  numberOfEntitiesControl: FormControl = new FormControl(1);
  hideMultiCreationButton: boolean;
  get areaTypes() {
    return AreaTypeEnum;
  }
  constructor(
    private store: Store<any>,

    @Inject(APP_CLIENT_ID) readonly appId: string,
    private dynamicEntitiesService: DynamicEntitiesService,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private matDialogRef: MatDialogRef<GlobalCaseCreateComponent>,
    private adminSchemasService: AdminSchemasService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.selectedWorkflow.caseSchemaId);
    this.hideMultiCreationButton = this.selectedWorkflow.disableMultiCreate;
    this.caseSchemaFields$ = of(this.caseSchema?.fields?.map((field) => BaseFieldConverter.toUi(field)));
  }

  create(data: FormlyDataOutput): void {
    this.createCaseWithNoRawData(
      this.appId,
      this.tenant,
      this.caseSchema,
      this.numberOfEntitiesControl.value,
      data,
      this.selectedWorkflow.id
    );
    this.store
      .select(refreshWorkflowStatesSelector)
      .pipe(take(2))
      .subscribe((x) => {
        if (x) {
          this.snackBar.open(this.ts.instant('Case Created Successfully!'), 'CLOSE', { duration: 2000 });
          this.matDialogRef.close();
          this.caseSchema = null;
          // this.caseSchema = this.schemaId = null;
        }
      });
  }

  hasError(errorName: string): boolean {
    return this.numberOfEntitiesControl.hasError(errorName);
  }

  createCaseWithNoRawData(
    appId: string,
    tenantId: string,
    caseSchema: SchemaDto,
    noOfItems: number,
    data: FormlyDataOutput,
    schemaId: string
  ): void {
    try {
      const caseDynamicPayload: CreateDynamicEntityDto = {
        appId: appId,
        tenantId: tenantId,
        areaType: AreaTypeEnum.case,
        schemaId: caseSchema.id,
        fields: this.populateDynamicEntityFields(data.model, caseSchema.fields)
      };
      this.store.dispatch(
        new CreateWorkflowStates({
          tenantId: tenantId,
          case: caseDynamicPayload,
          schemaId: schemaId,
          numberOfItems: noOfItems || 1
        })
      );
    } catch (error) {
      console.log(error);
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
        const embeddedFields = this.populateDynamicEntityFields(formModel[key], field.fields);
        const data = <EmbededFieldValueDto>{
          id: key,
          type: FieldTypeIds.EmbededField,
          value: embeddedFields
        };
        fields.push(data);
      }
    });

    return fields;
  }
}
