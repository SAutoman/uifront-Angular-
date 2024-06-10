import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * Global
 */
import { IKeyValueView } from '@wfm/common/models';
import {
  AreaTypeToUIAreaMapper,
  FieldTypeIds,
  keyForSchemaTitleSettings,
  SchemaDto,
  SchemaTitleSettingModel,
  SchemaTitleSettings,
  Settings,
  SettingsUI,
  TenantSettingsDto,
  TenantSettingsService,
  AdditionalSettingItem,
  UiAreasEnum
} from '@wfm/service-layer';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AuthState, FetchTenantSettingsAction, tenantSettingsSelector, loggedInState } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { isIntegerValidator } from '@wfm/service-layer/helpers';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { MatOptionSelectionChange } from '@angular/material/core';
/**
 * Project
 */

@Component({
  selector: 'app-title-formatter-per-schema',
  templateUrl: './title-formatter-per-schema.component.html',
  styleUrls: ['./title-formatter-per-schema.component.scss']
})
export class TitleFormatterPerSchemaComponent extends TenantComponent implements OnInit {
  @Input() schema$: Observable<SchemaDto>;
  schema: SchemaDto;
  uiAreas: IKeyValueView<string, UiAreasEnum>[];
  fieldOptions: IKeyValueView<string, string>[];
  form: FormGroup;
  tenantAuthState: AuthState;
  titleTenantSettings: SettingsUI;
  titleSettingsData: SchemaTitleSettings;
  fieldSeparators: string[] = [',', ';', ':', '|', '/', '\\', '-', 'New Line'];
  get areaForms(): FormArray {
    return this.form?.controls['areaForms'] as FormArray;
  }
  constructor(
    private fb: FormBuilder,
    private store: Store<ApplicationState>,
    private tenantSettingsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  stopDrag(e: MouseEvent): void {
    e.stopPropagation();
  }

  ngOnInit() {
    this.schema$.subscribe((schema: SchemaDto) => {
      this.schema = cloneDeep(schema);
      if (schema) {
        this.uiAreas = this.getUIAreas();
        this.fieldOptions = this.getSchemaFieldOptions();
        const systemFields = [
          {
            key: GridSystemFieldsEnum.STATUS,
            value: GridSystemFieldsEnum.STATUS,
            viewValue: 'Status'
          },
          {
            key: GridSystemFieldsEnum.CREATED_AT,
            value: GridSystemFieldsEnum.CREATED_AT,
            viewValue: 'CreatedAt'
          },
          {
            key: GridSystemFieldsEnum.UPDATED_AT,
            value: GridSystemFieldsEnum.UPDATED_AT,
            viewValue: 'UpdatedAt'
          }
        ];
        this.fieldOptions = [...this.fieldOptions, ...systemFields];
        this.addSystemFieldsToSchema(systemFields);
        this.store
          .pipe(
            select(loggedInState),
            filter((x) => !!x),
            takeUntil(this.destroyed$)
          )
          .subscribe((data) => {
            if (data) {
              this.tenantAuthState = data;
            }
          });
        this.store
          .pipe(
            select(tenantSettingsSelector),
            filter((x) => !!x),
            takeUntil(this.destroyed$)
          )
          .subscribe((data) => {
            if (data) {
              this.fetchSettings(data);
              this.initFormGroup();
            }
          });
      }
    });
  }

  addSystemFieldsToSchema(fields: IKeyValueView<string, string>[]): void {
    if (fields?.length) {
      fields.forEach((field) => {
        this.schema.fields.push({
          id: null,
          schemaFieldConfiguration: null,
          type: FieldTypeIds.StringField,
          displayName: field.viewValue,
          fieldName: field.key
        });
      });
    }
  }

  fetchSettings(tenantSettings: SettingsUI[]): void {
    this.titleTenantSettings = tenantSettings?.find((x) => x.key.includes(this.getSettingTitle()));
    this.titleSettingsData = null;
    if (this.titleTenantSettings) {
      this.titleSettingsData = this.titleTenantSettings.value;
    }
  }

  getUIAreas(): IKeyValueView<string, UiAreasEnum>[] {
    return AreaTypeToUIAreaMapper.get(this.schema.areaType);
  }

  initFormGroup(): void {
    let forms: FormGroup[] = this.uiAreas.map((area) => {
      let savedSettings: SchemaTitleSettingModel;
      if (this.titleSettingsData) {
        savedSettings = this.titleSettingsData.schemaTitles.find((sett) => sett.area === area.value);
      }
      return this.fb.group({
        keyValueSeparator: [savedSettings?.keyValueSeparator || ''],
        fieldsSeparator: [savedSettings?.fieldSeparator || ''],
        fields: [savedSettings?.fields || []],
        area: [area.value],
        fieldsAdditionalSettings: this.fb.array([])
      });
    });

    this.form = this.fb.group({
      areaForms: this.fb.array(forms)
    });
    this.populateAdditionalSettingsForms();
  }

  optionChanged(event: MatOptionSelectionChange, areaIndex: number): void {
    if (event.isUserInput) {
      const isSelected = event.source.selected;
      const fieldName = event.source.value;
      if (isSelected) {
        const fieldsSettings = this.fieldsAdditionalSettings(areaIndex);
        this.pushNewAdditionalSettings(areaIndex, {
          fieldName: fieldName,
          numberOfSymbolsFieldName: 0,
          numberOfSymbolsFieldValue: null,
          position: fieldsSettings?.length
        });
      } else {
        // if unselected, remove from additionalSettingsFormArray
        this.removeAdditionalSettings(areaIndex, fieldName);
      }
    }
  }

  populateAdditionalSettingsForms(): void {
    this.uiAreas.forEach((area, areaIndex) => {
      let savedSettings: SchemaTitleSettingModel;
      if (this.titleSettingsData) {
        savedSettings = this.titleSettingsData.schemaTitles.find((sett) => sett.area === area.value);
        if (savedSettings && savedSettings.additionalSettings) {
          let sortedSettings = [];
          // settings sorted by position
          for (const key in savedSettings.additionalSettings) {
            sortedSettings.push(savedSettings.additionalSettings[key]);
          }
          sortedSettings = sortedSettings?.sort((a, b) => {
            return a?.position - b?.position;
          });
          // add formArray of additionalSettings per selected fields
          if (sortedSettings?.length) {
            // counter for invalid fields
            let invalidEntriesCount: number = 0;
            for (let index = 0; index < sortedSettings.length; index++) {
              if (this.fieldOptions.find((x) => x.key === sortedSettings[index]?.fieldName)) {
                const additionalSetting = sortedSettings[index];
                this.pushNewAdditionalSettings(areaIndex, {
                  fieldName: additionalSetting?.fieldName,
                  numberOfSymbolsFieldName: additionalSetting?.numberOfSymbolsFieldName || 0,
                  numberOfSymbolsFieldValue: additionalSetting?.numberOfSymbolsFieldValue,
                  position: additionalSetting?.position
                    ? additionalSetting.position && invalidEntriesCount > 0
                      ? additionalSetting.position - invalidEntriesCount
                      : additionalSetting.position
                    : this.fieldsAdditionalSettings(areaIndex)?.length
                });
              } else {
                // Update positions If a field is removed from schema
                invalidEntriesCount++;
              }
            }
          }
        }
      }
    });
  }

  // get a direct ref to fieldsAdditionalSettings formArray
  fieldsAdditionalSettings(areaIndex: number): FormArray {
    return this.areaForms?.at(areaIndex)?.get('fieldsAdditionalSettings') as FormArray;
  }

  createAdditionalSettingsForm(setting: AdditionalSettingItem): FormGroup {
    let displayName = this.schema.fields.find((f) => f.fieldName === setting.fieldName)?.displayName || setting.fieldName || '';
    return this.fb.group({
      fieldName: setting.fieldName || '',
      displayName: displayName,
      numberOfSymbolsFieldName: [setting.numberOfSymbolsFieldName || 0, [Validators.required, Validators.min(-1), isIntegerValidator()]],
      numberOfSymbolsFieldValue: [setting.numberOfSymbolsFieldValue, [Validators.min(0), isIntegerValidator()]],
      position: [setting.position]
    });
  }

  pushNewAdditionalSettings(areaIndex: number, savedSettings: AdditionalSettingItem) {
    this.fieldsAdditionalSettings(areaIndex).push(this.createAdditionalSettingsForm(savedSettings));
  }

  removeAdditionalSettings(areaIndex: number, fieldName: string) {
    let fieldsSettings = this.fieldsAdditionalSettings(areaIndex);
    let index = fieldsSettings.value.findIndex((sett) => sett.fieldName === fieldName);
    if (index >= 0) {
      this.fieldsAdditionalSettings(areaIndex).removeAt(index);
      this.updateOrderOnRemove(index, fieldsSettings);
    }
  }

  updateOrderOnRemove(startIndex: number, fieldSettings: FormArray): void {
    for (let index = startIndex; index < fieldSettings?.length; index++) {
      const group = <FormGroup>fieldSettings.controls[index];
      group.controls.position.setValue(index);
    }
  }

  getSchemaFieldOptions(): IKeyValueView<string, string>[] {
    let filteredFields = this.schema.fields
      ?.sort((a, b) => {
        return a?.configuration?.position - b?.configuration?.position;
      })
      .filter(
        (field) =>
          field.type !== FieldTypeIds.EmbededField &&
          field.type !== FieldTypeIds.ListOfLinksField &&
          field.type !== FieldTypeIds.SignatureField &&
          field.type !== FieldTypeIds.YouTubeEmbedField
      );

    return filteredFields.map((field) => {
      return <IKeyValueView<string, string>>{
        key: field.fieldName,
        value: field.fieldName,
        viewValue: field.displayName
      };
    });
  }

  async onSubmit(): Promise<void> {
    this.titleSettingsData = this.form.value['areaForms'].map((areaData) => {
      let additionalSettings = {};
      areaData?.fieldsAdditionalSettings?.forEach((item) => {
        additionalSettings[item.fieldName] = item;
      });
      let data: SchemaTitleSettingModel = {
        area: areaData.area,
        keyValueSeparator: areaData.keyValueSeparator,
        fieldSeparator: areaData.fieldsSeparator,
        fields: areaData.fields,
        additionalSettings: additionalSettings
      };
      return data;
    });
    const userSettings = <Settings>{
      key: this.getSettingTitle(),
      value: { schemaId: this.schema.id, schemaTitles: this.titleSettingsData },
      id: this.titleTenantSettings?.id || null
    };
    const cmd = <TenantSettingsDto>{
      settings: [userSettings],
      tenantId: this.tenant
    };
    try {
      const operation = await this.tenantSettingsService.update(cmd);
      this.snackBar.open(this.ts.instant('Tenant Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
      this.refreshTenantSettings();
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  getSettingTitle(): string {
    return `${keyForSchemaTitleSettings}_${this.schema.id}_${this.schema.areaType}`;
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  resetSettings(index: number): void {
    let formGroup = this.areaForms.at(index) as FormGroup;
    formGroup.patchValue({
      keyValueSeparator: '',
      fieldsSeparator: '',
      fields: '',
      area: this.uiAreas[index].value
    });
    (<FormArray>formGroup.controls['fieldsAdditionalSettings']).clear();
  }

  async deleteSettings(): Promise<void> {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      disableClose: true,
      data: <ConfirmActionData>{ title: 'Alert', message: 'Are you sure you want to delete the settings?', showProceedBtn: true }
    });
    dialogRef.afterClosed().subscribe(async (x) => {
      if (x) {
        await this.tenantSettingsService.delete(this.tenant, this.titleTenantSettings.id);
        this.form.reset();
        this.refreshTenantSettings();
      }
    });
  }

  onDrag(e: CdkDragDrop<any[]>, areaIndex: number) {
    const areaFormGroup = this.fieldsAdditionalSettings(areaIndex);
    if (e.previousContainer === e.container) {
      const reorderedData = areaFormGroup.controls;
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      this.updateFieldSettingPositions(reorderedData);
    }
  }

  updateFieldSettingPositions(data: any[]): void {
    data.forEach((x, idx) => {
      if (x.controls?.position.value !== idx) {
        x.controls.position.setValue(idx);
      }
    });
  }
}
