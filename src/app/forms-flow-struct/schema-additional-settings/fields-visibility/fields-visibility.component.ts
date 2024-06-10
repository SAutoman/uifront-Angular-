import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { MatOptionSelectionChange } from '@angular/material/core';
import { Store } from '@ngrx/store';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { IConfigurableListItem, IKeyValueView } from '@wfm/common/models';
import { FieldTypeComplexFields, FieldTypeIds, Roles } from '@wfm/service-layer';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { ApplicationState, GetTenantUserGroups, userGroupsSelector } from '@wfm/store';
import { distinctUntilChanged, filter, take, takeUntil } from 'rxjs/operators';

export interface HideFieldSetting {
  roles: Roles[];
  groups: string[];
  fieldPath: string[];
}

export interface FieldSettingFormData {
  roles: Roles[];
  groups: string[];
  fieldPathString: string;
  displayName: string;
}

interface NameValue {
  name: string;
  value: string | Roles;
}

export interface FieldsVisibilityOutput {
  isValid: boolean;
  data: HideFieldSetting[];
}

@Component({
  selector: 'app-fields-visibility',
  templateUrl: './fields-visibility.component.html',
  styleUrls: ['./fields-visibility.component.scss']
})
export class FieldsVisibilityComponent extends TenantComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() fieldsVisibilitySettings: HideFieldSetting[];
  form: FormGroup;

  @Output() emitter: EventEmitter<FieldsVisibilityOutput> = new EventEmitter();
  fieldOptions: IKeyValueView<string, string>[];

  roles: NameValue[];
  groups: NameValue[];
  constructor(private store: Store<ApplicationState>, private fb: FormBuilder, private expressionHelper: ExpressionHelperService) {
    super(store);
  }

  get fieldSettings(): FormArray {
    return this.form?.controls['fieldSettings'] as FormArray;
  }

  ngOnInit(): void {
    this.populateFieldOptions();

    this.form = this.fb.group({
      selectedFields: [],
      fieldSettings: this.fb.array([])
    });

    this.form.valueChanges
      .pipe(
        filter((x) => !!x),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.emitToParent();
      });
    if (this.fieldsVisibilitySettings?.length) {
      const selection = [];
      this.fieldsVisibilitySettings.forEach((sett: HideFieldSetting) => {
        const settPathString = sett.fieldPath.join(pathSeparator);
        //cleanup the settings for the removed fields
        if (!this.fieldOptions.find((option) => option.value === settPathString)) {
          return;
        }
        this.addFieldSetting(sett);
        selection.push(settPathString);
      });
      this.form.get('selectedFields').setValue(selection);
    }
    this.getRoles();
    this.getUserGroups();
  }

  getRoles(): void {
    const roles = [Roles.Tenant, Roles.TenantAdmin, Roles.Supplier, Roles.Auditor];

    this.roles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });
  }

  async getUserGroups(): Promise<void> {
    this.store
      .select(userGroupsSelector)
      .pipe(take(2))
      .subscribe((result) => {
        if (isUndefinedOrNull(result)) {
          this.store.dispatch(new GetTenantUserGroups({ tenantId: this.tenant }));
        } else {
          this.groups = result.map((group) => {
            return {
              name: group.name,
              value: group.id
            };
          });
        }
      });
  }

  addFieldSetting(setting: HideFieldSetting): void {
    let displayName =
      this.fieldOptions.find((f) => f.value === setting.fieldPath.join(pathSeparator))?.key || setting.fieldPath.join(pathSeparator) || '';
    const settingForm = this.fb.group(
      {
        displayName: [displayName],
        fieldPathString: [setting?.fieldPath?.join(pathSeparator), Validators.required],
        roles: [setting?.roles],
        groups: [setting?.groups]
      },
      {
        validators: [this.fieldSettingValidator()]
      }
    );
    this.fieldSettings.push(settingForm);
  }

  removeFieldSetting(fieldPathString: string): void {
    let index = this.fieldSettings.value.findIndex((sett) => sett.fieldPathString === fieldPathString);
    if (index >= 0) {
      this.fieldSettings.removeAt(index);
    }
  }

  optionChanged(event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      const isSelected = event.source.selected;
      const fieldPathString = event.source.value;
      if (isSelected) {
        this.addFieldSetting({
          fieldPath: fieldPathString.split(pathSeparator),
          roles: [],
          groups: []
        });
      } else {
        // if unselected, remove from additionalSettingsFormArray
        this.removeFieldSetting(fieldPathString);
      }
    }
  }

  emitToParent(): void {
    const output: FieldsVisibilityOutput = {
      isValid: this.form.valid,
      data: this.fieldSettings.controls.map((form: FormGroup) => {
        const formValue: FieldSettingFormData = form.value;
        return {
          fieldPath: formValue.fieldPathString.split(pathSeparator),
          roles: formValue.roles,
          groups: formValue.groups
        };
      })
    };

    this.emitter.next(output);
  }

  fieldSettingValidator(): ValidatorFn {
    return (group: FormGroup) => {
      return group.get('roles').value.length || group.get('groups').value.length ? null : { invalidHideFieldSetting: true };
    };
  }

  populateFieldOptions(): void {
    this.fieldOptions = [];
    const allFIelds = [];
    this.fields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      allFIelds.push(...retrieved);
    });

    this.fieldOptions = allFIelds
      .filter((f) => !FieldTypeComplexFields.includes(f.value.type))
      .map((option) => {
        const path = this.getPath(option.value, []);
        return {
          key: option.key,
          value: path.join(pathSeparator),
          viewValue: option.value.displayName
        };
      });

    const systemFields = [
      {
        key: 'Status',
        value: GridSystemFieldsEnum.STATUS,
        viewValue: 'Status'
      },
      {
        key: 'CreatedAt',
        value: GridSystemFieldsEnum.CREATED_AT,
        viewValue: 'CreatedAt'
      },
      {
        key: 'UpdatedAt',
        value: GridSystemFieldsEnum.UPDATED_AT,
        viewValue: 'UpdatedAt'
      }
    ];
    this.fieldOptions = [...this.fieldOptions, ...systemFields];
  }

  getPath(field, path: string[]): string[] {
    path.unshift(field.fieldName || field.name);
    if (field.parentField) {
      path = this.getPath(field.parentField, path);
    }
    return path;
  }
}
