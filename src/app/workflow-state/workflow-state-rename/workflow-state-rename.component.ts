/**
 * global
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { AreaTypeEnum, FieldTypeIds, SchemaDto, SchemasCacheService, UpdateDynamicEntityDto, UpdateStateCase } from '@wfm/service-layer';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { UpdateWorkflowStateCase } from '@wfm/store/workflow';

/**
 * local
 */

@Component({
  selector: 'app-workflow-state-rename',
  templateUrl: './workflow-state-rename.component.html',
  styleUrls: ['./workflow-state-rename.component.scss']
})
export class WorkflowStateRenameComponent extends TenantComponent implements OnInit {
  componentId = '1ccd95b0-abbb-4aeb-b70d-b3d43e3a0105';
  schema: SchemaDto;
  loaded: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { cmd: UpdateDynamicEntityDto; workflowStateId: string },
    private store: Store<ApplicationState>,
    public dialogRef: MatDialogRef<WorkflowStateRenameComponent>,
    private adminSchemasService: AdminSchemasService,
    private schemasCacheService: SchemasCacheService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    if (this.data.cmd.fields[0] === undefined) {
      const schemaId = this.data.cmd.schemaId;
      this.schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, schemaId);
      const nameField = this.schema.fields.find((x) => x.type === FieldTypeIds.StringField);

      this.data.cmd.fields[0] = <BaseFieldValueType>{
        id: nameField ? nameField.fieldName : '',
        type: nameField ? nameField.type : FieldTypeIds.StringField,
        value: ''
      };
      this.loaded = true;
    } else {
      this.loaded = true;
    }
  }

  async update(): Promise<void> {
    let data: UpdateStateCase = {
      workflowStateId: this.data.workflowStateId,
      tenantId: this.tenant,
      caseDynamicEntity: {
        appId: this.data.cmd.appId,
        tenantId: this.tenant,
        schemaId: this.data.cmd.schemaId,
        areaType: AreaTypeEnum.case,
        fields: this.data.cmd.fields
      },
      schemaId: this.data.cmd.schemaId
    };
    this.store.dispatch(new UpdateWorkflowStateCase({ data: data, workflowStateId: this.data.workflowStateId }));
    this.dialogRef.close(true);
  }
}
