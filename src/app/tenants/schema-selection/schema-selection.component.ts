/**
 * global
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

/**
 * Project
 */
import { Animations } from '@wfm/animations/animations';
import { FieldTypeIds } from '@wfm/service-layer';
import { SchemaDto, SchemaFieldDto } from '@wfm/service-layer/models/schema';

@Component({
  selector: 'app-schema-selection',
  templateUrl: './schema-selection.component.html',
  styleUrls: ['./schema-selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: Animations
})
export class SchemaSelectionComponent implements OnInit, OnChanges {
  @Input('data')
  schemas: SchemaDto[];

  @Input() showSchemaFields: boolean;

  @Output() schemaIdEmitter: EventEmitter<string> = new EventEmitter();
  @Output() schemaFieldEmitter: EventEmitter<string> = new EventEmitter();

  schemaId: string;
  schemaFields: SchemaFieldDto[];
  selectedSchemaField: string;

  createdAt: SchemaFieldDto = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.DateTimeField,
    displayName: 'Created At',
    fieldName: 'createdAt',
    disabled: false
  };

  updatedAt: SchemaFieldDto = {
    schemaFieldConfiguration: undefined,
    id: undefined,
    type: FieldTypeIds.DateTimeField,
    displayName: 'Updated At',
    fieldName: 'updatedAt',
    disabled: false
  };

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(change: SimpleChanges) {
    if (change?.schemas && change?.schemas?.currentValue?.length > 0) {
      this.schemaId = change.schemas.currentValue?.[0].id;
      this.emitSchemaId(this.schemaId);
      if (this.showSchemaFields) {
        this.filterSchemaFields(this.schemaId);
      }
    }
  }

  filterSchemaFields(schemaId: string): void {
    const fields: SchemaFieldDto[] = this.schemas
      .find((schema) => schema.id === schemaId)
      ?.fields.filter((x) => x.type === FieldTypeIds.DateTimeField);
    this.schemaFields = [...fields, this.createdAt, this.updatedAt];
  }

  onSchemaChange(event: string): void {
    this.emitSchemaId(event);
    this.filterSchemaFields(event);
    this.selectedSchemaField = null;
  }

  emitSchemaId(id: string): void {
    this.schemaIdEmitter.emit(id);
  }

  onFieldChange(event): void {
    this.schemaFieldEmitter.emit(event);
  }
}
