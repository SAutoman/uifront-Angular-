/**
 * global
 */
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  ChangeDetectorRef,
  Renderer2,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { User } from 'oidc-client';
import { cloneDeep } from 'lodash-core';
import { Observable, Subscription } from 'rxjs';
import { DateTime } from 'luxon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import {
  UserSettingsDto,
  Settings,
  SettingsKeys,
  UsersService,
  SearchProfileType,
  DynamicEntitySearchProfile,
  FieldTypeIds,
  appRawDataSearchProfile,
  appCaseSearchProfile,
  AreaTypeEnum,
  StatePersistingService,
  IFieldBaseDto,
  Roles,
  SettingsUI,
  searchTimeRangeKey,
  FieldSetting,
  DynamicEntitySearchProfileUI,
  SharedService,
  appReportSearchProfile,
  SchemaDto
} from '@wfm/service-layer';

import {
  loggedInState,
  AuthState,
  SetOpenedChildMenuAction,
  selectedSearchProfiles,
  currentSelectedRoleNum,
  FetchWorkflowMenuData
} from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  SearchType,
  SearchFieldModel,
  CustomSearchType,
  PickerViewEnum,
  DateTimeSearchFieldModel
} from '@wfm/service-layer/models/dynamic-entity-models';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { cleanupSearchProfiles } from '@wfm/service-layer/helpers';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';

import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { DynamicEntityFieldInfo } from '@wfm/service-layer/models/FieldInfo';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { ReportGridColumnItem } from '@wfm/report/report-datasource.model';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { PropertyPath, PropertyPathTypeEnum } from '@wfm/service-layer/models/expressionModel';

/**
 * local
 */
import DateTimeFormatHelper from '../dateTimeFormatHelper';
import { DynamicEntityShareSearchProfileDialogComponent } from './dynamic-entity-share-search-profile-dialog/dynamic-entity-share-search-profile-dialog.component';
import { FilterFieldsService } from '../dynamic-entity-field/filter-fields.service';
import { MatMenuTrigger } from '@angular/material/menu';

export const keyForLastUsedSearchProfile = 'lastSearchProfile';
export interface SearchFieldInfoUI extends DynamicEntityFieldInfo {
  allowedSearchTypes: SearchType[];
  searchFieldModel: SearchFieldModel;
}

export interface SearchEvent {
  filters: SearchFieldModel[];
  refreshData: boolean;
}

export interface FieldWithShortName extends IFieldBaseDto {
  shortDisplayName?: string;
}

