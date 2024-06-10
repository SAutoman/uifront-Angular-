import { ProcessForm } from './ProcessForm';

export interface ProcessFormToApi extends ProcessForm {
  caseId: string;
  processStepId: string;
}
