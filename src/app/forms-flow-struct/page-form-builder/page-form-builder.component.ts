/**
 * global
 */

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  AreaTypeAll,
  AreaTypeEnum,
  AreaTypeOption,
  FastCreateSettings,
  FieldTypeIds,
  IFieldBaseDto,
  ListFieldsLink,
  SchemaDto,
  SchemaValidator,
  SchemasCacheService,
  UploadedFile,
  DataLifetimeSettings
} from '@wfm/service-layer';
import { Guid } from '@wfm/shared/guid';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';
import { IFormEvent, IFormUpdateInfo } from '@wfm/common/form-builder-components/i-form.event';
import { SchemaBuilderService } from '@wfm/service-layer/services/schema-builder.service';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  FetchWorkflowMenuData,
  GetAllSchemasAsFields,
  schemasAsFieldSelector,
  SetSchema,
  tenantNameKey,
  loggedInState,
  newTranslationLoadedSelector
} from '@wfm/store';
import { convertTenantName } from '@wfm/shared/utils';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { ConditionalFormatting } from '@wfm/service-layer/models/conditional-formatting';
import { GetTenantFields } from '@wfm/store/tenant-fields';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
/**
 * local
 */
import { IBuilderUiResultModel, IAddRequiredFieldsEvent } from '../interface';
import { LayoutSetup } from './layout-setup';
import { IFieldsExpressionView } from '../interface/expression/expressionModelUI';

import {
  SchemaAdditionaSettingsOutput,
  SchemaAdditionalSettingsComponent
} from '../schema-additional-settings/schema-additional-settings.component';
import { HideFieldSetting } from '../schema-additional-settings/fields-visibility/fields-visibility.component';
const AlowedFileTypes: string[] = ['.jpg', '.jpeg', '.gif', '.png', '.bmp'];

