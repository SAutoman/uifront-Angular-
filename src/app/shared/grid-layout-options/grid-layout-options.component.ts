/**
 * global
 */
import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { find, cloneDeep } from 'lodash-core';
import { Actions } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GridComponent } from '@progress/kendo-angular-grid';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AggregateDescriptor, GroupDescriptor } from '@progress/kendo-data-query';

/**
 * project
 */
import {
  getAllLayoutsSettingsSelector,
  getGridLayoutSelector,
  CreateGridLayoutAction,
  DeleteGridLayoutAction,
  UpdateGridLayoutAction,
  GetGridLayoutAction,
  loggedInState,
  ApplicationState,
  GridLayoutsTypes,
  ApplyGridLayoutAction,
  getCardLayoutSelector,
  currentLayoutSettingIdSelector,
  ClearLayoutsAndSelectedId,
  getReportGridLayoutSelector,
  ApplyChildGridLayoutAction,
  childGridsLayoutSelector,
  allChildGridsLayoutSelector,
  RemoveChildGridLayoutAction
} from '@wfm/store';

import {
  SidebarLinksService,
  StatePersistingService,
  SettingsUI,
  UserSettingsDto,
  Settings,
  AreaTypeEnum,
  CardColumnSettings,
  dynamicCardSettingsKey,
  dynamicGridSettingsKey,
  reportGridSettingsKey
} from '@wfm/service-layer';
import { IObjectMap } from '@wfm/common/models';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { cleanupLayouts } from '@wfm/service-layer/helpers';

/**
 * local
 */
import { TenantComponent } from '../tenant.component';
import { DynamicEntityShareSearchProfileDialogComponent } from '../dynamic-entity-search-mask/dynamic-entity-share-search-profile-dialog/dynamic-entity-share-search-profile-dialog.component';
import { GridSettings, CardSettings } from './../../service-layer';
import { MatMenuTrigger } from '@angular/material/menu';

export enum LayoutTypeEnum {
  Grid = 'grid',
  Card = 'card',
  ReportGrid = 'reportGrid'
}

@Component({
  selector: 'app-grid-layout-options',
  templateUrl: './grid-layout-options.component.html',
  styleUrls: ['./grid-layout-options.component.scss']
})
export class GridLayoutOptionsComponent extends TenantComponent implements OnInit, OnChanges, OnDestroy {
  @Input() type: LayoutTypeEnum;
  @Input() allowExports: boolean;
  @Input() gridSettingsName: string;
  @Input() allowSharing: boolean;
  @Input() schemaId?: string;
  @Input() schemaAreaType: AreaTypeEnum;
  @Input() cardConfig: CardColumnSettings[];
  @Input() gridChange$?: Observable<string>;
  @Input() groups?: GroupDescriptor[];
  @Input() aggregates?: AggregateDescriptor[];
  @Input() grid: GridComponent;
  @Input() gridSettings?: GridSettings;
  @Input() allowLayoutChange?: boolean;
  @Input() datasourceId?: string;
  @Input() isChildGrid?: boolean;
  @Input() parentSchemaId?: string;
  @Input() defaultLayoutId?: string;

  @Output() applyCardLayout: EventEmitter<CardColumnSettings[]> = new EventEmitter<CardColumnSettings[]>();
  @Output() resetCardLayout: EventEmitter<{ [key: string]: boolean }> = new EventEmitter();
  @Output() resetGrid: EventEmitter<{ [key: string]: boolean }> = new EventEmitter();
  @Output() csvDownloadEmitter: EventEmitter<string> = new EventEmitter();
  @Input() showToolButtons: boolean = true;

  private keyForSelectedLayoutId = '_SELECTED_LID';
  isSaveClicked: boolean = false;
  isUpdateClicked: boolean = false;
  createLayout: boolean = false;
  layoutChanged: boolean = false;
  layoutForm: FormGroup;
  layoutSettings: Settings[] = [];
  isSharedLayout: Boolean;
  selectedLayoutSetting: Settings | string;
  selectedLayoutSettingId: string;
  selectedLayoutName: string;
  newlySavedLayoutName: string;
  settingsLength: number;
  userId: string;
  name: string;
  tenantSettings: SettingsUI[];
  showResetButton: boolean = false;
  isMenuOpen = true;

