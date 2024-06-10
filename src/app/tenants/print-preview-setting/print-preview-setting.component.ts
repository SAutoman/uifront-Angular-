/**
 * global
 */

import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep, sortBy } from 'lodash-core';

/**
 * project
 */
import { DatasourceField } from '@wfm/report/report-datasource.model';
import {
  FieldTypeIds,
  PrintPreviewSettingValues,
  Settings,
  SettingsUI,
  TenantSettingsDto,
  TenantSettingsService,
  WorkflowService,
  WorkflowSimplifiedDto
} from '@wfm/service-layer';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TreeLikeNodes, TreeNodeAdditionalData } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { AuthState, FetchTenantSettingsAction, tenantSettingsSelector, loggedInState, workflowMenuItemsSelector } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';

import { CommentPath, ProcessStepPath, PropertyPathTypeEnum, RawDataPath } from '@wfm/service-layer/models/expressionModel';

/**
 * local
 */
import { PrintPreviewFieldsTree, getSystemFieldsForPreview } from './print-preview.model';

const rawDataFieldsLabel = 'Raw Data Fields';
const rawDataFieldsKey = 'rawDataSchemaFields';
const caseFieldsLabel = 'Case Fields';
const caseFieldsKey = 'caseSchemaFields';
const stepsFieldsLabel = 'ProcessSteps Fields';
const stepsFieldsKey = 'processStepSchemaFields';
const commentFieldsKey = 'commentSchemaFields';
const commentFieldsLabel = 'Comment Fields';
export const casePrintPeviewSettingsKey = 'casePrintPreviewSettings';

@Component({
  selector: 'app-print-preview-setting',
  templateUrl: './print-preview-setting.component.html',
  styleUrls: ['./print-preview-setting.component.scss']
})
export class PrintPreviewSettingComponent extends TenantComponent implements OnInit {
  @Output() formStatus: EventEmitter<boolean> = new EventEmitter();

  workflowsList: WorkflowSimplifiedDto[];
  tenantSettings: SettingsUI[];
  tenantAuthState: AuthState;
  workflowSelector: FormControl;
  datasourceFieldsTree: { [x: string]: { rawValue?: string; children: TreeLikeNodes; additionalData?: TreeNodeAdditionalData } };
  selectedItems: string[] = [];
  selectedNodesData: TreeNodeOutput[];
  settingSavedFlag: boolean = false;
  settings: PrintPreviewSettingValues;
  settingId: string;

