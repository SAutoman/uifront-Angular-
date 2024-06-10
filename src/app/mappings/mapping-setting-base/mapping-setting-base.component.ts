import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import { filter, take, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { AreaTypeEnum, SchemaDto } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { workflowMenuItemsSelector, rawDataMenuItemsSelector } from '@wfm/store';

export const auditorKey: string = 'Auditors';
export const supplierKey: string = 'Supplier';
@Component({
  selector: 'app-mapping-setting-base',
  templateUrl: './mapping-setting-base.component.html',
  styleUrls: ['./mapping-setting-base.component.scss']
})
export class MappingSettingBaseComponent extends TenantComponent implements OnInit {
  areaType: AreaTypeEnum;
  schemasData: SchemaDto[];

  get areaTypesEnum() {
    return AreaTypeEnum;
  }

  constructor(private router: Router, private store: Store<any>) {
    super(store);
    this.areaType = this.router.url.includes('rawData')
      ? AreaTypeEnum.rawData
      : this.router.url.includes('cases')
      ? AreaTypeEnum.case
      : null;
  }

  async ngOnInit() {
    await this.getActiveSchemas();
  }

  /**
   * populate case and rawData schemas used in any workflow
   */
  async getActiveSchemas(): Promise<void> {
    const caseMenus$ = this.store.select(workflowMenuItemsSelector);
    const rawDataMenus$ = this.store.select(rawDataMenuItemsSelector);
    combineLatest([caseMenus$, rawDataMenus$])
      .pipe(
        filter((data) => !!data[0] && !!data[1]),
        take(1),
        map(async (menus) => {
          const activeCaseSchemas: SchemaDto[] = [];
          const activeRawDataSchemas: SchemaDto[] = [];
          const wfItems = menus[0];
          for (const workflowMenu of wfItems) {
            const caseSchema = workflowMenu.setting.caseSchema;
            if (caseSchema) {
              activeCaseSchemas.push(<SchemaDto>cloneDeep(caseSchema));
            }
          }
          const rawDataMenuItems = menus[1]?.filter((x) => !x.setting?.isChildRef) || [];
          rawDataMenuItems.forEach((rawDataMenuItem) => {
            const rawDataSchema = rawDataMenuItem.setting;
            if (rawDataSchema) {
              activeRawDataSchemas.push(<SchemaDto>cloneDeep(rawDataSchema));
            }
          });
          if (this.areaType === AreaTypeEnum.rawData) this.schemasData = cloneDeep(activeRawDataSchemas);
          else if (this.areaType === AreaTypeEnum.case) this.schemasData = cloneDeep(activeCaseSchemas);
        })
      )
      .subscribe();
  }
}