  private tenantName: string;
  componentId = '8a855648-cef0-4a03-bbe8-1b074e06355c';
  cardlayoutSettingsName: string = dynamicCardSettingsKey;
  gridLayoutSettingsName: string = dynamicGridSettingsKey;
  reportGridLayoutSettingName: string = reportGridSettingsKey;
  isExportMenuOpen = true;

  get layoutTypeEnum() {
    return LayoutTypeEnum;
  }
  constructor(
    private persistingService: StatePersistingService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private store: Store<ApplicationState>,
    private sidebarLinksService: SidebarLinksService,
    private action$: Actions,
    private cdRef: ChangeDetectorRef,
    private ts: TranslateService
  ) {
    super(store);
    this.componentId += '_' + Math.random();
  }

  async ngOnInit(): Promise<void> {
    this.selectedLayoutSettingId = null;
    this.tenantName = this.sidebarLinksService.getTenantNameAsProperty();

    this.store.pipe(select(loggedInState), takeUntil(this.destroyed$)).subscribe((data) => {
      if (data?.currentTenantSystem) {
        this.tenantSettings = data.currentTenantSystem.tenantSettings;
      }
    });

    this.initGridLayoutSelectorPipe();
    this.initAllGridLayoutsSelectorPipe();

    this.initFormsAndFetchLayouts();

    this.cdRef.detectChanges();
    if (this.gridChange$) {
      this.gridChange$.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
        if (x.trim().length > 0) {
          this.showResetButton = true;
          const localGridSettings = this.persistingService.get(this.getSettingsNameKey());
          if (localGridSettings) {
            this.triggerLayoutChange(true);
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.schemaId && changes.schemaId.previousValue && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
      this.fetchGridLayoutsSettings();
    }
  }

  /**
   * get the stored layouts from tenant settings
   * all the layouts for one schemaId will be stored under the same stting
   */

  fetchGridLayoutsSettings(refresh?: boolean): void {
    if (this.userId) {
      this.showResetButton = false;
      this.layoutChanged = false;
      const settingName = this.getSettingsNameKey();
      this.store.dispatch(
        new GetGridLayoutAction({
          tenantId: this.tenant,
          userId: this.userId,
          settingName,
          refreshList: refresh,
          isChildGrid: this.isChildGrid
        })
      );
    }
  }

  initFormsAndFetchLayouts(): void {
    this.layoutForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });

    this.store
      .pipe(
        select(loggedInState),
        filter((x) => !!x.profile),
        take(1)
      )
      .subscribe((data) => {
        this.userId = data.profile.id;
        this.fetchGridLayoutsSettings();
      });
  }

  initGridLayoutSelectorPipe(): void {
    if (this.type === LayoutTypeEnum.Grid) {
      if (!this.isChildGrid)
        this.store.pipe(select(getGridLayoutSelector), takeUntil(this.destroyed$)).subscribe((gridLayout) => {
          this.initLayout(gridLayout);
        });
      if (this.isChildGrid)
        this.store.pipe(select(childGridsLayoutSelector), takeUntil(this.destroyed$)).subscribe((gridLayout) => {
          const layout = gridLayout ? gridLayout[this.schemaId] : null;
          if (layout) this.initLayout(layout);
        });
    } else if (this.type === LayoutTypeEnum.Card) {
      this.store.pipe(select(getCardLayoutSelector), takeUntil(this.destroyed$)).subscribe((cardLayout) => {
        this.initLayout(cardLayout);
      });
    } else if (this.type === LayoutTypeEnum.ReportGrid) {
      this.store.pipe(select(getReportGridLayoutSelector), takeUntil(this.destroyed$)).subscribe((reportGridLayout) => {
        this.initLayout(reportGridLayout);
      });
    }

    if (!this.isChildGrid)
      this.store.pipe(select(currentLayoutSettingIdSelector), takeUntil(this.destroyed$)).subscribe((settingId) => {
        if (settingId) {
          this.persistingService.set(this.getSettingsIdKey(), settingId);
        }
      });
  }

