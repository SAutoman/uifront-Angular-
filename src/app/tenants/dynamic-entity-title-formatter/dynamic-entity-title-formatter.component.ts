import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { IKeyValueView } from '@wfm/common/models';
import { AreaTypeEnum, AreaTypeMap, AreaTypesWithUiAreas, SchemaDto, SchemasService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';

interface SchemasDataByArea {
  data: SchemaDto[];
  currentSchema$?: BehaviorSubject<SchemaDto>;
}
@Component({
  selector: 'app-dynamic-entity-title-formatter',
  templateUrl: './dynamic-entity-title-formatter.component.html',
  styleUrls: ['./dynamic-entity-title-formatter.component.scss']
})
export class DynamicEntityTitleFormatterComponent extends TenantComponent implements OnInit {
  @Input() caseSchemas: SchemaDto[];

  areaTypes: IKeyValueView<string, AreaTypeEnum>[];
  schemasByArea: { [key: string]: SchemasDataByArea } = {};

  constructor(private schemaService: SchemasService, private store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit() {
    this.areaTypes = AreaTypesWithUiAreas.map((x) => AreaTypeMap.get(x));
    this.getSchemas();
  }

  getSchemas(): void {
    /**
     * Filtering out areaTypes except cases as we are getting casesSchemas via Input
     */
    let promises = this.areaTypes
      .filter((x) => x.value !== AreaTypeEnum.case)
      .map((areaType) => {
        return this.schemaService.search(this.tenant, areaType.value, null);
      });
    Promise.all(promises)
      .then((res) => {
        this.areaTypes
          .filter((x) => x.value !== AreaTypeEnum.case)
          .forEach((areaType, index) => {
            this.schemasByArea[areaType.key] = {
              data: res[index].items,
              currentSchema$: new BehaviorSubject(res[index].items[0])
            };
          });
      })
      .catch((err) => {
        console.log(err);
      });
    this.schemasByArea['case'] = {
      data: this.caseSchemas,
      currentSchema$: new BehaviorSubject(this.caseSchemas[0])
    };
  }

  setCurrentSchemaPerArea(event: string, schemasDataByArea: SchemasDataByArea): void {
    let schema = schemasDataByArea.data.find((schemaItem) => {
      return schemaItem.id === event;
    });
    if (schema) {
      schemasDataByArea.currentSchema$.next(schema);
    }
  }
}
