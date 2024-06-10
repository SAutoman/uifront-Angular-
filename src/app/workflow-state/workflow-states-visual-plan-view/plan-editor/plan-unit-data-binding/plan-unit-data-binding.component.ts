/**
 * global
 */
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { FieldTypeIds, IFieldBaseDto, SchemaDto } from '@wfm/service-layer';
import { SearchFieldModel, MappingSearchFieldModel, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
import { PlanUnitDataBinding } from '@wfm/service-layer/models/workflow-visual-plan.model';
import { FilterFieldsService } from '@wfm/shared/dynamic-entity-field/filter-fields.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { CanvasHelperService, ColorOption } from '../../services/canvas.helper.service';
import { LabelSettingsOutput } from '@wfm/common/field/connector-field-editor/connector-field-option-label-settings/connector-field-option-label-settings.component';

@Component({
  selector: 'app-plan-unit-data-binding',
  templateUrl: './plan-unit-data-binding.component.html',
  styleUrls: ['./plan-unit-data-binding.component.scss']
})
export class PlanUnitDataBindingComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() schema: SchemaDto;
  @Input() unitId: string;
  @Input() binding: PlanUnitDataBinding;
  @Input() unit: fabric.Object;
  isDynamicTitleAllowed: boolean;

  dataBindForm: FormGroup;
  fields: IFieldBaseDto[];
  selectedFields: IFieldBaseDto[] = [];
  colors: ColorOption[];
  labelSettings: LabelSettingsOutput;

  constructor(
    private store: Store<ApplicationState>,
    private fb: FormBuilder,
    private filterFieldsService: FilterFieldsService,
    private matdialogRef: MatDialogRef<PlanUnitDataBindingComponent>,
    private canvasHelper: CanvasHelperService
  ) {
    super(store);
    this.colors = this.canvasHelper.getAllowedColors();
    this.initDataBindForm();
  }

  ngOnInit(): void {
    if (this.schema) {
      this.getSearchMaskFields();
    }
    this.updateBindForm();
    this.checkForDynamicTitle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.binding && !changes.binding.firstChange) {
      this.updateBindForm();
    }
  }

  updateBindForm(): void {
    if (this.binding) {
      this.dataBindForm.setValue({
        bindingName: this.binding.name,
        color: this.binding.color,
        selectedField: null
      });
      this.populateSelectedFilters(this.binding);
      if (this.binding.titleSettings) {
        try {
          this.binding.titleSettingsUI = JSON.parse(this.binding.titleSettings);
          this.labelSettings = {
            ...this.binding.titleSettingsUI,
            isValid: true
          };
        } catch (error) {
          console.log('error', error);
        }
      }
    } else {
      this.initDataBindForm();
      this.selectedFields = [];
    }
  }

  initDataBindForm(): void {
    this.dataBindForm = this.fb.group({
      bindingName: ['', Validators.required],
      color: ['', Validators.required],
      selectedField: ['']
    });
  }

  // copied from mapping-editor

  onFieldSelected(field: IFieldBaseDto): void {
    if (this.selectedFields.includes(field)) {
      return;
    }
    this.selectedFields.push(field);
  }

  onFieldRemove(field: IFieldBaseDto): void {
    field.value = '';
    this.selectedFields = this.selectedFields.filter((f) => f !== field);
  }

  getSearchMaskFields(): void {
    this.selectedFields = [];
    this.fields = this.filterFieldsService.prepareSearchFieldsForSchema(this.schema, false);
  }

  populateSelectedFilters(binding: PlanUnitDataBinding): void {
    let mappedFields = cloneDeep(binding.fieldMappingsUI?.filters || []);
    this.selectedFields = [];

    mappedFields.forEach((mappedField) => {
      for (let i = 0; i < this.fields.length; i++) {
        if (mappedField.fieldName === this.fields[i].fieldName) {
          if (mappedField.valueType === FieldTypeIds.StringField && !mappedField.customSearchType) {
            mappedField.searchType = SearchType.Like;
          }
          let field = {
            ...this.fields[i],
            searchFieldModel: {
              ...mappedField,
              isValid: !!mappedField.value || !!mappedField['items']?.length
            }
          };
          this.selectedFields.push(field);
          break;
        }
      }
    });
  }

  saveMapping(): void {
    const formValue = this.dataBindForm.value;
    const fieldMappingsUI = this.selectedFields.map((field) => {
      let searchField: SearchFieldModel = cloneDeep(field.searchFieldModel);
      delete searchField.displayName;
      delete searchField.isValid;
      delete searchField.displayName;
      // in unitDataBinding, string fields matching shall be exactMatch
      if (searchField.valueType === FieldTypeIds.StringField && !searchField.customSearchType) {
        searchField.searchType = SearchType.EqualTo;
      }
      return <MappingSearchFieldModel>searchField;
    });
    const data = <PlanUnitDataBinding>{
      unitId: this.unitId,
      name: formValue.bindingName,
      color: formValue.color,
      fieldMappingsUI: { filters: fieldMappingsUI }
    };
    if (this.labelSettings) {
      delete this.labelSettings.isValid;
      data.titleSettings = JSON.stringify(this.labelSettings);
    }

    this.matdialogRef.close({ data });
  }

  cancel() {
    this.matdialogRef.close(null);
  }

  isValid(): boolean {
    return (
      this.dataBindForm?.valid &&
      this.selectedFields &&
      this.selectedFields.length &&
      this.selectedFields.every((field) => field.searchFieldModel?.isValid) &&
      (!this.labelSettings || this.labelSettings.isValid)
    );
  }

  labelSettingsUpdated(event: LabelSettingsOutput): void {
    this.labelSettings = event;
  }

  checkForDynamicTitle(): void {
    this.isDynamicTitleAllowed = this.canvasHelper.groupHasTextObject([this.unit]);
  }
}