  initLayout(layout?: GridSettings | CardSettings): void {
    if (layout) {
      this.selectedLayoutSettingId = layout['id'];
      this.selectedLayoutName = layout['name'];
      this.isSaveClicked = false;
      this.isUpdateClicked = false;
      this.createLayout = true;
    } else {
      this.resetLayout();
    }
  }

  resetLayout(): void {
    this.selectedLayoutSettingId = null;
    this.selectedLayoutName = null;
    this.selectedLayoutSetting = 'clear';
  }

  initAllGridLayoutsSelectorPipe(): void {
    let settingName;

    if (this.type === LayoutTypeEnum.Grid) {
      settingName = this.gridLayoutSettingsName;
    } else if (this.type === LayoutTypeEnum.Card) {
      settingName = this.cardlayoutSettingsName;
    } else if (this.type === LayoutTypeEnum.ReportGrid) {
      settingName = this.reportGridLayoutSettingName;
    }

    if (!this.isChildGrid)
      this.store.pipe(select(getAllLayoutsSettingsSelector), takeUntil(this.destroyed$)).subscribe((data) => {
        if (data) {
          if (data.settings) {
            // WFM-2125
            this.setLayouts(data);
          }
          this.cdRef.detectChanges();
        }
      });

    if (this.isChildGrid) {
      this.store.pipe(select(allChildGridsLayoutSelector), takeUntil(this.destroyed$)).subscribe((data) => {
        if (Object.keys(data)?.length) {
          const key = this.getSettingsNameKey();
          const layoutsByKey = data[key];
          if (layoutsByKey) {
            this.setLayouts(layoutsByKey);
          }
          this.cdRef.detectChanges();
        }
      });
    }
  }

  setLayouts(data: UserSettingsDto): void {
    const layouts = cleanupLayouts(data);
    const allLayouts = layouts.filter((x) => x?.key.includes(this.getSettingsNameKey()));
    this.layoutSettings = allLayouts;
    this.settingsLength = allLayouts?.length || 0;
    if (allLayouts) {
      this.checkForLastAppliedLayout(allLayouts);
    }
  }

  /**
   * if layoutChange triggered
   */
  triggerLayoutChange(isChanged: boolean): void {
    this.layoutChanged = isChanged;
    if (this.layoutChanged) {
      this.selectedLayoutSetting = 'layoutChanged';
      this.checkSelectedLayout();
      // remove last saved layout id from localstorage when there is a new change
      const settingsIdKey = this.getSettingsIdKey();
      this.persistingService.remove(settingsIdKey);
    }
  }

  checkSelectedLayout(): void {
    let selectedSetting = this.layoutSettings.find((setting) => setting.id === this.selectedLayoutSettingId);
    if (selectedSetting && (selectedSetting.fromGroup || selectedSetting.fromUser)) this.isSharedLayout = true;
    else this.isSharedLayout = false;
  }

