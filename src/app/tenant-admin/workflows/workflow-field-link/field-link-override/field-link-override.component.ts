/**
 * global
 */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, FormlyFieldAdapterTypeEnum } from '@wfm/common/vendor';
import { FieldTypeIds, Roles, UserGroupsDto, WorkflowStatusDto } from '@wfm/service-layer';
/**
 * local
 */
import { FieldLinkOverride } from '../field-link.model';

@Component({
  selector: 'app-field-link-override',
  templateUrl: './field-link-override.component.html',
  styleUrls: ['./field-link-override.component.scss'],
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }]
})
export class FieldLinkOverrideComponent implements OnInit {
  @Input() field: string;
  @Input() override: FieldLinkOverride;
  @Input() statuses: WorkflowStatusDto[];
  @Input() userGroups: UserGroupsDto[];
  view: IFormlyView;
  roles: { name: string; value: Roles }[];

  constructor(private fb: FormBuilder, private matdialogRef: MatDialogRef<FieldLinkOverrideComponent>, private ts: TranslateService) {
    const roles = [Roles.Tenant, Roles.TenantAdmin, Roles.Supplier, Roles.Auditor];

    this.roles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });
  }

  ngOnInit() {
    this.initFormly();

    if (this.override) {
      this.view.model = {
        ...this.override
      };
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
    const statusAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Select Statuses'),
      name: 'workflowStatusIds',
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

    const fieldRightsAdapter: FormlyFieldConfig = {
      key: 'caseFieldLinkOverrideRights',
      fieldGroup: this.createRightsFields()
    };

    const name = nameAdapter.getConfig();
    const status = statusAdapter.getConfig();
    const role = rolesAdapter.getConfig();
    const group = userGroupsAdapter.getConfig();
    const rights = fieldRightsAdapter;

    this.view = {
      fields: [name, status, role, group, rights],
      form: this.fb.group({}),
      model: {
        name: '',
        workflowStatusIds: [],
        roles: [],
        userGroupIds: [],
        caseFieldLinkOverrideRights: {
          canEdit: true,
          canView: true
        }
      }
    };
  }

  createRightsFields(): FormlyFieldConfig[] {
    const canEdit = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Can Edit'),
      name: 'canEdit',
      type: FieldTypeIds.BoolField,
      value: null,
      valueInfo: {
        renderType: FormlyFieldAdapterTypeEnum.radio
      }
    });

    const canView = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Can View'),
      name: 'canView',
      type: FieldTypeIds.BoolField,
      value: null,
      valueInfo: {
        renderType: FormlyFieldAdapterTypeEnum.radio
      }
    });

    return [canView.getConfig(), canEdit.getConfig()];
  }

  save(): void {
    const overrideData = this.view.model;
    this.matdialogRef.close({ data: overrideData });
  }

  close(): void {
    this.matdialogRef.close();
  }
}
