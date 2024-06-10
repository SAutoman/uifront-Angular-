import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Store, select } from '@ngrx/store';
import { takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import {
  SettingsUI,
  searchTimeRangeKey,
  Settings,
  AreaTypeEnum,
  SchemaDto,
  TenantSettingsService,
  TenantSettingsDto,
  FieldSetting,
  FieldTypeIds,
  FieldRenderTypeEnum,
  SharedService
} from '@wfm/service-layer';
import { TimePeriodFormat, TimePeriodNameMap, TimePeriods } from '@wfm/service-layer/models/TimePeriodFormat';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, AuthState, FetchTenantSettingsAction, loggedInState, tenantSettingsSelector } from '@wfm/store';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Component({
  selector: 'app-search-time-period',
  templateUrl: './search-time-period.component.html',
  styleUrls: ['./search-time-period.component.scss'],
  providers: []
})
export class SearchTimePeriodComponent extends TenantComponent implements OnInit {
  @Input('areaTitle') areaType: AreaTypeEnum;
  @Input() schemasData: SchemaDto[];
  @Output() formStatus: EventEmitter<boolean> = new EventEmitter();

  isDefault: boolean = false;
  timePeriodSettings: SettingsUI;
  timePeriodSettingsForDisplay: SettingsUI;
  areaName: string;
  selectedSchemaId: string;
  tenantAuthState: AuthState;
  showSeconds: boolean = false;
  selectedField: string;
  timePeriodFieldSetting: FieldSetting;
  formlyView: IFormlyView;
  userDateTimeFormat: string;
  tenantSettings: SettingsUI[];