  /**
   * if there is a last user layout stored in localstorage, we want to apply the same layout on component init
   * @param layouts
   */
  checkForLastAppliedLayout(layouts: Settings[]): void {
    const settingsIdKey = this.getSettingsIdKey();
    const lastLayoutSettingIdKey: string = this.persistingService.get(settingsIdKey);
    const localGridSettings = this.persistingService.get(this.getSettingsNameKey());
    if (layouts.length > 0 && lastLayoutSettingIdKey) {
      const lastLayout = find(layouts, (layoutItem) => lastLayoutSettingIdKey.indexOf(layoutItem.id) > 0);
      if (lastLayout) {
        this.applyLayout(lastLayout);
      }
    }
    // redundant check, next one checks just localGridSettings
    // else if (layouts.length > 0 && lastLayoutSettingIdKey === null && localGridSettings) {
    //   this.showResetButton = true;
    // }
    else if (localGridSettings) {
      this.showResetButton = true;
    }
    // Load Default Layout
    else if (this.defaultLayoutId) {
      const layoutSetting = this.layoutSettings.find((x) => x.id === this.defaultLayoutId);
      this.applyLayout(layoutSetting);
    } else {
      this.resetLayout();
    }
    if (this.newlySavedLayoutName) {
      let latestLayout = layouts.find((layout) => {
        return layout.value?.name === this.newlySavedLayoutName;
      });
      if (!latestLayout) {
        latestLayout = layouts[layouts.length - 1];
      }
      this.applyLayout(latestLayout);
      this.newlySavedLayoutName = null;
    }
    if (!lastLayoutSettingIdKey && localGridSettings) {
      this.triggerLayoutChange(true);
    }
  }

  /**
   * clear the localstorage and the selected layout,
   * if any
   */
  clearLayout(resetSelectedLayout?: boolean): void {
    const settingName = this.getSettingsNameKey();
    const settingsIdKey = this.getSettingsIdKey();

    this.persistingService.remove(settingsIdKey);
    this.persistingService.remove(settingName);

    if (resetSelectedLayout) this.resetLayout();
    this.showResetButton = false;
    this.layoutChanged = false;

    this.snackBar.open(this.ts.instant('Layout Cleared'), 'CLOSE', {
      duration: 3000
    });

    if (!this.isChildGrid)
      this.store.dispatch(
        new ApplyGridLayoutAction({
          gridConfig: null,
          settingId: null,
          cardConfig: null,
          reportGridConfig: null
        })
      );

    if (this.isChildGrid) {
      this.store.dispatch(
        new ApplyChildGridLayoutAction({
          clearLayouts: true
        })
      );
    }

    if (this.type === LayoutTypeEnum.Card) this.resetCardLayout.emit({ reset: true });
    this.resetGrid.emit({ reset: true });
    this.cdRef.detectChanges();
  }

  onShareClicked(): void {
    const header = 'Layout';

    const dialogRef = this.dialog.open(DynamicEntityShareSearchProfileDialogComponent, {
      width: '1000px'
    });
    const inst = dialogRef.componentInstance;
    inst.selectedProfile = <Settings>this.selectedLayoutSetting;
    inst.tenantId = this.tenant;
    inst.name = this.selectedLayoutName;
    inst.header = header;
    inst.message = 'layout';
    inst.isLayoutProfileSharing = true;
  }

  addLayout(): void {
    this.createLayout = !this.createLayout;
  }

  onSaveLayoutClicked(): void {
    this.isSaveClicked = !this.isSaveClicked;
    this.onUpdateLayoutClicked(false);
  }

  onUpdateLayoutClicked(isOpen?: boolean): void {
    this.isUpdateClicked = isOpen;
    this.createLayout = true;
    this.layoutForm?.patchValue({ name: isOpen ? this.selectedLayoutName : '' });
  }

  cancelCreateUpdate(): void {
    this.isSaveClicked = false;
    this.isUpdateClicked = false;
    this.layoutForm?.patchValue({ name: '' });
    this.createLayout = false;
    this.layoutChanged = false;
  }

