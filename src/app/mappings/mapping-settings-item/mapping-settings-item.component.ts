import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MappingSettings } from '../mapping-settings/mapping-settings.component';
import { FieldTypeIds, Roles, SchemaDto, SchemaFieldDto, whiteSpaceValidator } from '@wfm/service-layer';
import { Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { Store } from '@ngrx/store';

enum MappingSettingTypeEnum {
  DEFAULT = 0,
  MAPPED_AND_UNMAPPED,
  EXACT_MATCH
}

export interface MappingSettingsItem {
  settingType: MappingSettingTypeEnum;
  fieldName: string;
  valueSeparator: string;
  roleType: Roles;
}

@Component({
  selector: 'app-mapping-settings-item',
  templateUrl: './mapping-settings-item.component.html',
  styleUrls: ['./mapping-settings-item.component.scss']
})
export class MappingSettingsItemComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy {
  @Input() setting$: Observable<MappingSettings>;
  @Input() roleType: Roles;
  @Input() schemas: SchemaDto[];
  @Input() schemaId: string;

  @Output() formStatus: EventEmitter<boolean> = new EventEmitter();
  @Output() formValue: EventEmitter<MappingSettingsItem> = new EventEmitter(null);

  rolesRightsForm: FormGroup;
  fieldSeparators: string[] = [',', ';', ':', '|', '/', '\\', '-', '#'];
  formSubscriber: Subscription;
  schemaFields: SchemaFieldDto[];

  get mappingSettingTypeEnum() {
    return MappingSettingTypeEnum;
  }

  constructor(private fb: FormBuilder, private store: Store<ApplicationState>) {
    super(store);
    this.rolesRightsForm = this.fb.group({
      settingType: [MappingSettingTypeEnum.DEFAULT],
      fieldName: [null],
      valueSeparator: [this.fieldSeparators[0]]
    });
    this.subsribeToRoleFormChanges();
  }

  ngOnInit(): void {
    this.setting$.pipe(takeUntil(this.destroyed$)).subscribe((sett) => {
      this.updateSettings(sett);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.schemaId?.currentValue) {
      this.getSchemaFields();
      this.rolesRightsForm.controls.fieldName.setValue(this.schemaFields[0]?.fieldName);
    }
  }

  updateSettings(mappSetting: MappingSettings): void {
    const rolePermissions = mappSetting?.rolePermissions;
    const setting = rolePermissions?.find((x) => x.role === this.roleType)?.permission;
    this.rolesRightsForm.controls.settingType.setValue(setting?.settingType || MappingSettingTypeEnum.DEFAULT);
    if (setting?.settingType === MappingSettingTypeEnum.EXACT_MATCH) {
      this.rolesRightsForm.patchValue({
        fieldName: setting?.fields[0].fieldName || null,
        valueSeparator: setting?.keyValueSeperator || null
      });
    }
  }

  getSchemaFields(): void {
    const selectedSchema = this.schemas.find((x) => x.id === this.schemaId);
    this.schemaFields = selectedSchema?.fields?.filter((x) => x.type === FieldTypeIds.StringField || x.type === FieldTypeIds.TextareaField);
  }

  subsribeToRoleFormChanges(): void {
    this.formSubscriber = this.rolesRightsForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      if (x.settingType !== MappingSettingTypeEnum.EXACT_MATCH) {
        delete x.fieldName;
        delete x.valueSeparator;
      }
      const value: MappingSettingsItem = { ...x, roleType: this.roleType };
      this.formValue.emit(value);
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.formSubscriber.unsubscribe();
  }
}
