import { Form } from '@wfm/service-layer';
import { ProcessStepFormDto, SelectType, UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';

export function mapFormsInitial(x: Form): UIProcessStepFieldModel {
  const d = <UIProcessStepFieldModel>(<any>{ ...x });
  d.form = <ProcessStepFormDto>{};
  d.form.formId = x.id;
  d.form.name = x.name;
  d.name = x.name;
  d.id = x.id;
  d.processStepType = SelectType.Forms;

  return d;
}