  async onSaveClicked(formValue: IObjectMap<any>): Promise<void> {
    const name = formValue.name || formValue.updateName;
    this.newlySavedLayoutName = name;
    const settingName = this.getSettingsNameKey();
    let settingValue = { name: name };

    if (this.type === LayoutTypeEnum.Grid) {
      const gridConfig: GridSettings = cloneDeep(this.gridSettings);
      gridConfig.columnsConfig = gridConfig.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
      if (this.groups?.length) {
        gridConfig.groups = this.groups;
      }
      if (this.aggregates?.length) {
        gridConfig.aggregates = this.aggregates;
      }
      settingValue['gridConfig'] = gridConfig;
    } else if (this.type === LayoutTypeEnum.Card) {
      settingValue['cardConfig'] = this.cardConfig;
    } else if (this.type === LayoutTypeEnum.ReportGrid) {
      const reportGridConfig: GridSettings = cloneDeep(this.gridSettings);
      reportGridConfig.columnsConfig = reportGridConfig.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
      if (this.groups?.length) {
        reportGridConfig.groups = this.groups;
      }
      if (this.aggregates?.length) {
        reportGridConfig.aggregates = this.aggregates;
      }
      settingValue['reportGridConfig'] = reportGridConfig;
    }

    let cmd: UserSettingsDto = {
      id: undefined,
      tenantId: this.tenant,
      userId: this.userId,
      settings: [<Settings>{ key: settingName, value: settingValue }]
    };
    if (this.isSaveClicked) {
      this.store.dispatch(new CreateGridLayoutAction({ tenantId: this.tenant, grid: cmd }));
      await this.action$
        .pipe(
          filter((action) => action.type === GridLayoutsTypes.CreateGridLayoutActionSuccess),
          take(1)
        )
        .toPromise();
    } else if (this.isUpdateClicked) {
      cmd.settings[0].id = this.selectedLayoutSettingId;
      this.store.dispatch(new UpdateGridLayoutAction({ tenantId: this.tenant, layout: cmd }));
      await this.action$
        .pipe(
          filter((action) => action.type === GridLayoutsTypes.UpdateGridLayoutActionSuccess),
          take(1)
        )
        .toPromise();
      this.snackBar.open(this.ts.instant('Layout Updated Successfully'), 'CLOSE', {
        duration: 2000
      });
    }

    this.persistingService.remove(this.getSettingsNameKey());
    this.fetchGridLayoutsSettings(this.isSaveClicked ? true : false);
    this.layoutForm.reset();
    this.cancelCreateUpdate();
    this.clearLayout(false);
  }

