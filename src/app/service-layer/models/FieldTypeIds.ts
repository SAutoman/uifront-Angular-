/**
 * project
 */
import { IKeyValueView, KeyValueView } from '@wfm/common/models/i-key-value-view';
import { EnumConverter, OperatorEnum } from '@wfm/common/models';
import { RuleCustomOperatorEnum, RuleSetCustom } from '@wfm/service-layer/models/expressionModel';
/**
 * local
 */
import { ValidatorType } from './FieldValidator';

export enum FieldTypeIds {
  Unknown = 0,
  IntField = 1,
  StringField = 2,
  DecimalField = 3,
  BoolField = 4,
  ListField = 5,
  MultiselectListField = 6,
  DateField = 7,
  FileField = 9,
  TextareaField = 10,
  TimeField = 11,
  DateTimeField = 12,
  // new Types add it to server
  Radio = 13,
  LinkField = 14,
  /**
   * used in DE creation: stores id-s of some entities (Raw data DE-s for example)
   */
  ListOfLinksField = 15,
  /**
   * used in schema definition (nested schema field type)
   */
  EmbededField = 16,
  /**
   * is used only in UI, it is needed because the user may select schema to be used as EmbededField or ListOfLinksField
   */
  SchemaField = 18,
  ConnectorField = 22,
  // Used with dynamic search filters
  DynamicDateTimeRangeField = 23,
  RichTextField = 25,
  SignatureField = 26,
  YouTubeEmbedField = 27
}

export const FieldTypeLists = [FieldTypeIds.ListField, FieldTypeIds.MultiselectListField, FieldTypeIds.Radio];

export const FieldTypeSimpleFields = [
  FieldTypeIds.IntField,
  FieldTypeIds.StringField,
  FieldTypeIds.DecimalField,
  FieldTypeIds.BoolField,
  FieldTypeIds.DateField,
  FieldTypeIds.FileField,
  FieldTypeIds.TextareaField,
  FieldTypeIds.TimeField,
  FieldTypeIds.DateTimeField,
  FieldTypeIds.RichTextField,
  FieldTypeIds.SignatureField,
  FieldTypeIds.YouTubeEmbedField
];

export const FieldTypeComplexFields = [
  FieldTypeIds.ConnectorField,
  FieldTypeIds.EmbededField,
  FieldTypeIds.ListOfLinksField,
  FieldTypeIds.SchemaField
];

// get: (type: ValidatorType | string) => IKeyValueView<string, ValidatorType>;
// hasValidator: (type: ValidatorType | string) => boolean;
export const FieldTypeNameMap: {
  get: (type: FieldTypeIds) => IKeyValueView<string, FieldTypeIds>;
  has: (type: FieldTypeIds) => boolean;
} = (() => {
  const map = new Map<FieldTypeIds, IKeyValueView<string, FieldTypeIds>>();
  const converter = new EnumConverter(FieldTypeIds);

  const setItem = (type: FieldTypeIds, viewValue: string) => {
    const kv = converter.getKeyValue(type);
    map.set(kv.value, new KeyValueView(kv.key, kv.value, viewValue));
  };
  setItem(FieldTypeIds.Unknown, 'Unknown');
  setItem(FieldTypeIds.StringField, 'Text');
  setItem(FieldTypeIds.TextareaField, 'Big Text');

  setItem(FieldTypeIds.IntField, 'Integer');
  setItem(FieldTypeIds.DecimalField, 'Decimal');

  setItem(FieldTypeIds.BoolField, 'Yes/No');

  setItem(FieldTypeIds.DateField, 'Date');
  setItem(FieldTypeIds.TimeField, 'Time');

  setItem(FieldTypeIds.DateTimeField, 'Date and time');

  setItem(FieldTypeIds.FileField, 'File / Attachment');

  setItem(FieldTypeIds.ListField, 'List');
  setItem(FieldTypeIds.MultiselectListField, 'Multiple list');
  setItem(FieldTypeIds.Radio, 'Radio Button');
  setItem(FieldTypeIds.RichTextField, 'Rich Text');
  setItem(FieldTypeIds.SignatureField, 'Signature');
  setItem(FieldTypeIds.YouTubeEmbedField, 'Youtube Embed');
  // reference types
  setItem(FieldTypeIds.LinkField, 'Entity Reference');
  setItem(FieldTypeIds.ListOfLinksField, 'List of Entity References');
  setItem(FieldTypeIds.EmbededField, 'Embedded Schema');
  setItem(FieldTypeIds.SchemaField, 'Schema');
  setItem(FieldTypeIds.ConnectorField, 'Connector');

  const has = (type: FieldTypeIds) => {
    const kv = converter.getKeyValue(type);
    if (!kv) {
      return false;
    }
    return map.has(kv.value);
  };
  const getKv = (type: FieldTypeIds) => {
    if (!has(type)) {
      return { ...map.get(FieldTypeIds.Unknown) };
    }
    const kv = converter.getKeyValue(type);
    return { ...map.get(kv.value) };
  };

  return {
    get: getKv,
    has
  };
})();

