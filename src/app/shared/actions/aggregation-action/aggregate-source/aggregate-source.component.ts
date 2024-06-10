/**
 * global
 */

import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { filter, takeUntil, distinctUntilChanged, debounceTime } from 'rxjs/operators';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * project
 */
import { EnumConverter, IConfigurableListItem, KeyValueView } from '@wfm/common/models';
import { AreaTypeEnum, FieldTypeIds, FieldTypeNameMap, SchemaDto, WorkflowDto } from '@wfm/service-layer';
import { ApplicationState } from '@wfm/store';
import {
  FieldAggregationTypesEnum,
  RangeTypeEnum,
  RangeFieldAggregationTypesEnum,
  FieldAggregationMap,
  FieldTypeAggregationMap,
  RangeFieldAggregationMap,
  FieldPreProcessConfig,
  RangeFieldPreProcessConfig,
  FilterExpression,
  RangePropertyPath
} from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { populateFieldOptions } from '@wfm/shared/tree-selectbox/tree-selectbox.helper';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { TreeLikeNodes } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '@wfm/shared/tree-selectbox/tree-selectbox.component';
import { ProcessStepPath, PropertyPathTypeEnum, RawDataPath } from '@wfm/service-layer/models/expressionModel';

/**
 * local
 */
import { StepDataWithRefName } from '../../difference-calculation-action/difference-calculation-action.component';
import { AggregationGroupType } from '../aggregation-action.component';
import { pathSeparator } from '../../field-path-generator/field-path-generator.component';
import { FilterExpressionOutput } from './aggregate-source-filtering/aggregate-source-filtering.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { PropertyPathExtended } from '../../field-path-generator/FieldPathModels';

export interface AggregateSource {
  fieldSource?: {
    fieldsPath: PropertyPathExtended[];
    preProcess: FieldPreProcessConfig;
  };
  rangeFieldSource?: {
    fromToFieldsPath: RangePropertyPath[];
    rangeType: RangeTypeEnum;
    preProcess: RangeFieldPreProcessConfig;
  };
  filterItemsExpression?: FilterExpression[];
}

export interface AggregateSourceOutput {
  data: AggregateSource;
  isValid: boolean;
}

export interface SourceData {
  selectedSchema: SchemaDto;
  /**
   * schemaReference field's fieldName
   */
  name: string;
  /**
   * Referenced Schema Name
   */
  title: string;
  fieldsTreeNodes: TreeLikeNodes;
  rangeTreeNodes: TreeLikeNodes;
  fromFieldLabel: string;
  toFieldLabel: string;
  singleFieldLabel: string;
  /**
   * these props are for TreeNode component
   * array of joined paths
   */
  selectedSingleField: string[];
  selectedToField: string[];
  selectedFromField: string[];
}

export interface SourceFormGroupModel {
  schemaId: string;
  singleField?: IConfigurableListItem;
  toField?: IConfigurableListItem;
  fromField?: IConfigurableListItem;
}
const singleFieldKey = 'singleField';
const fromFieldKey = 'fromField';
const toFieldKey = 'toField';

@Component({
  selector: 'app-aggregate-source',
  templateUrl: './aggregate-source.component.html',
  styleUrls: ['./aggregate-source.component.scss']
})
export class AggregateSourceComponent extends TenantComponent implements OnInit {
  @Input() sourceData: AggregateSource;
  @Input() entityType: AreaTypeEnum;
  @Input() workflow?: WorkflowDto;
  @Input() steps?: StepDataWithRefName[];
  @Input() rawDataFields: KeyValueView<string, SchemaDto>[];
  @Input() selectedGroupType$: Observable<AggregationGroupType>;
  @Input() rangeType$: Observable<RangeTypeEnum>;
  @Input() showFilters: boolean = true;

  @Output() emitter: EventEmitter<AggregateSourceOutput> = new EventEmitter();

  entities: KeyValueView<string, string>[];

  isSingleGroup: boolean;
  sourceForm: FormGroup;
  aggregationTypeOptions: KeyValueView<string, RangeFieldAggregationTypesEnum | FieldAggregationTypesEnum>[];
  rangeType: RangeTypeEnum;
  rangeTypeLabel: string;

