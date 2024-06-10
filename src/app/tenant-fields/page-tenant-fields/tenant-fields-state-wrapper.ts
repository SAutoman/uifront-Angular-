/**
 * global
 */
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-core';

/**
 * project
 */
import { IConfigurableListItem, IFieldConfiguration, IKeyValueView } from '@wfm/common/models';
import { AreaTypeEnum, AreaTypeObj } from '@wfm/service-layer';
import { TenantFieldsState } from '@wfm/store/tenant-fields';

/**
 * local
 */

export class TenantFieldsStateWrapper {
  loading: boolean;
  silent: boolean;
  error?: any;

  workItems$ = new BehaviorSubject<IConfigurableListItem<IFieldConfiguration>[]>([]);

  private items: IConfigurableListItem<IFieldConfiguration>[];
  constructor(state: TenantFieldsState) {
    this.loading = state.loading;
    this.silent = state.silent;
    this.error = state.error;
    this.items = this.initItems(state?.page?.items || []);
  }

  changeFilter(type: number): void {
    let collection: IConfigurableListItem<IFieldConfiguration>[];

    switch (type) {
      case AreaTypeEnum.rawData:
        collection = this.rawData;
        break;
      case AreaTypeEnum.case:
        collection = this.case;
        break;
      case AreaTypeEnum.stepForm:
        collection = this.stepForm;
        break;
      case AreaTypeEnum.comment:
        collection = this.comment;
        break;
      case AreaTypeEnum.all:
        collection = this.common;
        break;
      default:
        collection = this.allFields;
        break;
    }

    this.workItems$.next(collection);
  }

  /**
   * append areaTypeNames based onb areaTypeIds
   */
  appendAreaTypeNames(statuses: IKeyValueView<string, AreaTypeEnum>[]): void {
    this.items.map((x) => {
      x.areaTypes = x.areaTypes && x.areaTypes.length && x.areaTypes.includes(AreaTypeEnum.all) ? [AreaTypeEnum.all] : x.areaTypes;
    });
    this.items.map((x: IConfigurableListItem) => {
      const areaTypeNames: string[] = this.mapAreaTypes(x.areaTypes, statuses);
      x.areaTypeNames = areaTypeNames;
    });
  }

  private mapAreaTypes(areaTypes: number[], statuses: IKeyValueView<string, AreaTypeEnum>[]): string[] {
    const items: string[] = [];

    areaTypes.map((el) => {
      const viewValue = statuses.find((x) => x.value === el).viewValue;
      items.push(viewValue);
    });

    return items;
  }

  get allFields(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items;
  }

  private initItems(items: IConfigurableListItem<IFieldConfiguration>[]): IConfigurableListItem<IFieldConfiguration>[] {
    return items.map((x) => {
      const item: IConfigurableListItem<IFieldConfiguration> = cloneDeep(x);
      item.isChanged = false;
      if (!item.useIn) {
        // as default we use tenant fields in step and process
        item.useIn = [];
        // turn on flag for save
        item.isChanged = true;
      }
      if (!item.useInObj) {
        item.useInObj = new AreaTypeObj(item.useIn);
      }

      return item;
    });
  }

  private get case(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items.filter((x) => x.useInObj.case) || [];
  }

  private get stepForm(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items.filter((x) => x.useInObj.stepForm) || [];
  }

  private get rawData(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items.filter((x) => x.useInObj.rawData) || [];
  }

  private get comment(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items.filter((x) => x.useInObj.comment) || [];
  }

  private get common(): IConfigurableListItem<IFieldConfiguration>[] {
    return this.items.filter((x) => x.useInObj.all);
  }
}