export const FieldTypeValidatorMap: {
  has: (type: FieldTypeIds) => boolean;
  get: (type: FieldTypeIds) => ValidatorType[];
} = (() => {
  const map = new Map<FieldTypeIds, ValidatorType[]>();
  const hasValidators = (type: FieldTypeIds) => {
    return map.has(type) && !!map.get(type).length;
  };
  const getValidators = (type: FieldTypeIds) => {
    if (!hasValidators(type)) {
      return [];
    }
    return [...map.get(type)];
  };
  map.set(FieldTypeIds.BoolField, [ValidatorType.Required]);
  map.set(FieldTypeIds.IntField, [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);
  map.set(FieldTypeIds.DecimalField, [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);
  // string
  map.set(FieldTypeIds.StringField, [
    ValidatorType.Required,
    ValidatorType.MinMax,
    ValidatorType.Min,
    ValidatorType.Max,
    ValidatorType.RegEx,
    ValidatorType.Email
  ]);
  map.set(FieldTypeIds.TextareaField, [
    ValidatorType.Required,
    ValidatorType.MinMax,
    ValidatorType.Min,
    ValidatorType.Max,
    ValidatorType.RegEx
  ]);

  // date
  map.set(FieldTypeIds.DateField, [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);
  map.set(FieldTypeIds.TimeField, [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);
  map.set(FieldTypeIds.DateTimeField, [ValidatorType.Required, ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);

  map.set(FieldTypeIds.FileField, [
    ValidatorType.Required,
    ValidatorType.Min,
    ValidatorType.Max,
    ValidatorType.MinMax,
    ValidatorType.AllowedTypes
  ]);
  map.set(FieldTypeIds.ListField, [ValidatorType.Required]);
  map.set(FieldTypeIds.MultiselectListField, [ValidatorType.Required]);
  // map.set(FieldTypeIds.ListOfLinksField, [ValidatorType.MinMax, ValidatorType.Min, ValidatorType.Max]);
  map.set(FieldTypeIds.ConnectorField, [ValidatorType.Required]);
  map.set(FieldTypeIds.RichTextField, [ValidatorType.Required]);
  map.set(FieldTypeIds.SignatureField, [ValidatorType.Required]);
  map.set(FieldTypeIds.YouTubeEmbedField, [ValidatorType.Required]);

  return {
    get: getValidators,
    has: hasValidators
  };
})();

enum HtmlInputTypeEnum {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  date = 'date',
  textarea = 'textarea',
  category = 'category',
  time = 'time',
  file = 'file',
  richText = 'richText',
  signature = 'signature',
  youtubeEmbed = 'youtubeEmbed'
}

export const FieldTypeHtmlMap: Map<FieldTypeIds, string> = (() => {
  const map = new Map();
  map.set(FieldTypeIds.StringField, HtmlInputTypeEnum.string);
  map.set(FieldTypeIds.TextareaField, HtmlInputTypeEnum.textarea);
  map.set(FieldTypeIds.IntField, HtmlInputTypeEnum.number);
  map.set(FieldTypeIds.DecimalField, HtmlInputTypeEnum.number);
  map.set(FieldTypeIds.BoolField, HtmlInputTypeEnum.boolean);
  map.set(FieldTypeIds.FileField, HtmlInputTypeEnum.file);
  map.set(FieldTypeIds.DateField, HtmlInputTypeEnum.date);
  map.set(FieldTypeIds.DateTimeField, HtmlInputTypeEnum.date);
  map.set(FieldTypeIds.TimeField, HtmlInputTypeEnum.time);
  map.set(FieldTypeIds.MultiselectListField, HtmlInputTypeEnum.category);
  map.set(FieldTypeIds.RichTextField, HtmlInputTypeEnum.richText);
  map.set(FieldTypeIds.SignatureField, HtmlInputTypeEnum.signature);
  map.set(FieldTypeIds.YouTubeEmbedField, HtmlInputTypeEnum.youtubeEmbed);
  return map;
})();

export const FieldTypeOperationMap: { get: (type: FieldTypeIds) => RuleCustomOperatorEnum[] } = (() => {
  const map = new Map<FieldTypeIds, RuleCustomOperatorEnum[]>();

  const allOperations: RuleCustomOperatorEnum[] = [
    RuleCustomOperatorEnum.Equal,
    RuleCustomOperatorEnum.NotEqual,
    RuleCustomOperatorEnum.LessThan,
    RuleCustomOperatorEnum.LessThanOrEqual,
    RuleCustomOperatorEnum.MoreThan,
    RuleCustomOperatorEnum.MoreThanOrEqual,
    RuleCustomOperatorEnum.IsEmpty,
    RuleCustomOperatorEnum.IsNotEmpty
  ];
  const eqOperations = [
    RuleCustomOperatorEnum.Equal,
    RuleCustomOperatorEnum.NotEqual,
    RuleCustomOperatorEnum.IsEmpty,
    RuleCustomOperatorEnum.IsNotEmpty
  ];
  const includeOperations = [RuleCustomOperatorEnum.In, RuleCustomOperatorEnum.NotIn, RuleCustomOperatorEnum.IsEmpty];

  map.set(FieldTypeIds.IntField, allOperations);
  map.set(FieldTypeIds.DecimalField, allOperations);
  map.set(FieldTypeIds.DateField, allOperations);
  map.set(FieldTypeIds.DateTimeField, allOperations);
  map.set(FieldTypeIds.TimeField, allOperations);

  map.set(FieldTypeIds.StringField, eqOperations);
  map.set(FieldTypeIds.TextareaField, eqOperations);

  map.set(FieldTypeIds.BoolField, eqOperations);
  map.set(FieldTypeIds.FileField, eqOperations);

  map.set(FieldTypeIds.MultiselectListField, includeOperations);
  map.set(FieldTypeIds.ListField, eqOperations);
  map.set(FieldTypeIds.Radio, eqOperations);
  map.set(FieldTypeIds.ConnectorField, [RuleCustomOperatorEnum.IsEmpty, RuleCustomOperatorEnum.IsNotEmpty]);
  map.set(FieldTypeIds.ListOfLinksField, [RuleCustomOperatorEnum.IsEmpty, RuleCustomOperatorEnum.IsNotEmpty]);
  map.set(FieldTypeIds.SignatureField, [RuleCustomOperatorEnum.IsEmpty, RuleCustomOperatorEnum.IsNotEmpty]);

  const get = (x: FieldTypeIds) => {
    return [...map.get(x)];
  };
  return {
    get
  };
})();
