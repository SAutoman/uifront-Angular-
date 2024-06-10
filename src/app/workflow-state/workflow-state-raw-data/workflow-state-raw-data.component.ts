/**
 * global
 */
import { Component, Inject, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';

import { combineLatest, Observable, of } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { sortBy } from 'lodash-core';
/**
 * project
 */
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AllowedGridOperations,
  APP_CLIENT_ID,
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  SchemaDto,
  SchemaFieldDto,
  UpdateStateCase,
  WorkflowDto,
  WorkflowStateDto
} from '@wfm/service-layer';
import { ApplicationState } from '@wfm/store';
import { ActionEvent, GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { UpdateWorkflowStateCase, workflowSelector, workflowStateSelector } from '@wfm/store/workflow';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { IConfigurableListItem } from '@wfm/common/models';
import { BaseFieldConverter } from '@wfm/service-layer/helpers/base-field-converter';
import { deleteRawDataKey, Row, showDetailsKey } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { RawdataLinkService } from '@wfm/service-layer/services/rawdata-link.service';

/**
 * local
 */

export interface RawDataDetails {
  fieldName: string;
  displayName: string;
  schemaId: string;
  dynamicEntityIds: string[];
  loaded: boolean;
}

@Component({
  selector: 'app-workflow-state-raw-data',
  templateUrl: './workflow-state-raw-data.component.html',
  styleUrls: ['./workflow-state-raw-data.component.scss']
})
export class WorkflowStateRawDataComponent extends TenantComponent implements OnInit {
  @ViewChild('addDataTmpl') addDataTmpl: TemplateRef<any>;
  @Input() showAll: boolean = false;
  @Input() title = '';
  rawDataDetails: RawDataDetails[] = [];
  // schemaId: string;
  // raw data ids inside case
  // dynamicEntityIds: string[] = [];
  caseId: string;
  caseSchemaId: string;
  // loaded: boolean = false;
  isDialog: boolean = false;
  actions: GridAction[] = [];
  componentId = '4704b9ce-7476-4955-ae8a-7f5ae021acd3';
  workflowState: WorkflowStateDto;
  workflow: WorkflowDto;
  row: Row;
  modalConfig = { width: '500px', maxHeight: '95vh', maxWidth: '95vw' };
  schema: SchemaDto;
  schemaFields: SchemaFieldDto[] = [];
  schemaFields$ = new Observable<IConfigurableListItem[]>();
  rawDatasRefFields: SchemaFieldDto[];
  get areatypeEnum() {
    return AreaTypeEnum;
  }

  detailGridOperations: AllowedGridOperations = {
    actionsColumn: true,
    menuColumn: false,
    //if need to add rawData id-s in ListOfLinks field
    // menuColumn: true,
    exportActions: false,
    infoColumn: true,
    layoutActions: false,
    crudOperations: false,
    allowSharing: false,
    allowSearching: false,
    enableMasterDetail: true,
    enableGrouping: false
  };
  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private store: Store<ApplicationState>,
    private dynamicEntitiesService: DynamicEntitiesService,
    public dialog: MatDialog,
    private adminSchemasService: AdminSchemasService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<WorkflowStateRawDataComponent>,
    private rawdataLinkService: RawdataLinkService,
    private snackbar: MatSnackBar
  ) {
    super(store);
    if (data && Object.keys(data).length !== 0) {
      this.title = data.title;
      this.showAll = data.showAll;
      this.isDialog = data.isDialog;
    }
  }

  ngOnInit(): void {
    this.initStore();
    this.initGridActions();
  }

  initStore(): void {
    combineLatest([this.store.select(workflowSelector), this.store.select(workflowStateSelector)])
      .pipe(
        filter(([workflow, workflowState]) => !!workflow && !!workflowState),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (x) => {
        this.workflowState = x[1];
        this.workflow = x[0];
        this.caseSchemaId = this.workflow.caseSchemaId;
        this.caseId = x[1].case?.id;
        this.populateRawDatas();
      });
  }

  async populateRawDatas(): Promise<void> {
    await this.getRawDataReferenceFields(this.caseSchemaId);
    if (this.rawDatasRefFields.length) {
      if (this.rawDataDetails?.length) {
        this.rawDataDetails = [];
      }
      for (const rawDatasField of this.rawDatasRefFields) {
        const ids = this.workflowState?.case?.fields?.find(
          (x) => x.type === FieldTypeIds.ListOfLinksField && x.id === rawDatasField.fieldName
        )?.value;
        const rawDataDetailItem = {
          fieldName: rawDatasField.fieldName,
          displayName: rawDatasField.displayName,
          dynamicEntityIds: (ids as string[]) || [],
          schemaId: rawDatasField.configuration.schemaId,
          loaded: false,
          wfStateId: this.workflowState.id
        };
        if (!rawDataDetailItem.dynamicEntityIds.length) {
          rawDataDetailItem.loaded = true;
        }

        this.rawDataDetails.push(rawDataDetailItem);
      }
    }
  }

  /**
   * get raw data schema id from case schema
   */
  async getRawDataReferenceFields(caseSchemaId: string): Promise<void> {
    const caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, caseSchemaId);
    this.rawDatasRefFields = caseSchema.fields.filter((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
    });
  }

  initGridActions(): void {
    this.actions = [
      {
        actionId: showDetailsKey,
        icon: 'info'
      },
      {
        actionId: deleteRawDataKey,
        icon: 'delete'
      }
    ];
  }

  dataLoaded(event: boolean, index: number): void {
    this.rawDataDetails[index].loaded = event;
  }

  areAllLoaded(): boolean {
    return this.rawDataDetails.every((detail) => detail.loaded);
  }

  actionEvent(event: ActionEvent, rawDataDetailIndex: number): void {
    switch (event.actionId) {
      case deleteRawDataKey:
        const deleteId: string = event.raw.publicId;
        const rawDataSchemaId: string = this.rawDataDetails[rawDataDetailIndex]?.schemaId;
        this.checkForRawDataDeletion(deleteId, rawDataSchemaId);
        break;
      case showDetailsKey:
        this.onDynamicEntityInfoClicked(event.raw, rawDataDetailIndex);

        break;
      default:
        break;
    }
  }

  async checkForRawDataDeletion(deleteId: string, schemaId: string): Promise<void> {
    try {
      const query = {
        rawDataIds: [deleteId],
        rawDataSchemaId: schemaId,
        caseId: this.caseId,
        workflowSchemaId: this.workflow.id
      };
      const response = await this.rawdataLinkService.checkMinMaxValidationBeforeRemoval(query, this.tenant);
      if (response.canDelete) {
        this.confirmDialog(deleteId);
      } else {
        this.snackbar.open('Cannot Remove: Min RawData count validation not passed', 'CLOSE', { duration: 5000 });
      }
    } catch (error) {}
  }

  confirmDialog(deleteId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.removeRawDataReferenceFromCase(deleteId);
    });
  }

  async removeRawDataReferenceFromCase(deleteId: string): Promise<void> {
    this.getDynamicEntity(deleteId);
  }

  /**
   *show raw data form viewer
   */
  async onDynamicEntityInfoClicked(row: Row, index: number): Promise<void> {
    const selectedRaw: DynamicEntityDto = await this.dynamicEntitiesService.getById(
      this.tenant,
      row.publicId,
      this.rawDataDetails[index].schemaId,
      AreaTypeEnum.rawData
    );
    this.row = await this.getDeFieldKeyValuePairs(selectedRaw);
    if (this.row) {
      this.schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.rawData, this.rawDataDetails[index].schemaId);
      const fields = [...this.schema.fields];
      this.schemaFields = sortBy(fields, [(field) => field.configuration?.position]);
      const mappedSchemaFields = this.schemaFields.map((field) => this.mapValuesToFields(field, this.row));
      this.schemaFields$ = await of(
        mappedSchemaFields.filter((f) => f.fieldName !== 'status').map((field) => BaseFieldConverter.toUi(field))
      );

      const dialogRef = this.dialog.open(this.addDataTmpl, this.modalConfig);
      dialogRef.afterClosed().subscribe(() => {
        this.schema = null;
        (this.schemaFields = []), (this.schemaFields$ = null);
      });
    }
  }

  mapValuesToFields(field: SchemaFieldDto, row: Row): SchemaFieldDto {
    let f = { ...field };
    f.value = row[f.fieldName];

    return f;
  }

  getDeFieldKeyValuePairs(de: DynamicEntityDto): Row {
    let row: Row = {
      publicId: de.id
    };
    de.fields.forEach((field) => {
      row[field.id] = field.value;
    });
    row.systemFields = {
      statusId: de.statusId,
      createdAt: de.createdAt,
      updatedAt: de.updatedAt
    };
    return row;
  }

  close(close: boolean): void {
    if (close) {
      this.dialog.closeAll();
    }
  }

  /**
   * get dynamic entity
   */
  async getDynamicEntity(deleteId: string): Promise<void> {
    const dynamicEntity: DynamicEntityDto = await this.dynamicEntitiesService.getById(
      this.tenant,
      this.caseId,
      this.caseSchemaId,
      AreaTypeEnum.case,
      true
    );
    this.deleteRawDataFromCase(dynamicEntity, deleteId);
  }

  /**
   * update dynamic entity (remove not needed rawDataId from fields)
   */
  deleteRawDataFromCase(de: DynamicEntityDto, deleteId: string): void {
    const filteredFields: BaseFieldValueType[] = de.fields.map((x) => {
      if (x.type === FieldTypeIds.ListOfLinksField) {
        x.value = (x.value as string[]).filter((id) => {
          return id !== deleteId;
        });
      }
      return x;
    });

    const cmd: UpdateStateCase = {
      workflowStateId: this.workflowState.id,
      tenantId: this.tenant,
      caseDynamicEntity: {
        appId: this.appId,
        tenantId: this.tenant,
        schemaId: this.caseSchemaId,
        areaType: AreaTypeEnum.case,
        fields: filteredFields
      },
      schemaId: this.workflow.id
    };
    this.store.dispatch(new UpdateWorkflowStateCase({ data: cmd, workflowStateId: this.workflowState.id }));
  }
}
