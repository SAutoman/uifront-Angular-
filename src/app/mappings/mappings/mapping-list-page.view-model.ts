import { SortDescriptor, State } from '@progress/kendo-data-query';
import { MappingDtoUi } from '@wfm/service-layer/models/mappings';
import { GridDataResultEx } from '../../shared/kendo-util';

export class MappingListPageViewModel {
  paging: State;
  gridData: GridDataResultEx<MappingDtoUi>;
  sort: SortDescriptor[];
  displayDeleteConfirmation: boolean;
}

export enum MappingsGridActions {
  DELETE = 'delete',
  APPLY = 'apply',
  EDIT = 'edit',
  ReApply_ALL_Mappings = 'reapplyAllMappings'
}
