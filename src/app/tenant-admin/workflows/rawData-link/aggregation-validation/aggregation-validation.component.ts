import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { RuleSetCustomCondition } from '@wfm/service-layer/models/expressionModel';
import { SchemaDto } from '@wfm/service-layer';
import { FormControl } from '@angular/forms';
import { ValidationRuleSet, AggregationExpression } from './aggregation.model';

import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@wfm/shared/base.component';
import { KeyValueView } from '@wfm/common/models';
import { AggregationExpressionData } from './aggregation-expression-item/aggregation-expression-item.component';

export interface ValidationRuleSetEvent extends ValidationRuleSet {
  isValid: boolean;
}

@Component({
  selector: 'app-aggregation-validation',
  templateUrl: './aggregation-validation.component.html',
  styleUrls: ['./aggregation-validation.component.scss']
})
export class AggregationValidationComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() rawDataReferences: Array<KeyValueView<string, SchemaDto>>;
  @Input() schema: SchemaDto;
  @Input() multipleValidation: ValidationRuleSet;
  @Output() dataEmitter: EventEmitter<ValidationRuleSetEvent> = new EventEmitter();

  validations: ValidationRuleSet;
  conditionControl: FormControl;
  validationsArray: AggregationExpressionData[] = [];

  get conditionEnum() {
    return RuleSetCustomCondition;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.conditionControl = new FormControl(RuleSetCustomCondition.And);
    this.conditionControl.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
      this.emitToParent();
    });
    if (this.multipleValidation) {
      this.conditionControl.setValue(this.multipleValidation.condition);
      this.multipleValidation.validations.forEach((val) => {
        this.addValidation(val);
      });
    }
    this.emitToParent();
  }

  addValidation(validation?: AggregationExpression): void {
    this.validationsArray.push({
      id: this.validationsArray.length + 1,
      data: {
        name: validation?.name || 'New Expression',
        field: validation?.field || null,
        rangeField: validation?.rangeField || null,
        operator: validation?.operator,
        value: validation?.value
      },
      isValid: validation ? true : false
    });
    this.emitToParent();
  }

  removeValidation(index: number): void {
    this.validationsArray.splice(index, 1);
    this.emitToParent();
  }

  validationUpdate(event: AggregationExpressionData, index: number): void {
    this.validationsArray[index] = {
      ...this.validationsArray[index],
      ...event
    };
    this.emitToParent();
  }

  emitToParent(): void {
    const data = this.populateValidationRuleSet();
    this.dataEmitter.emit(data);
  }

  populateValidationRuleSet(): ValidationRuleSetEvent {
    // return allRawDataItemsValidation;
    return {
      condition: this.conditionControl.value,
      validations: this.validationsArray.map((v) => v.data),
      isValid: this.conditionControl.valid && this.validationsArray.every((v) => v.isValid)
    };
  }

  trackFn(index: number, item: AggregationExpressionData): number {
    return item.id;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.dataEmitter.emit(null);
  }
}
