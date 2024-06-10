/**
 * global
 */
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { filter, take, takeUntil } from 'rxjs/operators';
import { cloneDeep, sortBy } from 'lodash-core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';

/**
 * project
 */
import {
  AreaTypeEnum,
  DynamicEntityDto,
  FieldTypeIds,
  PagedData,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  WorkflowStateService,
  keyForSchemaTitleSettings,
  UiAreasEnum,
  AllowedGridOperations,
  dynamicCardSettingsKey,
  CardColumnSettings,
  PermissionSettings,
  sortingSettingsKey,
  SortDirection,
  SortingSettingEnum,
  WorkflowDtoUi,
  ListItemDto
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  GetWorkflowStateCasesList,
  refreshWorkflowStatesSelector,
  ResetWorkflowStateCasesList,
  WorkflowActionTypes,
  workflowStatesListLoadingSelector
} from '@wfm/store/workflow';
import { getAllUserSettingsSelector, tenantSettingsSelector } from '@wfm/store/';
import { workflowStateCasesListSelector } from '@wfm/store/workflow';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { TenantSystem } from '@wfm/store';
import { Row } from '@wfm/shared/dynamic-entity-grid/dynamic-entity-grid.component';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { FormattingType } from '@wfm/service-layer/models/conditional-formatting';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { CardSystemFieldsEnum, casesGroupSettingKey } from '@wfm/tenants/cases-setting/cases-setting.component';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { populateListOptionValue } from '@wfm/service-layer/helpers/list-item-display.helper';
/**
 * local
 */
import { ConfirmActionComponent } from '../confirm-action/confirm-action.component';
import { LayoutTypeEnum } from '@wfm/shared/grid-layout-options/grid-layout-options.component';
import { SearchEvent } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.component';
import { ResizeEvent } from 'angular-resizable-element';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { CasePrintPreviewComponent } from '../case-print-preview/case-print-preview.component';

export interface FilterType {
  type: string;
  isClicked: boolean;
  status: string;
}

export interface KanbanGroupView<T> {
  id: string;
  name: string;
  type: FieldTypeIds;
  position: number;
  items?: T[];
  visible?: boolean;
  settings?: SettingsUi;
}
export interface SettingsUi {
  status?: string;
  width: string;
  field?: string;
}
export interface WorkflowStateUI extends DynamicEntityDto {
  caseNameField?: string;
  formattingClassName?: string;
  toBeHighlighted?: boolean;
  titleHint?: string;
  isMultiColumn?: boolean;
}

export enum CaseViewStatus {
  open = 'open',
  inProgress = 'inProgress',
  done = 'done',
  approved = 'approved',
  reopened = 'reopened'
}

