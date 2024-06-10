/**
 * global
 */
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
/**
 * project
 */
import { FieldTypeIds, FieldTypeNameMap } from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { PropertyPathTypeEnum, RawDataPath } from '@wfm/service-layer/models/expressionModel';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { BaseComponent } from '@wfm/shared/base.component';
import { TreeLikeNodes } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { populateFieldOptions } from '@wfm/shared/tree-selectbox/tree-selectbox.helper';
import { CompareOperatorEnum, FilterExpression } from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { ExpressionDefOutput } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.component';

/**
 * local
 */
import { SourceData } from '../aggregate-source.component';
export interface FilterExpressionOutput {
  data: FilterExpression;
  isValid: boolean;
}

enum AggregateFilterEnum {
  RULES = 1,
  COMPARISON = 2
}

@Component({
  selector: 'app-aggregate-source-filtering',
  templateUrl: './aggregate-source-filtering.component.html',
  styleUrls: ['./aggregate-source-filtering.component.scss']
})
export class AggregateSourceFilteringComponent extends BaseComponent implements OnInit {
  @Input() filterData: FilterExpression;
  @Input() selectedSources: Array<SourceData>;

  @Output() emitter: EventEmitter<FilterExpressionOutput> = new EventEmitter();

  allowedFieldTypes = [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.DateField, FieldTypeIds.DateTimeField];
  fieldPath: string[];
  fieldLabel: string;

  expressionConfig = {
    title: '',
    rules: true,
    rulesLabel: '',
    userRolesLabel: '',
    userGroupsLabel: '',
    buttons: false
  };
  expressionsDef: ExpressionDefOutput;

  fieldsTreeNodes: TreeLikeNodes;
  hasNodes: boolean;
  selectedField: string[] = [];

  form: FormGroup;

  get aggregateFilterEnum() {
    return AggregateFilterEnum;
  }

  get compareOperatorEnum() {
    return CompareOperatorEnum;
  }

  constructor(private ts: TranslateService, private cd: ChangeDetectorRef, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      source: ['', Validators.required],
      filterType: [AggregateFilterEnum.COMPARISON, Validators.required],
      comparisonType: [CompareOperatorEnum.MAX]
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.emitToParent();
    });

    this.form
      .get('source')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((sourceName: string) => {
        this.fieldsTreeNodes = null;
        this.fieldPath = null;
        this.fieldLabel = this.getFieldLabel('For Field');
        this.cd.detectChanges();

        const selectedSource = this.selectedSources.find((source) => {
          return source.name === sourceName;
        });
        if (selectedSource) {
          this.fieldsTreeNodes = populateFieldOptions(
            selectedSource.selectedSchema.fields.map((f) => BaseFieldConverter.toUi(f)),
            this.allowedFieldTypes
          );

          this.hasNodes = !!Object.keys(this.fieldsTreeNodes).length;
        }

        this.cd.detectChanges();
      });

    if (this.filterData.comparison) {
      this.setData();
    }
  }

  setData(): void {
    this.selectedField = [this.filterData.comparison[0].propertyPath.path.join(pathSeparator)];
    this.form.patchValue({
      source: (<RawDataPath>this.filterData.comparison[0].propertyPath).rawDataFieldName,
      comparisonType: this.filterData.comparison[0].type
    });
  }

  expressionUpdated(event: ExpressionDefOutput): void {
    this.expressionsDef = event;
    this.emitToParent();
  }

  emitToParent(): void {
    const output = this.populateOutput();
    this.emitter.next(output);
  }

  populateOutput(): FilterExpressionOutput {
    const formValue = this.form.value;
    const filterType = formValue.filterType;

    const output: FilterExpressionOutput = {
      data: {},
      isValid: this.isDataValid(filterType)
    };
    if (filterType === AggregateFilterEnum.COMPARISON) {
      output.data.comparison = [
        {
          type: formValue.comparisonType,
          propertyPath: <RawDataPath>{
            pathType: PropertyPathTypeEnum.RawDataPath,
            path: this.fieldPath,
            rawDataFieldName: formValue.source
          }
        }
      ];
    } else {
      output.data.ruleSet = {
        ...this.expressionsDef?.data?.ruleSet
      };
    }

    return output;
  }

  isDataValid(type: AggregateFilterEnum): boolean {
    if (type === AggregateFilterEnum.COMPARISON) {
      return !!this.fieldPath;
    } else {
      return this.expressionsDef?.isValid;
    }
  }

  fieldPathUpdated(event: TreeNodeOutput[]): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);
      this.fieldPath = path;
    } else {
      this.fieldPath = null;
    }
    this.fieldLabel = this.getFieldLabel('For Field', event[0]?.additionalData?.field?.viewName, event[0]?.additionalData?.field?.type);
    this.cd.detectChanges();
    this.emitToParent();
  }

  getFieldLabel(defaultText: string, fieldName?: string, fieldType?: FieldTypeIds): string {
    let fieldTitle = this.ts.instant(defaultText);
    if (fieldName) {
      fieldTitle += `: ${fieldName}`;
      if (fieldType) {
        fieldTitle += ` (${FieldTypeNameMap.get(fieldType).viewValue})`;
      }
    }
    return fieldTitle;
  }
}
