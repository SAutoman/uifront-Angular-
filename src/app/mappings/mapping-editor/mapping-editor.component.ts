/**
 * global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { Actions, ofType } from '@ngrx/effects';
import { MatDialog } from '@angular/material/dialog';

/**
 * project
 */
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { CreateMappingDto, EditMappingDto, MappingDto, SearchMask } from '@wfm/service-layer/models/mappings';
import { FilterFieldsService } from '@wfm/shared/dynamic-entity-field/filter-fields.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { MappingSearchFieldModel, SearchType } from '@wfm/service-layer/models/dynamic-entity-models';
/**
 * local
 */
import { AuthState, loggedInState } from '../../store/auth';
import { TenantComponent } from '../../shared/tenant.component';
import { FieldTypeIds, AreaTypeEnum, IFieldBaseDto, SchemaDto, SchemasService, Company } from '../../service-layer';
import {
  CreateSupplier,
  CreateAuditor,
  MappingTypes,
  CreateSupplierSuccess,
  CreateAuditorSuccess,
  editMappingViewModelSelector,
  LoadSupplier,
  LoadAuditor,
  ClearEditMappingViewModel,
  EditSupplier,
  EditAuditor,
  EditAuditorSuccess,
  EditSupplierSuccess,
  tenantCompaniesSelector,
  GetTenantMappingCompanies
} from '../../store';

import { TenantViewModel } from '../../tenants/tenant.model';

import { convertTenantName } from '../../shared/utils';
import { MappingManualTriggerComponent } from '../mapping-manual-trigger/mapping-manual-trigger.component';
import { caseMappingRoute, rawDataMappingRoute } from '../mappings.routing';

@Component({
  selector: 'app-mapping-editor',
  templateUrl: './mapping-editor.component.html',
  styleUrls: ['./mapping-editor.component.scss'],
  providers: [FilterFieldsService]
})
export class MappingEditorComponent extends TenantComponent implements OnInit, OnDestroy {
  mappingAreaType: AreaTypeEnum;
  mappingAreaName: string;
  redirectUrl: string;
  currentMapping: MappingDto = <MappingDto>{};
  mappingForm: FormGroup;
  selectedTenant: TenantViewModel;
  companies: Company[];
  header: string;
  fields: IFieldBaseDto[];
  selectedFields: IFieldBaseDto[] = [];
  mappedFields: MappingSearchFieldModel[];
  isLoading: boolean = true;
  hasError: boolean = false;
  authState: AuthState;
  schemas: SchemaDto[];
  componentId = '033228d0-8322-42c7-9354-79518a0e82dc';
  mappingFormHasChanges: boolean = false;
  fieldChangesDetectionFlag: boolean;
  isEdit: boolean;
  title: string;
  get searchMask(): AbstractControl {
    return this.mappingForm.get('searchMask');
  }

  get fieldTypeIds(): typeof FieldTypeIds {
    return FieldTypeIds;
  }

  get areaTypes(): typeof AreaTypeEnum {
    return AreaTypeEnum;
  }

  get searchType(): typeof SearchType {
    return SearchType;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private store: Store<ApplicationState>,
    private router: Router,
    private schemasService: SchemasService,
    private actions$: Actions,
    private _location: Location,
    private filterFieldsService: FilterFieldsService,
    private dialog: MatDialog
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    this.mappingAreaType = this.getMappingTypeFromUrl();
    this.mappingAreaName = this.mappingAreaType === AreaTypeEnum.rawData ? 'Raw Data' : 'Case';

    this.mappingForm = this.fb.group({
      companyId: ['', Validators.required],
      schemaId: ['', Validators.required],
      areaType: [this.mappingAreaType, Validators.required],
      searchMask: ['', Validators.required]
    });
    this.subscribeToFormChanges();
    this.getCompanies();

    this.header = this.isAuditorArea() ? 'Auditor' : 'Supplier';
    await this.initSchemas();

    this.activatedRoute.params.subscribe((params) => {
      const mappingId = params.id;
      if (mappingId) {
        this.isEdit = true;
        if (this.isSupplierArea()) {
          this.store.dispatch(new LoadSupplier({ tenantId: this.tenant, id: mappingId }));
        } else if (this.isAuditorArea()) {
          this.store.dispatch(new LoadAuditor({ tenantId: this.tenant, id: mappingId }));
        }

        this.store.pipe(select(editMappingViewModelSelector)).subscribe((result) => {
          if (result) {
            this.currentMapping = result;
            if (result.id) {
              this.mappingForm.patchValue(
                {
                  schemaId: result.schemaId,
                  companyId: result.companyId
                },
                { emitEvent: false }
              );

              this.getSearchMaskFields(result.schemaId);

              this.populateSelectedFilters(cloneDeep(result.searchMask));
            }
          }
        });
      }
      this.setTitle();
    });

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((authState) => {
      this.authState = authState;
      this.selectedTenant = {
        name: this.authState.currentTenantSystem.tenant.tenantName,
        id: this.authState.currentTenantSystem.tenant.tenantId
      };

      this.redirectUrl = `${convertTenantName(
        this.authState.currentTenantSystem.tenant.tenantName
      )}/mappings/${this.getMappingAreaTypeRoute()}`;
    });
  }

  setTitle(): void {
    if (this.isEdit) {
      this.title = `Edit ${this.header} Mapping For ${this.mappingAreaName}`;
    } else {
      this.title = `Create ${this.header} Mapping For ${this.mappingAreaName}`;
    }
  }

  getMappingAreaTypeRoute(): string {
    return this.mappingAreaType === AreaTypeEnum.rawData ? rawDataMappingRoute : caseMappingRoute;
  }