@Component({
  selector: 'app-workflow-states-kanban',
  templateUrl: './workflow-states-kanban.component.html',
  styleUrls: ['./workflow-states-kanban.component.scss']
})
export class WorkflowStatesKanbanComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('viewDataTmpl') viewDataTmpl: TemplateRef<any>;

  @Input() workflow: WorkflowDtoUi;
  @Input('tenantInfo') tenantSystem: TenantSystem;
  @Input() showRawData: boolean;
  @Input() showCreateCaseButton: boolean;
  @Input() showProcessButton: boolean;
  @Input() showToolButtons: boolean;
  @Output() openCaseCreateDialogue: EventEmitter<string> = new EventEmitter<string>();

  allowedGridOperations: AllowedGridOperations = {
    actionsColumn: true,
    menuColumn: false,
    exportActions: true,
    infoColumn: false,
    layoutActions: true,
    crudOperations: false,
    allowSharing: true,
    allowSearching: true,
    enableGrouping: false,
    enableMasterDetail: false
  };
  workflowStateCaseList: PagedData<WorkflowStateUI>;
  status: CaseViewStatus;
  filterType: FilterType;
  isDate: boolean;
  isName: boolean;
  isCreator: boolean;
  calcWidth: any;
  cardWidth = 300;
  caseAreaType: AreaTypeEnum = AreaTypeEnum.case;
  caseSchemaId: string;
  caseId: string[] = [];
  quickinfoLoaded: { rawDataFields: boolean; caseFields: boolean } = { rawDataFields: false, caseFields: false };
  loaded: boolean = false;
  rawDatasRefFields: SchemaFieldDto[];
  modalConfig = { width: '800px', maxWidth: '95vw', maxHeight: '95vh', panelClass: [] };
  filters: SearchFieldModel[];
  loading: boolean = true;
  componentId = '4638e2ca-ef13-41f1-a750-6f50e0a63d7f';
  width = '300px';
  showDeleteBtn: boolean = false;
  isSearchOpen: boolean = false;
  selectedCase: string;
  currentVisibilitySettings: { id: string; visible: boolean }[] = [];
  loading$: Observable<boolean>;
  allTitleSettings: SettingsUI[];
  qsTerm: string = '';
  gridSettingsName: string = dynamicCardSettingsKey;
  schema: SchemaDto;
  cardPostions = [];

  gridChanges$ = new BehaviorSubject<string>('');

  lastAppliedLayout: CardColumnSettings[];
  schemaPermissions: PermissionSettings;
  // stores the case id for highlighting from queries
  highlightCaseId: string;
  sortOrder: SortDirection;

  kanbanCaseCardTitles: KanbanGroupView<WorkflowStateUI>[] = [];
  originalCaseCardTitles: KanbanGroupView<WorkflowStateUI>[] = [];
  kanbanCaseCardTitlesSource: KanbanGroupView<WorkflowStateUI>[] = [];

  userDateFormat: string;
  userDateTimeFormat: string;

  /**
   *  grouping criteria (fieldName)
   */
  viewSetting: string;
  viewSettingLabel: string;
  caseGroupSetting: SettingsUI;
  //  populate additional configuration data (like listOptions inside listField)
  caseSchema: SchemaDto;

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  get fieldTypeEnum() {
    return FieldTypeIds;
  }

  get layoutTypeEnum() {
    return LayoutTypeEnum;
  }

  gridOperations: AllowedGridOperations = {
    actionsColumn: false,
    menuColumn: false,

    exportActions: false,
    infoColumn: false,
    layoutActions: false,
    crudOperations: false,
    allowSharing: false,
    allowSearching: false,
    enableMasterDetail: true,
    enableGrouping: false
  };

  constructor(
    private store: Store<ApplicationState>,
    private adminSchemasService: AdminSchemasService,
    private dynamicGridUiService: DynamicGridUiService,
    private workflowStateService: WorkflowStateService,
    public dialog: MatDialog,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private actions$: Actions,
    public snackBar: MatSnackBar,
    private ts: TranslateService
  ) {
    super(store);
    this.checkRouteParams();
    this.populateDateFormats();
  }

  async ngOnInit(): Promise<void> {
    this.loading$ = this.store.select(workflowStatesListLoadingSelector);
    this.subscribeToStore();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes?.workflow && changes?.workflow.currentValue !== changes?.workflow.previousValue) {
      this.caseSchemaId = this.workflow.caseSchemaId;
      if (this.caseSchemaId) this.caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.caseSchemaId);
      this.initData();
      this.currentVisibilitySettings = [];
    }

    if (changes?.tenantSystem && changes?.tenantSystem?.currentValue) {
      this.schemaPermissions = await this.schemaPermissionsHelper.getSchemaPermissions(this.caseSchemaId, AreaTypeEnum.case, this.tenant);
      this.showDeleteBtn = this.schemaPermissions.delete;
    }
  }

  checkRouteParams(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((paramsMap) => {
      if (!paramsMap['workflowStateId']) {
        this.selectedCase = null;
      }
      this.highlightCaseId = null;
      if (paramsMap && paramsMap['itemId'] && paramsMap['action'] === 'highlight') {
        this.highlightCaseId = paramsMap['itemId'];
      }
    });
  }

  /**
   * dispatch searching data
   */
  initData(): void {
    this.store.dispatch(
      new GetWorkflowStateCasesList({
        tenantId: this.tenant,
        caseSchemaId: this.caseSchemaId,
        filter: this.filters && this.filters.length ? this.filters : null,
        sorting: this.sortOrder ? [{ propertyName: GridSystemFieldsEnum.CREATED_AT, sort: this.sortOrder }] : []
      })
    );
  }

  openProcess(wfState: WorkflowStateUI): void {
    this.selectedCase = wfState.id;
    this.router.navigate([], {
      queryParams: {
        workflowStateId: this.selectedCase
      },
      relativeTo: this.activatedRoute
    });
  }

  openEditCase(wfState: WorkflowStateUI): void {
    this.selectedCase = wfState.id;
    this.router.navigate([], {
      queryParams: {
        workflowStateId: this.selectedCase,
        isEditCase: true
      },
      relativeTo: this.activatedRoute
    });
  }

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
  }

  listenForSearchSuccess(): void {
    this.actions$.pipe(ofType(WorkflowActionTypes.GetWorkflowStateCasesListSuccess), takeUntil(this.destroyed$)).subscribe((action) => {
      this.snackBar.open(this.ts.instant('Data Loaded!'), 'CLOSE', {
        duration: 3000
      });
    });
  }

  /**
   * subscribe and get data from state
   */
  subscribeToStore(): void {
    this.listenForSearchSuccess();
    this.store
      .select(tenantSettingsSelector)
      .pipe(
        filter((x) => !!x),
        take(1)
      )
      .subscribe((tenantSettings) => {
        this.allTitleSettings = tenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
        this.store
          .select(workflowStateCasesListSelector)
          .pipe(
            filter((list) => !!list),
            takeUntil(this.destroyed$)
          )
          .subscribe(async (list) => {
            if (list) {
              const wfStateList = cloneDeep(list);
              this.loaded = false;
              if (this.workflow.caseSchema?.schemaConfiguration?.conditionalFormattings) {
                wfStateList.items = await this.checkConditionalFormattings(wfStateList.items);
              }
              if (this.highlightCaseId) {
                wfStateList.items.forEach((item) => {
                  if (item.id === this.highlightCaseId) {
                    item.toBeHighlighted = true;
                  }
                });
              }
              /**
               * Check for existing group setting
               */
              this.caseGroupSetting = tenantSettings?.find(
                (x) => x.key === `${casesGroupSettingKey}_${this.workflow.id}_${AreaTypeEnum.case}`
              );
              if (this.caseGroupSetting && this.caseGroupSetting?.value?.field) {
                this.viewSetting = this.caseGroupSetting?.value?.field;
              } else this.viewSetting = CardSystemFieldsEnum.STATUS_ID;
              this.viewSettingLabel = this.getViewSettingLabel();
              this.workflowStateCaseList = cloneDeep(wfStateList);
              this.initGridActions();
              await this.setNames();
              if (this.viewSetting) {
                this.initKanbanCards();
                this.applyKanbanCardSettings();
                this.kanbanCaseCardTitlesSource = cloneDeep(this.kanbanCaseCardTitles);
              }
              this.loading = false;
            }
          });

        this.store
          .select(refreshWorkflowStatesSelector)
          .pipe(takeUntil(this.destroyed$))
          .subscribe((isRefresh) => {
            if (isRefresh) {
              this.initData();
            }
          });
      });
    this.store.pipe(select(getAllUserSettingsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      const sortSetting = x?.find((s) => s.key === sortingSettingsKey);
      if (sortSetting && sortSetting?.value?.sortSetting !== SortingSettingEnum.default) {
        this.sortOrder = sortSetting?.value?.sortSetting;
      }
    });
  }

  getViewSettingLabel(): string {
    if (this.viewSetting === CardSystemFieldsEnum.STATUS_ID) return 'Status';
    else if (this.viewSetting === CardSystemFieldsEnum.CREATED_AT) return 'CreatedAt';
    else if (this.viewSetting === CardSystemFieldsEnum.UPDATED_AT) return 'UpdatedAt';
    else return this.workflow?.caseSchema?.fields.find((f) => f.fieldName === this.viewSetting)?.displayName;
  }

  async checkConditionalFormattings(items: WorkflowStateUI[]): Promise<WorkflowStateUI[]> {
    let finalItems: WorkflowStateUI[] = [];
    for (let item of items) {
      let row: Row = {};
      const deFieldsAndSystemFields = this.dynamicGridUiService.addSystemFields(item);
      this.dynamicGridUiService.checkForConditionalFormatting(row, this.workflow.caseSchema, deFieldsAndSystemFields);
      if (row.meetsConditionalFormatting && row.conditionalFormattingAreas?.includes(FormattingType.Kanban)) {
        item.formattingClassName = row.conditionalFormattingClassName;
      }
      finalItems.push(item);
    }

    return finalItems;
  }

  isMultiFieldColumns(caseNameField: string): boolean {
    let subStr = '<br>';
    if (caseNameField.indexOf(subStr) !== -1) {
      const multiObject = caseNameField.split(subStr);
      return multiObject.length > 1;
    }
    return false;
  }

  async setNames(): Promise<void> {
    let titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
      this.caseSchemaId,
      this.allTitleSettings,
      UiAreasEnum.caseKanbanTitle
    );

    for (const element of this.workflowStateCaseList.items) {
      let titleFields = this.titleSettingsHelperService.populateTitleFields(element.fields, titleSettings, this.getSystemFields(element));
      const caseName = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, titleSettings, this.caseSchema);
      element.caseNameField = caseName;
      element.isMultiColumn = this.isMultiFieldColumns(element.caseNameField);
      element.titleHint = this.titleSettingsHelperService.extractStringFromHTML(caseName);
    }
  }

  getSystemFields(data: WorkflowStateUI): SystemFieldsTitleFormatter[] {
    const statusField = {
      id: GridSystemFieldsEnum.STATUS,
      type: FieldTypeIds.StringField,
      value: data.statusId
    };
    const createdAt = {
      id: GridSystemFieldsEnum.CREATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(data[GridSystemFieldsEnum.CREATED_AT])
    };
    const updatedAt = {
      id: GridSystemFieldsEnum.UPDATED_AT,
      type: FieldTypeIds.DateTimeField,
      value: DateTimeFormatHelper.formatDateTime(data[GridSystemFieldsEnum.UPDATED_AT])
    };
    return [statusField, createdAt, updatedAt];
  }

  isSystemFieldSetting(key: string): boolean {
    const systemField: string[] = [CardSystemFieldsEnum.STATUS_ID, CardSystemFieldsEnum.CREATED_AT, CardSystemFieldsEnum.UPDATED_AT];
    return systemField.includes(key);
  }

  initKanbanCards(): void {
    let wfData: KanbanGroupView<WorkflowStateUI>[] = [];
    const isFieldTypeList = this.caseSchema?.fields?.find((x) => x.fieldName === this.viewSetting && x.type === FieldTypeIds.ListField)
      ? true
      : false;
    if (this.viewSetting === CardSystemFieldsEnum.STATUS_ID || isFieldTypeList) {
      wfData = this.createUniqueCardsForStatusAndListTypeField(wfData);
      this.populateCardItems(wfData);
    } else this.populateCardItems(wfData);
    this.kanbanCaseCardTitles = cloneDeep(wfData);
    let storedSettings = this.getStoredCardsSettings();
    if (storedSettings?.key !== this.viewSetting) {
      const positionName = this.getSettingsKey();
      localStorage.removeItem(positionName);
      storedSettings = null;
    }
    if (storedSettings?.cards?.length) {
      this.originalCaseCardTitles = cloneDeep(this.kanbanCaseCardTitles);
      const newData = this.kanbanCaseCardTitles.map((card) => ({
        ...card,
        position: this.getCardPosition(card?.id, storedSettings?.cards)
      }));
      this.kanbanCaseCardTitles = sortBy(newData, [(x) => x.position]);
    } else this.kanbanCaseCardTitles = sortBy(wfData, [(x) => x.position]);
    this.originalCaseCardTitles = cloneDeep(this.kanbanCaseCardTitles);
  }

  getGroupableField(stateCaseItem: WorkflowStateUI): BaseFieldValueType {
    let groupableField: BaseFieldValueType;
    if (this.isSystemFieldSetting(this.viewSetting)) {
      if (this.viewSetting === CardSystemFieldsEnum.STATUS_ID) {
        const status = this.workflow?.statuses?.find((s) => s.id === stateCaseItem?.statusId);

        if (status) {
          groupableField = {
            id: 'status',
            value: status.name,
            type: FieldTypeIds.StringField
          };
        }
      } else {
        // system fields - CreatedAt/UpdatedAt
        groupableField = {
          id: this.viewSetting,
          value: stateCaseItem[this.viewSetting],
          type: FieldTypeIds.DateTimeField
        };
      }
    } else {
      // common DE field
      groupableField = stateCaseItem?.fields?.find((y) => y.id === this.viewSetting);
    }
    return groupableField;
  }

  populateCardItems(wfData: KanbanGroupView<WorkflowStateUI>[]): void {
    let stateCaseList: WorkflowStateUI[] = cloneDeep(this.workflowStateCaseList?.items);
    // default max limit : 20
    const maxCards = this.caseGroupSetting?.value?.limit || 20;
    for (let index = 0; index < stateCaseList?.length; index++) {
      if (wfData?.length < maxCards) {
        const stateCaseItem = stateCaseList[index];
        const caseField = this.getGroupableField(stateCaseItem);
        if (caseField) this.normalizeValue(caseField);
        // if stateCaseItem does not have the groupable field
        if (!caseField) {
          const existingBlankCard = wfData?.find((w) => w.id === 'blank');
          if (!existingBlankCard)
            wfData.push({
              id: `blank`,
              position: index,
              name: <string>'',
              type: FieldTypeIds.Unknown,
              items: [stateCaseItem]
            });
          else existingBlankCard.items.push(stateCaseItem);
        } else if (!wfData?.find((w) => w.name === caseField?.value)) {
          // if there is no group for the subject fieldValue yet
          wfData.push({
            id: `${caseField.id}-${index}`,
            position: index,
            name: <string>caseField.value,
            type: caseField.type,
            items: [stateCaseItem]
          });
        } else {
          // if the group is already there
          const existingCard = wfData.find((c) => c.name === caseField.value);
          if (existingCard) {
            existingCard.items = [...existingCard.items, stateCaseItem];
          }
        }
      }
    }
  }

  createUniqueCardsForStatusAndListTypeField(wfData: KanbanGroupView<WorkflowStateUI>[]): KanbanGroupView<WorkflowStateUI>[] {
    const maxCards = this.caseGroupSetting?.value?.limit || 20;
    let uniqueCards: KanbanGroupView<WorkflowStateUI>[];
    if (this.viewSetting === CardSystemFieldsEnum.STATUS_ID) {
      uniqueCards =
        this.workflow.statuses?.map((statusItem, index) => {
          return <KanbanGroupView<WorkflowStateUI>>{
            id: statusItem.id,
            name: statusItem.name,
            position: index,
            type: FieldTypeIds.StringField,
            items: []
          };
        }) || [];
    } else {
      // for list type
      const listOptions = this.caseSchema.fields.find((x) => x.fieldName === this.viewSetting)?.configuration?.listOptions;
      if (listOptions) {
        uniqueCards =
          listOptions?.map((item, index) => {
            return <KanbanGroupView<WorkflowStateUI>>{
              id: item.id,
              name: item.item,
              position: index,
              type: FieldTypeIds.StringField,
              items: []
            };
          }) || [];
      }
    }
    if (uniqueCards?.length > maxCards) {
      uniqueCards.length = maxCards;
    }
    wfData = cloneDeep(uniqueCards);
    return wfData;
  }

  normalizeValue(item: BaseFieldValueType): void {
    // parse date, dateTime, list field values to userFriendly texts
    switch (item.type) {
      case FieldTypeIds.DateTimeField:
        const dateTime = item.value;
        const normalizedDateTime = DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(dateTime as string);
        item.value = DateTimeFormatHelper.formatDateTime(normalizedDateTime);

        break;
      case FieldTypeIds.DateField:
        const dateLuxon = DateTimeFormatHelper.parseToLuxon(<Date>item.value);
        item.value = this.userDateFormat ? dateLuxon?.toFormat(this.userDateFormat) : dateLuxon.toFormat('D');
        break;
      case FieldTypeIds.ListField:
        const schemaField = this.caseSchema?.fields.find((f) => f.fieldName === item.id);
        const newFieldValue = item?.value['listItemId'] ? item?.value['listItemId'] : item.value;

        const selection = schemaField?.configuration?.listOptions?.find((option: ListItemDto) => option.id === newFieldValue);
        if (selection) {
          item.value = populateListOptionValue(selection, schemaField.configuration?.listItemDisplaySetting);
        }
        break;
      default:
        break;
    }
  }

  getSystemFieldValue(fieldType: string, item: WorkflowStateUI): { name: string; type: FieldTypeIds } {
    // To check if group field is a system field & return respective value with type (For DateTime rendering on UI)
    switch (fieldType) {
      case CardSystemFieldsEnum.CREATED_AT:
        return { name: item?.createdAt?.toString(), type: FieldTypeIds.DateTimeField };
      case CardSystemFieldsEnum.UPDATED_AT:
        return { name: item?.updatedAt?.toString(), type: FieldTypeIds.DateTimeField };
      default:
        break;
    }
  }

  populateDateFormats(): void {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  getCardPosition(cardId: string, cardsSettings: CardColumnSettings[]): number {
    const cardIndex = cardsSettings.findIndex((row) => row?.id === cardId);
    return cardIndex;
  }

  getStoredCardsSettings(): { cards: CardColumnSettings[]; key: string } {
    const positionName = this.getSettingsKey();
    let storedSettings = localStorage.getItem(positionName);

    return storedSettings ? JSON.parse(storedSettings) : null;
  }

  applyKanbanCardSettings(): void {
    this.kanbanCaseCardTitles.forEach((card) => {
      let isVisible: boolean = true;
      if (this.currentVisibilitySettings.length > 0) {
        isVisible = this.currentVisibilitySettings.find((x) => x.id === card.id)?.visible;
      }

      const cardsSavedSettings = this.getStoredCardsSettings()?.cards;
      const setting = cardsSavedSettings?.find((sett) => sett?.id === card.id);
      const kspWidth = setting?.width;

      card.visible = setting?.visible != undefined ? setting.visible : isVisible;
      card.settings = <SettingsUi>{
        width: kspWidth ? kspWidth : this.width,
        field: card.id
      };
      this.cardPostions.push({
        position: card?.position,
        id: card?.id,
        width: card?.settings?.width,
        visible: card?.visible
      });
    });
    if (this.currentVisibilitySettings?.length === 0) {
      this.currentVisibilitySettings = this.kanbanCaseCardTitles.map((x) => {
        return { id: x.id, visible: x.visible };
      });
    }
  }

  /**
   * initialize grid actions
   */
  initGridActions(): void {}

  /**
   * remove case
   */

  deleteDialog(wfState: WorkflowStateUI): void {
    const dynamicEntityId = wfState.id;
    const caseName = wfState.caseNameField.slice(wfState.caseNameField.indexOf(':') + 1, wfState.caseNameField.length).trim();
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: <ConfirmActionData>{
        title: 'Warning',
        message: `Are you sure you want to delete this item?`,
        showProceedBtn: true,
        dynamicText: caseName ? `Case Name: ${caseName}` : ''
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteCase(dynamicEntityId);
    });
  }

  /**
   * remove Dynamic Entity
   */
  async deleteCase(deleteId: string): Promise<void> {
    this.loaded = false;
    const wfStateOperation = await this.workflowStateService.delete({
      id: deleteId,
      tenant: this.tenant,
      schemaId: this.workflow.id
    });

    if (wfStateOperation.status.toString() === 'Success') {
      this.initData();
    } else {
      this.loaded = true;
    }
  }

  visibilityChanged(event: MatCheckboxChange, group: KanbanGroupView<WorkflowStateUI>): void {
    group.visible = event.checked;
    const currentGroupVisibility = this.currentVisibilitySettings.find((s) => s.id === group.id);
    if (currentGroupVisibility) currentGroupVisibility.visible = group.visible;
    this.drop(null);
  }

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX: number = 300;
    if (
      event.rectangle.width &&
      event.rectangle.height &&
      (event.rectangle.width < MIN_DIMENSIONS_PX || event.rectangle.height < MIN_DIMENSIONS_PX)
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent, statusName: string): void {
    // To Be covered
    //unclear
    this.kanbanCaseCardTitles.forEach((x) => {
      x.settings.width = x.name === statusName ? event.rectangle.width + 'px' : x.settings.width;
    });
    // this.calcWidth = event.rectangle.width;
    this.drop(null);
  }

  nameEventHandler($event: FilterType): void {
    this.filterType = $event;
    this.status = $event.status as CaseViewStatus;

    switch (this.filterType.type) {
      case 'date':
        this.isDate = this.filterType.isClicked;
        this.isName = false;
        this.isCreator = false;
        break;

      case 'name':
        this.isName = this.filterType.isClicked;
        this.isDate = false;
        this.isCreator = false;
        break;

      case 'creator':
        this.isCreator = this.filterType.isClicked;
        this.isDate = false;
        this.isName = false;
        break;
    }
  }

  /**
   * quick view -> show raw data table
   */
  async goToQuickView(row: WorkflowStateUI): Promise<void> {
    this.onPrint(row.id);
  }

  async onPrint(wfStateId: string) {
    const dialogRef = this.dialog?.open(CasePrintPreviewComponent, {
      width: '50%',
      height: '600px',
      panelClass: 'print'
    });
    dialogRef.componentInstance.workflowStateId = wfStateId;
    dialogRef.componentInstance.workflowSchema = { ...this.workflow };
  }

  async populateRawDatas(row: WorkflowStateUI): Promise<void> {
    await this.getRawDataReferenceFields();
    if (this.rawDatasRefFields.length) {
      this.gridOperations.enableMasterDetail = true;
    } else {
      this.gridOperations.enableMasterDetail = false;
    }
  }

  /**
   * get raw data schema id from case schema
   */

  async getRawDataReferenceFields(): Promise<void> {
    this.rawDatasRefFields = this.workflow.caseSchema.fields.filter((field) => {
      return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
    });
  }

  mapValuesToFields(field: SchemaFieldDto, row: Row): SchemaFieldDto {
    let f = { ...field };
    f.value = row[f.fieldName];

    return f;
  }

  getDeFieldKeyValuePairs(de: DynamicEntityDto): Row {
    let row: Row = {
      publicId: de.id
    };
    de.fields.forEach((field) => {
      row[field.id] = field.value;
    });
    return row;
  }

  caseFieldsLoaded(loaded: boolean): void {
    this.quickinfoLoaded.caseFields = loaded;
  }

  onSearch(event: SearchEvent): void {
    this.loaded = false;
    this.filters = event.filters;
    if (event.refreshData) {
      this.initData();
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event) moveItemInArray(this.kanbanCaseCardTitles, event.previousIndex, event.currentIndex);

    this.cardPostions = [];
    for (const row of this.kanbanCaseCardTitles) {
      this.cardPostions.push({ position: row?.position, id: row?.id, width: row.settings.width, visible: row.visible });
    }
    const positionName = this.getSettingsKey();
    localStorage.setItem(positionName, JSON.stringify({ cards: this.cardPostions, key: this.viewSetting }));
    this.gridChanges$.next(`cardSettings_${Math.round(Math.random() * 100)}`);
  }

  onQuickSearch(): void {
    if (!this.qsTerm) {
      this.qsTerm = '';
      this.kanbanCaseCardTitles = cloneDeep(this.kanbanCaseCardTitlesSource);
      if (this.lastAppliedLayout) {
        this.onApplyCardLayout(this.lastAppliedLayout);
      }
    } else {
      this.quickSearchCard(this.qsTerm);
    }
  }

  onCloseQuickSearch(): void {
    this.qsTerm = '';
    this.kanbanCaseCardTitles = cloneDeep(this.kanbanCaseCardTitlesSource);
    if (this.lastAppliedLayout) {
      this.onApplyCardLayout(this.lastAppliedLayout);
    }
  }

  onApplyCardLayout(cardLayout: CardColumnSettings[]) {
    this.lastAppliedLayout = cardLayout;
    const storedSettings = this.getStoredCardsSettings();

    if (cardLayout && !storedSettings) {
      const newData = this.kanbanCaseCardTitles.map((card) => ({
        ...card,
        position: this.getCardPosition(card?.id, cardLayout),
        visible: cardLayout[this.getCardPosition(card?.id, cardLayout)].visible,
        settings: { ...card.settings, width: cardLayout[this.getCardPosition(card?.id, cardLayout)].width }
      }));
      this.kanbanCaseCardTitles = sortBy(newData, [(x) => x.position]);
    } else if (storedSettings) {
      const newData = this.kanbanCaseCardTitles.map((card) => ({
        ...card,
        position: this.getCardPosition(card?.id, storedSettings?.cards),
        visible: storedSettings[this.getCardPosition(card?.id, storedSettings?.cards)].visible,
        settings: { ...card.settings, width: storedSettings[this.getCardPosition(card?.id, storedSettings?.cards)].width }
      }));
      this.kanbanCaseCardTitles = sortBy(newData, [(x) => x.position]);
    }
  }

  findSearchTextInProps(wfState: WorkflowStateUI, searchTerm: string): boolean {
    let textFound = false;
    if (wfState.hasOwnProperty('id')) delete wfState.id;
    if (wfState.hasOwnProperty('statusId')) delete wfState.statusId;
    // fields added for search
    wfState.fields.forEach((field) => {
      wfState[field.id] = field.value;
    });
    if (wfState.hasOwnProperty('fields')) delete wfState.fields;
    let propValueList = Object.values(wfState);
    for (let i = 0; i < propValueList.length; i++) {
      if (propValueList[i]) {
        if (propValueList[i].toString().toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          textFound = true;
          break;
        }
      }
    }
    return textFound;
  }

  quickSearchCard(searchText: string) {
    const searchedData: KanbanGroupView<WorkflowStateUI>[] = [];
    this.kanbanCaseCardTitlesSource.forEach((card) => {
      const cardData: KanbanGroupView<WorkflowStateUI> = cloneDeep(card);
      const selectedItemIds = [];
      for (let item of card.items) {
        const cardVisible = this.kanbanCaseCardTitles.find((x) => x.id === card.id)?.visible;
        if (cardVisible && this.findSearchTextInProps(cloneDeep(item), searchText)) {
          selectedItemIds.push(item.id);
        }
      }
      cardData.items = cardData?.items.filter((item) => selectedItemIds.some((itemId) => itemId === item.id));
      if (cardData?.items.length > 0) {
        searchedData.push(cardData);
      }
    });
    // what the below block for?
    const finalSearchedData: KanbanGroupView<WorkflowStateUI>[] = searchedData.filter((v, i, a) => {
      return a.findIndex((t) => t.id === v.id) === i;
    });

    this.kanbanCaseCardTitles = finalSearchedData;
    if (this.lastAppliedLayout) {
      this.onApplyCardLayout(this.lastAppliedLayout);
    }
  }

  getSettingsKey(): string {
    return `${this.gridSettingsName}_${this.caseSchemaId}_${AreaTypeEnum.case}`;
  }

  resetLayout(): void {
    this.lastAppliedLayout = null;
    this.cardPostions = [];
    this.currentVisibilitySettings = [];
    this.initKanbanCards();
    this.applyKanbanCardSettings();
    this.kanbanCaseCardTitlesSource = cloneDeep(this.kanbanCaseCardTitles);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.gridChanges$.unsubscribe();
    this.store.dispatch(new ResetWorkflowStateCasesList());
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  onOpenCaseCreateDialogue(): void {
    this.openCaseCreateDialogue.emit();
  }
}
