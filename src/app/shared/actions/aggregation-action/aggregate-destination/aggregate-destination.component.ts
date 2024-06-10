/**
 * global
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { takeUntil, filter, distinctUntilChanged, debounceTime } from 'rxjs/operators';

/**
 * project
 */
import { AreaTypeEnum, FieldTypeIds, FieldTypeNameMap, SchemaDto, WorkflowDto } from '@wfm/service-layer';
import { ProcessStepPath, PropertyPath, PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { RangeTypeEnum } from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { EnumConverter, IConfigurableListItem, KeyValueView } from '@wfm/common/models';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { populateFieldOptions } from '@wfm/shared/tree-selectbox/tree-selectbox.helper';
import { TreeLikeNodes } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';

/**
 * local
 */
import { AggregationGroupType } from '../aggregation-action.component';
import { pathSeparator } from '../../field-path-generator/field-path-generator.component';
import { StepDataWithRefName } from '../../difference-calculation-action/difference-calculation-action.component';
import { PropertyPathExtended } from '../../field-path-generator/FieldPathModels';

export interface AggregateDestination {
  fieldDestination?: PropertyPathExtended;

  rangeFieldDestination?: {
    fromFieldPath: PropertyPath;
    toFieldPath: PropertyPath;
    rangeType: RangeTypeEnum.Date;
  };
}

export interface AggregateDestinationOutput {
  data: AggregateDestination;
  isValid: boolean;
}

@Component({
  selector: 'app-aggregate-destination',
  templateUrl: './aggregate-destination.component.html',
  styleUrls: ['./aggregate-destination.component.scss']
})
export class AggregateDestinationComponent extends TenantComponent implements OnInit {
  @Input() destinatioData: AggregateDestination;
  @Input() entityType: AreaTypeEnum;
  @Input() workflow: WorkflowDto;
  @Input() steps: StepDataWithRefName[];
  @Input() selectedGroupType$: Observable<AggregationGroupType>;

  @Input() rangeType$: Observable<RangeTypeEnum>;

  @Output() emitter: EventEmitter<AggregateDestinationOutput> = new EventEmitter();
  entities: KeyValueView<string, string>[];

  form: FormGroup;
  isSingleGroup: boolean;
  fieldsTreeNodes: TreeLikeNodes;
  rangeTreeNodes: TreeLikeNodes;
  rangeType: RangeTypeEnum;
  rangeTypeLabel: string;
  selectedSchema: SchemaDto;
  singleSelection: string[] = [];
  toSelection: string[] = [];
  fromSelection: string[] = [];

  fromFieldLabel: string;
  toFieldLabel: string;
  constructor(
    private store: Store<ApplicationState>,
    private fb: FormBuilder,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService,
    private cd: ChangeDetectorRef
  ) {
    super(store);
  }

  ngOnInit(): void {
    this.initForm();
    this.initSubscriptions();
    if (this.destinatioData) {
      this.setControlValues();
    }
  }

  initSubscriptions(): void {
    this.selectedGroupType$
      .pipe(
        takeUntil(this.destroyed$),
        filter((x) => !!x),
        distinctUntilChanged()
      )
      .subscribe((groupType: AggregationGroupType) => {
        this.isSingleGroup = groupType === AggregationGroupType.Single;

        this.form.patchValue({
          singleField: null,
          toField: null,
          fromField: null
        });

        if (this.selectedSchema) {
          if (this.isSingleGroup) {
            this.populateSingleFieldNodes();
          } else {
            this.populateRangeNodes();
          }
        }
      });

    this.rangeType$.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe((rangeType: RangeTypeEnum) => {
      this.rangeType = rangeType;
      if (rangeType && this.selectedSchema) {
        this.populateRangeNodes();
        const converter = new EnumConverter(RangeTypeEnum);
        this.rangeTypeLabel = converter.getKeyValue(this.rangeType)?.key;
      }
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      entitySelector: ['', Validators.required],
      singleField: [],
      toField: [],
      fromField: []
    });

    this.form
      .get('entitySelector')
      .valueChanges.pipe(
        filter((s) => !!s),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (entitySchemaId) => {
        this.selectedSchema = await this.adminSchemasService.getSchema(this.tenant, this.entityType, entitySchemaId);
        this.populateRangeNodes();
        this.populateSingleFieldNodes();
      });

    this.populateEntities();

    this.form.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.emitOutput();
    });
  }

  setControlValues(): void {
    if (this.destinatioData.fieldDestination) {
      const data = this.destinatioData.fieldDestination;
      this.form.patchValue({
        entitySelector:
          this.entityType === AreaTypeEnum.case
            ? this.workflow.caseSchemaId
            : this.entities.find((item) => item.key === (<ProcessStepPath>data).processStepRefName).value
      });
      this.singleSelection.push(data.path.join(pathSeparator));
    } else if (this.destinatioData.rangeFieldDestination) {
      const data = this.destinatioData.rangeFieldDestination;

      this.form.patchValue({
        entitySelector:
          this.entityType === AreaTypeEnum.case
            ? this.workflow.caseSchemaId
            : this.entities.find((item) => item.key === (<ProcessStepPath>data.fromFieldPath).processStepRefName).value
      });
      this.fromSelection.push(data.fromFieldPath.path.join(pathSeparator));
      this.toSelection.push(data.toFieldPath.path.join(pathSeparator));
    }
  }

  isNodesEmpty(nodes: TreeLikeNodes): boolean {
    return !nodes || !Object.keys(nodes).length;
  }

  populateEntities(): void {
    if (this.entityType === AreaTypeEnum.case) {
      this.entities = [
        {
          key: this.workflow.name,
          value: this.workflow.caseSchemaId,
          viewValue: this.workflow.name
        }
      ];
    } else if (this.entityType === AreaTypeEnum.stepForm) {
      this.entities = this.steps.map((f) => {
        return {
          key: f.refName,
          value: f.schemaId,
          viewValue: f.name
        };
      });
    }

    if (this.entities.length === 1) {
      setTimeout(() => {
        this.form.controls['entitySelector'].setValue(this.entities[0].value);
      });
    }
  }

  singleFieldPathUpdated(event: TreeNodeOutput[]): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);
      this.form.get('singleField').setValue({
        ...event[0].additionalData.field,
        fieldPath: path
      });
    }
  }

  rangeFromPathUpdated(event: TreeNodeOutput[]): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);

      this.form.get('fromField').setValue({
        ...event[0].additionalData.field,
        fieldPath: path
      });
    }

    this.fromFieldLabel = this.getFieldLabel(
      'From Field',
      event[0]?.additionalData?.field?.viewName,
      event[0]?.additionalData?.field?.type
    );
    this.cd.detectChanges();
  }

  rangeToPathUpdated(event: TreeNodeOutput[]): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);

      this.form.get('toField').setValue({
        ...event[0].additionalData.field,
        fieldPath: path
      });
    }

    this.toFieldLabel = this.getFieldLabel('To Field', event[0]?.additionalData?.field?.viewName, event[0]?.additionalData?.field?.type);
    this.cd.detectChanges();
  }

  populateRangeNodes(): void {
    this.rangeTreeNodes = null;
    this.cd.detectChanges();
    let fieldTypes = [];

    switch (this.rangeType) {
      case RangeTypeEnum.Date:
        fieldTypes = [FieldTypeIds.DateField];
        break;
      case RangeTypeEnum.DateTime:
        fieldTypes = [FieldTypeIds.DateTimeField];
        break;
      case RangeTypeEnum.Time:
        fieldTypes = [FieldTypeIds.TimeField];
        break;
      case RangeTypeEnum.Integer:
        fieldTypes = [FieldTypeIds.IntField];
        break;
      case RangeTypeEnum.Decimal:
        fieldTypes = [FieldTypeIds.DecimalField];
        break;

      default:
        break;
    }

    let fields = this.selectedSchema.fields.map((f) => BaseFieldConverter.toUi(f));

    this.rangeTreeNodes = populateFieldOptions(fields, fieldTypes);
  }

  populateSingleFieldNodes(): void {
    this.fieldsTreeNodes = null;
    this.cd.detectChanges();
    let fields = this.selectedSchema.fields.map((f) => BaseFieldConverter.toUi(f));

    this.fieldsTreeNodes = populateFieldOptions(fields, []);
  }

  emitOutput(): void {
    const output = this.populateOutput();
    this.emitter.next(output);
  }

  isFormValid(): boolean {
    if (this.isSingleGroup) {
      return this.form.valid && !!this.form.get('singleField').value;
    } else {
      return this.form.valid && !!this.form.get('fromField').value && !!this.form.get('toField').value;
    }
  }

  populateOutput(): AggregateDestinationOutput {
    const formValue = this.form.getRawValue();
    const output: AggregateDestinationOutput = {
      isValid: this.isFormValid(),
      data: <AggregateDestination>{}
    };

    if (this.isSingleGroup) {
      output.data = {
        fieldDestination: this.getPropertyPath(formValue.singleField, true)
      };
    } else {
      output.data = {
        rangeFieldDestination: {
          fromFieldPath: this.getPropertyPath(formValue.fromField),
          toFieldPath: this.getPropertyPath(formValue.toField),
          rangeType: formValue.rangeType
        }
      };
    }

    return output;
  }

  getPropertyPath(field: IConfigurableListItem, includeType?: boolean): PropertyPathExtended {
    if (!field) {
      return null;
    }
    const path: PropertyPathExtended = {
      path: field.fieldPath
    };
    const ent = this.entities.find((ent) => {
      return ent.value === this.form.get('entitySelector').value;
    });

    if (this.entityType === AreaTypeEnum.stepForm) {
      path.pathType = PropertyPathTypeEnum.ProcessStepPath;
      (<ProcessStepPath>path).processStepRefName = ent?.key;
    } else if (this.entityType === AreaTypeEnum.case) {
      path.pathType = PropertyPathTypeEnum.CasePath;
    }
    if (includeType) {
      path.type = field.type;
    }
    return path;
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
