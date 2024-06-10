import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WorkflowDto } from '@wfm/service-layer';
import { SourceToDestinationWithPath, RawDataToStepActionDto, EventAreaScopes, EventTypes } from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import {
  AggregationActionDto,
  AggregationEventType
} from '@wfm/tenant-admin/workflows/rawData-link/aggregation-validation/aggregation.model';
import { takeUntil } from 'rxjs/operators';
import { AggregationActionOutput } from '../aggregation-action/aggregation-action.component';
import { CopyToRepeatableData } from './copy-to-repeatable/copy-to-repeatable.component';
import { workflowProcessStepLinkList } from '@wfm/store/workflow-builder';

export interface RawDataToStepData {
  copyAggregation?: AggregationActionDto;
  sourceToDestinationWithPath?: SourceToDestinationWithPath[];
  isValid: boolean;
}

enum CopyActionType {
  Aggregation = 1,
  CopyRepeatable = 2
}

@Component({
  selector: 'app-raw-data-to-step-action',
  templateUrl: './raw-data-to-step-action.component.html',
  styleUrls: ['./raw-data-to-step-action.component.scss']
})
export class RawDataToStepActionComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: RawDataToStepActionDto;
  @Input() actionScope?: EventAreaScopes;
  @Output() outputEmitter: EventEmitter<RawDataToStepData> = new EventEmitter();
  copyType: FormControl = new FormControl(null, Validators.required);
  showRepeatableCopy: boolean = false;
  isRepeatable: boolean = true;
  aggregationData: AggregationActionOutput;
  copyToRepeatableData: CopyToRepeatableData;
  get aggregationEventType() {
    return AggregationEventType;
  }

  get copyActionType() {
    return CopyActionType;
  }
  constructor(private store: Store<ApplicationState>, private fb: FormBuilder) {
    super(store);
  }

  ngOnInit(): void {
    this.getSteps();
    this.copyType.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((copyType: CopyActionType) => {
      switch (copyType) {
        case CopyActionType.Aggregation:
          this.isRepeatable = false;
          this.copyToRepeatableData = null;
          break;
        case CopyActionType.CopyRepeatable:
          this.isRepeatable = true;
          this.aggregationData = null;
          break;
        default:
          break;
      }
    });
    this.copyType.setValue(CopyActionType.Aggregation);

    if (this.actionDto) {
      const actionType = this.actionDto.copyAggregation ? CopyActionType.Aggregation : CopyActionType.CopyRepeatable;

      switch (actionType) {
        case CopyActionType.Aggregation:
          this.aggregationData = {
            isValid: true,
            data: this.actionDto.copyAggregation,
            type: EventTypes.RawDataToStep
          };
          break;
        case CopyActionType.CopyRepeatable:
          this.copyToRepeatableData = {
            isValid: true,
            sourceToDestination: this.actionDto.sourceToDestinationWithPath
          };
          break;

        default:
          break;
      }
      this.copyType.setValue(actionType);
    }
  }

  aggregationDataUpdated(data: AggregationActionOutput): void {
    this.aggregationData = data;
    this.emit();
  }

  copyToRepeatableUpdated(data: CopyToRepeatableData): void {
    this.copyToRepeatableData = data;
    this.emit();
  }

  emit(): void {
    const data: RawDataToStepData = {
      copyAggregation: this.aggregationData?.data,
      sourceToDestinationWithPath: this.copyToRepeatableData?.sourceToDestination,
      isValid: this.aggregationData ? this.aggregationData.isValid : this.copyToRepeatableData ? this.copyToRepeatableData.isValid : false
    };

    this.outputEmitter.emit(data);
  }

  getSteps(): void {
    this.store
      .select(workflowProcessStepLinkList)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (links) => {
        if (links && links.length) {
          for (const stepLink of links) {
            if (stepLink.processStepLinkRepeatableSettings?.isRepeatable) {
              this.showRepeatableCopy = true;
            }
          }
        }
      });
  }
}