  getCompanies() {
    this.store.pipe(select(tenantCompaniesSelector), takeUntil(this.destroyed$)).subscribe((companies) => {
      if (!companies?.length) {
        this.store.dispatch(new GetTenantMappingCompanies({ tenantId: this.tenant }));
      } else {
        this.companies = companies?.length
          ? cloneDeep(companies).sort((a, b) => {
              return a.name.localeCompare(b.name);
            })
          : [];
      }
    });
  }

  subscribeToFormChanges(): void {
    this.mappingForm.valueChanges.pipe(take(1)).subscribe((x) => {
      this.mappingFormHasChanges = true;
    });
  }

  async initSchemas(): Promise<void> {
    this.schemas = (await this.schemasService.search(this.tenant, this.mappingAreaType, { skip: 0, take: 999 }))?.items;
  }

  getSearchMaskFields(schemaId: string): void {
    const mappingSchema = this.schemas.find((schema) => schema.id === schemaId);
    this.mappingForm.patchValue(
      {
        schemaId: mappingSchema.id
      },
      { emitEvent: false }
    );
    this.isLoading = true;
    this.selectedFields = [];
    this.fields = this.filterFieldsService.prepareSearchFieldsForSchema(mappingSchema, false);
    this.isLoading = false;
  }

  onSubmit(): void {
    this.mappedFields = this.selectedFields.map((field) => {
      let clonedField = cloneDeep(field);
      let searchField = cloneDeep(<SearchFieldModel>clonedField.searchFieldModel);
      delete searchField.displayName;
      delete searchField.isValid;
      delete searchField.displayName;

      return <MappingSearchFieldModel>searchField;
    });
    // use getRawValue, to get back disabled companyId control's value
    let formData: CreateMappingDto = this.mappingForm.getRawValue();

    formData.searchMask = {
      filters: this.mappedFields
    };

    if (this.isEdit) {
      const data: EditMappingDto = {
        id: this.currentMapping.id,
        tenantId: this.tenant,
        entity: formData
      };
      if (this.isSupplierArea()) {
        this.store.dispatch(new EditSupplier({ tenantId: this.tenant, mapping: data }));
        this.listenForSupplierOrAuditorCreationSuccess(MappingTypes.EditSupplierSuccess);
      } else if (this.isAuditorArea()) {
        this.store.dispatch(new EditAuditor({ tenantId: this.tenant, mapping: data }));
        this.listenForSupplierOrAuditorCreationSuccess(MappingTypes.EditAuditorSuccess);
      }
    } else {
      const data = <CreateMappingDto>formData;
      if (this.isSupplierArea()) {
        this.store.dispatch(new CreateSupplier({ tenantId: this.tenant, data }));
        this.listenForSupplierOrAuditorCreationSuccess(MappingTypes.CreateSupplierSuccess);
      } else if (this.isAuditorArea()) {
        this.store.dispatch(new CreateAuditor({ tenantId: this.tenant, data }));
        this.listenForSupplierOrAuditorCreationSuccess(MappingTypes.CreateAuditorSuccess);
      }
    }
  }

  isSupplierArea(): boolean {
    return this.router.url.includes('suppliers');
  }

  isAuditorArea(): boolean {
    return this.router.url.includes('auditors');
  }

  getMappingTypeFromUrl(): AreaTypeEnum {
    return this.router.url.includes('case') ? AreaTypeEnum.case : AreaTypeEnum.rawData;
  }

  listenForSupplierOrAuditorCreationSuccess(action: MappingTypes): void {
    this.actions$
      .pipe(take(1), ofType(action))
      .subscribe((x: CreateSupplierSuccess | CreateAuditorSuccess | EditSupplierSuccess | EditAuditorSuccess) => {
        this.mappingFormHasChanges = false;
        switch (x.type) {
          case MappingTypes.CreateSupplierSuccess:
          case MappingTypes.EditSupplierSuccess:
            this.router.navigateByUrl(`${this.redirectUrl}/suppliers`);
            break;
          case MappingTypes.CreateAuditorSuccess:
          case MappingTypes.EditAuditorSuccess:
            this.router.navigateByUrl(`${this.redirectUrl}/auditors`);
            break;
          default:
            break;
        }
      });
  }

  onFieldSelected(field: IFieldBaseDto): void {
    if (this.selectedFields.includes(field)) {
      return;
    }
    this.selectedFields.push(field);
  }

  onFieldRemove(field: IFieldBaseDto): void {
    field.value = '';
    this.selectedFields = this.selectedFields.filter((f) => f !== field);
  }

  validate(): boolean {
    const fieldsCountValid = this.selectedFields?.length > 0 ? true : false;
    const fieldsValid = this.selectedFields.every((f) => f.searchFieldModel?.isValid);
    const companyIdValid = this.mappingForm?.controls?.companyId ? true : false;

    return fieldsCountValid && fieldsValid && companyIdValid;
  }

  back() {
    this._location.back();
  }

  populateSelectedFilters(searchMask: SearchMask): void {
    try {
      let mappedFields = searchMask.filters;
      this.hasError = false;
      this.selectedFields = [];
      mappedFields.forEach((mappedField) => {
        for (let i = 0; i < this.fields.length; i++) {
          if (mappedField.fieldName === this.fields[i].fieldName) {
            let field = {
              ...this.fields[i],
              searchFieldModel: {
                ...mappedField,
                isValid: !!mappedField.value || !!mappedField['items']?.length
              }
            };
            this.selectedFields.push(field);
            break;
          }
        }
      });
    } catch (error) {
      this.hasError = true;
    }
  }

  openMappingManualRunner(): void {
    const dialogRef = this.dialog.open(MappingManualTriggerComponent, {
      width: '400px'
    });
    dialogRef.componentInstance.mapping = cloneDeep(this.currentMapping);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.store.dispatch(new ClearEditMappingViewModel());
  }
}
