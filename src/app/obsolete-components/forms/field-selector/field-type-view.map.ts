import { FieldTypeIds } from '@wfm/service-layer';

/**
 * @depracted use FieldTypeNameMap instead of it
 */
export class FieldTypeViewMap {
  private map: Map<FieldTypeIds, string>;
  constructor() {
    this.map = new Map();
    this.fillMap();
  }
  hasValue(type: FieldTypeIds): boolean {
    return !!this.getValue(type);
  }
  getValue(type: FieldTypeIds): string {
    return this.map.get(type) || this.getDefaultValue();
  }
  getDefaultValue(): string {
    return this.map.get(FieldTypeIds.Unknown);
  }

  private fillMap(): void {
    this.map.set(FieldTypeIds.StringField, 'string field');
    this.map.set(FieldTypeIds.IntField, 'integer field');
    this.map.set(FieldTypeIds.DecimalField, 'decimal field');
    this.map.set(FieldTypeIds.DateField, 'date field');
    this.map.set(FieldTypeIds.ListField, 'list field');
    this.map.set(FieldTypeIds.BoolField, 'boolean field');
    this.map.set(FieldTypeIds.FileField, 'file field');
    this.map.set(FieldTypeIds.TextareaField, 'textarea field');
    this.map.set(FieldTypeIds.TimeField, 'time field');
    this.map.set(FieldTypeIds.MultiselectListField, 'multiSelect field');
    this.map.set(FieldTypeIds.Unknown, 'form field');
  }
}
