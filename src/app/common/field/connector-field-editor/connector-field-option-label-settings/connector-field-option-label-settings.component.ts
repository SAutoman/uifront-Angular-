import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FieldTypeIds, FieldTypeNameMap, SchemaDto } from '@wfm/service-layer';
import { BehaviorSubject } from 'rxjs';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { IKeyValueView } from '@wfm/common/models';
import { BaseComponent } from '@wfm/shared/base.component';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ConnectorFieldLabelFieldSettings, ConnectorFieldLabelSettings } from '@wfm/common/models/connector-field';
import { isIntegerValidator } from '@wfm/service-layer/helpers';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatOptionSelectionChange } from '@angular/material/core';

export interface LabelSettingsOutput {
  keyValueSeparator: string;
  fieldSeparator: string;
  fieldSettings: FieldSettingItem[];
  isValid: boolean;
}

interface FieldSettingItem {
  fieldId: string;
  numberOfSymbolsFieldName: number;
  numberOfSymbolsFieldValue?: number;
  position: number;
}

@Component({
  selector: 'app-connector-field-option-label-settings',
  templateUrl: './connector-field-option-label-settings.component.html',
  styleUrls: ['./connector-field-option-label-settings.component.scss']
})
export class ConnectorFieldOptionLabelSettingsComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() schema: SchemaDto;
  @Input() labelSettings: ConnectorFieldLabelSettings;
  @Output() labelSettingsEmitter: EventEmitter<LabelSettingsOutput> = new EventEmitter();
  updatedSchema$: BehaviorSubject<SchemaDto> = new BehaviorSubject(null);
  fieldOptions: IKeyValueView<string, string>[];
  form: FormGroup;
  fieldSeparators: string[] = [',', ';', ':', '|', '/', '\\', '-', 'New Line'];

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.fieldOptions = this.getSchemaFieldOptions();
    this.initFormGroup();
    if (this.labelSettings) {
      this.form.patchValue({
        keyValueSeparator: this.labelSettings.keyValueSeparator,
        fieldSeparator: this.labelSettings.fieldSeparator
      });
      this.populateAdditionalSettingsForms(this.labelSettings.fieldSettings);
    }

    this.updatedSchema$.subscribe((schema: SchemaDto) => {
      if (schema) {
        this.schema = schema;
        this.fieldOptions = this.getSchemaFieldOptions();

        this.fieldSettings()?.clear();
        this.form?.reset();
        this.initFormGroup();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema && !changes.schema.firstChange && changes.schema.currentValue !== changes.schema.previousValue) {
      this.updatedSchema$.next(changes.schema.currentValue);
    }
  }

  initFormGroup(): void {
    this.form = this.fb.group({
      keyValueSeparator: ['-', Validators.required],
      fieldSeparator: [this.fieldSeparators[0], Validators.required],
      fields: [[], Validators.required],
      fieldSettings: this.fb.array([])
    });
    this.form.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(200)).subscribe(() => {
      this.notify();
    });
  }

  optionChanged(event: MatOptionSelectionChange): void {
    if (event.isUserInput) {
      const isSelected = event.source.selected;
      const fieldId = event.source.value;
      if (isSelected) {
        this.addFieldSettingsGroup({
          fieldId: fieldId,
          numberOfSymbolsFieldName: 0,
          numberOfSymbolsFieldValue: null,
          position: this.fieldSettings()?.controls?.length
        });
      } else {
        // if unselected, remove from additionalSettingsFormArray
        this.removeFieldSettings(fieldId);
      }
    }
  }

  populateAdditionalSettingsForms(savedFieldSettings: ConnectorFieldLabelFieldSettings[]): void {
    const selectedFields = [];
    savedFieldSettings?.forEach((fieldSetting: FieldSettingItem) => {
      // guard against removed fields
      if (this.fieldOptions.find((o) => o.value === fieldSetting.fieldId)) {
        selectedFields.push(fieldSetting.fieldId);
        this.addFieldSettingsGroup(fieldSetting);
      }
    });
    this.form.get('fields').patchValue(selectedFields, { emitEvent: false });
  }

  // get a direct ref to fieldsSettings formArray
  fieldSettings(): FormArray {
    return this.form?.get('fieldSettings') as FormArray;
  }

  createFieldSettingsForm(setting: FieldSettingItem): FormGroup {
    let displayName = this.schema.fields.find((f) => f.id === setting.fieldId)?.displayName || setting.fieldId || '';
    return this.fb.group({
      fieldId: setting.fieldId || '',
      displayName: displayName,
      numberOfSymbolsFieldName: [setting.numberOfSymbolsFieldName || 0, [Validators.required, Validators.min(-1), isIntegerValidator()]],
      numberOfSymbolsFieldValue: [setting.numberOfSymbolsFieldValue, [Validators.min(0), isIntegerValidator()]],
      position: [setting?.position || this.fieldSettings()?.length || 0]
    });
  }

  addFieldSettingsGroup(savedSettings: FieldSettingItem): void {
    this.fieldSettings().push(this.createFieldSettingsForm(savedSettings));
  }

  removeFieldSettings(fieldId: string): void {
    let fieldsSettings = this.fieldSettings();
    let index = fieldsSettings.value.findIndex((sett) => sett.fieldId === fieldId);
    if (index >= 0) {
      this.fieldSettings().removeAt(index);
      this.updateFieldSettingPositions(fieldsSettings.controls);
    }
  }

  updateFieldSettingPositions(data: any[]): void {
    data.forEach((x, idx) => {
      if (x.controls?.position.value !== idx) {
        x.controls?.position.setValue(idx);
      }
    });
  }

  getSchemaFieldOptions(): IKeyValueView<string, string>[] {
    let filteredFields = this.schema.fields.filter(
      (field) => field.type !== FieldTypeIds.EmbededField && field.type !== FieldTypeIds.ListOfLinksField
    );

    return filteredFields.map((field) => {
      return <IKeyValueView<string, string>>{
        key: field.fieldName,
        value: field.id,
        viewValue: `${field.displayName} (${FieldTypeNameMap.get(field.type).viewValue})`
      };
    });
  }

  populateOutput(): LabelSettingsOutput {
    const formValue = this.form.value;

    let data = {
      keyValueSeparator: formValue.keyValueSeparator,
      fieldSeparator: formValue.fieldSeparator,
      fieldSettings: formValue.fieldSettings,
      isValid: this.form.valid
    };
    return data;
  }

  notify(): void {
    const dto: LabelSettingsOutput = this.populateOutput();
    this.labelSettingsEmitter.emit(dto);
  }

  onDrag(e: CdkDragDrop<any[]>) {
    const formGroup = this.fieldSettings();
    if (e.previousContainer === e.container) {
      const reorderedData = formGroup.controls;
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      this.updateFieldSettingPositions(reorderedData);
    }
  }

  stopDrag(e: MouseEvent): void {
    e.stopPropagation();
  }
}