  async applyLayout(setting: any): Promise<void> {
    if (setting && setting === 'clear') {
      this.clearLayout(true);
    } else {
      this.cancelCreateUpdate();
      if (setting === undefined) {
        return;
      }

      if (!setting.id) {
        return;
      }
      const settingsNameKey = this.getSettingsNameKey();
      const settingsIdKey = this.getSettingsIdKey();
      if (setting.id !== 'local') {
        this.persistingService.set(settingsIdKey, setting.id);
        // when the user selects a saved layout,
        // remove from localstorage the last changes he made
        this.persistingService.remove(this.getSettingsNameKey());
      }

      const selectedSetting = this.layoutSettings.filter((s) => setting.id === s.id);
      let actionDto = {
        tenantId: this.tenant,
        userId: this.userId,
        name: this.name,
        settingName: settingsNameKey,
        settingId: setting.id
      };
      let childLayoutActionDto: {
        tenantId: string;
        userId: string;
        name: string;
        settingName: string;
        settingId: string;
        schemaId: string;
      };
      if (this.type === LayoutTypeEnum.Grid) {
        const gridConfig = cloneDeep(selectedSetting[0].value?.gridConfig);
        gridConfig.id = setting.id;
        gridConfig.name = setting.value.name;

        this.selectedLayoutSetting = setting;
        this.selectedLayoutSettingId = setting.id;
        this.name = setting.value.name;

        gridConfig.columnsConfig = gridConfig.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
        actionDto['gridConfig'] = gridConfig;
        childLayoutActionDto = { ...actionDto, schemaId: this.schemaId };
      } else if (this.type === LayoutTypeEnum.Card) {
        const cardConfigLayout = selectedSetting[0].value?.cardConfig;
        const cardConfigData = { ...selectedSetting[0].value?.cardConfig };
        const cardConfig = { ...cardConfigData };

        cardConfig.id = setting.id;
        cardConfig.name = setting.value.name;

        this.selectedLayoutSetting = setting;
        this.selectedLayoutSettingId = setting.id;
        this.name = setting.value.name;
        actionDto['cardConfig'] = cardConfig;

        this.applyCardLayout.emit(cardConfigLayout);
      } else if (this.type === LayoutTypeEnum.ReportGrid) {
        this.selectedLayoutSettingId = setting.id;
        this.selectedLayoutSetting = setting;
        this.name = setting.value.name;

        const reportGridConfig = cloneDeep(selectedSetting[0].value?.reportGridConfig);
        if (reportGridConfig) {
          reportGridConfig.id = setting.id;
          reportGridConfig.name = setting.value.name;

          reportGridConfig.columnsConfig = reportGridConfig.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex);
          actionDto['reportGridConfig'] = reportGridConfig;
        }
      }
      this.checkSelectedLayout();

      if (!this.isChildGrid) this.store.dispatch(new ApplyGridLayoutAction(actionDto));
      else {
        this.store.dispatch(new ApplyChildGridLayoutAction(childLayoutActionDto));
      }

      this.snackBar.open(this.ts.instant('Layout Applied'), 'CLOSE', {
        duration: 1000
      });
      this.showResetButton = true;
    }
  }

  confirmDeleteLayout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) this.onLayoutDelete();
      });
  }

  async onLayoutDelete(): Promise<any> {
    if (
      !(<Settings>this.selectedLayoutSetting).fromUser &&
      !(<Settings>this.selectedLayoutSetting).fromGroup &&
      this.selectedLayoutSettingId
    ) {
      this.store.dispatch(new DeleteGridLayoutAction({ tenantId: this.tenant, settingId: this.selectedLayoutSettingId }));

      await this.action$
        .pipe(
          filter((action) => action.type === GridLayoutsTypes.DeleteGridLayoutActionSuccess),
          take(1)
        )
        .toPromise();

      this.clearLayout(true);
      this.fetchGridLayoutsSettings();

      this.snackBar.open(this.ts.instant('Layout Deleted Successfully'), 'CLOSE', {
        duration: 2000
      });
      this.createLayout = !this.createLayout;
    } else {
      return this.snackBar.open(this.ts.instant('Cannot Delete Shared Layout! Please Ask The Creator to Delete It!'), 'CLOSE', {
        duration: 5000
      });
    }
  }

  /**
   * key for storing layout locally
   */
  private getSettingsNameKey(): string {
    let settingName = '';
    if (this.type === LayoutTypeEnum.Grid || this.type === LayoutTypeEnum.Card) {
      settingName = this.schemaId
        ? `${this.gridSettingsName}_${this.schemaId}_${this.schemaAreaType}`
        : `${this.gridSettingsName}${this.tenantName}`;
      // if (this.isChildGrid) {
      //   settingName += `_${this.parentSchemaId}`;
      // }
    } else if (this.type === LayoutTypeEnum.ReportGrid) {
      settingName = `${this.gridSettingsName}_${this.datasourceId}`;
    }

    return settingName;
  }

  private getSettingsIdKey(): string {
    return this.getSettingsNameKey() + this.keyForSelectedLayoutId;
  }

  exportAllDataCsv(): void {
    this.csvDownloadEmitter.emit();
  }

  toggleMatMenu(menu: MatMenuTrigger): void {
    if (!this.isMenuOpen) {
      menu.closeMenu();
    }
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleExportMatMenu(menu: MatMenuTrigger): void {
    if (!this.isExportMenuOpen) {
      menu.closeMenu();
    }
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (!this.isChildGrid) {
      this.store.dispatch(
        new ApplyGridLayoutAction({
          gridConfig: undefined,
          settingId: undefined,
          cardConfig: undefined,
          reportGridConfig: undefined
        })
      );

      this.store.dispatch(new ClearLayoutsAndSelectedId());
    } else if (this.isChildGrid) {
      this.store.dispatch(new RemoveChildGridLayoutAction({ settingName: this.getSettingsNameKey(), schemaId: this.schemaId }));
    }
  }
}
