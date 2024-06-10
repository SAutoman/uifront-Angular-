/**
 * global
 */

import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import {
  AreaTypeEnum,
  FieldTypeIds,
  ProcessStepEntityDto,
  ProcessStepEntityService,
  ProcessStepLinkDto,
  SchemaDto,
  WorkflowDto
} from '@wfm/service-layer';
import { EventAreaScopes, EventTypes } from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';
import {
  AggregationActionDto,
  AggregationEventType,
  FieldAggregationMap,
  FieldAggregationTypesEnum,
  RangeTypeEnum
} from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { EnumConverter, KeyValueView } from '@wfm/common/models';

/**
 * local
 */
import { StepDataWithRefName } from '../difference-calculation-action/difference-calculation-action.component';
import { AggregateSource, AggregateSourceOutput } from './aggregate-source/aggregate-source.component';

import { AggregateDestination, AggregateDestinationOutput } from './aggregate-destination/aggregate-destination.component';
import { MatSnackBar } from '@angular/material/snack-bar';

export enum AggregationGroupType {
  Single = 1,
  Range
}

export interface AggregationActionOutput {
  isValid: boolean;
  data: AggregationActionDto;
  type: EventTypes;
}

const allRangeTypes = [RangeTypeEnum.Date, RangeTypeEnum.DateTime, RangeTypeEnum.Time, RangeTypeEnum.Decimal, RangeTypeEnum.Integer];

