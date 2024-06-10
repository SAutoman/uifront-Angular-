import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DynamicRuleSet, FieldTypeIds, SchemaDto, WorkflowStatusDto } from '@wfm/service-layer';
import { BaseComponent } from '@wfm/shared/base.component';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { CustomRule, ExpressionDef, RuleSetCustom } from '@wfm/service-layer/models/expressionModel';
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { cloneDeep } from 'lodash-core';
import { ConnectorOptionRules } from '@wfm/common/models/connector-field';
import { ExpressionDefOutput } from '@wfm/tenant-admin/workflows/rules-builder/rules-builder.component';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { DynamicRuleOutput } from '@wfm/tenant-admin/workflows/dynamic-rules-builder/dynamic-rules-builder.component';

export interface FieldOptionsRulesOutput {
  ruleSet: RuleSetCustom;
  dynamicRuleSet: DynamicRuleSet;
  statuses: string[];
  isValid: boolean;
}

interface IView {
  statuses: IFormlyView<{ statuses: string[] }>;
}

const statusesKey = 'statuses';
@Component({
  selector: 'app-connector-field-option-rules',
  templateUrl: './connector-field-option-rules.component.html',
  styleUrls: ['./connector-field-option-rules.component.scss']
})
export class ConnectorFieldOptionRulesComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() schema: SchemaDto;
  @Input() ownerSchemaFields$: Observable<IConfigurableListItem[]>;
  @Input() ownerSchemaName: string;
  @Input() statuses: WorkflowStatusDto[] = [];
  @Input() fieldOptionRules: ConnectorOptionRules;
  @Output() optionRulesEmitter: EventEmitter<FieldOptionsRulesOutput> = new EventEmitter();
  view: IView;
  schema$: BehaviorSubject<SchemaDto> = new BehaviorSubject(null);
  expressionsDef: ExpressionDef = {};
  expressionConfig = {
    title: '',
    rules: true,
    rulesLabel: '',
    userRolesLabel: '',
    userGroupsLabel: '',
    buttons: false
  };

  targetSchema: SchemaDto;
  areRulesValid: boolean;

  // for DynamicRules
  dynamicRules: DynamicRuleSet;
  areDynamicRulesValid: boolean;

  currentSchemaFields: IConfigurableListItem[];
  ownerSchemaFields: IConfigurableListItem[];

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    let isFirstLoad = true;
    this.schema$
      .pipe(
        filter((data) => !!data),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.targetSchema = cloneDeep(data);
        if (this.targetSchema) {
          this.currentSchemaFields = this.targetSchema.fields.map((f) => BaseFieldConverter.toUi(f));
          if (isFirstLoad) {
            if (this.fieldOptionRules) {
              if (this.fieldOptionRules.ruleSet) {
                this.expressionsDef.ruleSet = cloneDeep(this.fieldOptionRules.ruleSet);
                this.areRulesValid = true;
              }
              if (this.fieldOptionRules.dynamicRuleSet) {
                this.dynamicRules = cloneDeep(this.fieldOptionRules.dynamicRuleSet);
                this.areDynamicRulesValid = true;
              }
            }
            this.initView(this.fieldOptionRules);
          } else {
            this.initView();
          }
          isFirstLoad = false;
        }
      });
    if (this.ownerSchemaFields$) {
      this.ownerSchemaFields$.pipe(takeUntil(this.destroyed$)).subscribe((fields) => {
        this.ownerSchemaFields = fields;
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schema?.currentValue) {
      this.schema$.next(changes.schema.currentValue);
    }
  }

  initView(existingRule?: ConnectorOptionRules): void {
    this.view = {
      statuses: {
        fields: [this.createStatusesField(existingRule?.statuses)],
        form: this.fb.group({}),
        model: {
          [statusesKey]: existingRule?.statuses
        }
      }
    };
  }

  createStatusesField(selectedStatuses?: string[]): FormlyFieldConfig {
    const statusesAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: 'Statuses',
      name: statusesKey,
      type: FieldTypeIds.MultiselectListField,
      valueInfo: {
        options: this.statuses.map((status) => {
          return {
            key: status.name,
            value: status.id
          };
        })
      },
      value: selectedStatuses,
      required: false
    });
    const config = adapterToConfig(statusesAdapter, 'col-12');
    config.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        field.formControl.valueChanges
          .pipe(
            filter((formValue) => !!formValue),
            takeUntil(this.destroyed$)
          )
          .subscribe(() => {
            this.notify();
          });
      }
    };
    return config;
  }

  populateOutput(): FieldOptionsRulesOutput {
    const conditionValue = this.expressionsDef.ruleSet.condition;
    const rules = this.expressionsDef.ruleSet.rules.map((r) => {
      const rule: CustomRule = {
        propertyPath: r.propertyPath,
        operator: r.operator,
        value: r.value
      };
      return rule;
    });
    let data: FieldOptionsRulesOutput = {
      ruleSet: rules?.length
        ? {
            condition: conditionValue,
            rules: rules
          }
        : null,
      statuses: this.view.statuses.model[statusesKey] || [],
      dynamicRuleSet: this.dynamicRules?.rules?.length ? this.dynamicRules : null,
      isValid: this.isValid()
    };
    return data;
  }

  isValid(): boolean {
    if (!this.expressionsDef && !this.dynamicRules && !this.view.statuses.model[statusesKey]?.length) {
      return false;
    }
    const isValid =
      (!this.expressionsDef || (this.expressionsDef && this.areRulesValid)) &&
      (!this.dynamicRules || (this.dynamicRules && this.areDynamicRulesValid));
    return isValid;
  }

  notify(): void {
    const data = this.populateOutput();
    this.optionRulesEmitter.emit(data);
  }

  expressionUpdated(output: ExpressionDefOutput): void {
    this.expressionsDef = output.data;
    this.areRulesValid = output.isValid;
    this.notify();
  }

  dynamicRulesUpdate(data: DynamicRuleOutput): void {
    this.dynamicRules = cloneDeep(data.data);
    this.areDynamicRulesValid = data.isValid;
    this.notify();
  }
}