  constructor(
    private formBuilder: FormBuilder,
    private tenantsService: TenantSettingsService,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private dialog: MatDialog,
    private ts: TranslateService,
    private sharedService: SharedService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.initFormly();
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.tenantAuthState = x;
      });
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(tenantSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((x) => {
        this.tenantSettings = x;
        if (this.selectedSchemaId) {
          this.filterSettings();
        }
      });
    this.populateDateFormats();
    this.checkAreaTypeCase();
  }

  populateDateFormats(): void {
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  initFormly(): void {
    const timePeriodAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Time period to be applied to the search mask'),
      name: 'timePeriod',
      type: FieldTypeIds.ListField,
      value: null,
      required: true,

      valueInfo: {
        options: TimePeriods.map((timePeriodEnum) => {
          return {
            key: this.ts.instant(TimePeriodNameMap.get(timePeriodEnum).viewValue),
            value: TimePeriodNameMap.get(timePeriodEnum).value
          };
        }),
        renderType: FieldRenderTypeEnum.radio
      }
    });
    const timePeriodRadio = timePeriodAdapter.getConfig();
    timePeriodRadio.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe((v) => {
          if (v === TimePeriodFormat.Custom) {
            this.isDefault = true;
          } else {
            this.isDefault = false;
          }
          this.formStatus.emit(true);
        });
      }
    };

    const fromAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('From'),
      name: 'from',
      type: FieldTypeIds.DateTimeField,
      value: null,
      required: true
    });
    const fromDateField = fromAdapter.getConfig();

    fromDateField.hideExpression = (model) => {
      if (model.timePeriod !== TimePeriodFormat.Custom) {
        model['from'] = null;
        return true;
      }
      return false;
    };

    const toAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('To'),
      name: 'to',
      type: FieldTypeIds.DateTimeField,
      value: null,
      required: true
    });
    const toDateField = toAdapter.getConfig();
    toDateField.hideExpression = (model) => {
      if (model.timePeriod !== TimePeriodFormat.Custom) {
        model['to'] = null;
        return true;
      }
      return false;
    };

    this.formlyView = {
      fields: [timePeriodRadio, fromDateField, toDateField],
      form: this.formBuilder.group({}),
      model: {}
    };
  }

  filterSettings(): void {
    this.timePeriodSettings =
      cloneDeep(this.tenantSettings.find((s) => s.key.includes(`${searchTimeRangeKey}_${this.selectedSchemaId}_${this.areaType}`))) || null;
    this.timePeriodSettingsForDisplay = cloneDeep(this.timePeriodSettings);
    this.timePeriodSettingsForDisplay?.value?.data?.forEach((e) => {
      const value = TimePeriodNameMap.get(e?.timePeriod)?.viewValue;
      const fromAndTodateTime = this.sharedService.getFromAndToDateValues(e);
      e['fromValue'] = fromAndTodateTime.from;
      e['toValue'] = fromAndTodateTime.to;
      e['viewValue'] = `${value}`;
    });
    if (this.selectedField) {
      this.getSelectedField(this.selectedField);
    }
  }

  checkAreaTypeCase(): void {
    switch (this.areaType) {
      case AreaTypeEnum.rawData:
        this.areaName = 'Raw Data';
        break;
      case AreaTypeEnum.case:
        this.areaName = 'Cases';
        break;
      default:
        break;
    }
  }

  getSchemaId(id: string): void {
    if (id) {
      this.selectedSchemaId = id;
      this.selectedField = null;
      this.isDefault = false;
      this.formlyView.form.reset();
      this.filterSettings();
    }
  }

  getSelectedField(field: string): void {
    this.isDefault = false;
    this.selectedField = field;
    this.timePeriodFieldSetting = this.findCurrentFieldSetting(field);
    if (this.timePeriodFieldSetting) {
      this.formlyView.form.get('timePeriod').setValue(this.timePeriodFieldSetting?.timePeriod);
      if (this.timePeriodFieldSetting?.timePeriod === TimePeriodFormat.Custom) {
        setTimeout(() => {
          this.formlyView.form.get('from').setValue(DateTimeFormatHelper.parseToLuxon(this.timePeriodFieldSetting?.from).toJSDate());
          this.formlyView.form.get('to').setValue(DateTimeFormatHelper.parseToLuxon(this.timePeriodFieldSetting?.to).toJSDate());
        });
      }
    } else {
      this.formlyView.form.reset();
    }
  }

  findCurrentFieldSetting(field: string): FieldSetting {
    return this.timePeriodSettings?.value?.data?.find((x) => x.field === field) || null;
  }

  async onSubmit(): Promise<void> {
    try {
      const formValue = this.formlyView.model;

      let value = {
        field: this.selectedField,
        timePeriod: formValue.timePeriod,
        from: undefined,
        to: undefined
      };
      if (formValue.timePeriod === TimePeriodFormat.Custom) {
        this.setFromAndToDates(value);
        if (!this.formlyView.form.get('from').valid || !this.formlyView.form.get('to').valid) return;
      }
      // add field's setting
      const fields = this.prepareFields(value);
      await this.saveTenantSettings(fields);
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  prepareFields(item: FieldSetting): FieldSetting[] {
    const fieldsArray: FieldSetting[] = cloneDeep(this.timePeriodSettings?.value?.data) || [];
    const existingItem = fieldsArray?.find((x) => x.field === item.field);
    if (existingItem) {
      // update existing
      delete existingItem.from;
      delete existingItem.to;
      existingItem.timePeriod = item?.timePeriod;
      if (item.timePeriod === TimePeriodFormat.Custom) {
        existingItem.from = item?.from;
        existingItem.to = item?.to;
      }
    }
    // insert new
    else fieldsArray.push(item);
    return fieldsArray;
  }

  async saveTenantSettings(fields: FieldSetting[]): Promise<void> {
    const dateFormatSettings = <Settings>{
      key: `${searchTimeRangeKey}_${this.selectedSchemaId}_${this.areaType}}`,
      value: { data: fields },
      id: this.timePeriodSettings ? this.timePeriodSettings?.id : null,
      isUnique: true
    };
    const cmd = <TenantSettingsDto>{
      settings: [dateFormatSettings],
      tenantId: this.tenant
    };
    await this.tenantsService.update(cmd);
    this.formStatus.emit(false);
    this.snackBar.open(this.ts.instant('User Settings Saved Successfully!'), 'CLOSE', { duration: 2000 });
    this.refreshTenantSettings();
  }

  setFromAndToDates(value): void {
    const from = this.formlyView.form.get('from').value;
    const to = this.formlyView.form.get('to').value;
    if (!from || !to) {
      this.snackBar.open(this.ts.instant('Please fill From & To date values'), 'Ok', { duration: 3000 });
    } else if (from && to && DateTimeFormatHelper.parseToLuxon(to) < DateTimeFormatHelper.parseToLuxon(from)) {
      this.snackBar.open(this.ts.instant('Please enter a valid date range'), 'Ok', { duration: 3000 });
      this.formlyView.form.get('to').setErrors({ incorrect: true });
    } else {
      value.from = DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(from);
      value.to = DateTimeFormatHelper.getUtcDateTimeWithMaxSeconds(to);
    }
  }

  refreshTenantSettings(): void {
    this.store.dispatch(
      new FetchTenantSettingsAction({ tenant: this.tenantAuthState.currentTenantSystem.tenant, userId: this.tenantAuthState.profile.id })
    );
  }

  confirmRemoveSetting(index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((x) => {
      if (x) this.removeSetting(index);
    });
  }

  async removeSetting(index: number): Promise<void> {
    try {
      const fieldsArray: FieldSetting[] = cloneDeep(this.timePeriodSettings.value?.data);
      if (index >= 0) {
        fieldsArray.splice(index, 1);
      }
      if (!fieldsArray.length) {
        // delete the setting if no fields left
        await this.tenantsService.delete(this.tenant, this.timePeriodSettings.id);
        this.snackBar.open(this.ts.instant('User Settings Deleted'), 'CLOSE', { duration: 3000 });
        this.isDefault = false;
        this.formlyView.form.reset();

        this.timePeriodSettings = null;
        this.refreshTenantSettings();
      } else {
        // remove selected field setting and save remainig field settings
        await this.saveTenantSettings(fieldsArray);
        this.formlyView.form.reset();
      }
    } catch (error) {
      console.log(error);
    }
  }
}
