/**
 * global
 */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IConfigurableListItem } from '@wfm/common/models';
import { FieldTypeIds } from '@wfm/service-layer';
import { FormattingType } from '@wfm/service-layer/models/conditional-formatting';
import { FormulaConfig } from '@wfm/service-layer/models/formula';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';

/**
 * local
 */
import { ConditionalFormattingUi } from '../conditional-formatting-list/conditional-formatting-list.component';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

interface KeyLabel {
  key: FormattingType | string;
  label: string;
}

interface StyleType {
  name: string;
  items: KeyLabel[];
}
@Component({
  selector: 'app-conditional-formatting',
  templateUrl: './conditional-formatting.component.html',
  styleUrls: ['./conditional-formatting.component.scss']
})
export class ConditionalFormattingComponent extends TenantComponent implements OnInit {
  @Input() conditionalFormatting: ConditionalFormattingUi;
  @Input() fields: IConfigurableListItem[];
  @Output() update: EventEmitter<ConditionalFormattingUi> = new EventEmitter(null);
  fieldType: FieldTypeIds = FieldTypeIds.BoolField;
  formula: FormulaConfig;
  formulaDataOutput: FormulaConfig;
  formattingAreas: KeyLabel[];
  styleTypes: StyleType[];
  form: FormGroup;

  constructor(private fb: FormBuilder, store: Store<ApplicationState>, private ts: TranslateService) {
    super(store);
  }

  ngOnInit() {
    this.populateFormattingOptions();
    this.addSystemFields();
    try {
      this.formula = JSON.parse(this.conditionalFormatting.conditionFormula);
    } catch (error) {
      this.formula = null;
    }

    this.form = this.fb.group({
      name: [this.conditionalFormatting.name, Validators.required],
      formulaData: [this.formula, Validators.required],
      formattingArea: [this.conditionalFormatting.formatting.types, Validators.required],
      formattingClass: [this.conditionalFormatting.formatting.className, Validators.required],
      isEnabled: [!this.conditionalFormatting.isDisabled]
    });

    this.form.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
      const output = this.populateOutput();
      this.update.emit(output);
    });
  }

  addSystemFields(): void {
    this.fields = [
      ...this.fields,
      {
        id: null,
        name: GridSystemFieldsEnum.CREATED_AT,
        fieldName: GridSystemFieldsEnum.CREATED_AT,
        displayName: 'Created At',
        type: FieldTypeIds.DateTimeField
      },
      {
        id: null,
        name: GridSystemFieldsEnum.UPDATED_AT,
        fieldName: GridSystemFieldsEnum.UPDATED_AT,
        displayName: 'Updated At',
        type: FieldTypeIds.DateTimeField
      }
    ];
  }

  formulaDataUpdate(event: FormulaConfig): void {
    this.formulaDataOutput = cloneDeep(event);
    this.form.get('formulaData').setValue(this.formulaDataOutput);
  }

  populateOutput(): ConditionalFormattingUi {
    const formValues = this.form.value;

    const output: ConditionalFormattingUi = {
      name: formValues['name'],
      conditionFormula: JSON.stringify(formValues['formulaData']),
      formatting: {
        types: formValues['formattingArea'],
        className: formValues['formattingClass']
      },
      isDisabled: !formValues['isEnabled'],
      isValid: this.isValid(),
      expanded: this.conditionalFormatting.expanded
    };
    return output;
  }

  populateFormattingOptions(): void {
    this.formattingAreas = [
      {
        key: FormattingType.Grid,
        label: this.ts.instant('Style grid rows')
      },
      {
        key: FormattingType.Kanban,
        label: this.ts.instant('Style kanban board')
      }
    ];

    this.styleTypes = [
      {
        name: this.ts.instant('Font Styling'),
        items: [
          {
            key: 'bold-text',
            label: this.ts.instant('Make font bold')
          },
          {
            key: 'italic-text',
            label: this.ts.instant('Make font italic')
          },
          {
            key: 'red-text',
            label: this.ts.instant('Make font red color')
          },
          {
            key: 'blue-text',
            label: this.ts.instant('Make font blue color')
          }
        ]
      },
      {
        name: this.ts.instant('Background Styling'),
        items: [
          {
            key: 'yellow',
            label: this.ts.instant('Make items yellow')
          },
          {
            key: 'red',
            label: this.ts.instant('Make items red')
          },
          {
            key: 'green',
            label: this.ts.instant('Make items green')
          },
          {
            key: 'blue',
            label: this.ts.instant('Make items blue')
          },
          {
            key: 'orange',
            label: this.ts.instant('Make items orange')
          },
          {
            key: 'purple',
            label: this.ts.instant('Make items purple')
          },
          {
            key: 'grey',
            label: this.ts.instant('Make items grey')
          }
        ]
      }
    ];
  }

  isValid(): boolean {
    return this.form.valid && !!this.formulaDataOutput.expression;
  }
}
