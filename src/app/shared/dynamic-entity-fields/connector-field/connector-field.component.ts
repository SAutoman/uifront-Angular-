/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';

/**
 * project
 */
import { IFormlyView } from '@wfm/common/models';
import { ConnectorFieldConfiguration } from '@wfm/common/models/connector-field';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds } from '@wfm/service-layer';
import { ConnectorFieldSearchModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { FieldWithSearchModel } from '@wfm/shared/dynamic-entity-field/dynamic-entity-field.component';

@Component({
  selector: 'app-connector-field',
  templateUrl: './connector-field.component.html',
  styleUrls: ['./connector-field.component.scss']
})
export class ConnectorFieldComponent implements OnInit {
  @Input() field: FieldWithSearchModel;
  selectItems: Array<{ id: string; name: string }> = [];
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  view: IFormlyView;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initFormly();
  }

  initFormly(): void {
    const connectorField = FormlyFieldAdapterFactory.createAdapter({
      label: 'Select Entities',
      name: this.field.fieldName,
      type: FieldTypeIds.ConnectorField,
      value: (<ConnectorFieldSearchModel>this.field.searchFieldModel).values,
      allowDisablingOptions: false,
      valueInfo: {
        connectorFieldConfiguration: <ConnectorFieldConfiguration>{
          allowMultipleSelection: true
        },
        schemaFieldId: this.field.id
      }
    });
    const config = connectorField.getConfig();
    this.view = {
      fields: [config],
      form: this.fb.group({}),
      model: {}
    };
  }

  onChange(): void {
    const selection = this.view.model[this.field.fieldName];
    (<ConnectorFieldSearchModel>this.field.searchFieldModel).values = selection;
    this.field.searchFieldModel.isValid = selection?.length ? true : false;
    this.isFieldChanged.emit(true);
  }
}
