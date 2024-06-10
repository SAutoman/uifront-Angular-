import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EnumConverter, IConfigurableListItem, IFormlyView, KeyValueView } from '@wfm/common/models';
import { FormBuilder } from '@angular/forms';

import { AggregationExpression, FieldAggregationTypesEnum, RangeTypeEnum } from '../aggregation.model';
import { BaseComponent } from '@wfm/shared/base.component';
import { RuleCustomOperatorEnum, RuleCustomOperatorMap } from '@wfm/service-layer/models/expressionModel';
import { KeyValue } from '@angular/common';
import { AreaTypeEnum, FieldTypeIds, FieldTypeOperationMap, SchemaDto } from '@wfm/service-layer';

import { AggregateSourceOutput, AggregateSource } from '@wfm/shared/actions/aggregation-action/aggregate-source/aggregate-source.component';
import { AggregationGroupType } from '@wfm/shared/actions/aggregation-action/aggregation-action.component';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { takeUntil, distinctUntilChanged, debounceTime, filter, startWith, switchMap } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { createOperatorField, createValueField } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { TranslateService } from '@ngx-translate/core';

interface IView {
  details: IFormlyView<AggregationDetails>;
  rule?: IFormlyView<RuleModel>;
}

interface AggregationDetails {
  name: string;
  groupType: AggregationGroupType;
  rangeType: RangeTypeEnum;
}

interface RuleModel {
  operator: RuleCustomOperatorEnum;
  value?: any;
}

export interface AggregationExpressionData {
  id?: number;
  data: AggregationExpression;
  isValid: boolean;
}

const allRangeTypes = [RangeTypeEnum.Date, RangeTypeEnum.DateTime, RangeTypeEnum.Time, RangeTypeEnum.Decimal, RangeTypeEnum.Integer];

const operatorKey = 'operator';
const valueKey = 'value';
const nameKey = 'name';
const validationTargetTypeKey = 'groupType';
const rangeTypeKey = 'rangeType';
@Component({
  selector: 'app-aggregation-expression-item',
  templateUrl: './aggregation-expression-item.component.html',
  styleUrls: ['./aggregation-expression-item.component.scss']
})
export class AggregationExpressionItemComponent extends BaseComponent implements OnInit {
  @Input() rawDataReferences: Array<KeyValueView<string, SchemaDto>>;
  @Input() validation: AggregationExpression;
  @Output() dataEmitter: EventEmitter<AggregationExpressionData> = new EventEmitter();

  groupTypes: KeyValue<string, AggregationGroupType>[];

  rangeTypeOptions: KeyValueView<string, string>[];
  selectedGroupType$: Observable<AggregationGroupType>;
  selectedRangeType$: Observable<RangeTypeEnum>;
  sourceData: AggregateSourceOutput;
  sourceDataSubject$: BehaviorSubject<AggregateSource> = new BehaviorSubject(null);
  sourceDataInput: AggregateSource;
  sourceType = AreaTypeEnum.rawData;
  view: IView;

  get groupTypeValue(): AggregationGroupType {
    return this.view?.details?.model?.groupType;
  }

  constructor(private fb: FormBuilder, private ts: TranslateService, private cd: ChangeDetectorRef) {
    super();

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

  ngOnInit(): void {
    this.initFormly();

    if (this.validation) {
      this.sourceDataInput = {
        fieldSource: this.validation.field,
        rangeFieldSource: this.validation.rangeField
      };
    }
  }

  initFormly(): void {
    const validationName = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Description'),
      name: nameKey,
      type: FieldTypeIds.StringField,
      value: this.validation.name,
      required: true
    }).getConfig();
    validationName.className = 'col-lg-12';

