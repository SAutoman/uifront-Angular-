/**
 * global
 */
import { Injectable } from '@angular/core';
import { sortBy } from 'lodash-core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter, map, switchMap, take, takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

/**
 * project
 */
import {
  BuilderToolbarFeature,
  IAddRequiredFieldsEvent,
  IBuilderUiLayoutSettings,
  IBuilderUiPageData
} from '@wfm/forms-flow-struct/interface';
import { AreaTypeEnum, SchemaDto } from '@wfm/service-layer';
import { TenantFieldsStateWrapper } from '@wfm/tenant-fields/page-tenant-fields/tenant-fields-state-wrapper';
import { IConfigurableListItem } from '@wfm/common/models';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { schemasAsFieldSelector } from '@wfm/store';

/**
 * local
 */
import { AdminSchemasService } from './admin-schemas.service';
import { TranslateService } from '@ngx-translate/core';
import { selectTenantFieldsState, TenantFieldsState } from '@wfm/store/tenant-fields';

@Injectable()
export class SchemaBuilderService {
  cmdAddRequiredFields$ = new BehaviorSubject<IAddRequiredFieldsEvent>(undefined);
  pageData$ = new BehaviorSubject<IBuilderUiPageData>(undefined);
  schemaId: string;
  schema: SchemaDto;
  builderUiMap: Map<AreaTypeEnum, IBuilderUiLayoutSettings>;

  constructor(
    private adminSchemaService: AdminSchemasService,
    private store: Store<ApplicationState>,
    private translate: TranslateService
  ) {
    this.setupUiMap();
  }

  init(tenantId: string, area: AreaTypeEnum, schemaId?: string): void {
    const tenantFields$ = this.store.select(selectTenantFieldsState).pipe(
      filter((state) => !!state && !!state.page && !!state.page.items),
      take(1),
      switchMap((state: TenantFieldsState) => {
        const wrapper = new TenantFieldsStateWrapper(state);
        wrapper.changeFilter(area);
        return wrapper.workItems$;
      })
    );

    const schemaFields$ = this.store.select(schemasAsFieldSelector).pipe(
      filter((state) => !!state),
      take(1),
      map((schemaFields: IConfigurableListItem[]) => {
        return schemaFields;
      })
    );
    if (schemaId) {
      this.schemaId = schemaId;
      this.adminSchemaService.getSchema(tenantId, area, schemaId).then((schema) => {
        this.schema = schema;
        combineLatest([tenantFields$, schemaFields$])
          .pipe(
            take(1),
            map((fields: Array<IConfigurableListItem[]>) => {
              const schemaDto = this.adminSchemaService.schemaToFormDto(schema);
              this.pageData$.next({
                name: schemaDto?.name,
                formFields: sortBy(schemaDto.fields || [], [(x) => x.configuration.position]),
                selectFields: sortBy(fields[0].concat(fields[1]), [(field) => field.name])
              });
            })
          )
          .subscribe();
      });
    } else {
      // create new
      combineLatest([tenantFields$, schemaFields$])
        .pipe(
          take(1),
          map((fields: Array<IConfigurableListItem[]>) => {
            this.pageData$.next({
              name: '',
              formFields: [],
              selectFields: sortBy(fields[0].concat(fields[1]), [(field) => field.name])
            });
          })
        )
        .subscribe();
    }
  }

  getLayoutSettings(areaType: AreaTypeEnum): IBuilderUiLayoutSettings {
    return this.builderUiMap.get(areaType);
  }

  setupUiMap(): void {
    this.builderUiMap = new Map();
    const baseLayout = {
      newFormTitle: 'Create A Form',
      updateFormTitle: 'Update Form',
      formPreviewTitle: 'Form Preview',
      schemaNameFieldLabel: 'Form Name',
      toolBarActions: {
        show: true,
        features: [
          BuilderToolbarFeature.setFormName,
          BuilderToolbarFeature.addField,
          BuilderToolbarFeature.manageFunctions,
          BuilderToolbarFeature.updateForm,
          BuilderToolbarFeature.saveForm,
          BuilderToolbarFeature.linkedListFields,
          BuilderToolbarFeature.schemaValidators
        ]
      }
    };
    this.builderUiMap.set(AreaTypeEnum.case, {
      ...baseLayout,
      newFormTitle: 'Create Case Template',
      updateFormTitle: 'Update Case Template',
      formPreviewTitle: 'Template Preview',
      schemaNameFieldLabel: 'Case Template Name',
      toolBarActions: {
        ...baseLayout.toolBarActions,
        features: [
          ...baseLayout.toolBarActions.features,
          BuilderToolbarFeature.dataLifetimeSettings,
          BuilderToolbarFeature.conditionalFormatting,
          BuilderToolbarFeature.fastCreateSettings,
          BuilderToolbarFeature.fieldsVisibilityInGrid
        ]
      }
    });

    this.builderUiMap.set(AreaTypeEnum.rawData, {
      ...baseLayout,
      newFormTitle: `Create Raw Data Schema`,
      updateFormTitle: `Update Raw Data Schema`,
      formPreviewTitle: 'Schema Preview',
      schemaNameFieldLabel: `Raw Data Template Name`,
      toolBarActions: {
        ...baseLayout.toolBarActions,
        features: [
          ...baseLayout.toolBarActions.features,
          BuilderToolbarFeature.dataLifetimeSettings,
          BuilderToolbarFeature.fieldsVisibilityInGrid
        ]
      }
    });

    this.builderUiMap.set(AreaTypeEnum.stepForm, {
      ...baseLayout,
      newFormTitle: 'Create Process Step Schema',
      updateFormTitle: 'Update Process Step Schema',
      formPreviewTitle: 'Schema Preview',
      schemaNameFieldLabel: 'Step Template Name'
    });

    this.builderUiMap.set(AreaTypeEnum.comment, {
      ...baseLayout,
      newFormTitle: 'Create Comment Schema',
      updateFormTitle: 'Update Comment Schema',
      formPreviewTitle: 'Comment Schema Preview',
      schemaNameFieldLabel: 'Comment Schema Name'
    });
  }
}
