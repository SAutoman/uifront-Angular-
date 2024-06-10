import { CaseStatus } from './CaseStatus';

export interface UpdateCaseStatusDto {
  status: CaseStatus;
  caseId: string;
}
