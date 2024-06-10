// import { ProcessStepFieldModel, SelectType, UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';
// import { IFieldBaseDto } from '@wfm/service-layer';

// export function mapFieldToUiModelCommon(x: IFieldBaseDto, processStepType: SelectType): UIProcessStepFieldModel {
//   const d = <UIProcessStepFieldModel>(<any>{ ...x });
//   d.field = <ProcessStepFieldModel>{};
//   d.field.typeField = x.type;
//   d.field.fieldName = x.name;
//   d.field.isCustom = false;
//   d.field.fieldPublicId = x.id;
//   d.field.validators = [];

//   d.type = x.type;

//   d.processStepType = processStepType;
//   d.isValid = true;
//   return d;
// }
