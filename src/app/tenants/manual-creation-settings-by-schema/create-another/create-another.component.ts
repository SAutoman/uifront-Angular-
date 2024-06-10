import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { IConfigurableListItem, IKeyValueView } from '@wfm/common/models';
import { FieldTypeIds, SchemaDto } from '@wfm/service-layer';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { Subject } from 'rxjs';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface DynamicEntityCreateAnotherSetting {
  enableCreateAnother: boolean;
  persistingFields?: Array<string[]>;
}

export interface FieldWithPath extends IConfigurableListItem {
  path: string[];
}
@Component({
  selector: 'app-create-another',
  templateUrl: './create-another.component.html',
  styleUrls: ['./create-another.component.scss']
})
export class CreateAnotherComponent implements OnInit, OnChanges, OnDestroy {
  @Input() schema: SchemaDto;
  @Input() setting?: DynamicEntityCreateAnotherSetting;
  @Output() createAnotherSettingEmitter = new EventEmitter();

  form: FormGroup;
  fieldOptions: KeyValue<string, FieldWithPath>[];
  destroyed$ = new Subject<any>();

  constructor(private fb: FormBuilder, private expressionHelper: ExpressionHelperService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      enableCreateAnother: [false],
      persistingFields: []
    });

    this.populateFieldOptions();
    this.updateForm();

    this.form.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
      const formValue = this.form.getRawValue();
      if (!formValue.enableCreateAnother) {
        this.form.controls['persistingFields'].patchValue(null, { onlySelf: true });
      }
      this.createAnotherSettingEmitter.emit({
        enableCreateAnother: formValue.enableCreateAnother,
        persistingFields: formValue.enableCreateAnother ? formValue.persistingFields?.map((pathJoined) => this.split(pathJoined)) : null
      });
    });
  }

  updateForm(): void {
    this.form.patchValue(
      {
        enableCreateAnother: this.setting ? this.setting.enableCreateAnother : null,
        persistingFields: this.setting ? this.setting.persistingFields?.map((f) => this.join(f)) : null
      },
      { emitEvent: false }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema && !changes.schema.firstChange && changes.schema.currentValue !== changes.schema.previousValue) {
      this.populateFieldOptions();
      this.updateForm();
    }
  }

  split(pathString: string): string[] {
    return pathString.split(pathSeparator);
  }

  join(path: string[]): string {
    return path.join(pathSeparator);
  }

  populateFieldOptions(): void {
    const fields = [...this.schema.fields];
    this.fieldOptions = [];
    fields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      retrieved.forEach((option) => {
        if (option.value.type !== FieldTypeIds.EmbededField && option.value.type !== FieldTypeIds.ListOfLinksField) {
          const path = this.getPath(option.value);
          option.value['path'] = path;
          option.value['pathJoined'] = this.join(path);
          this.fieldOptions.push(option);
        }
      });
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

  getSchemaFieldOptions(): IKeyValueView<string, string>[] {
    let filteredFields = this.schema.fields.filter(
      (field) => field.type !== FieldTypeIds.EmbededField && field.type !== FieldTypeIds.ListOfLinksField
    );

    return filteredFields.map((field) => {
      return <IKeyValueView<string, string>>{
        key: field.fieldName,
        value: field.id,
        viewValue: field.displayName
      };
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
