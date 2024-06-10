import { Component, Input, OnInit } from '@angular/core';
import { IConfigurableListItem } from '@wfm/common/models';
import { DataLifetimeSettings, FastCreateSettings, ListFieldsLink, SchemaDto, SchemaValidator } from '@wfm/service-layer';

import { MatDialogRef } from '@angular/material/dialog';
import { ConditionalFormatting } from '@wfm/service-layer/models/conditional-formatting';
import { FastCreateSettingsUi } from './fast-create-setting/fast-create-setting.component';
import { ConditionalFormattingUi } from './conditional-formatting-list/conditional-formatting-list.component';
import { ListFieldLinkOutput } from './linked-list-fields/linked-list-fields.component';
import { LayoutSetup } from '../page-form-builder/layout-setup';
import { BuilderToolbarFeature } from '../interface';
import { SchemaValidatorsOutput } from './schema-validators/schema-validators.component';
import { cloneDeep } from 'lodash-core';
import { FieldsVisibilityOutput, HideFieldSetting } from './fields-visibility/fields-visibility.component';
import { DataLifetimeSettingsOutput } from '@wfm/forms-flow-struct/schema-additional-settings/data-lifetime/data-lifetime.component';

export interface SchemaAdditionaSettingsOutput {
  formattings: ConditionalFormatting[];
  fastCreateSetting: FastCreateSettings;
  linkedListFields?: ListFieldsLink[];
  schemaValidators: SchemaValidator[];
  fieldsVisibility: HideFieldSetting[];
  dataLifetimeSettings: DataLifetimeSettings;
}

@Component({
  selector: 'app-schema-additional-settings',
  templateUrl: './schema-additional-settings.component.html',
  styleUrls: ['./schema-additional-settings.component.scss']
})
export class SchemaAdditionalSettingsComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() formattings: ConditionalFormattingUi[] = [];
  @Input() schema: SchemaDto;

  @Input() fastCreateSettings: FastCreateSettings;

  @Input() linkedListFields: ListFieldsLink[];
  @Input() schemaValidators: SchemaValidator[];
  @Input() fieldsVisibilty: HideFieldSetting[];
  @Input() dataLifetimeSettings: DataLifetimeSettings;

  @Input() layoutSetup: LayoutSetup;
  formattingsOutput: ConditionalFormattingUi[];
  fastCreateOutput: FastCreateSettingsUi;
  linkedListFieldsOutput: ListFieldLinkOutput[];
  schemaValidatorsOutput: SchemaValidatorsOutput;
  fieldsVisibilityOutput: FieldsVisibilityOutput;
  dataLifetimeSettingsOutput: DataLifetimeSettingsOutput;
  isFastCreateAllowed: boolean;
  isFormattingAllowed: boolean;
  isListsLinksAllowed: boolean;
  isDataLifetimeSettingsAllowed: boolean;
  isValidatorsAllowed: boolean;
  isFieldSettingAllowed: boolean;
  constructor(private dialogRef: MatDialogRef<SchemaAdditionalSettingsComponent>) {}

  ngOnInit(): void {
    this.isFastCreateAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.fastCreateSettings);
    this.isFormattingAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.conditionalFormatting);
    this.isListsLinksAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.linkedListFields);
    this.isDataLifetimeSettingsAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.dataLifetimeSettings);
    this.isFieldSettingAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.fieldsVisibilityInGrid);
    this.isValidatorsAllowed = this.layoutSetup?.isSupportedFeature(BuilderToolbarFeature.schemaValidators);
  }

  emitFormattingsOutput(data: ConditionalFormattingUi[]): void {
    if (data?.length) {
      this.formattingsOutput = [...data];
    } else {
      this.formattingsOutput = null;
    }
  }

  emitFastCreateOutput(data: FastCreateSettingsUi): void {
    if (data?.fields?.length) {
      this.fastCreateOutput = { ...data };
    } else {
      this.fastCreateOutput = null;
    }
  }

  emitLinkedListFieldsOutput(data: ListFieldLinkOutput[]): void {
    this.linkedListFieldsOutput = [...data];
  }

  emitDataLifetimeOutput(data: DataLifetimeSettingsOutput): void {
    this.dataLifetimeSettingsOutput = cloneDeep(data);
  }

  fieldsVisibilityUpdated(data: FieldsVisibilityOutput): void {
    this.fieldsVisibilityOutput = cloneDeep(data);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  submit(): void {
    const formattings = this.formattingsOutput
      ? this.formattingsOutput.map((f) => {
          return {
            name: f.name,
            conditionFormula: f.conditionFormula,
            formatting: f.formatting,
            isDisabled: f.isDisabled
          };
        })
      : null;

    const fastCreate = this.fastCreateOutput
      ? {
          enableBarcodeScanning: this.fastCreateOutput.enableBarcodeScanning,
          fields: this.fastCreateOutput.fields
        }
      : null;

    const links = this.linkedListFieldsOutput
      ? this.linkedListFieldsOutput.map((link) => {
          return {
            parentFieldPath: link.parentFieldPath,
            childFieldPath: link.childFieldPath
          };
        })
      : null;

    const validators = this.schemaValidatorsOutput ? this.schemaValidatorsOutput.data : null;
    const fieldsVisibility = this.fieldsVisibilityOutput ? this.fieldsVisibilityOutput.data : null;
    const dataLifetimeSettings = this.dataLifetimeSettingsOutput ? cloneDeep(this.dataLifetimeSettingsOutput) : null;
    delete dataLifetimeSettings?.isValid;

    const data: SchemaAdditionaSettingsOutput = {
      formattings: formattings,
      fastCreateSetting: fastCreate,
      linkedListFields: links,
      schemaValidators: validators,
      dataLifetimeSettings: dataLifetimeSettings,
      fieldsVisibility: fieldsVisibility
    };
    this.dialogRef.close(data);
  }

  isValid(): boolean {
    return (
      (!this.formattingsOutput || this.formattingsOutput?.every((f) => f.isValid)) &&
      (!this.fastCreateOutput || this.fastCreateOutput.isValid) &&
      (!this.linkedListFieldsOutput || this.linkedListFieldsOutput?.every((f) => f.isValid)) &&
      (!this.schemaValidatorsOutput || this.schemaValidatorsOutput.isValid) &&
      (!this.dataLifetimeSettingsOutput || this.dataLifetimeSettingsOutput.isValid) &&
      (!this.fieldsVisibilityOutput || this.fieldsVisibilityOutput.isValid)
    );
  }

  emitSchemaValidatorsOutput(data: SchemaValidatorsOutput): void {
    this.schemaValidatorsOutput = cloneDeep(data);
  }
}
