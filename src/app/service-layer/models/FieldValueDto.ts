import { FileInfo } from './document-upload';
import { BaseDynamicEntityDto, FieldTypeIds } from '@wfm/service-layer';
export interface ListValue {
  listItemId: string;
}

export interface FileValue {
  documentId: string;
  name: string;
}

export interface FileValueUi extends FileValue {
  url?: string;
  fileInfo?: FileInfo;
  // other props we will need
}

export interface BaseFieldValueDto {
  id: string;
  type: FieldTypeIds;
}

export interface FieldValueDto<T> extends BaseFieldValueDto {
  value: T;
}

export type BaseFieldValueType =
  | BoolFieldValueDto
  | DateFieldValueDto
  | DateTimeFieldValueDto
  | DecimalFieldValueDto
  | IntFieldValueDto
  | LinkFieldValueDto
  | ListOfLinkFieldValueDto
  | StringFieldValueDto
  | EmbededFieldValueDto
  | TextAreaTypeFieldValueDto
  | TimeFieldValueDto
  | ListFieldValueDto
  | MultiSelectListFieldValueDto
  | FileFieldValueDto
  | ConnectorFieldValueDto
  | RichTextFieldValueDto
  | SignatureFieldValueDto
  | YoutubeFieldValueDto;

export interface BoolFieldValueDto extends FieldValueDto<boolean> {}
export interface DateFieldValueDto extends FieldValueDto<Date> {}
export interface DateTimeFieldValueDto extends FieldValueDto<Date> {}
export interface DecimalFieldValueDto extends FieldValueDto<number> {}
export interface IntFieldValueDto extends FieldValueDto<number> {}
export interface LinkFieldValueDto extends FieldValueDto<string> {}
export interface ListOfLinkFieldValueDto extends FieldValueDto<string[]> {}
export interface StringFieldValueDto extends FieldValueDto<string> {}
export interface EmbededFieldValueDto extends FieldValueDto<FieldValueDto<any>[]> {}
export interface TextAreaTypeFieldValueDto extends FieldValueDto<string> {}
export interface TimeFieldValueDto extends FieldValueDto<string> {}
export interface ListFieldValueDto extends FieldValueDto<ListValue> {}
export interface MultiSelectListFieldValueDto extends FieldValueDto<string[]> {}
export interface FileFieldValueDto extends FieldValueDto<FileValueUi[]> {}
export interface ConnectorFieldValueDto extends FieldValueDto<string[]> {}
export interface RichTextFieldValueDto extends FieldValueDto<string> {}
export interface SignatureFieldValueDto extends FieldValueDto<string> {}
export interface YoutubeFieldValueDto extends FieldValueDto<string> {}
