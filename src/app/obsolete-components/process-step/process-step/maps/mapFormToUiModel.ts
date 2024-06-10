import { ProcessStepFormDto, SelectType, UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';

export function mapFormToUiModel(x: ProcessStepFormDto, selectType: SelectType): UIProcessStepFieldModel {
  const d = <UIProcessStepFieldModel>{};
  d.form = x;
  d.name = x.name;
  d.processStepType = selectType;
  d.id = d.form.formId;
  return d;
}