@Component({
  selector: 'app-dynamic-entity-search-mask',
  templateUrl: './dynamic-entity-search-mask.component.html',
  styleUrls: ['./dynamic-entity-search-mask.component.scss'],
  providers: [FilterFieldsService]
})
export class DynamicEntitySearchMaskComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('searchMask', { read: ElementRef }) searchMask: ElementRef;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @Input() schemaId: string;
  @Input() areaType: AreaTypeEnum;
  @Input() quickFilter: boolean = false;
  @Input() searchBarOpen$: Observable<boolean> = new Observable();
  @Output() searchEvent: EventEmitter<SearchEvent> = new EventEmitter();
  @Output() searchClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  componentId = 'bf269d6d-4575-4b9f-a185-e68b8cb6b104';
  allowedFiltersPerFieldType: { [id: string]: SearchType[] } = {};
  expanded: boolean = false;
  /**
   * fields of the schema that support searching
   */
  fields: FieldWithShortName[] = [];
  fieldOptions: FieldWithShortName[] = [];
  /**
   * fields selected for searching
   */
  selectedFields: SearchFieldInfoUI[] = [];
  // customSearchType: CustomSearchType;
  /**
   * field selected from the selectbox
   */
  selectedOption: SearchFieldInfoUI;
  /**
   * the search configuration of the selected fields
   */
  searchFields: SearchFieldModel[];
  profilerFields?: SearchFieldModel[] = [];
  showNameInput: boolean;
  userId: string;
  user: User;
  authState: AuthState;
  allSearchProfiles: DynamicEntitySearchProfileUI[];
  /**
   * search profiles filtered by the current schemaId
   */
  searchProfiles: DynamicEntitySearchProfileUI[];
  selectedProfile: DynamicEntitySearchProfileUI;
  showUpdateName: boolean = false;
  updateName: string;
  updateSearchProfileGroup: FormGroup;
  searchProfileGroup: FormGroup;
  isSearchValid: boolean = false;
  INT_MAX_VALUE = 2147483647;
  INT_MIN_VALUE = -2147483648;
  qsTerm: string = '';
  selectedSearchProfileId: string;
  loading: boolean = false;
  searchTimePeriodSettings: SettingsUI;
  isPinned: boolean = false;
  isFirstLoad: boolean = false;

  private keyForLastFilterFields = 'lastSearchFields';
  private wasInside: boolean;
  documentListener: () => void;

  get searchTypes(): typeof SearchType {
    return SearchType;
  }
  get customSearchTypes(): typeof CustomSearchType {
    return CustomSearchType;
  }
  get fieldTypeIds(): typeof FieldTypeIds {
    return FieldTypeIds;
  }
  get searchProfileType(): typeof SearchProfileType {
    return SearchProfileType;
  }
  searchTerm: FormControl = new FormControl(null);

  sub: Subscription;
  userRole: Roles;
  isSearchBarOpen: boolean;
  constructor(
    private store: Store<AuthState>,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private adminSchemasService: AdminSchemasService,
    private persistingService: StatePersistingService,
    private filterFieldsService: FilterFieldsService,
    private ts: TranslateService,
    private sharedService: SharedService,
    private cd: ChangeDetectorRef,
    private errorhandlerService: ErrorHandlerService,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private renderer2: Renderer2
  ) {
    super(store);
    this.allowedFiltersPerFieldType = {
      [FieldTypeIds.StringField.toString()]: [SearchType.Like],
      [FieldTypeIds.IntField.toString()]: [SearchType.Range, SearchType.EqualTo],
      [FieldTypeIds.DecimalField.toString()]: [SearchType.Range, SearchType.EqualTo],
      [FieldTypeIds.BoolField.toString()]: [SearchType.EqualTo],
      [FieldTypeIds.DateField.toString()]: [SearchType.Range, SearchType.EqualTo],
      [FieldTypeIds.TimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
      [FieldTypeIds.DateTimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
      [FieldTypeIds.MultiselectListField.toString()]: [SearchType.List],
      [FieldTypeIds.ListField.toString()]: [SearchType.List],
      [FieldTypeIds.ConnectorField.toString()]: [SearchType.List]
    };
  }

  async ngOnInit(): Promise<void> {
    this.getRole();
    this.store
      .pipe(
        select(loggedInState),
        filter((data) => !!data.profile),
        take(1)
      )
      .subscribe(async (data) => {
        this.authState = data;

        this.userId = data.profile.id;
        this.user = data.user;
        await this.loadUserSearchProfiles();
        this.subscribeToSearchProfileSelection();
      });

    this.searchProfileGroup = this.formBuilder.group({
      name: ['', Validators.required]
    });

    this.updateSearchProfileGroup = this.formBuilder.group({
      updateName: [this.updateName, Validators.required]
    });

    await this.populateSearchFields();

    this.searchBarOpen$?.pipe(takeUntil(this.destroyed$)).subscribe((isOpen: boolean) => {
      this.isSearchBarOpen = isOpen;
    });

    this.searchTerm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x: string) => {
      this.filterFields(x);
    });
    const isPinned = localStorage.getItem('isPinned');
    if (isPinned) this.isPinned = true;

    this.sharedService
      .getClickBroadcastEvent()
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        if (!this.wasInside) {
          this.checkForSearchBarOpen();
        }
        this.wasInside = false;
      });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // when a new schema is selected, reset the search masks and collapse the expanded panel
    if (changes.schemaId && !changes.schemaId.firstChange && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.resetSearchMasks(false, false, false);
      await this.populateSearchFields();
      this.loadUserSearchProfiles();
    }
  }

  ngAfterViewInit(): void {
    const searchMask = this.searchMask?.nativeElement;
    if (searchMask)
      this.renderer2.listen(searchMask, 'click', () => {
        this.wasInside = true;
      });
  }

  pinToggle(): void {
    this.isPinned = !this.isPinned;
    if (this.isPinned) {
      localStorage.setItem('isPinned', JSON.stringify(this.isPinned));
    } else {
      localStorage.removeItem('isPinned');
    }
  }

  checkForSearchBarOpen(): void {
    if (!this.isPinned && this.isFirstLoad) this.searchCloseClicked();
    if (!this.isFirstLoad && this.isSearchBarOpen) this.isFirstLoad = true;
  }

  getRole(): void {
    this.store.pipe(select(currentSelectedRoleNum), takeUntil(this.destroyed$)).subscribe((roleNum) => {
      this.userRole = roleNum;
    });
  }

  subscribeToSearchProfileSelection(): void {
    this.sub = this.store.pipe(select(selectedSearchProfiles), takeUntil(this.destroyed$)).subscribe((selectedProfiles) => {
      let selectedProfile;
      switch (this.areaType) {
        case AreaTypeEnum.rawData:
          selectedProfile = selectedProfiles.rawData;
          break;
        case AreaTypeEnum.case:
          selectedProfile = selectedProfiles.case;
          break;
        case AreaTypeEnum.workflowState:
          selectedProfile = selectedProfiles.report;
          break;

        default:
          break;
      }

      if (selectedProfile) {
        this.applyProfile(selectedProfile.id, false);
      } else if (selectedProfile === null) {
        //the user tries to reset the search masks
        this.selectedProfile = null;
        this.selectedSearchProfileId = null;
        const areFiltersApplied = this.checkForLastSavedSearches();
        if (!areFiltersApplied) {
          this.resetSearchMasks(null, true, true);
        }
      } else {
        this.selectedProfile = null;
        this.selectedSearchProfileId = null;
        this.checkForLastSavedSearches();
      }
    });
  }

  checkForLastSavedSearches(): boolean {
    const lastSavedFilters: string = this.persistingService.get(`${this.keyForLastFilterFields}_${this.schemaId}_${this.areaType}`);
    if (lastSavedFilters) {
      // if there are saved filters and the search widget is open, apply filters

      this.selectedFields = JSON.parse(lastSavedFilters);
      this.isSearchValid = true;

      if (this.isSearchBarOpen) {
        const searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
        this.searchEvent.emit({ filters: searchFields, refreshData: true });
        this.cd.detectChanges();
        return true;
      }
      return false;
    }
    return false;
  }

  getSearchTimePeriodSettings(settings: SettingsUI[]): void {
    const setting = settings.find((x) => x.key.includes(`${searchTimeRangeKey}_${this.schemaId}_${this.areaType}`));
    if (setting) {
      this.searchTimePeriodSettings = setting;
    }
  }

  async populateSearchFields(): Promise<void> {
    if (this.areaType === AreaTypeEnum.case || this.areaType === AreaTypeEnum.rawData || this.areaType === AreaTypeEnum.workflowState) {
      await this.populateSchemaAndFields();
    }
  }

  async populateSchemaAndFields(): Promise<void> {
    const areaType = this.areaType === AreaTypeEnum.workflowState ? AreaTypeEnum.case : this.areaType;
    let schema = await this.adminSchemasService.getSchema(this.tenant, areaType, this.schemaId);
    this.populatePropertyPathAndDisplayName(schema.fields, null);
    let ownFields = this.filterFieldsService.prepareSearchFieldsForSchema(schema, this.isTenant());
    ownFields = await this.schemaPermissionsHelper.checkSchemaFieldsVisibility(schema, ownFields);

    const nestedFields = [];
    await this.getReferenceFields(schema, nestedFields);
    this.fields = [...ownFields, ...nestedFields];
    this.populateShortDisplayNames();
    this.fieldOptions = cloneDeep(this.fields);
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  async loadUserSearchProfiles(applyLastSaved?: boolean): Promise<void> {
    try {
      const settingsKeys: SettingsKeys = {
        keys: [this.getSearchProfileSettingKey()],
        isExclusive: false
      };
      const data = await this.usersService.getUserSettingsByKeys(this.tenant, this.userId, settingsKeys);

      // WFM-2125
      const filteredProfiles = cleanupSearchProfiles(data.settings);
      this.allSearchProfiles = filteredProfiles.map((x) => this.mapSearchProfileToUI(x));
      const searchProfilesBySchema = this.getSchemaSearchProfiles(this.allSearchProfiles, this.schemaId);
      this.searchProfiles = cloneDeep(searchProfilesBySchema);
      if (applyLastSaved) {
        this.applyProfile(this.searchProfiles[this.searchProfiles.length - 1].id);
      }
      this.cd.detectChanges();
    } catch (error) {
      console.log(error);
    }
  }

  getSchemaSearchProfiles(profiles: DynamicEntitySearchProfileUI[], schemaId: string): DynamicEntitySearchProfileUI[] {
    return profiles.filter((x) => x.schemaId === schemaId);
  }

  mapSearchProfileToUI(x: Settings): DynamicEntitySearchProfileUI {
    const value = <DynamicEntitySearchProfile>x.value;
    return <DynamicEntitySearchProfileUI>{
      id: x.id,
      name: value.name,
      searchFields: value.search,
      fromUser: x.fromUser,
      fromGroup: x.fromGroup,
      schemaId: x.value.schemaId
    };
  }

  onFieldSelected(event: MatSelectChange): void {
    if (this.selectedFields.findIndex((e) => event.value?.fieldName === e.fieldName) >= 0) {
      return;
    } else {
      const field = this.setSavedFieldTimeRangeValues(cloneDeep(event.value));
      this.selectedFields.push({ ...field });
    }
  }

  setSavedFieldTimeRangeValues(field: any): any {
    if (field.type === FieldTypeIds.DateTimeField && this.searchTimePeriodSettings) {
      const allFieldSettings: FieldSetting[] = this.searchTimePeriodSettings?.value?.data || [];
      const fieldSetting = allFieldSettings?.find((setting) => setting?.field === field.fieldName);
      const dateValues = fieldSetting ? this.sharedService.getFromAndToDateValues(fieldSetting) : null;
      const searchModel = {
        displayName: field.displayName,
        fieldName: field.fieldName,
        from: dateValues?.from ? dateValues.from : null,
        id: undefined,
        isValid: true,
        searchType: SearchType.Range,
        to: dateValues?.to ? dateValues.to : null,
        valueType: FieldTypeIds.DateTimeField
      };
      field.searchFieldModel = searchModel;
      this.onFieldChanged(true);
    }
    return field;
  }

  onSearch(): void {
    const searchFieldsList: SearchFieldModel[] = [];
    this.searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
    this.searchFields.forEach((field: SearchFieldModel) => {
      let copyField = { ...field };

      if (copyField.searchType === this.searchTypes.Range && (<DateTimeSearchFieldModel>field).viewOption === PickerViewEnum.STATIC) {
        searchFieldsList.push(this.fulfillRangeSearch(copyField));
      } else {
        searchFieldsList.push(this.trimWhitespaceCharacters(copyField));
      }
    });
    this.searchEvent.emit({ filters: searchFieldsList, refreshData: true });
    this.storeOrResetFiltersLocally();
    if (!this.isPinned) this.searchCloseClicked();
  }

  /**
   * fill missing from/to param with min/max value of the varaiable type (backend requires both from and to to have values )
   * @param fld
   * @returns
   */

  fulfillRangeSearch(fld: SearchFieldModel): SearchFieldModel {
    const field: SearchFieldModel = cloneDeep(fld);
    if (!field.from) {
      switch (field.valueType) {
        case FieldTypeIds.IntField:
          field.from = this.INT_MIN_VALUE;
          break;
        case FieldTypeIds.DecimalField:
          field.from = Number.MIN_SAFE_INTEGER;
          break;
        case FieldTypeIds.DateField:
          field.from = DateTime.fromMillis(155695200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toJSDate();
          break;
        case FieldTypeIds.DateTimeField:
          field.from = DateTime.fromMillis(155695200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toJSDate();

          break;

        default:
          break;
      }
    } else if (!field.to) {
      switch (field.valueType) {
        case FieldTypeIds.IntField:
          field.to = this.INT_MAX_VALUE;
          break;
        case FieldTypeIds.DecimalField:
          field.to = Number.MAX_SAFE_INTEGER;
          break;
        case FieldTypeIds.DateField:
          field.to = DateTime.fromMillis(66269599200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toJSDate();
          break;
        case FieldTypeIds.DateTimeField:
          field.to = DateTime.fromMillis(66269599200000).toUTC().set({ hour: 23, minute: 59, second: 59 }).toJSDate();
          break;
        default:
          break;
      }
    }
    return field;
  }

  /**
   * remove automatically added min/max values of 'from'/'to' properties added by 'fulfillRangeSearch' method
   * @param fld
   * @returns
   */
  removeFulfilledRangeSearch(fld: SearchFieldModel): SearchFieldModel {
    const field: SearchFieldModel = cloneDeep(fld);
    if (field.from) {
      switch (field.valueType) {
        case FieldTypeIds.IntField:
          field.from = field.from === this.INT_MIN_VALUE ? null : field.from;
          break;
        case FieldTypeIds.DecimalField:
          field.from = field.from === Number.MIN_SAFE_INTEGER ? null : field.from;
          break;
        case FieldTypeIds.DateField:
          const dateField = DateTime.fromMillis(155695200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();
          const from = DateTimeFormatHelper.parseToLuxon(field.from)?.toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();

          field.from = dateField === from ? null : field.from;
          break;
        case FieldTypeIds.DateTimeField:
          const dateTimeField = DateTime.fromMillis(155695200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();
          const fromTime = DateTimeFormatHelper.parseToLuxon(field.from)?.toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();
          field.from = dateTimeField === fromTime ? null : field.from;
          break;

        default:
          break;
      }
    }

    if (field.to) {
      switch (field.valueType) {
        case FieldTypeIds.IntField:
          field.to = field.to === this.INT_MAX_VALUE ? null : field.to;
          break;
        case FieldTypeIds.DecimalField:
          field.to = field.to === Number.MAX_SAFE_INTEGER ? null : field.to;
          break;
        case FieldTypeIds.DateField:
          const dateField = DateTime.fromMillis(66269599200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();
          const to = DateTimeFormatHelper.parseToLuxon(field.to)?.toUTC().set({ hour: 0, minute: 0, second: 0 }).toISO();

          field.to = dateField === to ? null : field.to;
          break;
        case FieldTypeIds.DateTimeField:
          const dateTimeField = DateTime.fromMillis(66269599200000).toUTC().set({ hour: 23, minute: 59, second: 59 }).toISO();
          const toTime = DateTimeFormatHelper.parseToLuxon(field.to)?.toUTC().set({ hour: 23, minute: 59, second: 59 }).toISO();

          field.to = dateTimeField === toTime ? null : field.to;
          break;
        default:
          break;
      }
    }
    return field;
  }

  applyProfile(searchProfileId: string, fromUI: boolean = true): void {
    if (searchProfileId && this.searchProfiles) {
      const profileData = this.searchProfiles.find((x) => x.id === searchProfileId);
      if (profileData) {
        this.selectedSearchProfileId = profileData.id;
        this.resetSelectedFields();
        this.selectedProfile = profileData;
        this.updateName = profileData.name;
        const searchFieldsList: SearchFieldModel[] = [];
        profileData.searchFields.forEach((field) => {
          field.searchType === this.searchTypes.Range
            ? searchFieldsList.push(this.fulfillRangeSearch(field))
            : searchFieldsList.push(field);
        });

        this.profilerFields = cloneDeep(searchFieldsList);
        this.searchEvent.emit({ filters: searchFieldsList, refreshData: true });
        this.applyProfileFields();

        this.saveLastUsedSearchProfile(searchProfileId);
        /**
         * if this event is not fired from html when select option has been chosen,
         * then we don't need emit and snackbar,
         * so define this.selectedProfileValue manually and return from function
         */
        if (!fromUI) {
          // this.selectedProfileValue = profileData;
          this.selectedProfile = profileData;
          return;
        }

        /**
         * update active child-menu in state -> auth -> tenant -> searchMenuItems -> 'item'?.isOpened?
         */
        this.store.dispatch(new SetOpenedChildMenuAction({ itemName: profileData.name }));
      }
    }
  }

  applyProfileFields(): void {
    this.profilerFields.forEach((it) => {
      const selectedField: IFieldBaseDto = this.fields.find((x) => x.fieldName === it.fieldName);
      it = it.searchType === this.searchTypes.Range ? this.removeFulfilledRangeSearch(it) : it;

      const filterField = <SearchFieldInfoUI>{
        allowedSearchTypes: selectedField.allowedSearchTypes,
        searchFieldModel: <SearchFieldModel>{
          customSearchType: it.customSearchType,
          fieldName: it.fieldName,
          id: it.id,
          isValid: it.isValid,
          // searchType: it.customSearchType === CustomSearchType.Status ? SearchType.Custom : it.searchType,
          searchType: it.searchType,

          valueType: it.valueType,
          value: it.value ? it.value : null,
          from: it.from ? it.from : null,
          to: it.to ? it.to : null,
          items: it['items']?.length ? it['items'] : null,
          values: it['values']?.length ? it['values'] : null,
          viewOption: it['viewOption'],
          after: it['after'],
          before: it['before'],
          dynamicDateTimeRangeType: it['dynamicDateTimeRangeType'],
          dynamicSearchValue: it['dynamicSearchValue'],
          propertyPath: it.propertyPath
        },
        configuration: selectedField.configuration,
        id: selectedField.id,
        fieldName: selectedField.fieldName,
        displayName: selectedField.displayName,
        name: selectedField.fieldName,
        schemaFieldConfiguration: selectedField.schemaFieldConfiguration,
        type: selectedField.type,
        isSystem: selectedField.isSystem,
        isCustom: selectedField.isCustom,
        rawDataFieldPublicId: null,
        valueType: selectedField.valueType,
        publicId: selectedField.fieldName
      };
      this.selectedFields.push(filterField);
    });
  }

  resetSelectedFields(): void {
    this.selectedOption = null;
    this.selectedFields = [];
    this.searchFields = undefined;
  }

  resetSearchMasks(showPopup?: boolean, init?: boolean, refreshData?: boolean): void {
    this.expanded = false;
    this.refreshData(init, refreshData);
    this.showNameInput = false;
    this.showUpdateName = false;
    this.profilerFields = [];
    showPopup ? this.openSnackBar(this.ts.instant('Data is Reset!'), 'CLOSE') : '';
  }

  refreshData(init?: boolean, refreshData?: boolean): void {
    this.searchEvent.emit({ filters: [], refreshData });
    this.resetSelectedFields();
    // this.selectedProfileValue = null;
    this.selectedProfile = null;
    this.selectedSearchProfileId = null;
    if (!init) {
      this.persistingService.remove(`${keyForLastUsedSearchProfile}_${this.schemaId}_${this.areaType}`);
      this.persistingService.remove(`${this.keyForLastFilterFields}_${this.schemaId}_${this.areaType}`);
    }
    /**
     * update active child-menu in state -> auth -> tenant -> searchMenuItems -> 'item'?.isOpened?
     */
    this.store.dispatch(new SetOpenedChildMenuAction({ itemName: '' }));
    this.openSnackBar(this.ts.instant('Data Refreshed!'), 'CLOSE');
    this.menuTrigger?.closeMenu();
  }

  expandedState(): void {
    this.expanded = true;
  }

  async onRemove(item): Promise<void> {
    if (this.selectedFields.length < 1) {
      this.searchFields = undefined;
      this.showNameInput = false;
      this.showUpdateName = false;
      this.searchEvent.emit({ filters: [], refreshData: true });
    }

    this.selectedOption = null;
    this.selectedFields = this.selectedFields.filter((x) => x.fieldName !== item.fieldName);
    const searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
    if (!searchFields.length) this.searchEvent.emit({ filters: searchFields, refreshData: true });
    this.storeOrResetFiltersLocally();
  }

  async onSaveProfileClicked(): Promise<void> {
    if (this.searchFields !== undefined) {
      this.showNameInput = !this.showNameInput;
    } else {
      this.showNameInput = false;
      this.openSnackBar(this.ts.instant('You must first make a search to be able to create a search profile!'), 'CLOSE');
    }
    this.menuTrigger?.closeMenu();
  }

  async onSaveButtonClicked(): Promise<void> {
    const formValue = this.searchProfileGroup.value;
    this.loading = true;
    this.searchFields.forEach((field) => {
      field = this.trimWhitespaceCharacters(field);
      // if (field.customSearchType === CustomSearchType.Status) {
      //   field.searchType = SearchType.Custom;
      // }
    });
    const cmdSearchProfile = <DynamicEntitySearchProfile>{
      name: formValue.name,
      search: this.searchFields,
      schemaId: this.schemaId
    };

    const cmd = <UserSettingsDto>{
      userId: this.userId,
      tenantId: this.tenant,
      settings: [
        <Settings>{
          key: this.getSearchProfileSettingKey(),
          value: cmdSearchProfile
        }
      ]
    };
    try {
      await this.usersService.createUserSettings(this.tenant, cmd);
      await this.loadUserSearchProfiles(true);
      this.openSnackBar(`Profile ${cmdSearchProfile.name} Saved Successfully!`, 'CLOSE');
      this.loading = false;
      this.persistingService.remove(`${this.keyForLastFilterFields}_${this.schemaId}_${this.areaType}`);
      // get settings for sidebar
      this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
    } catch (error) {
      this.errorhandlerService.getAndShowErrorMsg(error);
      this.loading = false;
    }

    this.showNameInput = false;
  }

  async onDeleteDialogOkClicked(): Promise<void> {
    const name = this.selectedProfile.name;
    try {
      const operation = await this.usersService.deleteUserSettings(this.tenant, this.selectedProfile.id);
      if (operation?.status?.toString()?.toLowerCase() === 'success') {
        this.openSnackBar(`${name} ${this.ts.instant('Deleted Successfully!')}`, 'CLOSE');

        this.selectedProfile = undefined;
        this.loadUserSearchProfiles();

        // get settings for sidebar
        this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));

        this.searchCloseClicked();
        this.refreshData();
      }
    } catch (error) {
      this.errorhandlerService.getAndShowErrorMsg(error);
    }
  }

  deleteSearchProfile(): void {
    let role = this.authState?.currentTenantSystem?.tenant?.role;
    if ((this.selectedProfile.fromGroup || this.selectedProfile.fromUser) && role !== 'TenantAdmin') {
      this.openSnackBar(this.ts.instant(`You don't have a permission to delete this profile!`), 'CLOSE');
    } else {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        width: '400px',
        data: <ConfirmActionData>{
          title: 'Please confirm',
          showProceedBtn: true
        }
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.onDeleteDialogOkClicked();
        }
      });
    }
    this.menuTrigger?.closeMenu();
  }

  onUpdateClicked(): void {
    this.showUpdateName = !this.showUpdateName;
    this.menuTrigger?.closeMenu();
  }

  async onUpdateButtonClicked(): Promise<void> {
    const formValue = this.updateSearchProfileGroup.value;
    if (this.searchFields === undefined) {
      this.searchFields = this.selectedProfile.searchFields;
    }
    this.searchFields.forEach((field) => {
      field = this.trimWhitespaceCharacters(field);
      // if (field.customSearchType === CustomSearchType.Status) {
      //   field.searchType = SearchType.Custom;
      // }
    });
    const cmdSearchProfile = <DynamicEntitySearchProfile>{
      name: formValue.updateName,
      search: this.searchFields,
      schemaId: this.schemaId
    };

    const cmd = <UserSettingsDto>{
      userId: this.userId,
      tenantId: this.tenant,
      settings: [
        <Settings>{
          key: this.getSearchProfileSettingKey(),
          value: cmdSearchProfile,
          id: this.selectedProfile.id
        }
      ]
    };
    try {
      await this.usersService.updateUserSettings(this.tenant, cmd);
      await this.loadUserSearchProfiles();
      this.openSnackBar(`${cmdSearchProfile.name} ${this.ts.instant('Profile Updated Successfully!')}`, 'CLOSE');
      // get settings for sidebar
      this.store.dispatch(new FetchWorkflowMenuData({ tenantId: this.tenant, userId: this.userId }));
      this.showUpdateName = false;
      this.refreshData();
    } catch (error) {
      this.errorhandlerService.getAndShowErrorMsg(error);
    }
  }

  onShareClicked(): void {
    const header = 'Search Profile';

    const dialogRef = this.dialog.open(DynamicEntityShareSearchProfileDialogComponent, {
      width: '1000px'
    });

    dialogRef.componentInstance.name = this.selectedProfile.name;
    dialogRef.componentInstance.tenantId = this.tenant;
    dialogRef.componentInstance.selectedProfile = this.selectedProfile;
    dialogRef.componentInstance.header = header;
    dialogRef.componentInstance.message = 'profile';
    dialogRef.componentInstance.schemaId = this.schemaId;
    this.menuTrigger?.closeMenu();
  }

  onFieldChanged(z: boolean): void {
    const validation = this.selectedFields.every((x) => x.searchFieldModel.isValid) ? true : false;
    setTimeout(() => {
      this.isSearchValid = validation;
      this.cd.detectChanges();
    }, 50);
  }

  getSearchProfileSettingKey(): string {
    let searchProfileKey;
    switch (this.areaType) {
      case AreaTypeEnum.case:
        searchProfileKey = appCaseSearchProfile;
        break;
      case AreaTypeEnum.rawData:
        searchProfileKey = appRawDataSearchProfile;
        break;
      case AreaTypeEnum.workflowState:
        searchProfileKey = appReportSearchProfile;
        break;
      default:
        break;
    }
    return searchProfileKey;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.sub?.unsubscribe();
  }

  searchCloseClicked(): void {
    this.searchClose.emit(false);
    this.isFirstLoad = false;
  }

  /**
   * trimming extra whitespace characters from string
   * (common issue when copy/pasting the text)
   * @param field
   * @returns
   */

  trimWhitespaceCharacters(field: SearchFieldModel): SearchFieldModel {
    if (field.searchType === this.searchTypes.Like) {
      field.value = field.value.trim();
    }
    return field;
  }

  /**
   * save the search fields if any, otherwise remove the saved filters from localstorage
   */
  storeOrResetFiltersLocally(): void {
    const key = `${this.keyForLastFilterFields}_${this.schemaId}_${this.areaType}`;
    if (this.selectedFields.length > 0) {
      const searchFields = this.selectedFields.map((f) => {
        const field = cloneDeep(f);
        delete field['propertyPath'];
        return field;
      });

      this.persistingService.set(`${key}`, searchFields);
    } else {
      this.persistingService.remove(key);
      this.isSearchValid = false;
    }
    this.onFieldChanged(true);
  }

  /**
   * save the last applied searchProfile id
   */

  saveLastUsedSearchProfile(value: any): void {
    this.persistingService.set(`${keyForLastUsedSearchProfile}_${this.schemaId}_${this.areaType}`, value);
  }

  isTenant(): boolean {
    return (this.userRole && this.userRole === Roles.Tenant) || this.userRole === Roles.TenantAdmin;
  }

  /**
   * in every searchField add the propertyPath
   * make the field labels more detailed (where the field comes from)
   */

  populatePropertyPathAndDisplayName(fields: IFieldBaseDto[], parentField: IFieldBaseDto): void {
    let parentPath = [];
    if (parentField) {
      parentPath = parentField?.propertyPath ? parentField.propertyPath?.path : [parentField.fieldName];
    }
    fields.forEach((field) => {
      // field.displayName = `${field.displayName}` + (parentField ? ` (from ${parentField.displayName})` : '');
      field.displayName = `${parentField ? `${parentField.displayName} => ` : ''}${field.displayName}`;
      field.propertyPath = <PropertyPath>{
        pathType: PropertyPathTypeEnum.Internal,
        path: [...parentPath, field.fieldName]
      };
    });
  }

  /**
   * recursively populate all the fields from referenced schemas
   */
  async getReferenceFields(parentSchema: SchemaDto, allNestedFields: IFieldBaseDto[]): Promise<void> {
    try {
      for (const field of parentSchema.fields) {
        if (field.type === FieldTypeIds.ListOfLinksField && field.configuration.schemaAreaType === AreaTypeEnum.rawData) {
          const rawDataSchema = await this.adminSchemasService.getSchema(
            this.tenant,
            field.configuration.schemaAreaType,
            field.configuration.schemaId
          );
          if (rawDataSchema) {
            this.populatePropertyPathAndDisplayName(rawDataSchema.fields, field);
            let rawDataOwnFields = this.filterFieldsService.prepareSearchFieldsForNestedSchema(rawDataSchema);
            rawDataOwnFields = await this.schemaPermissionsHelper.checkSchemaFieldsVisibility(rawDataSchema, rawDataOwnFields);
            allNestedFields.push(...rawDataOwnFields);
            await this.getReferenceFields(rawDataSchema, allNestedFields);
          }
        }
      }
    } catch (error) {
      this.errorhandlerService.getAndShowErrorMsg(error);
    }
  }

  filterFields(term: string): void {
    if (term?.trim().length > 0) {
      this.fieldOptions = this.fields?.filter((x) => x.displayName?.toLowerCase()?.includes(term?.toLowerCase()));
    } else {
      this.fieldOptions = cloneDeep(this.fields);
    }
  }

  populateShortDisplayNames(): void {
    for (let field of this.fields) {
      const fieldData = field.displayName.split('=>');

      const displayName = `${fieldData.length > 2 ? `... ${fieldData[fieldData.length - 2]} => ` : ''}${fieldData[fieldData.length - 1]}`;

      field.shortDisplayName = fieldData.length > 2 ? displayName : field.displayName;
    }
  }
}
