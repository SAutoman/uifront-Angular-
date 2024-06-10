import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { AggregateDescriptor } from '@progress/kendo-data-query';
import { FieldTypeIds } from '@wfm/service-layer';
import { AggregateTypesEnum } from '@wfm/service-layer/models/aggregate-types-enum';
import { GridColumnField } from '../dynamic-entity-grid/dynamic-entity-grid.component';

interface GridColumnsUI extends GridColumnField {
  fieldTypeLabel: string;
}
interface AggregateOption {
  title: string;
  hint: string;
  allowedFieldTypes?: FieldTypeIds[];
}

@Component({
  selector: 'app-add-aggregate',
  templateUrl: './add-aggregate.component.html',
  styleUrls: ['./add-aggregate.component.scss']
})
export class AddAggregateComponent implements OnInit {
  aggregateOptions: AggregateOption[];
  selectedField: string;
  selectedAggregate: AggregateTypesEnum;

  constructor(
    private dialogRef: MatDialogRef<AddAggregateComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { gridColumns: GridColumnsUI[]; existingAggregates: AggregateDescriptor[]; isDynamicGrid: boolean },
    private snackbar: MatSnackBar,
    private ts: TranslateService
  ) {}

  ngOnInit(): void {
    this.aggregateOptions = [
      {
        title: `${AggregateTypesEnum.SUM}`,
        hint: this.ts.instant(`(Number)`),
        allowedFieldTypes: [FieldTypeIds.IntField, FieldTypeIds.DecimalField]
      },
      // TODO: uncomment when the github issue is fixed
      // https://github.com/telerik/kendo-angular/issues/3724
      // { title: `${AggregateTypesEnum.AVERAGE}`, hint: `(Number)`, allowedFieldTypes: [FieldTypeIds.IntField, FieldTypeIds.DecimalField] },
      {
        title: `${AggregateTypesEnum.COUNT}`,
        hint: this.ts.instant(`(String, Number & Date)`),
        allowedFieldTypes: [
          FieldTypeIds.StringField,
          FieldTypeIds.DateField,
          FieldTypeIds.DateTimeField,
          FieldTypeIds.IntField,
          FieldTypeIds.DecimalField,
          FieldTypeIds.BoolField,
          FieldTypeIds.ListField,
          FieldTypeIds.MultiselectListField,
          FieldTypeIds.TextareaField,
          FieldTypeIds.Radio
        ]
      },
      {
        title: `${AggregateTypesEnum.MIN}`,
        hint: this.ts.instant(`(Number & Date)`),
        allowedFieldTypes: [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.DateField, FieldTypeIds.DateTimeField]
      },
      {
        title: `${AggregateTypesEnum.MAX}`,
        hint: this.ts.instant(`(Number & Date)`),
        allowedFieldTypes: [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.DateField, FieldTypeIds.DateTimeField]
      }
    ];
  }

  add(): void {
    if (this.selectedField && this.selectedAggregate) {
      if (!this.data.existingAggregates.find((a) => a.field === this.selectedField)) {
        if (this.checkAllowedFieldOperation()) {
          this.data.existingAggregates.push({ field: this.selectedField, aggregate: this.selectedAggregate });
          this.selectedAggregate = this.selectedField = null;
        } else this.snackbar.open(this.ts.instant('Aggregate not supported for this field type'), 'Ok', { duration: 3000 });
      } else this.snackbar.open(this.ts.instant('Aggregate with same field name already exists'), 'Ok', { duration: 3000 });
    } else this.snackbar.open(this.ts.instant('Please select a Field & an Aggregate function'), 'Ok', { duration: 3000 });
  }

  checkAllowedFieldOperation(): boolean {
    const operation = this.aggregateOptions.find((x) => x.title === this.selectedAggregate);
    const columnData = this.data.gridColumns?.find((x) => x.fieldName === this.selectedField);
    if (operation && columnData && operation.allowedFieldTypes.includes(columnData.type)) {
      return true;
    } else return false;
  }

  onApply(): void {
    this.dialogRef.close(this.data.existingAggregates);
  }

  removeAggregate(ind: number): void {
    this.data.existingAggregates.splice(ind, 1);
  }
}
