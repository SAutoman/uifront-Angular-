/**
 * global
 */

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { KeyValueView } from '@wfm/common/models';
import {
  FieldTypeComplexFields,
  FieldTypeIds,
  FieldTypeNameMap,
  SchemaDto,
  SortDirection,
  Sorting,
  WorkflowStatusDto
} from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

/**
 * local
 */

export interface FieldOptionsSortingOutput {
  data: Sorting[];
  isValid: boolean;
}

@Component({
  selector: 'app-connector-field-options-sorting',
  templateUrl: './connector-field-options-sorting.component.html',
  styleUrls: ['./connector-field-options-sorting.component.scss']
})
export class ConnectorFieldOptionsSortingComponent extends BaseComponent implements OnInit {
  @Input() schema: SchemaDto;
  @Input() sortingRules: FieldOptionsSortingOutput;
  @Output() optionSortingEmitter: EventEmitter<FieldOptionsSortingOutput> = new EventEmitter();

  fieldOptions: KeyValueView<string, string>[];
  form: FormGroup;
  get sortDirection() {
    return SortDirection;
  }
  constructor(private fb: FormBuilder) {
    super();
  }

  stopDrag(e: MouseEvent): void {
    e.stopPropagation();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      sortRulesArray: this.fb.array([])
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe(() => {
      this.emitToParent();
    });

    this.populateOptions();

    if (this.sortingRules?.data) {
      this.sortingRules.data.forEach((rule) => this.addSortGroup(rule));
    }
  }

  sortRulesArray(): FormArray {
    return this.form?.get('sortRulesArray') as FormArray;
  }

  createSortGroup(rule?: Sorting): FormGroup {
    return this.fb.group({
      field: [rule ? this.fieldOptions.find((f) => f.value === rule.propertyName) : null, Validators.required],
      sort: [rule ? rule.sort : '', Validators.required]
    });
  }

  addSortGroup(rule?: Sorting): void {
    this.sortRulesArray().push(this.createSortGroup(rule));
  }

  removeFieldSettings(index: number): void {
    this.sortRulesArray().removeAt(index);
  }

  populateOptions(): void {
    this.fieldOptions = [];
    this.schema.fields.forEach((field) => {
      if (!FieldTypeComplexFields.includes(field.type)) {
        this.fieldOptions.push({
          key: field.fieldName,
          value: `fields.${field.fieldName}`,
          viewValue: `${field.displayName} (${FieldTypeNameMap.get(field.type).viewValue})`
        });
      }
    });

    const systemFields = [
      {
        key: GridSystemFieldsEnum.STATUS,
        value: GridSystemFieldsEnum.STATUS,
        viewValue: `Status (${FieldTypeNameMap.get(FieldTypeIds.StringField).viewValue})`
      },
      {
        key: GridSystemFieldsEnum.CREATED_AT,
        value: GridSystemFieldsEnum.CREATED_AT,
        viewValue: `Created At (${FieldTypeNameMap.get(FieldTypeIds.DateTimeField).viewValue})`
      },
      {
        key: GridSystemFieldsEnum.UPDATED_AT,
        value: GridSystemFieldsEnum.UPDATED_AT,
        viewValue: `Updated At (${FieldTypeNameMap.get(FieldTypeIds.DateTimeField).viewValue})`
      }
    ];

    this.fieldOptions.push(...systemFields);
  }

  emitToParent(): void {
    const data: FieldOptionsSortingOutput = {
      isValid: this.form.valid,
      data: this.sortRulesArray().controls?.map((formGroup) => {
        const formValue = formGroup.value;
        return {
          propertyName: formValue.field?.value,
          sort: formValue.sort
        };
      })
    };

    this.optionSortingEmitter.emit(data);
  }

  onDrag(e: CdkDragDrop<FormGroup[]>): void {
    if (e.previousContainer === e.container) {
      const reorderedData = this.sortRulesArray().controls;
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);

      this.emitToParent();
    }
  }
}
