/**
 * global
 */
import { KeyValue } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatOptionSelectionChange } from '@angular/material/core';

/**
 * project
 */
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { IConfigurableListItem } from '@wfm/common/models';
import { AreaTypeEnum, FieldTypeComplexFields, FieldTypeIds, RepeatableSettings, SchemaDto, WorkflowDto } from '@wfm/service-layer';
import { PropertyPathTypeEnum, RawDataPath } from '@wfm/service-layer/models/expressionModel';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { FieldPathInput } from '@wfm/shared/actions/field-path-generator/FieldPathModels';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WorkflowBuilderState } from '@wfm/store/workflow-builder';

@Component({
  selector: 'app-repeatable-step-settings',
  templateUrl: './repeatable-step-settings.component.html',
  styleUrls: ['./repeatable-step-settings.component.scss']
})
export class RepeatableStepSettingsComponent extends TenantComponent implements OnInit, OnDestroy {
  @Input() workflow: WorkflowDto;
  @Input() repeatableSettings?: RepeatableSettings;
  @Output() settingsEmitter: EventEmitter<RepeatableSettings> = new EventEmitter();
  form: FormGroup;
  rawDataFieldsOptions: KeyValue<string, IConfigurableListItem>[] = [];

  rawDataRefFields: IConfigurableListItem[] = [];

  field: FieldPathInput;
  selectedFields: KeyValue<string, string>[] = [];
  constructor(
    private fb: FormBuilder,
    private adminSchemasService: AdminSchemasService,
    store: Store<WorkflowBuilderState>,
    private expressionHelper: ExpressionHelperService,
    private cd: ChangeDetectorRef,
    private errorHandler: ErrorHandlerService
  ) {
    super(store);
  }

  async ngOnInit() {
    this.form = this.fb.group({
      resolveAtOnce: [false],
      rawDataFields: [[], Validators.required],
      rawDataRef: [null, Validators.required]
    });

    this.form.valueChanges.pipe(debounceTime(100), takeUntil(this.destroyed$)).subscribe(() => {
      this.emitDataToParent();
    });

    this.form
      .get('rawDataRef')
      .valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(async (refSelected) => {
        const refField = this.rawDataRefFields.find((f) => f.id === refSelected);
        if (refField) {
          try {
            const schema = await this.adminSchemasService.getSchema(
              this.tenant,
              refField.configuration?.schemaAreaType,
              refField.configuration?.schemaId
            );
            if (schema) {
              this.populateFieldOptions(schema);
            }
          } catch (error) {
            this.errorHandler.getAndShowErrorMsg(error);
          }
        }
      });

    await this.getRawDataReferences(this.workflow.caseSchemaId, AreaTypeEnum.case, this.rawDataRefFields, [], '');

    if (this.repeatableSettings) {
      this.updateForm();
    }
  }

  updateForm(): void {
    const rawDataRef = this.rawDataRefFields.find(
      (f) =>
        f.path?.join(pathSeparator) === this.repeatableSettings.linkedRawDataSettings?.linkedRawDataReference?.path?.join(pathSeparator)
    );

    this.form.patchValue({
      resolveAtOnce: this.repeatableSettings.resolveAtOnce || false,
      rawDataFields:
        this.repeatableSettings.linkedRawDataSettings?.rawDataFields?.map((rawDataPath) => rawDataPath.path?.join(pathSeparator)) || [],
      rawDataRef: rawDataRef.id
    });

    // for existing repeatable settings, user cannot change rawDataRef to another one

    this.form.get('rawDataRef').disable();
  }

  /**
   *  getting schemas from cache
   *  get case schema,  from it get the raw data schemaId, get rawDataSchema fields
   */
  async getRawDataReferences(
    schemaId: string,
    areaType: AreaTypeEnum,
    rawDataReferences: IConfigurableListItem[],
    parentPath: string[],
    parentName: string
  ): Promise<void> {
    try {
      const schema = await this.adminSchemasService.getSchema(this.tenant, areaType, schemaId);

      for (const field of schema.fields) {
        if (field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData) {
          const fieldWithPath: any = {
            ...field,
            path: [...parentPath, field.fieldName],
            label: parentName ? `${field.displayName} (child reference in ${parentName})` : `${field.displayName}`
          };
          rawDataReferences.push(fieldWithPath);

          await this.getRawDataReferences(
            field.configuration.schemaId,
            field.configuration.schemaAreaType,
            rawDataReferences,
            fieldWithPath.path,
            fieldWithPath.label
          );
        }
      }
    } catch (error) {
      this.errorHandler.getAndShowErrorMsg(error);
    }
  }

  populateFieldOptions(schema: SchemaDto): void {
    const fields = [...schema.fields];
    this.rawDataFieldsOptions = [];
    this.cd.detectChanges();
    fields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.rawDataFieldsOptions.push(...retrieved);
    });

    this.rawDataFieldsOptions = this.rawDataFieldsOptions
      .filter((f) => !FieldTypeComplexFields.includes(f.value.type))
      .map((option) => {
        const path = this.getPath(option.value, []);
        return {
          key: option.key,
          value: {
            ...option.value,
            pathString: path.join(pathSeparator)
          }
        };
      });
  }

  getPath(field, path: string[]): string[] {
    path.unshift(field.fieldName || field.name);
    if (field.parentField) {
      path = this.getPath(field.parentField, path);
    }
    return path;
  }

  emitDataToParent(): void {
    let data = this.prepareSettingsData();
    this.settingsEmitter.emit(data);
  }

  prepareSettingsData(): RepeatableSettings {
    const formValues = this.form.getRawValue();
    const selectedRawData = this.rawDataRefFields.find((f) => f.id === formValues.rawDataRef);
    let settings: RepeatableSettings = {
      isRepeatable: true,
      resolveAtOnce: true,
      linkedRawDataSettings: {
        rawDataSchemaId: selectedRawData.configuration.schemaId,
        linkedRawDataReference: {
          pathType: PropertyPathTypeEnum.CasePath,
          path: selectedRawData?.path
        },
        rawDataFields: this.selectedFields.map((field) => {
          return <RawDataPath>{
            pathType: PropertyPathTypeEnum.RawDataPath,
            path: field.value?.split(pathSeparator),
            rawDataFieldName: selectedRawData?.fieldName
          };
        })
      }
    };
    return settings;
  }

  onDrag(e: CdkDragDrop<any[]>): void {
    if (e.previousContainer === e.container) {
      moveItemInArray(this.selectedFields, e.previousIndex, e.currentIndex);
      this.emitDataToParent();
    }
  }

  optionChanged(event: MatOptionSelectionChange, field: KeyValue<string, IConfigurableListItem>): void {
    if (event.source.selected && !this.selectedFields.find((field) => field.value === event.source.value)) {
      this.selectedFields.push({
        value: event.source.value,
        key: field.key
      });
    } else if (!event.source.selected) {
      this.selectedFields = this.selectedFields.filter((field) => field.value !== event.source.value);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.settingsEmitter.emit(null);
  }
}
