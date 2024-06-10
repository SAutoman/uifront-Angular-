/**
 * global
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep, sortBy } from 'lodash-core';
import { MatSelectChange } from '@angular/material/select';

/**
 * project
 */
import {
  AggregationEnumBackend,
  AggregationEnumBackendExtended,
  FieldTypeComplexFields,
  FieldTypeIds,
  FieldTypeNameMap,
  StatePersistingService,
  WorkflowSimplifiedDto,
  reportGridSettingsKey
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, FetchWorkflowMenuData, loggedInState, workflowMenuItemsSelector } from '@wfm/store';
import { TreeLikeNodes } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { ProcessStepPath, PropertyPath, PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
/**
 * local
 */
import {
  ReportTypeEnum,
  CreateDataSourceDto,
  DatasourceFieldsTree,
  DatasourceField,
  DataSourceDto,
  DatasourceFieldsConfig,
  GroupByField,
  ReportAggregationConfig
} from '../report-datasource.model';

import {
  CreateDatasource,
  CreateDatasourceSuccess,
  DatasourceActionTypes,
  GetDatasource,
  GetDatasourceFieldsTree,
  UpdateDatasource,
  UpdateDatasourceSuccess,
  selectCurrentDatasource,
  selectReportsFieldsTree
} from '@wfm/store/report-datasource';
import { Actions } from '@ngrx/effects';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { AggregateTypeNameMap } from '@wfm/service-layer/models/aggregate-types-enum';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { TranslateService } from '@ngx-translate/core';

const caseFieldsLabel = 'Case Fields';
const caseFieldsKey = 'caseSchemaFields';
const stepsFieldsLabel = 'ProcessSteps Fields';
const stepsFieldsKey = 'processStepSchemaFields';
@Component({
  selector: 'app-datasource-builder',
  templateUrl: './datasource-builder.component.html',
  styleUrls: ['./datasource-builder.component.scss']
})
export class DatasourceBuilderComponent extends TenantComponent implements OnInit {
  @Input() isEditMode: boolean;
  @Output() modeChanged = new EventEmitter<boolean>();
  @Output() removeDataSource = new EventEmitter<boolean>();
  datasource: DataSourceDto;
  workflows: WorkflowSimplifiedDto[];
  form: FormGroup;
  datasourceFieldsTree: TreeLikeNodes;
  // An array of datasource fields' stringified propertyPaths
  selectedItems: string[] = [];
  // output from treeSelectbox
  selectedNodesData: TreeNodeOutput[] = [];
  userId: string;
  cachedWorkflowFields: { [key: string]: DatasourceFieldsTree } = {};
  currentWorkflowSchemaId: string;
  isViewModeActivated: boolean = true;
  isEditActivated: boolean = false;
  fieldsTitleMap: { [key: string]: string } = {};

  fieldsAggregationMap: { [key: string]: AggregationEnumBackendExtended } = {};
  nodesAreValid: boolean;
  get reportType() {
    return ReportTypeEnum;
  }

  constructor(
    private store: Store<ApplicationState>,
    private snackbar: MatSnackBar,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private action$: Actions,
    private cd: ChangeDetectorRef,
    private errorHandler: ErrorHandlerService,
    private ts: TranslateService,
    private persistingService: StatePersistingService
  ) {
    super(store);

    store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
      });
  }

  ngOnInit(): void {
    this.loadWorkflows();
    this.subscribeToFieldsTree();
    this.initForm();
    this.subscribeToCurrentDatasource();
    this.isEditActivated = this.isEditMode === true ? true : false;
    this.isViewModeActivated = this.isEditMode === true ? false : true;
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      workflowSchemaId: [null, Validators.required],
      reportType: [ReportTypeEnum.GRID, Validators.required]
    });

    this.form
      .get('workflowSchemaId')
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe((wfId) => {
        this.currentWorkflowSchemaId = wfId;
        this.datasourceFieldsTree = null;
        this.selectedNodesData = [];
        this.selectedItems = [];
        this.cd.detectChanges();
        this.store.dispatch(new GetDatasourceFieldsTree({ workflowSchemaId: wfId, tenantId: this.tenant }));
      });
  }

  subscribeToFieldsTree(): void {
    this.store
      .select(selectReportsFieldsTree)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data) => {
        this.cachedWorkflowFields = cloneDeep(data);
        if (this.cachedWorkflowFields && this.cachedWorkflowFields.hasOwnProperty(this.currentWorkflowSchemaId)) {
          this.buildTreeSource(this.cachedWorkflowFields[this.currentWorkflowSchemaId]);
        }
      });
  }

  subscribeToCurrentDatasource(): void {
    this.store
      .select(selectCurrentDatasource)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (data) => {
        this.datasource = cloneDeep(data);
        this.datasourceFieldsTree = null;
        this.selectedItems = [];
        this.cd.detectChanges();
        this.currentWorkflowSchemaId = this.datasource.workflowSchemaId;
        this.store.dispatch(new GetDatasourceFieldsTree({ workflowSchemaId: this.datasource.workflowSchemaId, tenantId: this.tenant }));
        this.updateForm();
      });
  }

  updateForm(): void {
    this.selectedItems = [];

    this.form.patchValue({
      name: this.datasource.name,
      workflowSchemaId: this.datasource.workflowSchemaId,
      reportType: this.datasource.reportType
    });
    this.form.get('workflowSchemaId').disable();
    try {
      const datasourceObj: DatasourceFieldsConfig = this.datasource.dataSourceUI;
      this.populateTitles(datasourceObj);
      this.populateAggregationMap(datasourceObj);
      datasourceObj.caseSchemaFields?.forEach((field) => {
        this.populateReportField(field, datasourceObj);
      });
      datasourceObj.processStepSchemaFields?.forEach((field) => {
        this.populateReportField(field, datasourceObj);
      });
      this.cd.detectChanges();
    } catch (error) {
      this.errorHandler.getAndShowErrorMsg(error);
    }
  }

  loadWorkflows(): void {
    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length) {
        this.workflows = x.map((menuItem) => menuItem.setting);
      }
    });
  }

  save(): void {
    if (this.datasource) {
      this.updateDatasource();

      this.persistingService.remove(`${reportGridSettingsKey}_${this.datasource.id}`);
    } else {
      this.createDatasource();
    }
  }

  showSnackbar(message: string, duration: number): void {
    this.snackbar.open(message, 'CLOSE', {
      duration: duration
    });
  }

  updateDatasource(): void {
    const datasourceObject = this.populateDatasourceDto(this.form.get('reportType').value);
    if (!this.isDatasourceValid(datasourceObject)) {
      return;
    }

    const dto: DataSourceDto = {
      id: this.datasource.id,
      name: this.form.get('name').value,
      workflowSchemaId: this.form.get('workflowSchemaId').value,
      tenantId: this.tenant,
      dataSource: JSON.stringify(datasourceObject),
      reportType: this.form.get('reportType').value
    };

    this.store.dispatch(new UpdateDatasource({ data: dto }));

    this.action$
      .pipe(
        filter((action) => action.type === DatasourceActionTypes.UpdateDatasourceSuccess),
        take(1),
        takeUntil(this.destroyed$)
      )
      .subscribe((action: UpdateDatasourceSuccess) => {
        this.showSnackbar(this.ts.instant('Datasource Updated'), 2000);

        this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));

        this.store.dispatch(new GetDatasource({ datasourceId: dto.id, tenantId: this.tenant }));
      });
  }

  createDatasource(): void {
    const datasourceObject = this.populateDatasourceDto(this.form.get('reportType').value);
    if (!this.isDatasourceValid(datasourceObject)) {
      return;
    }
    const dto: CreateDataSourceDto = {
      name: this.form.get('name').value,
      workflowSchemaId: this.form.get('workflowSchemaId').value,
      tenantId: this.tenant,
      dataSource: JSON.stringify(datasourceObject),
      reportType: this.form.get('reportType').value
    };
    this.store.dispatch(new CreateDatasource({ data: dto }));

    this.action$
      .pipe(
        filter((action) => action.type === DatasourceActionTypes.CreateDatasourceSuccess),
        take(1),
        takeUntil(this.destroyed$)
      )
      .subscribe((action: CreateDatasourceSuccess) => {
        this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
        this.router.navigate(['..', action.payload.datasourceId], { relativeTo: this.route });
      });
  }

  populateDatasourceDto(reportType: ReportTypeEnum): DatasourceFieldsConfig {
    const dto: DatasourceFieldsConfig = {
      [caseFieldsKey]: [],
      [stepsFieldsKey]: []
    };

    if (reportType === ReportTypeEnum.AGGREGATION) {
      dto.aggregationConfigs = [];
      dto.groupByFields = [];
    }
    this.selectedNodesData.forEach((node: TreeNodeOutput) => {
      if (node.additionalData.datasourceField) {
        const field = node.additionalData.datasourceField;

        if (field.isSystemField || field.propertyPath?.pathType === PropertyPathTypeEnum.CasePath) {
          dto[caseFieldsKey].push(<DatasourceField>{
            id: field.id || null,
            propertyPath: field.propertyPath || null,
            fieldName: field.fieldName,
            displayName: field.displayName,
            customReportTitle: field?.customReportTitle,
            type: field.type,
            pathSchemaFieldIds: field.pathSchemaFieldIds || null,
            position: field.position,
            isSystemField: field.isSystemField
          });
        } else if (field.propertyPath.pathType === PropertyPathTypeEnum.ProcessStepPath) {
          dto[stepsFieldsKey].push(<DatasourceField>{
            id: field.id,
            propertyPath: field.propertyPath,
            fieldName: field.fieldName,
            displayName: field.displayName,
            customReportTitle: field?.customReportTitle,
            type: field.type,
            pathSchemaFieldIds: field.pathSchemaFieldIds,
            position: field.position
          });
        }
        if (reportType === ReportTypeEnum.AGGREGATION) {
          if (field.aggregationType === AggregationEnumBackendExtended.Group) {
            dto.groupByFields.push({
              fieldName: field.fieldName,
              propertyPath: field.propertyPath
            });
          } else {
            dto.aggregationConfigs.push({
              field: field.fieldName,
              propertyPath: field.propertyPath,
              aggregate: field.aggregationType as unknown as AggregationEnumBackend
            });
          }
        }
      }
    });
    return dto;
  }

  // populate the workflow fields tree for TreeSelectbox component
  buildTreeSource(fields: DatasourceFieldsTree): void {
    this.datasourceFieldsTree = null;
    let tree: TreeLikeNodes = {
      [caseFieldsLabel]: {
        rawValue: caseFieldsKey,
        children: {},
        additionalData: {
          datasourceField: null
        }
      },
      [stepsFieldsLabel]: {
        rawValue: stepsFieldsKey,
        children: this.buildStepTopLevel(fields.processStepSchemaFields),
        additionalData: {
          datasourceField: null
        }
      }
    };
    fields.caseSchemaFields = sortBy(fields.caseSchemaFields || [], [(x) => x.position]);
    fields.caseSchemaFields.forEach((field) => {
      this.buildCaseTree(tree[caseFieldsLabel].children, field, 0);
    });

    if (fields.processStepSchemaFields?.length) {
      fields.processStepSchemaFields = sortBy(fields.processStepSchemaFields || [], [(x) => x.position]);
      fields.processStepSchemaFields.forEach((field) => {
        this.buildStepsTree(tree[stepsFieldsLabel].children, field, 0);
      });
    } else {
      delete tree[stepsFieldsLabel];
    }

    this.datasourceFieldsTree = { ...tree };
  }

  /**
   * build the steps' top level (by stepRefName)
   */
  buildStepTopLevel(fields: DatasourceField[]): TreeLikeNodes {
    let targetObj: TreeLikeNodes = {};
    fields.forEach((item) => {
      const propPath = item.propertyPath as ProcessStepPath;
      if (!targetObj.hasOwnProperty(propPath.processStepRefName)) {
        targetObj[propPath.processStepRefName] = {
          rawValue: [stepsFieldsLabel, propPath.processStepRefName].join(pathSeparator),
          children: {},
          additionalData: {
            datasourceField: null
          }
        };
      }
    });
    return targetObj;
  }

  /**
   * build the subtree of  stepField
   */
  buildStepsTree(targetObject: TreeLikeNodes, stepField: DatasourceField, level: number): void {
    if (stepField.type === FieldTypeIds.ListOfLinksField) {
      return;
    }
    const propPath = stepField.propertyPath as ProcessStepPath;
    const itemPathString = this.getJoinedPath(stepField.propertyPath);

    const stepTree = targetObject[propPath.processStepRefName];

    const fieldTitle = this.fieldsTitleMap[itemPathString];
    const fieldAggregation = this.fieldsAggregationMap[itemPathString];

    if (!stepTree.children.hasOwnProperty(stepField.propertyPath.path[level])) {
      stepTree.children[stepField.propertyPath.path[level]] = {
        rawValue: itemPathString,
        children: {},
        additionalData: {
          fieldType: stepField.type,
          datasourceField: {
            id: stepField.id,
            fieldName: stepField.fieldName,
            displayName: stepField.displayName,
            customReportTitle: fieldTitle ? fieldTitle : null,
            propertyPath: { ...stepField.propertyPath },
            type: stepField.type,
            pathSchemaFieldIds: stepField.pathSchemaFieldIds,
            position: stepField.position,
            aggregationType: !isUndefinedOrNull(fieldAggregation) ? fieldAggregation : null
          }
        }
      };
    }

    if (stepField.nestedSchemaFields) {
      let nextLevelObject = stepTree.children[stepField.propertyPath?.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, stepField, level, itemPathString);
    }
  }

  /**
   * build the subtree of  caseField
   */
  buildCaseTree(targetObject: TreeLikeNodes, caseField: DatasourceField, level: number): void {
    if (
      caseField.type === FieldTypeIds.ListOfLinksField ||
      (!caseField.isSystemField && caseField.propertyPath && !caseField.propertyPath?.path[level])
    ) {
      return;
    }

    const itemPathString = this.getJoinedPath(caseField.propertyPath, caseField.fieldName);
    const fieldTitle = this.fieldsTitleMap[itemPathString];
    const fieldAggregation = this.fieldsAggregationMap[itemPathString];

    if (caseField.isSystemField) {
      targetObject[caseField.fieldName] = {
        rawValue: this.getJoinedPath(null, caseField.fieldName),
        children: {},
        additionalData: {
          fieldType: caseField.type,
          datasourceField: {
            id: null,
            fieldName: caseField.fieldName,
            displayName: caseField.displayName,
            customReportTitle: fieldTitle || null,
            propertyPath: null,
            type: caseField.type,
            pathSchemaFieldIds: null,
            position: caseField.position,
            isSystemField: true,
            aggregationType: !isUndefinedOrNull(fieldAggregation) ? fieldAggregation : null
          }
        }
      };
    } else {
      const itemPathString = this.getJoinedPath(caseField.propertyPath);
      if (!targetObject.hasOwnProperty(caseField.propertyPath.path[level])) {
        targetObject[caseField.propertyPath.path[level]] = {
          rawValue: itemPathString,
          children: {},
          additionalData: {
            fieldType: caseField.type,
            datasourceField: {
              id: caseField.id,
              fieldName: caseField.fieldName,
              displayName: caseField.displayName,
              customReportTitle: fieldTitle || null,
              propertyPath: { ...caseField.propertyPath },
              type: caseField.type,
              pathSchemaFieldIds: caseField.pathSchemaFieldIds,
              position: caseField.position,
              aggregationType: !isUndefinedOrNull(fieldAggregation) ? fieldAggregation : null
            }
          }
        };
      }

      if (caseField.nestedSchemaFields) {
        let nextLevelObject = targetObject[caseField.propertyPath.path[level]].children;
        this.populateNestedFieldsHierarchy(nextLevelObject, caseField, level, itemPathString);
      }
    }
  }

  /**
   * build the subtrees of  case/step field's nested fields
   */

  populateNestedFieldsHierarchy(treeObject: TreeLikeNodes, item: DatasourceField, level: number, parentPathString: string): void {
    level++;
    item.nestedSchemaFields = sortBy(item.nestedSchemaFields || [], [(x) => x.position]);
    item.nestedSchemaFields.forEach((nestedField) => {
      this.buildNextLevel(treeObject, nestedField, level, parentPathString);
    });
  }

  /**
   * build a subtree of  case/step  nested field
   */
  buildNextLevel(targetObject: TreeLikeNodes, item: DatasourceField, level: number, parentPath: string): void {
    if (item.type === FieldTypeIds.ListOfLinksField || !item.propertyPath.path[level]) {
      return;
    }
    const itemPathString = [parentPath, item.fieldName].join(pathSeparator);
    const fieldTitle = this.fieldsTitleMap[itemPathString];
    const fieldAggregation = this.fieldsAggregationMap[itemPathString];

    if (!targetObject.hasOwnProperty(item.propertyPath.path[level])) {
      targetObject[item.propertyPath.path[level]] = {
        rawValue: itemPathString,
        children: {},
        additionalData: {
          fieldType: item.type,
          datasourceField: {
            id: item.id,
            fieldName: item.fieldName,
            displayName: item.displayName,
            customReportTitle: fieldTitle || null,
            propertyPath: { ...item.propertyPath },
            type: item.type,
            pathSchemaFieldIds: item.pathSchemaFieldIds,
            position: item.position,
            aggregationType: !isUndefinedOrNull(fieldAggregation) ? fieldAggregation : null
          }
        }
      };
    }

    if (item.nestedSchemaFields) {
      let nextLevelObject = targetObject[item.propertyPath.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, item, level, itemPathString);
    }
  }

  fieldSelectionEmitted(event: TreeNodeOutput[]): void {
    this.nodesAreValid = false;
    this.selectedNodesData = event;
    this.nodesAreValid = this.areNodesValid();
  }

  toggleEdit(): void {
    this.modeChanged.emit(true);
    this.isViewModeActivated = false;
    this.isEditActivated = true;
    this.cd.detectChanges();
  }

  toggleView(): void {
    this.modeChanged.emit(false);
    this.isViewModeActivated = true;
    this.isEditActivated = false;
    this.cd.detectChanges();
  }

  removeDatasource(): void {
    this.removeDataSource.emit();
  }

  populateReportField(field: DatasourceField, datasourceObj: DatasourceFieldsConfig): void {
    let pathJoined = this.getJoinedPath(field.propertyPath, field.fieldName);
    this.selectedItems.push(pathJoined);
  }

  getJoinedPath(propPath: PropertyPath, systemFieldName?: string): string {
    if (propPath) {
      switch (propPath.pathType) {
        case PropertyPathTypeEnum.CasePath:
          return [caseFieldsKey, ...propPath.path].join(pathSeparator);
        case PropertyPathTypeEnum.ProcessStepPath:
          return [stepsFieldsKey, (<ProcessStepPath>propPath).processStepRefName, ...propPath.path].join(pathSeparator);
        default:
          break;
      }
    } else if (systemFieldName) {
      return [caseFieldsKey, systemFieldName].join(pathSeparator);
    }
  }

  getFieldLabel(sourceField: DatasourceField): string {
    let label;
    if (sourceField.propertyPath) {
      if (sourceField.propertyPath.pathType === PropertyPathTypeEnum.CasePath) {
        label = `${caseFieldsLabel} - ${sourceField.propertyPath.path.join('.')}`;
      } else if (sourceField.propertyPath.pathType === PropertyPathTypeEnum.ProcessStepPath) {
        label = `${stepsFieldsLabel} - ${
          (<ProcessStepPath>sourceField.propertyPath).processStepRefName
        }.${sourceField.propertyPath.path.join('.')}`;
      }
    } else {
      label = sourceField.displayName;
    }

    label += ` (${FieldTypeNameMap.get(sourceField.type).viewValue})`;

    return label;
  }

  isDatasourceValid(config: DatasourceFieldsConfig): boolean {
    // report needs at least on case field
    if (!config.caseSchemaFields.length) {
      this.showSnackbar(this.ts.instant('You need to select at least 1 Case Field'), 5000);
      return false;
    }
    return true;
  }

  validateAggregation(fieldNode: TreeNodeOutput, index: number): boolean {
    const fieldPathString = this.getJoinedPath(
      fieldNode.additionalData.datasourceField.propertyPath,
      fieldNode.additionalData.datasourceField.fieldName
    );
    const field = this.selectedNodesData.find((node) => {
      return node.value === fieldPathString;
    });
    let isPassed = false;

    if (!isUndefinedOrNull(field.additionalData.datasourceField.aggregationType)) {
      switch (fieldNode.additionalData.datasourceField.aggregationType) {
        case AggregationEnumBackendExtended.Avg:
        case AggregationEnumBackendExtended.Sum:
          if ([FieldTypeIds.IntField, FieldTypeIds.DecimalField].includes(field.additionalData.fieldType)) {
            isPassed = true;
          }
          break;
        case AggregationEnumBackendExtended.Min:
        case AggregationEnumBackendExtended.Max:
          if (
            [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.DateField, FieldTypeIds.DateTimeField].includes(
              field.additionalData.fieldType
            )
          ) {
            isPassed = true;
          }
          break;
        case AggregationEnumBackendExtended.Count:
        case AggregationEnumBackendExtended.Group:
          isPassed = true;
          break;

        default:
          break;
      }

      if (!isPassed) {
        const aggText = `Aggregation ${AggregateTypeNameMap.get(fieldNode.additionalData.datasourceField.aggregationType).viewValue}`;
        this.showSnackbar(
          `${this.ts.instant(aggText)}  ${this.ts.instant('cannot be applied for the selected field')}: ${this.getFieldLabel(
            field.additionalData.datasourceField
          )}`,
          5000
        );
      }
    }

    return isPassed;
  }

  populateTitles(datasource: DatasourceFieldsConfig): void {
    datasource.caseSchemaFields.forEach((field) => {
      if (field.customReportTitle) {
        const joinedPath = this.getJoinedPath(field.propertyPath, field.fieldName);
        this.fieldsTitleMap[joinedPath] = field.customReportTitle;
      }
    });

    datasource.processStepSchemaFields.forEach((field) => {
      if (field.customReportTitle) {
        const joinedPath = this.getJoinedPath(field.propertyPath, field.fieldName);
        this.fieldsTitleMap[joinedPath] = field.customReportTitle;
      }
    });
  }

  populateAggregationMap(datasource: DatasourceFieldsConfig): void {
    datasource.aggregationConfigs?.forEach((config) => {
      const joinedPath = this.getJoinedPath(config.propertyPath, config.field);
      this.fieldsAggregationMap[joinedPath] = config.aggregate as unknown as AggregationEnumBackendExtended;
    });

    datasource.groupByFields?.forEach((group) => {
      const joinedPath = this.getJoinedPath(group.propertyPath, group.fieldName);
      this.fieldsAggregationMap[joinedPath] = AggregationEnumBackendExtended.Group;
    });
  }

  areNodesValid(): boolean {
    if (!this.selectedNodesData.length) {
      return false;
    } else {
      if (this.form.get('reportType').value === ReportTypeEnum.GRID) {
        return true;
      } else {
        for (let index = 0; index < this.selectedNodesData.length; index++) {
          const node = this.selectedNodesData[index];
          if (!this.validateAggregation(node, index)) {
            return false;
          }
        }
        return true;
      }
    }
  }
}