    const groupType = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Validation Target Field Type'),
      name: validationTargetTypeKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: [
          {
            key: 'single',
            value: AggregationGroupType.Single,
            viewValue: this.ts.instant('Single Field')
          },
          {
            key: 'range',
            value: AggregationGroupType.Range,
            viewValue: this.ts.instant('Range Field')
          }
        ]
      },
      value: null,
      required: true
    }).getConfig();
    groupType.className = 'col-lg-12';
    groupType.templateOptions.labelProp = 'viewValue';

    groupType.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        this.selectedGroupType$ = field.formControl.valueChanges.pipe(
          startWith(field.form.get(validationTargetTypeKey).value),
          filter((itemId) => !!itemId),
          takeUntil(this.destroyed$)
        );
      }
    };

    const rangeType = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Range Type'),
      name: rangeTypeKey,
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: this.rangeTypeOptions
      },
      value: null,
      required: true
    }).getConfig();
    rangeType.className = 'col-lg-12';
    rangeType.templateOptions.labelProp = 'viewValue';

    rangeType.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        this.selectedRangeType$ = field.formControl.valueChanges.pipe(
          startWith(field.form.get(rangeTypeKey).value),
          filter((itemId) => !!itemId),
          takeUntil(this.destroyed$)
        );

        field.hideExpression = (model) => {
          if (!model || model[validationTargetTypeKey] !== AggregationGroupType.Range) {
            model ? (model[rangeTypeKey] = null) : '';
            return true;
          }
          return false;
        };
      }
    };

    this.view = {
      details: {
        fields: [validationName, groupType, rangeType],
        form: this.fb.group({}),
        model: {
          name: this.validation?.name,
          groupType: this.validation?.rangeField ? AggregationGroupType.Range : AggregationGroupType.Single,
          rangeType: this.validation?.rangeField?.rangeType
        }
      },
      rule: {
        fields: [],
        form: this.fb.group({}),
        model: {
          operator: this.validation?.operator,
          value: this.validation?.value
        }
      }
    };

    this.view.rule.fields = [
      this.createOperatorField(this.validation?.operator, null),
      this.createValueField(this.validation?.value, null)
    ];
    this.cd.detectChanges();
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

  sourceEmitted(output: AggregateSourceOutput): void {
    this.sourceData = cloneDeep(output);
    this.sourceDataSubject$.next(output.data);
    this.emitToParent();
  }

  createOperatorField(value: RuleCustomOperatorEnum, selectedField: IConfigurableListItem): FormlyFieldConfig {
    const operatorField = createOperatorField(operatorKey, value, selectedField?.type);
    operatorField.className = 'col-lg-12';

    operatorField.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        const validationTypeControl = this.view.details.form.get('groupType');

        field.templateOptions.options = validationTypeControl.valueChanges.pipe(
          startWith(validationTypeControl.value),
          debounceTime(300),
          filter((value) => !!value),
          takeUntil(this.destroyed$),
          switchMap((value) => {
            if (value === AggregationGroupType.Range) {
              if (this.sourceData?.data?.fieldSource) {
                this.sourceData.data.fieldSource = null;
              }
              const allowedRangeOperators = [RuleCustomOperatorEnum.IsEmpty, RuleCustomOperatorEnum.IsNotEmpty].map((operation) => {
                return RuleCustomOperatorMap.get(operation);
              });
              field.templateOptions.disabled = false;

              return from([allowedRangeOperators]);
            } else {
              if (this.sourceData?.data?.rangeFieldSource) {
                this.sourceData.data.rangeFieldSource = null;
              }

              let isFirstChange = true;

              return this.sourceDataSubject$.pipe(
                distinctUntilChanged(),
                takeUntil(this.destroyed$),
                switchMap((data: AggregateSource) => {
                  let operators = [];

                  const aggregation = data?.fieldSource?.preProcess?.aggregationType;
                  let selectedField = data?.fieldSource?.fieldsPath[0]?.field;
                  if (aggregation && selectedField?.type) {
                    switch (aggregation) {
                      case FieldAggregationTypesEnum.Avg:
                        //decimal operators
                        operators = FieldTypeOperationMap.get(FieldTypeIds.DecimalField).map((operation) => {
                          return RuleCustomOperatorMap.get(operation);
                        });
                        // for avg the value field is to be decimal

                        selectedField = {
                          id: '',
                          type: FieldTypeIds.DecimalField,
                          name: 'Decimal',
                          configuration: {
                            position: 0
                          }
                        };
                        break;
                      case FieldAggregationTypesEnum.Count:
                        // number operators
                        operators = FieldTypeOperationMap.get(FieldTypeIds.IntField).map((operation) => {
                          return RuleCustomOperatorMap.get(operation);
                        });
                        // for count the value field is to be integer
                        selectedField = {
                          id: '',
                          type: FieldTypeIds.IntField,
                          name: 'Number',
                          configuration: {
                            position: 0
                          }
                        };
                        break;
                      case FieldAggregationTypesEnum.InnerJoin:
                      case FieldAggregationTypesEnum.Min:
                      case FieldAggregationTypesEnum.Max:
                      case FieldAggregationTypesEnum.Sum:
                      case FieldAggregationTypesEnum.Concat:
                        // current fieldType's operators
                        operators = FieldTypeOperationMap.get(selectedField.type).map((operation) => {
                          return RuleCustomOperatorMap.get(operation);
                        });
                        break;
                      default:
                        break;
                    }
                    setTimeout(() => {
                      this.updateRuleFormly(selectedField, null, isFirstChange);
                      isFirstChange = false;
                    });
                  }

                  field.templateOptions.disabled = !operators.length ? true : false;

                  return from([operators]);
                })
              );
            }
          })
        );
      }
    };
    return operatorField;
  }

  createValueField(value: any, field: IConfigurableListItem): FormlyFieldConfig {
    const valueField = createValueField(valueKey, value, field);
    valueField.className = 'col-lg-12';

    valueField.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.hideExpression = (model) => {
          if (this.sourceData?.data?.rangeFieldSource?.rangeType) {
            return true;
          }
          if (
            model &&
            (model[operatorKey] === RuleCustomOperatorEnum.IsEmpty || model[operatorKey] === RuleCustomOperatorEnum.IsNotEmpty)
          ) {
            // when rule is IsEmpty or isNotEmpty, reset the rule value
            if (model[valueKey]) {
              model[valueKey] = null;
            }
            return true;
          }
          return false;
        };
      }
    };
    return valueField;
  }

  updateRuleFormly(selectedField: IConfigurableListItem, value: any, keepModel?: boolean): void {
    const operatorField = this.view.rule.fields.find((f) => f.key === operatorKey);
    this.view.rule = {
      fields: [operatorField, this.createValueField(value, selectedField)],
      form: this.fb.group({}),
      model: keepModel ? this.view.rule.model : { operator: null, value: null }
    };
  }

  emitToParent(): void {
    const data = this.populateOutput();
    if (data) {
      this.dataEmitter.emit(data);
    }
  }

  populateOutput(): AggregationExpressionData {
    const data: AggregationExpression = {
      name: this.view.details.model.name,
      operator: this.view.rule.model.operator,
      value: this.view.rule.model.value
    };

    if (this.view.details.model.groupType === AggregationGroupType.Single) {
      const source = this.sourceData?.data?.fieldSource ? cloneDeep(this.sourceData?.data?.fieldSource) : null;

      source?.fieldsPath?.forEach((propPath) => {
        delete propPath?.type;
        delete propPath?.field;
      });

      data.field = source;
    } else {
      data.rangeField = this.sourceData?.data?.rangeFieldSource;
    }

    const output = <AggregationExpressionData>{
      isValid: this.view.details.form.valid && this.view.rule.form.valid && !!this.sourceData?.isValid,
      data: data
    };

    return output;
  }
}
