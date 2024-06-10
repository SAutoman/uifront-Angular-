import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { IFormlyView, KeyValueView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { WorkflowStatusDto, UserGroupsDto, Roles, FieldTypeIds, SchemaDto, AreaTypeEnum } from '@wfm/service-layer';
import { ExpressionConfig, ExpressionDefOutput } from '../../rules-builder/rules-builder.component';
import { FieldLinkOverrideComponent } from '../../workflow-field-link/field-link-override/field-link-override.component';
import { cloneDeep } from 'lodash-core';
import { RawDataLinkOverride, RawDataLinkRightMap, RawDataLinkRightsEnum } from '../rawdata-link.model';
import { ValidationRuleSetEvent } from '../aggregation-validation/aggregation-validation.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RawDataPath } from '@wfm/service-layer/models/expressionModel';
@Component({
  selector: 'app-raw-data-link-override',
  templateUrl: './raw-data-link-override.component.html',
  styleUrls: ['./raw-data-link-override.component.scss']
})
export class RawDataLinkOverrideComponent implements OnInit {
  @Input() fieldLabel: string;
  @Input() fieldName: string;
  @Input() rawDataSchema: SchemaDto;
  @Input() caseSchema: SchemaDto;
  @Input() override: RawDataLinkOverride;
  @Input() statuses: WorkflowStatusDto[];
  @Input() userGroups: UserGroupsDto[];
  view: IFormlyView;
  roles: { name: string; value: Roles }[];
  rights: { name: string; value: RawDataLinkRightsEnum }[];

  ruleConfig: ExpressionConfig;
  rawDataExpressionData: ExpressionDefOutput;
  caseExpressionData: ExpressionDefOutput;

  rawDataItemsValidations: ValidationRuleSetEvent;
  isExpressionExpanded: boolean = false;
  isValidationExpanded: boolean = false;
  hideRawDataValidation: boolean = false;
  showCaseRules: boolean = false;
  rawDataReferences: Array<KeyValueView<string, SchemaDto>> = [];
  invalidAggregations: boolean = false;
  constructor(
    private fb: FormBuilder,
    private matdialogRef: MatDialogRef<FieldLinkOverrideComponent>,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService,
    private snackbar: MatSnackBar
  ) {
    this.initRolesAndRights();
  }

  async ngOnInit() {
    this.checkExpandedState();
    await this.populateRawDataReferences();
    this.initFormly();

    this.ruleConfig = {
      rules: true,
      rulesLabel: ''
    };
  }

  async populateRawDataReferences(): Promise<void> {
    const refs = this.caseSchema?.fields.filter((f) => {
      return f.type === FieldTypeIds.ListOfLinksField && f.configuration.schemaAreaType === AreaTypeEnum.rawData;
    });

    for (const field of refs) {
      const schema = await this.adminSchemasService.getSchema(this.caseSchema.tenantId, AreaTypeEnum.rawData, field.configuration.schemaId);

      this.rawDataReferences.push(new KeyValueView(field.fieldName, schema, field.displayName));
    }
  }

  initRolesAndRights(): void {
    const roles = [Roles.Tenant, Roles.TenantAdmin, Roles.Supplier, Roles.Auditor];

    this.roles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });
    const rights = [RawDataLinkRightsEnum.CanAddToNew, , RawDataLinkRightsEnum.CanAddToExisting, RawDataLinkRightsEnum.CanDeleteFromCase];

    this.rights = rights.map((right) => {
      const rightData = RawDataLinkRightMap.get(right);
      return {
        name: rightData.viewValue,
        value: rightData.value
      };
    });
  }

  /**
   * expand by default if override has ruleSet or aggregationValidation
   */
  checkExpandedState(): void {
    if (this.override) {
      if (this.override.ruleSet?.rules?.length || this.override.caseFieldsRuleSet?.rules?.length) {
        this.isExpressionExpanded = true;
      }

      if (this.override.rawDataItemsValidation?.validations?.length) {
        this.isValidationExpanded = true;
      }
    }
  }

  initFormly(): void {
    const nameAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Rule Name'),
      name: 'name',
      type: FieldTypeIds.StringField,
      value: null,
      required: true
    });

    const rawDataStatuses = this.statuses?.map((status) => {
      return {
        key: status.name,
        value: status.id
      };
    });
    rawDataStatuses.unshift({
      key: 'Unassigned',
      value: '-1'
    });
    const rawDataStatusAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Allowed RawData Statuses'),
      name: 'allowedRawDataStatusesIds',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: rawDataStatuses
      }
    });

    const caseStatusAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Allowed Case Statuses'),
      name: 'allowedCaseStatusesIds',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: this.statuses?.map((status) => {
          return {
            key: status.name,
            value: status.id
          };
        })
      }
    });

    const rolesAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('User Roles'),
      name: 'roles',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: this.roles?.map((role) => {
          return {
            key: this.ts.instant(role.name),
            value: role.value
          };
        })
      }
    });

    const userGroupsAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('User Groups'),
      name: 'userGroupIds',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: this.userGroups?.map((group) => {
          return {
            key: group.name,
            value: group.id
          };
        })
      }
    });

    const fieldRightsAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Action For Which Rules Are To Be Evaluated'),
      name: 'rawDataLinkRight',
      type: FieldTypeIds.ListField,
      value: null,
      required: true,
      disabled: this.override ? true : false,
      valueInfo: {
        options: this.rights?.map((actionRight) => {
          return {
            key: this.ts.instant(actionRight.name),
            value: actionRight.value
          };
        })
      }
    });

    const name = nameAdapter.getConfig();
    const rawDataStatus = rawDataStatusAdapter.getConfig();
    const caseStatus = caseStatusAdapter.getConfig();

    const role = rolesAdapter.getConfig();
    const group = userGroupsAdapter.getConfig();
    const rawDataLinkRight = fieldRightsAdapter.getConfig();

    this.view = {
      fields: [name, rawDataLinkRight, rawDataStatus, caseStatus, role, group],
      form: this.fb.group({}),
      model: {
        name: '',
        allowedRawDataStatusesIds: [],
        allowedCaseStatusesIds: [],
        roles: [],
        userGroupIds: [],
        rawDataLinkRight: null
      }
    };
    setTimeout(() => {
      // wait until form gets initialized
      this.view.form.get('rawDataLinkRight').valueChanges.subscribe((value) => {
        switch (value) {
          case RawDataLinkRightsEnum.CanAddToNew:
            caseStatus.hide = true;
            caseStatus.formControl.setValue(null);
            this.hideRawDataValidation = false;
            this.showCaseRules = false;
            break;
          case RawDataLinkRightsEnum.CanAddToExisting:
            caseStatus.hide = false;
            this.hideRawDataValidation = false;
            this.showCaseRules = true;
            break;
          case RawDataLinkRightsEnum.CanDeleteFromCase:
            this.hideRawDataValidation = true;
            caseStatus.hide = false;
            this.showCaseRules = false;
            break;
          default:
            break;
        }
      });

      if (this.override) {
        this.setModelValues();
      }
    });
  }

  setModelValues(): void {
    this.view.model = {
      ...this.override
    };
    if (this.override.allowUnassignedStatus) {
      this.view.model.allowedRawDataStatusesIds.push('-1');
    }

    this.rawDataExpressionData = { data: { ruleSet: this.override.ruleSet }, isValid: true };
    if (this.override.caseFieldsRuleSet) {
      this.caseExpressionData = { data: { ruleSet: this.override.caseFieldsRuleSet }, isValid: true };
    }
  }

  save(): void {
    const overrideData: RawDataLinkOverride = this.view.model;
    overrideData.ruleSet = cloneDeep(this.rawDataExpressionData?.data?.ruleSet);
    overrideData.allowUnassignedStatus = false;
    // unassigned status handled via separate prop
    overrideData.allowedRawDataStatusesIds = overrideData.allowedRawDataStatusesIds?.filter((statusId) => {
      if (statusId == '-1') {
        overrideData.allowUnassignedStatus = true;
        return false;
      }
      return true;
    });
    delete this.rawDataItemsValidations?.isValid;
    overrideData.rawDataItemsValidation = this.rawDataItemsValidations;
    if (this.showCaseRules && this.caseExpressionData?.data?.ruleSet?.rules?.length) {
      overrideData.caseFieldsRuleSet = cloneDeep(this.caseExpressionData.data.ruleSet);
    } else {
      delete overrideData.caseFieldsRuleSet;
    }
    this.matdialogRef.close({ data: overrideData });
  }

  rulesUpdated(event: ExpressionDefOutput): void {
    this.rawDataExpressionData = cloneDeep(event);
  }

  caseRulesUpdated(event: ExpressionDefOutput): void {
    this.caseExpressionData = cloneDeep(event);
  }

  rawDataItemsValidationUpdated(event: ValidationRuleSetEvent): void {
    this.rawDataItemsValidations = event;
    this.validateAggregationForAddToNew();
  }

  validateAggregationForAddToNew(): void {
    this.invalidAggregations = false;
    if (
      this.rawDataItemsValidations?.validations?.length &&
      this.view.form.get('rawDataLinkRight').value === RawDataLinkRightsEnum.CanAddToNew
    ) {
      for (let index = 0; index < this.rawDataItemsValidations.validations.length; index++) {
        const validation = this.rawDataItemsValidations.validations[index];
        // single field aggregation
        if (validation?.field?.fieldsPath) {
          for (let j = 0; j < validation.field.fieldsPath.length; j++) {
            const fieldPath = validation.field.fieldsPath[j] as RawDataPath;
            if (fieldPath && fieldPath.rawDataFieldName !== this.fieldName) {
              this.invalidAggregations = true;
              this.snackbar.open(
                this.ts.instant('Aggregations for fields from other rawData schemas are not implemented for AddToNew rules'),
                this.ts.instant('Ok'),
                { duration: 3000 }
              );
              break;
            }
          }
          // range field aggregation
        } else if (validation?.rangeField?.fromToFieldsPath) {
          for (let j = 0; j < validation.rangeField.fromToFieldsPath.length; j++) {
            const fromToFieldPath = validation.rangeField.fromToFieldsPath[j];
            if (fromToFieldPath.fromFieldPath && (<RawDataPath>fromToFieldPath.fromFieldPath).rawDataFieldName !== this.fieldName) {
              this.invalidAggregations = true;

              this.snackbar.open(
                this.ts.instant('Aggregations for fields from other rawData schemas are not implemented for AddToNew rules'),
                this.ts.instant('Ok'),
                { duration: 3000 }
              );
              break;
            }
          }
        }
      }
    }
  }

  close(): void {
    this.matdialogRef.close();
  }

  isValid(): boolean {
    return (
      this.view.form.valid &&
      this.rawDataExpressionData?.isValid &&
      (this.hideRawDataValidation || this.rawDataItemsValidations?.isValid) &&
      (!this.showCaseRules || this.caseExpressionData?.isValid)
    );
  }
}