@Component({
  selector: 'app-page-form-builder',
  templateUrl: './page-form-builder.component.html',
  styleUrls: ['./page-form-builder.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PageFormBuilderComponent extends TenantComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * selected fields for function builder component
   */
  selectedFields$ = new BehaviorSubject<IConfigurableListItem[]>(undefined);
  /**
   * selected fields to be previewed in form-builder-form-preview component
   */
  viewFields$ = new BehaviorSubject<IConfigurableListItem[]>([]);
  fileTypes = [...AlowedFileTypes];
  pending = false;
  /**
   * selected fields (including required/locked ones) to be listed in form-builder-form component
   */
  setFields$: BehaviorSubject<IConfigurableListItem[]>;

  /**
   * form name - use if exist form
   */
  setName$: Observable<string>;
  /**
   * all the fields the user can select
   */
  allFields$: Observable<IConfigurableListItem[]>;

  file?: UploadedFile & { url: string };
  iExpressions?: IFieldsExpressionView[];
  isUpdateMode: boolean;
  layoutSetup: LayoutSetup;
  areaType: AreaTypeEnum;
  areaTypes: Array<AreaTypeOption | number>;
  form: FormGroup;
  schema: SchemaDto;
  isSchemaUpdated: boolean;
  areFunctionsUpdated: boolean = false;
  isNewFieldAdded: boolean = false;
  showPreview: boolean = false;
  private redirectUrl = '../list';
  schemaId?: string;
  private formEvent: IFormEvent<IFormUpdateInfo>;
  isDeskTop: boolean = true;
  appBarData: AppBarData = {} as AppBarData;
  componentId = 'dae769c3-b886-4194-be4e-37b468e471c1';
  userId: string;
  toggleDesktopCallback: () => {};

  allSchemasList: IConfigurableListItem[];
  schemasListForCopying: IConfigurableListItem[];
  copiedSchemaId: string;
  schemaName: string;
  schemaNameSubs: Subscription;
  dataSubs: Subscription;
  conditionalFormattings: ConditionalFormatting[];
  fastCreateSettings: FastCreateSettings;
  linkedListFields: ListFieldsLink[];
  areSchemaSettingsUpdated: boolean = false;
  schemaValidators: SchemaValidator[];
  fieldsVisibilty: HideFieldSetting[];
  dataLifetimeSettings: DataLifetimeSettings;
  @ViewChild('builderSection') builderSection: ElementRef;
  isExternalFieldIdentifierPresent: boolean = false;
  schemaSettingsCount: number = 0;
  countOfFunctionsAndSchemaSettings: number = 0;
  public userDateTimeFormat: string;

  constructor(
    private store: Store<ApplicationState>,
    public dialog: MatDialog,
    private builderService: SchemaBuilderService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private adminSchemaService: AdminSchemasService,
    private schemasCacheService: SchemasCacheService,
    private sharedService: SharedService,
    private ts: TranslateService,
    private errorHandler: ErrorHandlerService
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
  }

  ngOnInit(): void {
    this.schemaId = this.activatedRoute.snapshot.paramMap.get('id');
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;

    this.isUpdateMode = this.schemaId ? true : false;
    this.appBarData.title = this.isUpdateMode ? 'Update Schema' : 'Create Schema';
    this.sharedService.setAppBarData(this.appBarData);

    this.store
      .select(loggedInState)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
      });

    this.activatedRoute.queryParamMap.subscribe((queries) => {
      const area = queries.get('area');
      this.areaType = area ? Number(area) : AreaTypeEnum.rawData;
      this.layoutSetup = new LayoutSetup(this.builderService.getLayoutSettings(this.areaType));
      if (!this.schemaId) {
        this.setupAreaSelector();
        this.store.pipe(select(schemasAsFieldSelector), takeUntil(this.destroyed$)).subscribe((x) => {
          if (x?.length > 0) {
            this.allSchemasList = x;
            this.schemasListForCopying = this.allSchemasList.filter((i) => i.area === this.areaType);
          }
        });
      }
      this.store
        .pipe(
          select(newTranslationLoadedSelector),
          filter((x) => !!x?.isLoaded),
          takeUntil(this.destroyed$)
        )
        .subscribe((x) => {
          this.layoutSetup = new LayoutSetup(this.builderService.getLayoutSettings(this.areaType));
        });
    });
    this.store.dispatch(new GetTenantFields({ tenantId: this.tenant }));
    this.store.dispatch(new GetAllSchemasAsFields({ tenant: this.tenant }));
    this.initServiceSubscriptions(this.tenant, this.areaType, this.schemaId);
    this.toggleDesktopCallback = this.toggleDesktopMode.bind(this);
    window.addEventListener('resize', this.toggleDesktopCallback, true);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.toggleDesktopMode();
    });
  }

  toggleDesktopMode(): void {
    if (this.builderSection && this.builderSection.nativeElement && this.builderSection.nativeElement.offsetWidth <= 770) {
      this.isDeskTop = false;
    } else {
      this.isDeskTop = true;
    }
  }

  initServiceSubscriptions(tenant: string, area: AreaTypeEnum, schemaId: string): void {
    this.schemaNameSubs?.unsubscribe();
    this.dataSubs?.unsubscribe();
    const pageData$ = this.builderService.pageData$.asObservable().pipe(
      takeUntil(this.destroyed$),
      filter((x) => !!x)
    );
    // reset props
    this.setFields$ = new BehaviorSubject<IConfigurableListItem[]>([]);
    this.allFields$ = null;
    this.setName$ = null;
    // comes from builder service,
    this.allFields$ = pageData$.pipe(
      map((x) => {
        const allFields = x.selectFields.filter((field) => field.id !== schemaId);
        return allFields || [];
      })
    );
    this.setName$ = pageData$.pipe(map((x) => x.name || ''));
    this.schemaNameSubs = this.setName$
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.schemaName = x;
      });

    if (this.builderService.cmdAddRequiredFields$) {
      this.builderService.cmdAddRequiredFields$
        .asObservable()
        .pipe(
          takeUntil(this.destroyed$),
          filter((x) => !!x),
          take(1)
        )
        .subscribe((e: IAddRequiredFieldsEvent) => {
          this.store.dispatch(new SetSchema({ data: null }));

          this.setFields$.next(e.items);
        });
    }

    this.dataSubs = pageData$.pipe(map((x) => x.formFields || [])).subscribe((formFields) => {
      if (this.copiedSchemaId) {
        const newFields: IConfigurableListItem<IFieldConfiguration>[] = formFields.map((x) => {
          // this combo will trigger creating a new custom field - { isClientId: true, isCustom:true } -
          const copiedSchemaField = {
            configuration: x.configuration,
            id: x.isCustom ? Guid.createQuickGuidAsString() : x.tenantFieldId,
            isClientId: x.isCustom ? true : false,
            isCustom: x.isCustom,
            name: x.name,
            tenantId: this.tenant,
            type: x.type,
            useIn: x.useIn,
            useInObj: x.useInObj,
            viewName: x.viewName
          };
          return copiedSchemaField;
        });
        this.setFields$.next(newFields);
      } else {
        this.setFields$.next(formFields);
      }
      if (schemaId) {
        this.schema = null;
        this.schema = cloneDeep(this.builderService.schema);
        this.store.dispatch(new SetSchema({ data: cloneDeep(this.schema) }));
        this.iExpressions = this.adminSchemaService.getExpressionsView(cloneDeep(this.schema), formFields, this.tenant);
        this.conditionalFormattings = cloneDeep(this.schema?.schemaConfiguration?.conditionalFormattings);
        this.fastCreateSettings = cloneDeep(this.schema?.schemaConfiguration?.fastCreateSettings);
        this.dataLifetimeSettings = cloneDeep(this.schema?.schemaConfiguration?.dataLifetimeSettings);
        this.linkedListFields = cloneDeep(this.schema?.schemaConfiguration?.linkedListFields);
        this.schemaValidators = cloneDeep(this.schema?.schemaConfiguration?.validators) || null;
        this.fieldsVisibilty = cloneDeep(this.schema?.schemaConfiguration?.fieldVisibiltySettings) || null;
        this.checkForExternalIdentifier();
        this.countAllSettings();
      }
    });

    setTimeout(() => {
      this.builderService.init(tenant, area, schemaId);
    });
  }

  checkForExternalIdentifier(): void {
    const schemaFields = this.schema?.fields;
    if (schemaFields && schemaFields.find((x) => x?.configuration?.isExternalIdentifier)) {
      this.isExternalFieldIdentifierPresent = true;
    }
  }

  onExtIdentifierUpdate(event: string): void {
    if (event?.length) this.isExternalFieldIdentifierPresent = true;
  }

  setupAreaSelector(): void {
    this.areaTypes = this.adminSchemaService.getAreaEnumOptions().filter((x) => x.id.toString() !== AreaTypeAll.toString());

    // creating formgroup to get the controls previous value in valueChanges
    this.form = new FormGroup({
      areaSelect: new FormControl(this.areaType)
    });
    this.form.controls['areaSelect'].valueChanges.subscribe((newAreaType) => {
      this.schemasListForCopying = this.allSchemasList?.filter((i) => i.area === newAreaType);
      this.onNewAreaSelection(newAreaType, this.form.value['areaSelect']);
    });
  }

  onNewAreaSelection(newAreaType: AreaTypeEnum, previousAreaType: AreaTypeEnum): void {
    if (this.isSchemaUpdated) {
      //  show a confirmation only if the user has entered any data
      const confirm = this.dialog.open(PopupConfirmComponent, {
        data: {
          title: this.ts.instant('Change Template Area?'),
          message: this.ts.instant('If you switch to another template area, your unsaved schema will be lost.')
        }
      });

      confirm.afterClosed().subscribe(async (result) => {
        if (result === true) {
          this.updateRouteQuery(newAreaType);
          this.isSchemaUpdated = false;
          this.resetSchemaConfig();
          this.areaType = newAreaType;
          this.layoutSetup = new LayoutSetup(this.builderService.getLayoutSettings(this.areaType));
          this.initServiceSubscriptions(this.tenant, this.areaType, this.schemaId);
        } else {
          this.form.patchValue(
            {
              areaSelect: previousAreaType
            },
            { emitEvent: false }
          );
        }
      });
    } else {
      this.updateRouteQuery(newAreaType);
      this.areaType = newAreaType;
      this.layoutSetup = new LayoutSetup(this.builderService.getLayoutSettings(this.areaType));
      this.initServiceSubscriptions(this.tenant, this.areaType, this.schemaId);
    }
  }

  resetSchemaConfig(): void {
    this.iExpressions = [];
    this.fastCreateSettings = null;
    this.schemaValidators = null;
    this.fieldsVisibilty = null;
    this.conditionalFormattings = null;
    this.linkedListFields = null;
    this.countAllSettings();
  }

  updateRouteQuery(newArea) {
    //doing this for better ux, load the correct area on page refresh or when going back
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { area: newArea },
      queryParamsHandling: 'merge'
    });
  }

  onFormUpdate(e: IFormEvent<IFormUpdateInfo>): void {
    this.isSchemaUpdated = false;
    if (e.formName || e.fields.length) {
      this.isSchemaUpdated = true;
    }
    this.formEvent = e;
    this.viewFields$.next([this.getNameField(e), ...e.fields]);
    let expressionFields = e.fields.filter((f) => {
      return f.type !== FieldTypeIds.ListOfLinksField;
    });
    this.selectedFields$.next(expressionFields);
  }

  getNameField(e: IFormEvent<IFormUpdateInfo>): IConfigurableListItem {
    const nameFieldLabel = this.layoutSetup.getSchemaNameFieldLabel();
    // adding the schema name as an additional field to be previewed in formPreviewComponent
    const nameField: IConfigurableListItem = {
      id: Guid.createQuickGuidAsString(),
      name: nameFieldLabel,
      viewName: !e.formName ? this.ts.instant(nameFieldLabel) : '',
      type: FieldTypeIds.StringField,
      isClientId: true,
      isLockedField: true,
      configuration: {
        position: 0,
        required: true,
        readonly: true,
        value: e.formName
      }
    };
    return nameField;
  }

  onAddField(field: IConfigurableListItem): void {
    this.dialog.closeAll();
    field.id = Guid.createQuickGuidAsString();
    // need this flag to check and create a custom field before creating a schema
    field.isClientId = true;
    field.isCustom = true;
    field.isValid = true;
    this.isNewFieldAdded = true;
    this.setFields$.next([field]);
    if (field.configuration.isExternalIdentifier) this.isExternalFieldIdentifierPresent = true;
  }

  openDialogAddImage(template: TemplateRef<any>): void {
    this.openDialog(template, ['app-form-builder--add-image-dialog']).subscribe();
  }

  openDialogAddField(template: TemplateRef<any>): void {
    this.openDialog(template, ['app-form-builder--add-field-dialog']).subscribe();
  }

  openDialogAddFunctions(template: TemplateRef<any>): void {
    this.openDialog(template, ['app-form-builder--add-functions-dialog']).subscribe();
  }

  openDialogSchemaSettings(): void {
    const dialogRef = this.dialog.open(SchemaAdditionalSettingsComponent, { width: '600px' });
    const selectedFields = this.selectedFields$.value;
    dialogRef.componentInstance.fields = selectedFields.map((field) => {
      return {
        ...field,
        fieldName: field.fieldName || field.name,
        displayName: field.displayName || field.viewName
      };
    });

    dialogRef.componentInstance.schema = this.schema;
    dialogRef.componentInstance.layoutSetup = this.layoutSetup;
    dialogRef.componentInstance.fastCreateSettings = this.fastCreateSettings;
    dialogRef.componentInstance.schemaValidators = this.schemaValidators;
    dialogRef.componentInstance.fieldsVisibilty = this.fieldsVisibilty;
    dialogRef.componentInstance.dataLifetimeSettings = this.dataLifetimeSettings;

    if (this.conditionalFormattings) {
      setTimeout(() => {
        dialogRef.componentInstance.formattings = this.conditionalFormattings.map((formatting) => {
          return {
            ...formatting,
            expanded: false,
            isValid: true
          };
        });
      });
    }
    dialogRef.componentInstance.linkedListFields = this.linkedListFields;

    dialogRef.afterClosed().subscribe((result: SchemaAdditionaSettingsOutput) => {
      if (result) {
        this.conditionalFormattings = cloneDeep(result.formattings);
        this.fastCreateSettings = cloneDeep(result.fastCreateSetting);
        this.linkedListFields = cloneDeep(result.linkedListFields);
        this.schemaValidators = cloneDeep(result.schemaValidators);
        this.fieldsVisibilty = cloneDeep(result.fieldsVisibility);
        this.dataLifetimeSettings = cloneDeep(result.dataLifetimeSettings);

        this.areSchemaSettingsUpdated = true;
        this.countAllSettings();
      }
    });
  }

  onFileUpload(formFile: UploadedFile & { url: string }): void {
    this.file = formFile;
  }

  onFunctionsUpdate(e: IFieldsExpressionView[]): void {
    this.areFunctionsUpdated = true;
    e.forEach((x) => {
      x.fields = this.selectedFields$.getValue() || [];
    });
    this.iExpressions = cloneDeep(e);

    const funcItems = this.iExpressions && this.iExpressions.length ? this.iExpressions.map((func) => func.expressionModel) : [];
    if (this.schema) {
      this.schema.functions = this.adminSchemaService.mapFunctionsForBackend(funcItems);
    }
    this.countAllSettings();

    // re-run the function evaluations on the fields after functions are updated
    this.viewFields$.next([this.getNameField(this.formEvent), ...this.formEvent?.fields]);
    this.dialog.closeAll();
  }

  onSaveForm(): void {
    this.pending = true;
    if (this.copiedSchemaId && this.schemaName.toLowerCase() === this.formEvent?.formName.toLowerCase()) {
      this.snackBar.open(this.ts.instant('Please use a unique schema name'), 'Ok', { duration: 3000 });
      this.pending = false;
    } else this.createOrUpdateSchema();
  }

  async createOrUpdateSchema(): Promise<void> {
    let imageId: string;
    if (this.file && this.file.id) {
      imageId = this.file.id;
    }
    const model: IBuilderUiResultModel = {
      id: this.schemaId,
      tenantId: this.tenant,
      name: this.formEvent?.formName,
      fields: this.formEvent?.fields || [],
      functions: this.iExpressions && this.iExpressions.length ? this.iExpressions.map((func) => func.expressionModel) : [],
      isUpdateMode: this.isUpdateMode,
      imageId
    };

    if (this.formEvent?.formRef?.removedFields?.length) {
      await this.cleanupRemovedFieldsData();
    }

    if (this.conditionalFormattings || this.fastCreateSettings || this.linkedListFields || this.schemaValidators || this.fieldsVisibilty) {
      model.schemaConfiguration = {
        conditionalFormattings: this.conditionalFormattings || null,
        fastCreateSettings: this.fastCreateSettings || null,
        linkedListFields: this.linkedListFields || null,
        validators: this.schemaValidators || null,
        fieldVisibiltySettings: this.fieldsVisibilty || null,
        dataLifetimeSettings: this.dataLifetimeSettings || null
      };
    }
    this.adminSchemaService
      .createOrUpdate(model, this.tenant, this.areaType, this.isUpdateMode ? this.schema : null)
      .then((schemaId?: string) => {
        this.pending = false;
        if (schemaId) {
          this.schemasCacheService.clearCache();
          this.resetChangeDetectionFlags();
          if (model.isUpdateMode) {
            this.snackBar.open(this.ts.instant('Updated Successfully'), 'CLOSE', { duration: 2000 });
            window.location.reload();
          } else {
            this.router.navigate([this.redirectUrl], { queryParams: { area: this.areaType }, relativeTo: this.activatedRoute });
          }

          this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
        }
      })
      .catch((err) => {
        console.log(err);
        this.snackBar.open(err.message, 'CLOSE', { duration: 5000 });
      });
  }

  isValidForm(): boolean {
    const selectedFields = this.formEvent?.fields;
    if (!selectedFields?.length) {
      return false;
    }

    const isFormValid = this.formEvent?.valid;
    const areFunctionsValid = this.iExpressions ? this.iExpressions.every((x: IFieldsExpressionView) => x.isValid) : true;
    return isFormValid && areFunctionsValid;
  }

  isChangedForm(): boolean {
    const isFormChanged = this.formEvent?.changed;
    return isFormChanged || this.areFunctionsUpdated || this.isNewFieldAdded || this.areSchemaSettingsUpdated;
  }

  private openDialog(template: TemplateRef<any>, panelClasses: string[] = [], minWidth: number = 300): Observable<any> {
    return this.dialog
      .open(template, {
        minWidth,
        panelClass: panelClasses,
        disableClose: true
      })
      .afterClosed()
      .pipe(filter((x) => !!x));
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  resetChangeDetectionFlags(): void {
    if (this.formEvent) {
      this.formEvent.changed = false;
    }
    this.isNewFieldAdded = false;
    this.areFunctionsUpdated = false;
    this.areSchemaSettingsUpdated = false;
  }

  backToList(): void {
    this.resetChangeDetectionFlags();
    this.router.navigateByUrl(`/${convertTenantName(localStorage.getItem(tenantNameKey))}/schemas/list)`);
  }

  showPreviewSection() {
    this.showPreview = !this.showPreview;
  }

  onSchemaSelection(event: MatSelectChange): void {
    this.copiedSchemaId = event.value;
    this.setName$ = null;
    this.setFields$.next([]);
    this.initServiceSubscriptions(this.tenant, this.areaType, this.copiedSchemaId);
  }

  // number of schemaSettings
  getNumberOfSchemaSettings(): void {
    this.schemaSettingsCount =
      (this.dataLifetimeSettings ? 1 : 0) +
      (this.fastCreateSettings ? 1 : 0) +
      (this.schemaValidators?.length || 0) +
      (this.fieldsVisibilty?.length || 0) +
      (this.conditionalFormattings?.length || 0) +
      (this.linkedListFields?.length || 0);
  }

  // number of  functions + schemaSettings
  countAllSettings(): void {
    this.getNumberOfSchemaSettings();
    this.countOfFunctionsAndSchemaSettings = (this.iExpressions?.length || 0) + this.schemaSettingsCount;
  }

  async cleanupRemovedFieldsData(): Promise<void> {
    try {
      this.snackBar.open(this.ts.instant('Cleaning up removed fields from entities'), 'Ok', { duration: 2000 });
      const schemaFieldIds = this.formEvent.formRef.removedFields.map((field) => field.id);
      await this.adminSchemaService.cleanupRemovedFieldsFromEntities(this.tenant, this.schemaId, schemaFieldIds);
    } catch (error) {
      this.errorHandler.getAndShowErrorMsg(error);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    window.removeEventListener('resize', this.toggleDesktopCallback, true);
    this.store.dispatch(new SetSchema({ data: null }));
    this.builderService.pageData$.next(undefined);
    this.builderService.cmdAddRequiredFields$.next(undefined);
  }
}