@Component({
  selector: 'app-aggregation-action',
  templateUrl: './aggregation-action.component.html',
  styleUrls: ['./aggregation-action.component.scss']
})
export class AggregationActionComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() aggregationEventType: AggregationEventType;
  @Input() actionDto: AggregationActionDto;
  @Output() outputEmitter: EventEmitter<AggregationActionOutput> = new EventEmitter();
  sourceType: AreaTypeEnum;
  destinationType: AreaTypeEnum;
  groupTypes: KeyValue<string, AggregationGroupType>[];

  rangeTypeOptions: KeyValueView<string, string>[];

  form: FormGroup;

  selectedGroupType$: BehaviorSubject<AggregationGroupType> = new BehaviorSubject(null);

  selectedRangeType$: BehaviorSubject<RangeTypeEnum> = new BehaviorSubject(null);

  steps: StepDataWithRefName[];
  rawDataFields: Array<KeyValueView<string, SchemaDto>> = [];
  sourceData: AggregateSourceOutput;
  destinationData: AggregateDestinationOutput;
  sourceDataInput: AggregateSource;
  destinationDataInput: AggregateDestination;

  get aggregationType() {
    return AggregationGroupType;
  }
  constructor(
    private store: Store<ApplicationState>,
    private fb: FormBuilder,
    private ts: TranslateService,
    private processStepEntityService: ProcessStepEntityService,
    private adminSchemasService: AdminSchemasService,
    private snackbar: MatSnackBar
  ) {
    super(store);
    this.form = this.fb.group({
      groupType: ['', Validators.required],
      rangeType: []
    });
    this.form
      .get('groupType')
      .valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged())
      .subscribe((groupType) => {
        this.selectedGroupType$.next(groupType);

        if (groupType === AggregationGroupType.Single) {
          this.form.get('rangeType').setValue(null);
          this.form.get('rangeType').setValidators(null);
        } else {
          this.form.get('rangeType').setValidators(Validators.required);
        }
        this.form.get('rangeType').updateValueAndValidity();
      });
    this.form
      .get('rangeType')
      .valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged())
      .subscribe((rangeType) => {
        this.selectedRangeType$.next(rangeType);
      });
    this.form.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => this.emitToParent());

    this.groupTypes = [
      {
        key: 'Single Field Aggregation',
        value: AggregationGroupType.Single
      },
      {
        key: 'Range Fields Aggregation',
        value: AggregationGroupType.Range
      }
    ];

    this.populateRangeTypes();
  }

  async ngOnInit(): Promise<void> {
    this.populateStepsData();
    switch (this.aggregationEventType) {
      case AggregationEventType.RawDataToCase:
        this.sourceType = AreaTypeEnum.rawData;
        this.destinationType = AreaTypeEnum.case;
        break;
      case AggregationEventType.StepToCase:
        this.sourceType = AreaTypeEnum.stepForm;
        this.destinationType = AreaTypeEnum.case;
        break;
      case AggregationEventType.RawDataToStep:
        this.sourceType = AreaTypeEnum.rawData;
        this.destinationType = AreaTypeEnum.stepForm;
        break;
      default:
        break;
    }
    await this.populateRawDataSchemas();

    if (this.actionDto) {
      this.form.patchValue({
        groupType: !!this.actionDto.rangeGroup ? AggregationGroupType.Range : AggregationGroupType.Single,
        rangeType: this.actionDto.rangeGroup?.rangeFieldSource?.rangeType || null
      });

      this.sourceDataInput = {
        fieldSource: this.actionDto.singleGroup?.fieldSource,
        rangeFieldSource: this.actionDto.rangeGroup?.rangeFieldSource,
        filterItemsExpression: this.actionDto.filterItemsExpression || []
      };

      this.destinationDataInput = {
        fieldDestination: this.actionDto.singleGroup?.fieldDestination,
        rangeFieldDestination: this.actionDto.rangeGroup?.rangeFieldDestination
      };
    }
    this.emitToParent();
  }

  populateRangeTypes(): void {
    const converter = new EnumConverter(RangeTypeEnum);

    this.rangeTypeOptions = allRangeTypes.map((rangeType: RangeTypeEnum) => {
      const rangeTypeItem = converter.getKeyValue(rangeType);
      return {
        key: rangeTypeItem.key,
        value: rangeTypeItem.value,
        viewValue: rangeTypeItem.key
      };
    });
  }

  async populateRawDataSchemas(): Promise<void> {
    const caseSchema = await this.adminSchemasService.getSchema(this.workflow.tenantId, AreaTypeEnum.case, this.workflow.caseSchemaId);
    const rawDatas = caseSchema.fields.filter((f) => {
      return f.type === FieldTypeIds.ListOfLinksField && f.configuration.schemaAreaType === AreaTypeEnum.rawData;
    });

    for (const rawDataField of rawDatas) {
      const schema = await this.adminSchemasService.getSchema(
        this.workflow.tenantId,
        AreaTypeEnum.rawData,
        rawDataField.configuration.schemaId
      );

      this.rawDataFields.push(new KeyValueView(rawDataField.fieldName, schema, rawDataField.displayName));
    }
  }

  populateStepsData(): void {
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(take(1))
      .subscribe(async (links) => {
        if (links && links.length) {
          let allLinks: ProcessStepLinkDto[];
          if (this.aggregationEventType === AggregationEventType.RawDataToStep) {
            allLinks = links.filter(
              (stepLink) => !stepLink.processStepLinkRepeatableSettings || !stepLink.processStepLinkRepeatableSettings.isRepeatable
            );
          } else {
            allLinks = cloneDeep(links);
          }
          let stepPromises = allLinks.map((link) => {
            return this.processStepEntityService.get(this.tenant, link.processStepEntityId);
          });
          Promise.all(stepPromises)
            .then((stepsData: ProcessStepEntityDto[]) => {
              let stepDataWithRefname: StepDataWithRefName[] = [];
              stepsData.forEach((step, index) => {
                stepDataWithRefname.push({
                  ...step,
                  refName: allLinks[index].refName
                });
              });

              this.steps = [...stepDataWithRefname];
            })
            .catch((error) => {
              console.log(error);
            });
        } else {
          this.steps = [];
        }
      });
  }

  sourceEmitted(data: AggregateSourceOutput): void {
    this.sourceData = cloneDeep(data);
    this.emitToParent();
  }

  destinationEmitted(data: AggregateDestinationOutput): void {
    this.destinationData = cloneDeep(data);
    this.emitToParent();
  }

  emitToParent(): void {
    const data = this.populateOutput();
    if (data) {
      this.outputEmitter.emit(data);
    }
  }

  populateOutput(): AggregationActionOutput {
    const output = <AggregationActionOutput>{
      isValid: this.form.valid && this.isFieldTypeValid() && !!this.destinationData?.isValid && !!this.sourceData?.isValid,
      data: {},
      type: EventTypes.AggregatedRawDataToCase
    };

    if (this.form.get('groupType').value === AggregationGroupType.Single) {
      const source = this.sourceData?.data?.fieldSource ? cloneDeep(this.sourceData?.data?.fieldSource) : null;
      const dest = this.destinationData?.data?.fieldDestination ? cloneDeep(this.destinationData?.data?.fieldDestination) : null;
      source?.fieldsPath?.forEach((propPath) => {
        delete propPath?.type;
        delete propPath?.field;
      });

      delete dest?.type;
      output.data.singleGroup = {
        fieldSource: source,
        fieldDestination: dest
      };
    } else {
      output.data.rangeGroup = {
        rangeFieldSource: this.sourceData?.data?.rangeFieldSource,
        rangeFieldDestination: this.destinationData?.data?.rangeFieldDestination
      };
    }

    output.data.filterItemsExpression = this.sourceData?.data?.filterItemsExpression;
    return output;
  }

  isFieldTypeValid(): boolean {
    let isValid = true;
    const destinationFieldType = this.destinationData?.data?.fieldDestination?.type;
    const sourceFieldType = this.sourceData?.data?.fieldSource?.fieldsPath[0]?.type;
    const aggregationType = this.sourceData?.data?.fieldSource?.preProcess?.aggregationType;
    if (destinationFieldType && sourceFieldType) {
      switch (aggregationType) {
        case FieldAggregationTypesEnum.Min:
        case FieldAggregationTypesEnum.Max:
        case FieldAggregationTypesEnum.InnerJoin:
          isValid =
            [FieldTypeIds.StringField, FieldTypeIds.TextareaField].includes(destinationFieldType) ||
            destinationFieldType === sourceFieldType;
          break;
        case FieldAggregationTypesEnum.Count:
          isValid = [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.StringField, FieldTypeIds.TextareaField].includes(
            destinationFieldType
          );
          break;
        case FieldAggregationTypesEnum.Sum:
          isValid =
            [FieldTypeIds.IntField, FieldTypeIds.DecimalField, FieldTypeIds.StringField, FieldTypeIds.TextareaField].includes(
              destinationFieldType
            ) || destinationFieldType === sourceFieldType;
          break;
        case FieldAggregationTypesEnum.Avg:
          isValid = [FieldTypeIds.DecimalField, FieldTypeIds.StringField, FieldTypeIds.TextareaField].includes(destinationFieldType);
          break;
        case FieldAggregationTypesEnum.Concat:
          isValid =
            [FieldTypeIds.StringField, FieldTypeIds.TextareaField].includes(destinationFieldType) ||
            destinationFieldType === sourceFieldType;
          break;
        default:
          break;
      }
    }

    if (!isValid) {
      this.snackbar.open(
        this.ts.instant(
          `Destination field type is not compatible with '${FieldAggregationMap.get(aggregationType).viewValue}' aggregation result`
        ),
        'Ok',
        { duration: 5000 }
      );
    }
    return isValid;
  }
}
