/**
 * project
 */
import { SearchMask } from '@wfm/service-layer/models/mappings';

export class MappingViewModel {
  id: string;
  tenantId: string;
  companyId: string;
  schemaId: string;
  searchMask: SearchMask;
}
