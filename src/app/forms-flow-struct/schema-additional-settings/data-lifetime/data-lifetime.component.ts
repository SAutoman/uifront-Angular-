import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { DataLifetimeSettings, FieldTypeIds } from '@wfm/service-layer';
import { PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { BaseComponent } from '@wfm/shared/base.component';
import { takeUntil } from 'rxjs/operators';
import { KeyValue } from '@angular/common';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import { find, map } from 'lodash-core';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { TranslateService } from '@ngx-translate/core';

export interface DataLifetimeSettingsOutput extends DataLifetimeSettings {
  isValid: boolean;
}

interface IDataLifteimeFormModel {
  field: KeyValue<string, string[]>;
  days: number;
  hours: number;
  minutes: number;
}

@Component({
  selector: 'app-data-lifetime',
  templateUrl: './data-lifetime.component.html',
  styleUrls: ['./data-lifetime.component.scss']
})
export class DataLifetimeComponent extends BaseComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() dataLifetimeSettings: DataLifetimeSettings;
  @Output() emitData: EventEmitter<DataLifetimeSettingsOutput> = new EventEmitter(null);

  private fieldOptions: KeyValue<string, string>[];
  private dataLifetimeAllowedFieldTypes = [FieldTypeIds.DateField, FieldTypeIds.DateTimeField];
  private systemFields: KeyValue<string, string[]>[] = [
    {
      key: 'CreatedAt',
      value: [GridSystemFieldsEnum.CREATED_AT]
    },
    {
      key: 'UpdatedAt',
      value: [GridSystemFieldsEnum.UPDATED_AT]
    }
  ];
  public view: IFormlyView;

  constructor(private fb: FormBuilder, private ts: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.populateFieldOptions();
    this.initFormly();
    this.view.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.emitToParent());
  }

  initFormly(): void {
    const model = this.getDefaultModel();
    const field = find(this.fieldOptions, (fieldOption) => fieldOption.value === model?.field);
    const entityTypeSelector = FormlyFieldAdapterFactory.createAdapter({
      name: 'field',
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Field'),
      valueInfo: {
        options: this.fieldOptions
      },
      value: field ? field.value : ''
    }).getConfig();
    entityTypeSelector.templateOptions.labelProp = 'key';
    entityTypeSelector.className = 'col-12';

    const daysField = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Days'),
      name: 'days',
      type: FieldTypeIds.IntField,
      value: model?.days ? +model?.days : 0,
      min: 0
    }).getConfig();
    daysField.hideExpression = (dataLifteimeModel: IDataLifteimeFormModel) => !dataLifteimeModel.field;
    daysField.className = 'col-4';

    const hoursField = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Hours'),
      name: 'hours',
      type: FieldTypeIds.IntField,
      value: model?.hours ? +model?.hours : 0,
      min: 0,
      max: 24
    }).getConfig();
    hoursField.hideExpression = (dataLifteimeModel: IDataLifteimeFormModel) => !dataLifteimeModel.field;
    hoursField.className = 'col-4';

    const minutesField = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Minutes'),
      name: 'minutes',
      type: FieldTypeIds.IntField,
      value: model?.minutes ? +model?.minutes : 0,
      min: 0,
      max: 60
    }).getConfig();
    minutesField.hideExpression = (dataLifteimeModel: IDataLifteimeFormModel) => !dataLifteimeModel.field;
    minutesField.className = 'col-4';

    this.view = {
      fields: [entityTypeSelector, daysField, hoursField, minutesField],
      form: this.fb.group({}),
      model: {}
    };
  }

  getDefaultModel(): IDataLifteimeFormModel {
    const path = this.dataLifetimeSettings?.baseField?.path;
    const field = find(this.fieldOptions, (fieldOption) => fieldOption.value === JSON.stringify(path));

    return {
      field: field?.value || '',
      days: this.dataLifetimeSettings?.expirationPeriod?.days || 0,
      hours: this.dataLifetimeSettings?.expirationPeriod?.hours || 0,
      minutes: this.dataLifetimeSettings?.expirationPeriod?.minutes || 0
    };
  }

  emitToParent(): void {
    const formValue = this.view.form.value;
    let data: DataLifetimeSettingsOutput = null;
    if (formValue.field) {
      const valueSet = formValue.days > 0 || formValue.hours > 0 || formValue.minutes > 0;
      data = {
        baseField: {
          path: JSON.parse(formValue.field) || [],
          pathType: PropertyPathTypeEnum.Internal
        },
        expirationPeriod: {
          days: formValue.days || 0,
          hours: formValue.hours || 0,
          minutes: formValue.minutes || 0
        },
        isValid: valueSet && this.view.form.valid
      };
    }
    this.emitData.next(data);
  }

  private getPath(field: IConfigurableListItem): Array<string> {
    const finalPath = [];
    finalPath.unshift(`${field.fieldName || field.name}`);

    if (field.parentField) {
      const parentFieldName = this.getPath(field.parentField);
      finalPath.unshift(...parentFieldName);
    }
    return finalPath;
  }

  populateFieldOptions(): void {
    this.fieldOptions = map(this.systemFields, (field) => {
      return {
        key: field.key,
        value: JSON.stringify(field.value)
      };
    });
    this.fields.forEach((field) => {
      const item = {
        key: field.viewName,
        value: JSON.stringify(['fields', field.pathJoined])
      };
      if (this.dataLifetimeAllowedFieldTypes.includes(field.type)) {
        item.value = JSON.stringify(['fields', ...this.getPath(field)]);
        this.fieldOptions.push(item);
      }
    });

    this.fieldOptions.splice(0, 0, {
      key: this.ts.instant('Not set'),
      value: ''
    });
  }
}
