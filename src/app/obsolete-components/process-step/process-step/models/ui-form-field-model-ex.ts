import { UIFormFieldModel } from '@wfm/obsolete-components/forms/models';
import { UIProcessStepFieldModel } from '@wfm/obsolete-components/process-step/models';

/**
 * local
 */

export interface UIFormFieldModelEx extends UIFormFieldModel {
  ref: UIProcessStepFieldModel;
}
