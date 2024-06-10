import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { IConfigurableListItem } from '@wfm/common/models';
import { FastCreateSettings, FieldTypeIds } from '@wfm/service-layer';
import { PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { BaseComponent } from '@wfm/shared/base.component';
import { FieldWithPath } from '@wfm/tenants/manual-creation-settings-by-schema/create-another/create-another.component';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface FastCreateSettingsUi extends FastCreateSettings {
  isValid: boolean;
}

@Component({
  selector: 'app-fast-create-setting',
  templateUrl: './fast-create-setting.component.html',
  styleUrls: ['./fast-create-setting.component.scss']
})
export class FastCreateSettingComponent extends BaseComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() fastCreateSettings: FastCreateSettings;

  @Output() emitData: EventEmitter<FastCreateSettingsUi> = new EventEmitter(null);

  form: FormGroup;
  fieldOptions: KeyValue<string, FieldWithPath>[];

  fastCreateAllowedFieldTypes = [
    FieldTypeIds.StringField,
    FieldTypeIds.TextareaField,
    FieldTypeIds.IntField,
    FieldTypeIds.DecimalField,
    // list fields do not get focused properly and no text can be typed
    // FieldTypeIds.ListField,
    FieldTypeIds.ConnectorField
  ];
  constructor(private fb: FormBuilder, private expressionHelper: ExpressionHelperService) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      enableBarcodeScanning: [false],
      fastCreateFields: []
    });
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => this.emitToParent());

    this.populateFieldOptions();
    this.updateForm();
  }

  updateForm(): void {
    this.form.patchValue({
      enableBarcodeScanning: this.fastCreateSettings ? this.fastCreateSettings.enableBarcodeScanning : null,
      fastCreateFields: this.fastCreateSettings ? this.fastCreateSettings.fields?.map((f) => this.join(f.path)) : null
    });
  }

  split(pathString: string): string[] {
    return pathString.split(pathSeparator);
  }

  join(path: string[]): string {
    return path.join(pathSeparator);
  }

  populateFieldOptions(): void {
    const fields = [...this.fields];
    this.fieldOptions = [];
    fields.forEach((field) => {
      let item = {
        key: field.viewName,
        value: <FieldWithPath>field
      };
      if (this.fastCreateAllowedFieldTypes.includes(item.value.type)) {
        const path = this.getPath(item.value);
        item.value['path'] = path;
        item.value['pathJoined'] = this.join(path);
        this.fieldOptions.push(item);
      }

      // let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      // retrieved.forEach((option) => {
      //   if (this.fastCreateAllowedFieldTypes.includes(option.value.type)) {
      //     const path = this.getPath(option.value);
      //     option.value['path'] = path;
      //     option.value['pathJoined'] = this.join(path);
      //     this.fieldOptions.push(option);
      //   }
      // });
    });
  }

  private getPath(field: IConfigurableListItem): Array<string> {
    let finalPath = [];
    finalPath.unshift(`${field.fieldName || field.name}`);

    if (field.parentField) {
      const parentFieldName = this.getPath(field.parentField);
      finalPath.unshift(...parentFieldName);
    }
    return finalPath;
  }

  emitToParent(): void {
    const formValue = this.form.value;

    let data: FastCreateSettingsUi;

    if (formValue.fastCreateFields?.length) {
      data = {
        enableBarcodeScanning: formValue.enableBarcodeScanning,
        fields: formValue.fastCreateFields?.map((pathJoined) => {
          return {
            path: this.split(pathJoined),
            pathType: PropertyPathTypeEnum.Internal
          };
        }),
        isValid: true
      };

      if (data.enableBarcodeScanning) {
        data.isValid = !!data.fields.length;
      }
    }
    this.emitData.next(data);
  }
}