  constructor(
    private store: Store<ApplicationState>,
    private tenantSettingsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService,
    private workflowService: WorkflowService,
    private cd: ChangeDetectorRef
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data) {
        this.tenantAuthState = data;
      }
    });

    this.workflowSelector = new FormControl(null, Validators.required);
    this.store.pipe(select(tenantSettingsSelector), takeUntil(this.destroyed$)).subscribe((settings) => {
      this.tenantSettings = settings;
    });
  }

  async ngOnInit(): Promise<void> {
    this.store.pipe(select(workflowMenuItemsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length) {
        this.workflowsList = x.map((menuItem) => menuItem.setting);
        this.getTenantSettings();
      }
    });

    this.workflowSelector.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.getFields(x);
    });
  }

  getTenantSettings(): void {
    const wfId = this.workflowSelector.value;
    if (!wfId) {
      this.workflowSelector.patchValue(this.workflowsList[0]?.id);
    }
    this.getFields(this.workflowSelector.value);
  }

  getExistingSetting(wfId: string): void {
    if (wfId) {
      const setting = this.tenantSettings.find((x) => x.key === `${casePrintPeviewSettingsKey}_${wfId}`);
      this.settings = setting?.value;
      this.settingId = setting?.id;
      this.selectedItems = [];
      if (this.settings) {
        for (const key in this.settings) {
          const data = this.settings[key];
          this.selectedItems = [...this.selectedItems, ...data?.map((x) => x?.treePathString)];
        }
      }
    }
  }

  async getFields(wfId: string): Promise<void> {
    try {
      this.getExistingSetting(wfId);
      const data = await this.workflowService.getWorkflowFieldsTree(this.tenant, wfId);
      if (data) {
        let cachedWorkflowFields: PrintPreviewFieldsTree = cloneDeep(data);
        if (cachedWorkflowFields) {
          this.buildTreeSource(cachedWorkflowFields);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  // populate the workflow fields tree for TreeSelectbox component
  buildTreeSource(fields: PrintPreviewFieldsTree): void {
    this.datasourceFieldsTree = null;
    this.cd.detectChanges();

    let tree: TreeLikeNodes = {};
    // RawData fields
    if (fields.rawDataSchemaFields.length) {
      tree[rawDataFieldsLabel] = {
        rawValue: rawDataFieldsKey,
        children: this.buildRawDataTopLevel(fields.rawDataSchemaFields),
        additionalData: {
          datasourceField: null
        }
      };

      fields.rawDataSchemaFields = sortBy(fields.rawDataSchemaFields || [], [(x) => x.position]);
      fields.rawDataSchemaFields.forEach((field) => {
        this.buildRawDataTree(tree[rawDataFieldsLabel].children, field, 0);
      });
    }

    // comment fields
    if (fields.commentSchemaFields.length) {
      tree[commentFieldsLabel] = {
        rawValue: commentFieldsKey,
        children: this.buildCommentTopLevel(fields.commentSchemaFields),
        additionalData: {
          datasourceField: null
        }
      };

      fields.commentSchemaFields = sortBy(fields.commentSchemaFields || [], [(x) => x.position]);
      fields.commentSchemaFields.forEach((field) => {
        this.buildCommentTree(tree[commentFieldsLabel].children, field, 0);
      });
    }

    // Case fields
    if (fields.caseSchemaFields.length) {
      tree[caseFieldsLabel] = {
        rawValue: caseFieldsKey,
        children: {},
        additionalData: {
          datasourceField: null
        }
      };
      fields.caseSchemaFields = sortBy(fields.caseSchemaFields || [], [(x) => x.position]);
      // Get System fields for Case Tree node
      fields.caseSchemaFields = [...fields.caseSchemaFields, ...getSystemFieldsForPreview(PropertyPathTypeEnum.CasePath)];
      fields.caseSchemaFields.forEach((field) => {
        this.buildCaseTree(tree[caseFieldsLabel].children, field, 0);
      });
    }
    // Step Fields
    if (fields.processStepSchemaFields.length) {
      tree[stepsFieldsLabel] = {
        rawValue: stepsFieldsKey,
        children: this.buildStepTopLevel(fields.processStepSchemaFields),
        additionalData: {
          datasourceField: null
        }
      };

      fields.processStepSchemaFields = sortBy(fields.processStepSchemaFields || [], [(x) => x.position]);
      fields.processStepSchemaFields.forEach((field) => {
        this.buildStepsTree(tree[stepsFieldsLabel].children, field, 0);
      });
    }

    this.datasourceFieldsTree = { ...tree };
    if (!this.settings) {
      // select all values by default If no setting found
      let valuesToBeSelected: string[] = [];
      for (const key in this.datasourceFieldsTree) {
        const parent = this.datasourceFieldsTree[key];
        valuesToBeSelected.push(parent.rawValue);
        this.selectAllByDefault(valuesToBeSelected, parent.children);
      }
      this.selectedItems = cloneDeep(valuesToBeSelected);
    }
  }

  selectAllByDefault(data: string[], nodes: TreeLikeNodes): string[] {
    for (const key in nodes) {
      const child = nodes[key];
      data.push(child.rawValue);
      if (Object.keys(child?.children)?.length) {
        this.selectAllByDefault(data, child.children);
      }
    }
    return data;
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
   * build Raw Data's top level (by rawDataFieldName)
   */
  buildRawDataTopLevel(fields: DatasourceField[]): TreeLikeNodes {
    let targetObj: TreeLikeNodes = {};

    fields.forEach((item) => {
      const propPath = item.propertyPath as RawDataPath;
      if (!targetObj.hasOwnProperty(propPath.rawDataFieldName)) {
        const systemFields = getSystemFieldsForPreview(PropertyPathTypeEnum.RawDataPath, propPath.rawDataFieldName);
        let systemChildren = {};
        systemFields.forEach((sysField) => {
          const itemPathString = [rawDataFieldsKey, propPath.rawDataFieldName, ...sysField.propertyPath.path].join(pathSeparator);

          systemChildren[sysField.fieldName] = {
            rawValue: itemPathString,
            children: {},
            additionalData: {
              fieldType: sysField.type,
              datasourceField: {
                propertyPath: sysField.propertyPath
              }
            }
          };
        });
        targetObj[propPath.rawDataFieldName] = {
          rawValue: [rawDataFieldsLabel, propPath.rawDataFieldName].join(pathSeparator),
          children: systemChildren,
          additionalData: {
            datasourceField: null
          }
        };
      }
    });
    return targetObj;
  }

  /**
   * build Comments top level (by CommentFieldName)
   */
  buildCommentTopLevel(fields: DatasourceField[]): TreeLikeNodes {
    let targetObj: TreeLikeNodes = {};

    fields.forEach((item) => {
      const propPath = item.propertyPath as CommentPath;
      if (!targetObj.hasOwnProperty(propPath.commentFieldName)) {
        const systemFields = getSystemFieldsForPreview(PropertyPathTypeEnum.CommentPath, propPath.commentFieldName);
        let systemChildren = {};
        systemFields.forEach((sysField) => {
          const itemPathString = [commentFieldsKey, propPath.commentFieldName, ...sysField.propertyPath.path].join(pathSeparator);

          systemChildren[sysField.fieldName] = {
            rawValue: itemPathString,
            children: {},
            additionalData: {
              fieldType: sysField.type,
              datasourceField: {
                propertyPath: sysField.propertyPath
              }
            }
          };
        });
        targetObj[propPath.commentFieldName] = {
          rawValue: [commentFieldsLabel, propPath.commentFieldName].join(pathSeparator),
          children: systemChildren,
          // children: {},
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
    const itemPathString = [stepsFieldsKey, propPath.processStepRefName, ...propPath.path].join(pathSeparator);

    const stepTree = targetObject[propPath.processStepRefName];
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
            propertyPath: { ...stepField.propertyPath },
            type: stepField.type,
            pathSchemaFieldIds: stepField.pathSchemaFieldIds,
            position: stepField.position
          }
        }
      };
    }

    if (stepField.nestedSchemaFields) {
      let nextLevelObject = stepTree.children[stepField.propertyPath.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, stepField, level, itemPathString);
    }
  }

  buildRawDataTree(field: TreeLikeNodes, rawDataField: DatasourceField, level: number) {
    if (rawDataField.type === FieldTypeIds.ListOfLinksField) {
      return;
    }
    const propPath = rawDataField.propertyPath as RawDataPath;
    const itemPathString = [rawDataFieldsKey, propPath.rawDataFieldName, ...propPath.path].join(pathSeparator);

    const rawDataTree = field[propPath.rawDataFieldName];
    if (!rawDataTree.children.hasOwnProperty(rawDataField.propertyPath.path[level])) {
      rawDataTree.children[rawDataField.propertyPath.path[level]] = {
        rawValue: itemPathString,
        children: {},
        additionalData: {
          fieldType: rawDataField.type,
          datasourceField: {
            id: rawDataField.id,
            fieldName: rawDataField.fieldName,
            displayName: rawDataField.displayName,
            propertyPath: { ...rawDataField.propertyPath },
            type: rawDataField.type,
            pathSchemaFieldIds: rawDataField.pathSchemaFieldIds,
            position: rawDataField.position
          }
        }
      };
    }

    if (rawDataField.nestedSchemaFields) {
      let nextLevelObject = rawDataTree.children[rawDataField.propertyPath.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, rawDataField, level, itemPathString);
    }
  }

  buildCommentTree(field: TreeLikeNodes, commentField: DatasourceField, level: number) {
    if (commentField.type === FieldTypeIds.ListOfLinksField) {
      return;
    }
    const propPath = commentField.propertyPath as CommentPath;
    const itemPathString = [commentFieldsKey, propPath.commentFieldName, ...propPath.path].join(pathSeparator);

    const commentTree = field[propPath.commentFieldName];
    if (!commentTree.children.hasOwnProperty(commentField.propertyPath.path[level])) {
      commentTree.children[commentField.propertyPath.path[level]] = {
        rawValue: itemPathString,
        children: {},
        additionalData: {
          fieldType: commentField.type,
          datasourceField: {
            id: commentField.id,
            fieldName: commentField.fieldName,
            displayName: commentField.displayName,
            propertyPath: { ...commentField.propertyPath },
            type: commentField.type,
            pathSchemaFieldIds: commentField.pathSchemaFieldIds,
            position: commentField.position
          }
        }
      };
    }

    if (commentField.nestedSchemaFields) {
      let nextLevelObject = commentTree.children[commentField.propertyPath.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, commentField, level, itemPathString);
    }
  }

  /**
   * build the subtree of  caseField
   */
  buildCaseTree(targetObject: TreeLikeNodes, caseField: DatasourceField, level: number): void {
    if (caseField.type === FieldTypeIds.ListOfLinksField || !caseField.propertyPath.path[level]) {
      return;
    }

    const itemPathString = [caseFieldsKey, ...caseField.propertyPath.path].join(pathSeparator);
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
            propertyPath: { ...caseField.propertyPath },
            type: caseField.type,
            pathSchemaFieldIds: caseField.pathSchemaFieldIds,
            position: caseField.position
          }
        }
      };
    }

    if (caseField.nestedSchemaFields) {
      let nextLevelObject = targetObject[caseField.propertyPath.path[level]].children;
      this.populateNestedFieldsHierarchy(nextLevelObject, caseField, level, itemPathString);
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
            propertyPath: { ...item.propertyPath },
            type: item.type,
            pathSchemaFieldIds: item.pathSchemaFieldIds,
            position: item.position
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
    this.selectedNodesData = event;
  }

  async onSubmit(): Promise<void> {
    this.settings = this.setFieldsForSave();
    const userSettings = <Settings>{
      key: `${casePrintPeviewSettingsKey}_${this.workflowSelector.value}`,
      value: this.settings,
      id: this.settingId
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    try {
      await this.tenantSettingsService.update(cmd);
      this.refreshTenantSettings();
      this.formStatus.emit(false);
      this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  setFieldsForSave(): PrintPreviewSettingValues {
    const obj: PrintPreviewSettingValues = {
      [rawDataFieldsKey]: [],
      [caseFieldsKey]: [],
      [stepsFieldsKey]: [],
      [commentFieldsKey]: []
    };
    this.selectedNodesData.forEach((node) => {
      if (node.value.includes(rawDataFieldsKey) || node.value.includes(rawDataFieldsLabel)) {
        obj[rawDataFieldsKey].push({
          treePathString: node.value,
          propertyPath: node.additionalData.datasourceField?.propertyPath
        });
      } else if (node.value.includes(caseFieldsKey) || node.value.includes(caseFieldsLabel)) {
        obj[caseFieldsKey].push({
          treePathString: node.value,
          propertyPath: node.additionalData.datasourceField?.propertyPath
        });
      } else if (node.value.includes(stepsFieldsKey) || node.value.includes(stepsFieldsLabel)) {
        obj[stepsFieldsKey].push({
          treePathString: node.value,
          propertyPath: node.additionalData.datasourceField?.propertyPath
        });
      } else if (node.value.includes(commentFieldsKey) || node.value.includes(commentFieldsLabel)) {
        obj[commentFieldsKey].push({
          treePathString: node.value,
          propertyPath: node.additionalData.datasourceField?.propertyPath
        });
      }
    });
    return obj;
  }

  setFieldsForSave1(): string[] {
    return this.selectedNodesData.map((x) => x.value);
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }
}
