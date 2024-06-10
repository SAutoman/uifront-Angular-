/**
 * global
 */

import { Component, OnInit, Input, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { cloneDeep } from 'lodash-core';
import { Observable } from 'rxjs';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

/**
 * project
 */

import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  Operation,
  Paging,
  PermissionSettings,
  Profile,
  SchemaDto,
  UpdateStateCase,
  WorkflowDto,
  WorkflowStateCaseFieldDto,
  WorkflowStateUI
} from '@wfm/service-layer';
import { ApplicationState } from '@wfm/store';
import {
  GetWorkflowStateById,
  UpdateWorkflowStateCase,
  wfStateErrorSelector,
  WorkflowActionTypes,
  workflowSelector,
  workflowStateSelector
} from '@wfm/store/workflow';
import { DynamicGridUiService, QueryingArea } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { BaseFieldValueDto, BaseFieldValueType, ListOfLinkFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { Row } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { SharedService } from '@wfm/service-layer/services/shared.service';
import { ValueMap } from '@wfm/workflow-state/workflow-state-case/workflow-state-case.component';

/**
 * local
 */
export interface CommentFieldData {
  label: string;
  type: FieldTypeIds;
  value: any;
  isUrl?: boolean;
  url?: SafeHtml;
}
export interface CommentData {
  fields: CommentFieldData[];
  createdAt: string;
  id: string;
}

@Component({
  selector: 'app-workflow-state-case-activity',
  templateUrl: './workflow-state-case-activity.component.html',
  styleUrls: ['./workflow-state-case-activity.component.scss'],
  providers: [DynamicGridUiService]
})
export class WorkflowStateCaseActivityComponent extends TenantComponent implements OnInit {
  @Input() caseId: string;
  @Input() userProfile: Profile;
  @Input() tenantId: string;
  @Input() canEditCase: boolean;
  @Input() schemaId: string;
  @Input() wfStateId: string;
  @Input() wfSchemaId: string;
  @Output() closeActivity: EventEmitter<boolean> = new EventEmitter();
  @Output() lastComment: EventEmitter<CommentData> = new EventEmitter();
  @Output() commentsEmitter: EventEmitter<CommentData[]> = new EventEmitter();
  activityOpenState = false;
  showCreateComment: boolean = false;
  workflow: WorkflowDto;
  workflowState: WorkflowStateUI;
  commentSchema: SchemaDto;
  commentDeIds: string[];
  commentLinkField: WorkflowStateCaseFieldDto;
  caseSchema: SchemaDto;
  loading: boolean = true;
  componentId = '42b81304-3b3f-4509-93b2-e25842207d87';
  comments: CommentData[];
  commentToUpdate: Row;
  errorMessage$: Observable<string>;
  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  get fieldTypes() {
    return FieldTypeIds;
  }

  permissions: PermissionSettings;
  commentIdToPreload: string;

  constructor(
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private adminSchemasService: AdminSchemasService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private dynamicEntitiesService: DynamicEntitiesService,
    private dynamicGridUiService: DynamicGridUiService,
    private store: Store<ApplicationState>,
    private actions$: Actions,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private sharedService: SharedService
  ) {
    super(store);
  }

  async ngOnInit() {
    this.initView();
    this.store
      .select(workflowStateSelector)
      .pipe(
        filter((wfState) => !!wfState),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.workflowState = cloneDeep(data);

        this.commentDeIds = [];
        this.comments = [];
        this.commentsEmitter.emit(this.comments);

        this.store
          .select(workflowSelector)
          .pipe(
            filter((wf) => !!wf),
            take(1)
          )
          .subscribe(async (wf) => {
            this.workflow = wf;
            await this.getCommentFields();
            this.setUpPermissions();
            if (this.commentDeIds) {
              this.initDataByIds();
            }
            this.activityOpenState = true;
          });
      });

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((queryParams) => {
      if (queryParams && queryParams['commentId']) {
        this.commentIdToPreload = queryParams['commentId'];
      }
    });
  }

  initView(): void {
    this.dynamicGridUiService
      .asObservable()
      .pipe(
        filter((x) => x !== null),
        tap((commentsData) => {
          this.loading = false;
          this.populateComments({ ...commentsData });
        })
      )
      .subscribe();

    this.errorMessage$ = this.store.select(wfStateErrorSelector);
    this.errorMessage$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.loading = false;
    });
  }

  populateComments(gridData: GridDataResult) {
    this.comments = [];
    gridData.data.forEach((item) => {
      let comment: CommentData = {
        fields: [],
        createdAt: item['createdAt'],
        id: item.id
      };
      this.commentSchema.fields.forEach((field) => {
        let fieldName = field.fieldName;
        const isUrlInString = this.sharedService.isUrl(item[fieldName]);
        comment.fields.push({
          type: field.type,
          value: item[fieldName],
          label: field.displayName,
          isUrl: isUrlInString,
          url: isUrlInString ? this.sharedService.extractUrlFromString(item[fieldName]) : null
        });
      });
      this.comments.push(comment);
    });

    if (this.commentIdToPreload) {
      this.editComment(this.commentIdToPreload);
    }
    this.commentsEmitter.emit(this.comments);
    if (this.comments.length) {
      const lastIndex = this.comments.length - 1;
      if (this.comments[lastIndex].createdAt) {
        this.lastComment?.emit(this.comments[lastIndex]);
      }
    } else {
      this.lastComment?.emit(null);
    }
  }

  async setUpPermissions(): Promise<void> {
    const schemaPermissions = await this.schemaPermissionsHelper.getSchemaPermissions(
      this.commentSchema?.id,
      AreaTypeEnum.comment,
      this.tenant
    );
    this.setPermissions(schemaPermissions);
  }

  setPermissions(schemaPermissions: PermissionSettings): void {
    this.permissions = {
      add: schemaPermissions.add,
      edit: schemaPermissions.edit,
      delete: schemaPermissions.delete
    };
  }

  deleteComment(comment: CommentData) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.dynamicEntitiesService.deleteById(this.tenantId, comment.id, this.commentSchema.id, AreaTypeEnum.comment);
        // now remove the id from the comment field of the case
        this.removeCommentReferenceFromCase(comment.id);
      }
    });
  }

  /**
   * update dynamic entity (remove the deleted commentId reference)
   */
  async removeCommentReferenceFromCase(commentId: string): Promise<void> {
    const caseDe: DynamicEntityDto = await this.dynamicEntitiesService.getById(
      this.tenant,
      this.caseId,
      this.workflow.caseSchemaId,
      AreaTypeEnum.case,
      true
    );
    const filteredFields: BaseFieldValueType[] = caseDe.fields.map((x) => {
      if (x.type === FieldTypeIds.ListOfLinksField) {
        x.value = (x.value as string[]).filter((id) => {
          return id !== commentId;
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
        schemaId: this.workflow.caseSchemaId,
        areaType: AreaTypeEnum.case,
        fields: filteredFields
      },
      schemaId: this.workflow.id
    };

    this.store.dispatch(new UpdateWorkflowStateCase({ data: cmd, workflowStateId: this.workflowState.id }));
  }

  async initDataByIds(): Promise<void> {
    const paging: Paging = { skip: 0, take: 50 };
    await this.dynamicGridUiService.queryMany(
      this.areaTypeEnum.comment,
      this.tenantId,
      this.commentSchema?.id,
      this.commentDeIds,
      paging,
      null,
      [],
      QueryingArea.CaseComments
    );
  }

  toggleActivity() {
    this.closeActivity.emit(true);
  }

  async getCommentFields(): Promise<void> {
    try {
      this.caseSchema = await this.adminSchemasService.getSchema(this.tenantId, AreaTypeEnum.case, this.workflow.caseSchemaId);
      const commentSchemaField = this.caseSchema.fields.find(
        (f) => f.type === FieldTypeIds.ListOfLinksField && f.schemaFieldConfiguration['schemaAreaType'] === AreaTypeEnum.comment
      );
      if (commentSchemaField) {
        this.commentLinkField = this.workflowState.case.fields.find(
          (f) => f.type === FieldTypeIds.ListOfLinksField && f.id === commentSchemaField?.fieldName
        );
        this.commentDeIds = <string[]>this.commentLinkField?.value;
        const commentSchemaId = commentSchemaField?.schemaFieldConfiguration['schemaId'];
        if (commentSchemaId) {
          this.commentSchema = await this.adminSchemasService.getSchema(this.tenantId, AreaTypeEnum.comment, commentSchemaId);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  async addCommentToWorkflowState(operations: Operation[]): Promise<void> {
    this.loading = true;
    const caseDe = cloneDeep(this.workflowState.case);
    const commentFieldFiltered = this.caseSchema.fields.filter(
      (f) =>
        f.type === FieldTypeIds.ListOfLinksField &&
        f.configuration.schemaAreaType === AreaTypeEnum.comment &&
        f.configuration.schemaId === this.commentSchema.id
    );
    if (caseDe && commentFieldFiltered) {
      let commentIdsField: ListOfLinkFieldValueDto;
      let deFields = [];
      if (caseDe.fields?.length) {
        caseDe.fields.forEach((f: BaseFieldValueDto) => {
          if (f.type === FieldTypeIds.ListOfLinksField && f.id === commentFieldFiltered[0]?.fieldName) {
            commentIdsField = cloneDeep(f);
          } else {
            deFields.push(f);
          }
        });
      }
      if (!commentIdsField) {
        commentIdsField = {
          id: commentFieldFiltered[0].fieldName,
          type: FieldTypeIds.ListOfLinksField,
          value: []
        };
      }
      commentIdsField.value = [...commentIdsField.value, operations[0]?.targetId];
      deFields.push(commentIdsField);
      const updateCmd: UpdateStateCase = {
        workflowStateId: this.workflowState.id,
        tenantId: this.tenantId,
        caseDynamicEntity: {
          appId: this.appId,
          tenantId: this.tenantId,
          schemaId: this.caseSchema.id,
          areaType: AreaTypeEnum.case,
          fields: deFields
        },
        schemaId: this.workflow.id
      };
      this.store.dispatch(new UpdateWorkflowStateCase({ data: updateCmd, workflowStateId: this.workflowState.id }));
      this.actions$
        .pipe(
          filter((action) => action.type === WorkflowActionTypes.UpdateWorkflowStateCaseSuccess),
          take(1)
        )
        .subscribe(async () => {
          await this.getCommentFields();
          this.initDataByIds();
        });
    }
  }

  scrollToElement(el?: HTMLElement) {
    if (el) {
      this.scrollToBottom(el);
    }
  }

  editComment(commentId: string): void {
    this.commentToUpdate = this.getDeFieldKeyValuePairs(this.dynamicGridUiService.dynamicEntities.find((f) => f.id === commentId));
    if (this.commentToUpdate) {
      this.showCreateComment = !this.showCreateComment;
    }
  }

  getDeFieldKeyValuePairs(de?: DynamicEntityDto): Row {
    if (de) {
      let row: Row = {
        publicId: de.id
      };
      de.fields.forEach((field) => {
        row[field.id] = field.value;
      });

      row.valueMap = this.getDynamicEntityMap(de.fields);
      row.systemFields = {
        statusId: de.statusId,
        createdAt: de.createdAt,
        updatedAt: de.updatedAt
      };

      return row;
    }
    return null;
  }

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

  closeComment(loadComments?: boolean): void {
    this.showCreateComment = !this.showCreateComment;
    if (this.commentToUpdate) this.commentToUpdate = null;
    if (loadComments) this.getCommentFields();
  }

  getWorkflowStateById(): void {
    this.store.dispatch(new GetWorkflowStateById({ id: this.wfStateId, schemaId: this.wfSchemaId }));
  }
}
