/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { CellValue } from 'hyperformula';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { FormVariableDto, FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FieldTypeIds, FieldTypeNameMap } from '@wfm/service-layer';
import { FormulaEngineService } from '@wfm/service-layer/services/formula-engine';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';

import { FormulaConfig, FormulaField, FormulaNamedExpression, stopFormulaCalculationKey } from '@wfm/service-layer/models/formula';
import { ApplicationState } from '@wfm/store/application/application.reducer';
/**
 * local
 */
import { TreeLikeNodes, TreeNodeAdditionalData } from '../tree-selectbox/checklist-database.service';
import { TreeNodeOutput } from '../tree-selectbox/tree-selectbox.component';
import { TenantComponent } from '../tenant.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { pathSeparator } from '../actions/field-path-generator/field-path-generator.component';
export interface FormulaFieldFormControls extends FormulaField {
  // UI props
  selectedFieldForTree?: string[];
  sampleValueForm?: IFormlyView;
}

export const alphabet = 'abcdefghijklmnopqrstuvwxyz';

@Component({
  selector: 'app-formula-generator',
  templateUrl: './formula-generator.component.html',
  styleUrls: ['./formula-generator.component.scss']
})
export class FormulaGeneratorComponent extends TenantComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() formulaDto: FormulaConfig;
  @Input() targetFieldType?: FieldTypeIds;
  @Input() isDialog: boolean = true;
  @Output() formulaDataUpdate: EventEmitter<FormulaConfig> = new EventEmitter(null);
  form: FormGroup;
  expressionResult: CellValue | Date | DateTime;
  resultReturned: boolean;
  fieldsTreeNodes: TreeLikeNodes = null;
  hintForExit = `Use "${stopFormulaCalculationKey}" in the formula if you need to stop the calculation for specific scenario`;
  unsupportedFieldypes: FieldTypeIds[] = [
    FieldTypeIds.ListOfLinksField,
    FieldTypeIds.FileField,
    FieldTypeIds.ConnectorField,
    FieldTypeIds.ListField,
    FieldTypeIds.MultiselectListField,
    FieldTypeIds.SignatureField,
    FieldTypeIds.YouTubeEmbedField
  ];
  get dynamicFields(): FormArray {
    return this.form?.get('dynamicFields') as FormArray;
  }

  get namedExpressions(): FormArray {
    return this.form?.get('namedExpressions') as FormArray;
  }

  constructor(
    private formulaEngineService: FormulaEngineService,
    private fb: FormBuilder,
    private matdialogRef: MatDialogRef<FormulaGeneratorComponent>,
    private expressionHelper: ExpressionHelperService,
    store: Store<ApplicationState>,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    this.populateFieldOptions();
    this.form = this.fb.group({
      dynamicFields: this.fb.array([]),
      namedExpressions: this.fb.array([], this.hasDuplicateName()),
      finalExpression: ['=', Validators.required]
    });
    this.subscribeToFormulaChanges();
    if (this.formulaDto) {
      this.updateForm();
    }
  }

  subscribeToFormulaChanges(): void {
    this.form.valueChanges.pipe(distinctUntilChanged(), debounceTime(300), takeUntil(this.destroyed$)).subscribe((x) => {
      this.expressionResult = null;
      this.resultReturned = false;
      if (!this.isDialog) {
        const config = this.populateContract();
        this.formulaDataUpdate.emit(config);
      }
    });
  }

  sampleValueUpdate(): void {
    this.expressionResult = null;
    this.resultReturned = false;
  }

  updateForm() {
    this.form.controls['finalExpression'].setValue(this.formulaDto.expression);
    this.formulaDto.namedExpressions
      ?.sort((a, b) => {
        return a?.position - b?.position;
      })
      .forEach((namedExpression) => {
        this.addNamedExpressionGroup(namedExpression);
      });
    this.formulaDto.fields.forEach((field) => {
      this.addDynamicFieldGroup(field);
    });
  }

  populateFieldOptions(): void {
    let fieldTree = {};
    this.buildFieldsTree(this.fields, fieldTree);
    setTimeout(() => {
      this.fieldsTreeNodes = fieldTree;
    });
  }

  /**
   * recursively build each level of the tree
   */
  buildFieldsTree(fields: IConfigurableListItem[], treeObject: TreeLikeNodes, parentRawValue?: string): void {
    fields.forEach((field) => {
      if (this.unsupportedFieldypes.includes(field.type)) {
        return;
      }
      if (!treeObject[field.fieldName]) {
        treeObject[field.fieldName] = {
          rawValue: parentRawValue ? `${parentRawValue}${pathSeparator}${field.fieldName}` : field.fieldName,
          children: {},
          additionalData: <TreeNodeAdditionalData>{
            fieldType: field.type
          }
        };
      }
      if (field.type == FieldTypeIds.EmbededField && field.fields?.length) {
        const nestedTreeObj = treeObject[field.fieldName].children;
        this.buildFieldsTree(field.fields, nestedTreeObj, treeObject[field.fieldName].rawValue);
      }
    });
  }

  addDynamicFieldGroup(group?: FormulaField): void {
    const count = this.dynamicFields.controls.length;
    this.dynamicFields.push(this.newDynamicFieldGroup(count, group));
  }

  removeDynamicFieldGroup(i: number): void {
    this.dynamicFields.removeAt(i);
  }

  newDynamicFieldGroup(index: number, group?: FormulaField): FormGroup {
    if (group) {
      return this.fb.group(<FormulaFieldFormControls>{
        selectedFieldForTree: new Array(group.fieldPath?.path?.join(pathSeparator)),
        key: group.key,
        fieldPath: group.fieldPath,
        fieldType: this.getFieldFromPath(group.fieldPath?.path, this.fields)?.type,
        sampleValueForm: null
      });
    } else {
      return this.fb.group(<FormulaFieldFormControls>{
        key: `${alphabet.charAt(index).toUpperCase()}1`,
        fieldPath: null,
        fieldType: null,
        sampleValueForm: null
      });
    }
  }

  addNamedExpressionGroup(group?: FormulaNamedExpression): void {
    this.namedExpressions.push(this.newNamedExpressionGroup(group));
  }

  removeNamedExpressionGroup(i: number): void {
    this.namedExpressions.removeAt(i);
    const expressions = this.form?.get('namedExpressions') as FormArray;
    this.updatePositionsOnRemove(i, expressions);
  }

  updatePositionsOnRemove(startIndex: number, expressions: FormArray): void {
    for (let index = startIndex; index < expressions?.length; index++) {
      const group = <FormGroup>expressions.controls[index];
      group.controls?.position.setValue(index);
    }
  }

  newNamedExpressionGroup(group?: FormulaNamedExpression): FormGroup {
    const groupCount = (this.form?.get('namedExpressions') as FormArray)?.length;
    if (group) {
      return this.fb.group({
        key: group?.key,
        formula: group?.formula,
        position: group?.position ? group.position : groupCount
      });
    } else {
      return this.fb.group({
        key: ['', Validators.pattern(/^[a-zA-Z_]{1,255}$/)],
        formula: '=',
        position: groupCount
      });
    }
  }

  tryIt() {
    this.resultReturned = false;

    if (!this.form.valid) {
      return;
    }
    const formulaConfig = this.populateContract();
    const sampleValues = {};
    this.form.value?.dynamicFields?.forEach((f) => {
      sampleValues[f.key] = f.sampleValueForm?.model?.value;
    });
    const formulaResult = this.formulaEngineService.evaluateFormula(formulaConfig, sampleValues, this.targetFieldType);
    if (formulaResult !== stopFormulaCalculationKey) {
      this.expressionResult = formulaResult;
      this.resultReturned = true;
    }
  }

  getFieldTypeLabel(type: FieldTypeIds): string {
    return FieldTypeNameMap.get(type).viewValue;
  }

  fieldSelected(selection: TreeNodeOutput[], groupIndex: number): void {
    if (selection.length) {
      const group = this.dynamicFields.controls[groupIndex] as FormGroup;
      const path = selection[0]?.value.split(pathSeparator);
      const field = this.getFieldFromPath(path, this.fields);
      const sampleValueField = this.createSampleValueField('value', null, field);
      group.controls['fieldPath'].setValue({ path });
      group.controls['fieldType'].setValue(field.type);
      group.controls['sampleValueForm'].setValue({
        fields: [sampleValueField],
        form: this.fb.group({}),
        model: {}
      });
    }
  }

  getFieldFromPath(path: string[], fields: IConfigurableListItem[]): IConfigurableListItem {
    return this.expressionHelper.getFieldByPath(path, fields);
  }

  submit(): void {
    if (this.form.valid) {
      const data = this.populateContract();
      // if opened through dialog
      this.matdialogRef.close({ data });
    }
  }

  populateContract(): FormulaConfig {
    const formValue = this.form.value;
    const formulaConfig = <FormulaConfig>{
      expression: formValue.finalExpression,
      fields: formValue.dynamicFields
        .filter((group: FormulaFieldFormControls) => {
          return group.fieldPath && group.fieldType;
        })
        .map((group: FormulaFieldFormControls) => {
          return <FormulaField>{
            key: group.key,
            fieldPath: group.fieldPath,
            fieldType: group.fieldType
          };
        }),
      namedExpressions: formValue.namedExpressions
        .filter((ne: FormulaNamedExpression) => {
          return ne.key && ne.formula && (ne?.position || ne?.position === 0);
        })
        .map((namedExpression: FormulaNamedExpression) => {
          {
            return {
              key: namedExpression.key,
              formula: namedExpression.formula,
              position: namedExpression?.position
            };
          }
        })
    };
    return formulaConfig;
  }

  createSampleValueField(key: string, value: any, field: IConfigurableListItem, cssClass: string = 'col-11 mx-auto'): FormlyFieldConfig {
    const dto: FormVariableDto = {
      label: this.ts.instant('Enter Value For Testing'),
      name: key,
      type: field.type || FieldTypeIds.StringField,
      value: value || undefined,
      required: false,
      disabled: !field.type,
      valueInfo: field.configuration
    };

    return adapterToConfig(FormlyFieldAdapterFactory.createAdapter(dto), cssClass);
  }

  finalFormulaEmitter(emittedFormula: string): void {
    const fValue = this.form.get('finalExpression').value;
    this.form.get('finalExpression').setValue(fValue + emittedFormula);
  }

  hasDuplicateName(): ValidatorFn {
    return (formArray: FormArray): { [key: string]: any } | null => {
      const names = formArray.controls.map((x) => x.get('key').value);
      const check_hasDuplicate = names.some((name, index) => names.indexOf(name, index + 1) != -1);

      return check_hasDuplicate ? { error: this.ts.instant('More than one Named Expression with the same key detected!') } : null;
    };
  }

  getFieldLabel(group: FormGroup): string {
    const fieldPath = group?.controls['fieldPath']?.value?.path;
    let fieldTitle: string = fieldPath ? 'Field: ' + fieldPath[fieldPath?.length - 1] : this.ts.instant('Select Field');
    if (group?.controls['fieldType']?.value) {
      fieldTitle += ` (${this.getFieldTypeLabel(group?.controls['fieldType']?.value)})`;
    }
    return fieldTitle;
  }

  onDrag(e: CdkDragDrop<any[]>): void {
    const formGroup = this.form?.get('namedExpressions') as FormArray;
    const reorderedData: any[] = formGroup?.controls;
    moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
    this.updatePositions(reorderedData);
  }

  updatePositions(data: any[]): void {
    data.forEach((x, idx) => {
      if (x.controls?.position.value !== idx) {
        x.controls?.position.setValue(idx);
      }
    });
  }
}