  /**
   * will store all the information on the selection
   */
  selectedSources: Array<SourceData> = [];

  filters: FilterExpression[] = [];
  filtersOutput: FilterExpressionOutput[] = [];

  showConcatControl: boolean;
  get ConcatTexts(): FieldAggregationTypesEnum {
    return FieldAggregationTypesEnum.Concat;
  }

  areSingleFieldSameType: boolean;
  constructor(
    store: Store<ApplicationState>,
    private fb: FormBuilder,
    private ts: TranslateService,
    private adminSchemasService: AdminSchemasService,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.initForm();
    this.initSubscriptions();
    if (this.sourceData) {
      await this.setControlValues();
    }
  }

  initForm(): void {
    this.sourceForm = this.fb.group({
      entitySelector: [[], Validators.required],
      sourcesArray: this.fb.array([]),
      aggregationType: [{ value: '', disabled: true }, Validators.required],
      concatSymbol: []
    });

    this.populateEntities();

    this.sourceForm.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.emitOutput();
    });
    this.toggleConcatSymbolControl();
  }

  toggleConcatSymbolControl(): void {
    this.sourceForm
      .get('aggregationType')
      .valueChanges.pipe(
        filter((s) => !!s),
        distinctUntilChanged(),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (aggregationType) => {
        if (aggregationType === this.ConcatTexts) {
          this.sourceForm.get('concatSymbol').addValidators(Validators.required);
          this.showConcatControl = true;
        } else {
          this.sourceForm.get('concatSymbol').clearValidators();
          this.showConcatControl = false;
        }
        this.sourceForm.get('concatSymbol').updateValueAndValidity();
      });
  }

  async selectionChanged(event: MatOptionSelectionChange): Promise<void> {
    const isSelected = event.source.selected;
    const entitySchemaId = event.source.value;
    if (isSelected) {
      const ent = this.entities.find((ent) => {
        return ent.value === entitySchemaId;
      });
      this.addSourceFormGroup({ schemaId: entitySchemaId });

      const selectedSchema = await this.adminSchemasService.getSchema(this.tenant, this.entityType, entitySchemaId);

      this.addSelectedSource(selectedSchema, ent.key, ent.viewValue, null, null, null);
    } else if (event.isUserInput) {
      // if intentionally unselected, remove
      let index = this.selectedSources.findIndex((sett) => sett.selectedSchema.id === entitySchemaId);
      if (index >= 0) {
        const removedSource = this.selectedSources.splice(index, 1);
        this.cleanupFilters(removedSource[0]);
        this.removeSourceGroup(entitySchemaId);
      }
    }
  }

  cleanupFilters(removedSource: SourceData) {
    //remove the filters for the subject schema
    this.filters = this.filters.filter((filter) => {
      if (filter.comparison?.length) {
        return (<RawDataPath>filter.comparison[0].propertyPath)?.rawDataFieldName !== removedSource.name;
      }
    });

    this.filtersOutput = this.filtersOutput.filter((output) => {
      if (output.data.comparison?.length) {
        return (<RawDataPath>output.data.comparison[0].propertyPath)?.rawDataFieldName !== removedSource.name;
      }
    });
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

        this.resetSourceGroups();
        this.sourceForm.patchValue({
          aggregationType: null,
          concatSymbol: null
        });

        if (this.selectedSources?.length) {
          this.refreshSourceNodes();
        }
      });

    this.rangeType$.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe((rangeType: RangeTypeEnum) => {
      this.rangeType = rangeType;

      if (rangeType && this.selectedSources?.length) {
        this.refreshSourceNodes();

        const converter = new EnumConverter(RangeTypeEnum);
        this.rangeTypeLabel = converter.getKeyValue(this.rangeType)?.key;
      }
    });
  }

  refreshSourceNodes(): void {
    this.selectedSources.forEach((source) => {
      if (this.isSingleGroup) {
        source.fieldsTreeNodes = this.populateSingleFieldNodes(source.selectedSchema);
      } else {
        source.rangeTreeNodes = this.populateRangeNodes(source.selectedSchema);
      }
    });
  }

  async setControlValues(): Promise<void> {
    let selectedEntities = [];
    if (this.sourceData.fieldSource) {
      const data = this.sourceData.fieldSource;
      for (const propPath of data.fieldsPath) {
        const name = (<RawDataPath>propPath).rawDataFieldName;
        const ent = this.entities.find((item) => item.key === name);
        if (ent) {
          selectedEntities.push(ent.value);
          this.addSourceFormGroup({ schemaId: ent.value });

          const selectedSchema = await this.adminSchemasService.getSchema(this.tenant, this.entityType, ent.value);

          this.addSelectedSource(selectedSchema, ent.key, ent.viewValue, [propPath.path.join(pathSeparator)], null, null);
        }
      }

      this.sourceForm.patchValue({
        aggregationType: data.preProcess.aggregationType,
        concatSymbol: data.preProcess.concatSymbol,
        entitySelector: selectedEntities
      });
    } else if (this.sourceData.rangeFieldSource) {
      const data = this.sourceData.rangeFieldSource;

      for (const rangePath of data.fromToFieldsPath) {
        const fromPath = rangePath.fromFieldPath;
        const toPath = rangePath.toFieldPath;

        const name = (<RawDataPath>fromPath).rawDataFieldName;
        const ent = this.entities.find((item) => item.key === name);
        selectedEntities.push(ent.value);
        this.addSourceFormGroup({ schemaId: ent.value });

        const selectedSchema = await this.adminSchemasService.getSchema(this.tenant, this.entityType, ent.value);

        this.addSelectedSource(
          selectedSchema,
          ent.key,
          ent.viewValue,
          null,
          [fromPath.path.join(pathSeparator)],
          [toPath.path.join(pathSeparator)]
        );
      }

      this.sourceForm.patchValue({
        aggregationType: data.preProcess.aggregationType,
        entitySelector: selectedEntities
      });
    }

    if (this.sourceData.filterItemsExpression) {
      this.filters = [...this.sourceData.filterItemsExpression];
    }
  }

  addSelectedSource(
    schema: SchemaDto,
    sourceName: string,
    sourceTitle: string,
    singleFieldPath: string[],
    fromPath: string[],
    toPath: string[]
  ): void {
    if (this.selectedSources.find((source) => source.selectedSchema?.id === schema.id)) {
      // if it is already there, do not add
      return;
    }

    this.selectedSources.push({
      selectedSchema: schema,
      name: sourceName,
      title: sourceTitle,
      fieldsTreeNodes: this.populateSingleFieldNodes(schema),
      rangeTreeNodes: this.populateRangeNodes(schema),
      fromFieldLabel: this.getFieldLabel('From Field'),
      toFieldLabel: this.getFieldLabel('To Field'),
      singleFieldLabel: this.getFieldLabel('Field'),
      selectedSingleField: singleFieldPath,
      selectedToField: toPath,
      selectedFromField: fromPath
    });
  }

  populateEntities(): void {
    if (this.entityType === AreaTypeEnum.rawData) {
      this.entities = this.rawDataFields.map((f) => {
        return {
          key: f.key,
          value: f.value.id,
          viewValue: f.viewValue
        };
      });
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
        this.sourceForm.controls['entitySelector'].setValue([this.entities[0].value]);
      });
    }
  }

  isNodesEmpty(nodes: TreeLikeNodes): boolean {
    return !nodes || !Object.keys(nodes).length;
  }

  populateRangeNodes(schema: SchemaDto): TreeLikeNodes {
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

    let fields = schema.fields.map((f) => BaseFieldConverter.toUi(f));
    return populateFieldOptions(fields, fieldTypes);
  }

  populateSingleFieldNodes(schema: SchemaDto): TreeLikeNodes {
    let fields = schema.fields.map((f) => BaseFieldConverter.toUi(f));

    return populateFieldOptions(fields, []);
  }

  populateAggregationTypes(fieldType: FieldTypeIds): void {
    if (this.isSingleGroup) {
      this.aggregationTypeOptions = FieldTypeAggregationMap.get(fieldType).map((aggregate) => {
        const ag = FieldAggregationMap.get(aggregate);
        return {
          key: ag.key,
          value: ag.value,
          viewValue: this.ts.instant(ag.viewValue)
        };
      });
    } else {
      this.aggregationTypeOptions = [RangeFieldAggregationTypesEnum.InnerJoin, RangeFieldAggregationTypesEnum.FullJoin].map((aggregate) => {
        const ag = RangeFieldAggregationMap.get(aggregate);
        return {
          key: ag.key,
          value: ag.value,
          viewValue: this.ts.instant(ag.viewValue)
        };
      });
    }
  }

  validateSingleFieldsType(currentFieldType: FieldTypeIds): boolean {
    const areTypesSame = this.sourcesArray()?.controls?.every((group: FormGroup, index: number) => {
      return !group.get(singleFieldKey).value || group.get(singleFieldKey).value?.type === currentFieldType;
    });

    if (!areTypesSame) {
      this.snackbar.open('Selected Fields Must Be Of The Same Type', 'Ok', { duration: 1500 });
    }
    return areTypesSame;
  }

  singleFieldPathUpdated(event: TreeNodeOutput[], sourceIndex: number): void {
    const outputData = event && event[0];

    if (outputData) {
      const path = outputData.value?.split(pathSeparator);
      const formGroup = this.sourcesArray().at(sourceIndex) as FormGroup;
      formGroup.get(singleFieldKey).setValue({
        ...outputData.additionalData.field,
        fieldPath: path
      });
      this.areSingleFieldSameType = this.validateSingleFieldsType(outputData.additionalData.fieldType);
      this.enableAggregationTypeControl(outputData.additionalData.fieldType);
    }

    this.selectedSources[sourceIndex].singleFieldLabel = this.getFieldLabel(
      'Field',
      outputData?.additionalData?.field?.viewName,
      outputData?.additionalData?.field?.type
    );
    this.cd.detectChanges();
  }

  rangeFromPathUpdated(event: TreeNodeOutput[], sourceIndex: number): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);

      const formGroup = this.sourcesArray().at(sourceIndex) as FormGroup;
      formGroup.get(fromFieldKey).setValue({
        ...event[0].additionalData.field,
        fieldPath: path
      });

      this.enableAggregationTypeControl(event[0].additionalData.fieldType);
    }

    this.selectedSources[sourceIndex].fromFieldLabel = this.getFieldLabel(
      'From Field',
      event[0]?.additionalData?.field?.viewName,
      event[0]?.additionalData?.field?.type
    );
    this.cd.detectChanges();
  }

  rangeToPathUpdated(event: TreeNodeOutput[], sourceIndex: number): void {
    if (event.length) {
      const path = event[0].value.split(pathSeparator);
      const formGroup = this.sourcesArray().at(sourceIndex) as FormGroup;
      formGroup.get(toFieldKey).setValue({
        ...event[0].additionalData.field,
        fieldPath: path
      });
      this.enableAggregationTypeControl(event[0].additionalData.fieldType);
    }

    this.selectedSources[sourceIndex].toFieldLabel = this.getFieldLabel(
      'To Field',
      event[0]?.additionalData?.field?.viewName,
      event[0]?.additionalData?.field?.type
    );
    this.cd.detectChanges();
  }

  allSourcesHaveSelection(): boolean {
    return this.sourcesArray()?.controls?.every((group: FormGroup) => {
      return group.get(singleFieldKey).value || (group.get(fromFieldKey).value && group.get(toFieldKey).value);
    });
  }

  enableAggregationTypeControl(fieldType: FieldTypeIds): void {
    // enable when the fields are selected for all sources
    if (this.allSourcesHaveSelection()) {
      this.populateAggregationTypes(fieldType);
      this.sourceForm.get('aggregationType').enable();
    }
  }

  emitOutput(): void {
    const output = this.populateOutput();
    this.emitter.next(output);
  }

  isOutputValid(): boolean {
    if (this.isSingleGroup) {
      return (
        this.sourceForm.valid && this.allSourcesHaveSelection() && this.areSingleFieldSameType && this.filtersOutput.every((f) => f.isValid)
      );
    } else {
      return this.sourceForm.valid && this.allSourcesHaveSelection() && this.filtersOutput.every((f) => f.isValid);
    }
  }

  populateOutput(): AggregateSourceOutput {
    const formValue = this.sourceForm.getRawValue();
    const output: AggregateSourceOutput = {
      isValid: this.isOutputValid(),
      data: <AggregateSource>{}
    };

    if (this.isSingleGroup) {
      output.data = <AggregateSource>{
        fieldSource: {
          fieldsPath: formValue.sourcesArray.map((sourceGroup) => {
            return this.getPropertyPath(sourceGroup.singleField, sourceGroup.schemaId, true);
          }),
          preProcess: {
            aggregationType: formValue.aggregationType
          }
        }
      };
      if (formValue.aggregationType === this.ConcatTexts) {
        output.data.fieldSource.preProcess.concatSymbol = formValue.concatSymbol;
      }
    } else {
      output.data = <AggregateSource>{
        rangeFieldSource: {
          fromToFieldsPath: formValue.sourcesArray.map((sourceGroup) => {
            return {
              fromFieldPath: this.getPropertyPath(sourceGroup.fromField, sourceGroup.schemaId),
              toFieldPath: this.getPropertyPath(sourceGroup.toField, sourceGroup.schemaId)
            };
          }),
          rangeType: this.rangeType,
          preProcess: {
            aggregationType: formValue.aggregationType
          }
        }
      };
    }

    output.data.filterItemsExpression = this.filtersOutput.map((f) => f.data);

    return output;
  }

  getPropertyPath(field: IConfigurableListItem, schemaId: string, includeAdditionalData?: boolean): PropertyPathExtended {
    if (!field) {
      return null;
    }
    const path: PropertyPathExtended = {
      path: field.fieldPath
    };
    const ent = this.entities.find((ent) => {
      return ent.value === schemaId;
    });

    if (this.entityType === AreaTypeEnum.stepForm) {
      path.pathType = PropertyPathTypeEnum.ProcessStepPath;
      (<ProcessStepPath>path).processStepRefName = ent?.key;
    } else if (this.entityType === AreaTypeEnum.rawData) {
      path.pathType = PropertyPathTypeEnum.RawDataPath;
      (<RawDataPath>path).rawDataFieldName = ent?.key;
    }
    if (includeAdditionalData) {
      path.type = field.type;
      path.field = field;
    }
    return path;
  }

  addFilter(): void {
    this.filters.push({});
  }

  removeFilter(index: number): void {
    this.filters.splice(index, 1);
    this.filtersOutput.splice(index, 1);
    this.emitOutput();
  }

  filterUpdated(filterData: FilterExpressionOutput, index: number): void {
    this.filtersOutput[index] = filterData;
    this.emitOutput();
  }

  onDrag(e: CdkDragDrop<FilterExpression[]>): void {
    if (e.previousContainer === e.container) {
      moveItemInArray(this.filtersOutput, e.previousIndex, e.currentIndex);
      moveItemInArray(this.filters, e.previousIndex, e.currentIndex);
      this.emitOutput();
    }
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

  sourcesArray(): FormArray {
    return this.sourceForm?.get('sourcesArray') as FormArray;
  }

  createSourceGroup(setting: SourceFormGroupModel): FormGroup {
    return this.fb.group({
      schemaId: setting.schemaId,
      singleField: setting.singleField,
      toField: setting.toField,
      fromField: setting.fromField
    });
  }

  addSourceFormGroup(savedSettings: SourceFormGroupModel): void {
    const sourcesGroups = this.sourcesArray().controls as FormGroup[];

    if (sourcesGroups.find((group) => group.get('schemaId')?.value === savedSettings?.schemaId)) {
      // if it is already there, do not add

      return;
    }

    this.sourcesArray().push(this.createSourceGroup(savedSettings));
  }

  removeSourceGroup(schemaId: string): void {
    let sourcesArray = this.sourcesArray();
    let i = sourcesArray.value.findIndex((sett) => sett.schemaId === schemaId);
    if (i >= 0) {
      this.sourcesArray().removeAt(i);
    }
  }

  resetSourceGroups(): void {
    let sourcesArray = this.sourcesArray();
    sourcesArray.controls.forEach((group: FormGroup) => {
      group.patchValue({
        singleField: null,
        toField: null,
        fromField: null
      });
    });
  }
}
