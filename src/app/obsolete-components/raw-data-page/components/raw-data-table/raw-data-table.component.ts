// /**
//  * global
//  */
// import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

// import { GridComponent, NavigationRow, PageChangeEvent } from '@progress/kendo-angular-grid';

// import { SortDescriptor } from '@progress/kendo-data-query';

// import { select, Store } from '@ngrx/store';
// import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
// import { filter, map, switchMap, takeUntil } from 'rxjs/operators';
// import { upperFirst, cloneDeep, differenceWith } from 'lodash-core';

// /**
//  * project
//  */
// import {
//   AreaTypeEnum,
//   CasesService,
//   DynamicEntitiesService,
//   GridSettings,
//   RawDataEntityService,
//   rawDataOnSingleCase,
//   RawDataStatus,
//   RawDataStatusNameMap,
//   SidebarLinksService,
//   StatePersistingService,
//   AdminTenantFieldsService,
//   ColumnSettings,
//   PagedData,
//   DynamicEntityDto,
//   SettingsUI,
//   appGridLayout,
//   rawDataGridSettings,
//   Paging,
//   UserSettingsDto,
//   appDateFormatKey,
//   RAW_DATA_FIELDS_VISIBILITY_KEY,
//   SchemasService,
//   SchemaDto
// } from '@wfm/service-layer';
// import { TenantComponent } from '@wfm/shared/tenant.component';

// import { ApplicationState } from '@wfm/store/application/application.reducer';

// import { RawDataGridService } from '@wfm/raw-data/raw-data-grid/raw-data-grid.service';

// import {
//   AuthState,
//   currentTenantSelector,
//   getDateFormatSettingsSelector,
//   getGridLayoutSelector,
//   tenantSettingsSelector,
//   userProfile
// } from '@wfm/store';
// import { IConfigurableListItem, IFieldConfiguration, IObjectMap } from '@wfm/common/models';
// import { BaseFieldConverter } from '@wfm/service-layer/helpers';

// import { toApiSort } from '@wfm/shared/kendo-util';
// import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
// import { setTimeoutAsync } from '@wfm/common/helpers';
// import { FieldSettingUI } from '@wfm/tenant-admin/models';

// /**
//  * local
//  */
// import { IRawDataView } from './i-raw-data.view';
// import { getPermissions, kendoPropertyToNative, mapRawDataToKendoData, settingsKey, statusKey, toKendoProperty } from './raw-data.helpers';
// import { RawDataEditorDialogComponent } from '../raw-data-editor-dialog/raw-data-editor-dialog.component';

// @Component({
//   selector: 'app-raw-data-table',
//   templateUrl: './raw-data-table.component.html',
//   styleUrls: ['./raw-data-table.component.scss'],
//   encapsulation: ViewEncapsulation.None
// })
// export class RawDataTableComponent extends TenantComponent implements OnInit {
//   @ViewChild('grid') grid: GridComponent;
//   @ViewChild('createCaseBtn', { static: false, read: ElementRef }) createCaseBtn: ElementRef<HTMLElement>;
//   componentId = 'ee532569-c6f9-4ab0-b6db-97440909397c';
//   view$ = new BehaviorSubject<IRawDataView>(undefined);
//   get areaTypeEnum() {
//     return AreaTypeEnum;
//   }
//   private modalConfig: MatDialogConfig = { width: '800px' };

//   constructor(
//     private rawDataGridService: RawDataGridService,
//     private rawDataEntityService: RawDataEntityService,
//     private dynamicEntitiesService: DynamicEntitiesService,
//     private adminTenantFieldsService: AdminTenantFieldsService,
//     private casesService: CasesService,
//     private schemasService: SchemasService,
//     private snackBar: MatSnackBar,
//     private store: Store<ApplicationState>,
//     private persistingService: StatePersistingService,
//     private dialog: MatDialog,

//     private sidebarService: SidebarLinksService
//   ) {
//     super(store, false);
//   }

//   ngOnInit(): void {
//     this.store
//       .select(currentTenantSelector)
//       .pipe(
//         takeUntil(this.destroyed$),
//         filter((x) => !!x),
//         switchMap((tenantId: string) => {
//           const rawDataPage$: Observable<PagedData<DynamicEntityDto>> = this.dynamicEntitiesService.search$(tenantId, AreaTypeEnum.rawData);
//           const tenantRawFields$: Observable<IConfigurableListItem[]> = this.adminTenantFieldsService
//             .searchByAreaType$(AreaTypeEnum.rawData, tenantId)
//             .pipe(map((page) => (page?.items || []).map((x) => BaseFieldConverter.toUi(x))));

//           const auth$: Observable<AuthState> = this.store.pipe(
//             select(userProfile),
//             filter((s) => !!s)
//           );
//           const tenantSettings$: Observable<SettingsUI[]> = this.store.pipe(select(tenantSettingsSelector));
//           const dateFormatDb$: Observable<SettingsUI> = this.store.pipe(
//             select(getDateFormatSettingsSelector),
//             map((data: UserSettingsDto) => {
//               const dateKey = appDateFormatKey;
//               return data?.settings?.find((x) => x.key === dateKey);
//             })
//           );
//           const gridSettingsChange$ = this.store.pipe(select(getGridLayoutSelector));

//           return combineLatest([auth$, tenantSettings$, tenantRawFields$, rawDataPage$, dateFormatDb$, gridSettingsChange$]).pipe(
//             takeUntil(this.destroyed$),
//             map(([auth, tenantSettings, tenantRawFields, rawDataPage, dateFormatDb, gridSettingsChange]) => {
//               const isAdmin = auth.tenant?.tenant?.role === 'TenantAdmin';

//               let tsRawDataOnSingleCase = tenantSettings?.find((x) => x.key === rawDataOnSingleCase)?.value;
//               if (typeof tsRawDataOnSingleCase === 'object') {
//                 tsRawDataOnSingleCase = !!tsRawDataOnSingleCase[rawDataOnSingleCase];
//               }
//               tsRawDataOnSingleCase = !!tsRawDataOnSingleCase;

//               const columns = tenantRawFields;

//               const tenantName = this.sidebarService.getTenantNameAsProperty();
//               const gridSettings = gridSettingsChange || this.getGridSettings(tenantName, columns);

//               const view: IRawDataView = {
//                 authState: auth,
//                 rawDataColumns: columns,
//                 tsRawDataOnSingleCase: tsRawDataOnSingleCase,
//                 isTenantAdmin: isAdmin,
//                 permission: getPermissions(tenantId, auth),
//                 tenantId,
//                 tenantName,
//                 tenantSettings,
//                 dateFormatDb,
//                 caseRawDataColumns: [],
//                 selectedRowMap: new Map(),
//                 loading: false,
//                 hasSomeCheckFlag: false,
//                 isAddToCaseClicked: false,
//                 isCreateCaseButtonClicked: false,
//                 kendo: {
//                   appSettingName: appGridLayout,
//                   gridSettingsName: rawDataGridSettings,
//                   allowExports: true,
//                   allowSharing: true,
//                   gridData: mapRawDataToKendoData(rawDataPage, dateFormatDb, columns),
//                   gridSettings,
//                   pageSize: [50, 150, 500, 1000, { text: 'all', value: 'all' }],
//                   selectableSettings: {
//                     checkboxOnly: true,
//                     mode: 'multiple'
//                   },
//                   selectedKeys: [],
//                   sort: gridSettings?.state?.sort || [],
//                   state: {
//                     skip: 0,
//                     take: 50
//                   }
//                 }
//               };
//               console.log('view', { view });
//               return view;
//             })
//           );
//         })
//       )
//       .subscribe((view) => this.view$.next(view));
//   }

//   async onSortChange(view: IRawDataView, sort: SortDescriptor[]): Promise<void> {
//     await this.saveGridSettingsLocally(view);
//     const newView: IRawDataView = {
//       ...view
//     };
//     newView.kendo.sort = sort || undefined;
//     this.view$.next(newView);

//     await this.updateTable(newView);
//   }

//   onReorder(view: IRawDataView): void {
//     this.saveGridSettingsLocally(view);
//   }
//   onResize(view: IRawDataView): void {
//     this.saveGridSettingsLocally(view);
//   }
//   onVisibilityChange(view: IRawDataView): void {
//     this.saveGridSettingsLocally(view);
//   }

//   async onPageChange(view: IRawDataView, event: PageChangeEvent): Promise<void> {
//     const newView: IRawDataView = {
//       ...view
//     };
//     newView.kendo.state.skip = event.skip;
//     await this.updateTable(newView);
//   }

//   async onDataStateChanged(view: IRawDataView, ev: { take: number }): Promise<void> {
//     if (ev.take !== view.kendo.state) {
//       const newView: IRawDataView = {
//         ...view
//       };
//       newView.kendo.state.take = ev.take;
//       await this.updateTable(newView);
//     }
//   }

//   async onSelectedKeysChange(view: IRawDataView, rowIds: string[]): Promise<void> {
//     const selectedRowMap = view.selectedRowMap;
//     const gridData = view.kendo.gridData.data;
//     const selectedKendoRawDataRows: IObjectMap<any>[] = rowIds
//       .map((rowId) => {
//         if (selectedRowMap.has(rowId)) {
//           return selectedRowMap.get(rowId);
//         }
//         return gridData.find((g) => g.rowId === rowId);
//       })
//       .filter((x) => !!x);

//     selectedKendoRawDataRows.forEach((x) => {
//       x.isChecked = true;
//       selectedRowMap.set(x.id, x);
//     });

//     const deselectRows = differenceWith([...selectedRowMap.values()], selectedKendoRawDataRows);

//     deselectRows.forEach((x) => {
//       x.isChecked = false;
//       selectedRowMap.delete(x.rowId);
//     });

//     const hasSomeCheckFlag = gridData.some((x) => !!x.isChecked);

//     const tenantSettings = view.tenantSettings;

//     const rawDataFieldsSettings = tenantSettings.find((x) => x.key === RAW_DATA_FIELDS_VISIBILITY_KEY);

//     const visibleFields: FieldSettingUI[] = rawDataFieldsSettings?.value || [];

//     const rawDataColumnMap = new Map<string, IConfigurableListItem>();
//     view.rawDataColumns.forEach((x) => rawDataColumnMap.set(x.id, x));

//     const caseRawDataColumns = visibleFields
//       .filter((x) => x.setting[settingsKey])
//       .map((x) => {
//         const srcField = rawDataColumnMap.get(x.fieldId);
//         if (!srcField) {
//           return null;
//         }
//         const field: FieldSettingUI = {
//           name: srcField.name,
//           nameUI: upperFirst(srcField.viewName),
//           fieldId: x.fieldId,
//           setting: cloneDeep(x.setting)
//         };
//         return field;
//       });

//     const newView: IRawDataView = {
//       ...view,
//       hasSomeCheckFlag,
//       caseRawDataColumns
//     };

//     this.view$.next(newView);

//     if (hasSomeCheckFlag && !newView.isCreateCaseButtonClicked) {
//       /**
//        * wait render view
//        */
//       await setTimeoutAsync(1);
//       this.createCaseBtn.nativeElement.click();
//     }
//   }

//   openDialogRawDataInfo(row: IObjectMap<any>): void {}
//   openDialogUpdateRawData(row: IObjectMap<any>): void {}

//   openDialogAddRawData(view: IRawDataView): void {
//     const dialogRef = this.dialog.open(RawDataEditorDialogComponent, this.modalConfig);
//     const inst = dialogRef.componentInstance;
//     inst.inputButtonText = 'Create';
//     inst.inputRawFieldsDefinition = view.rawDataColumns;
//     inst.tenantId = view.tenantId;

//     dialogRef
//       .afterClosed()
//       .pipe(filter((x) => !!x))
//       .subscribe(() => this.updateTable(view));
//   }

//   openDialogDeleteSelectedRows(view: IRawDataView): void {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent);
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result) {
//         const newView = {
//           ...view,
//           hasSomeCheckFlag: false,
//           loading: true
//         };
//         this.view$.next(newView);
//         try {
//           await this.rawDataEntityService.deleteItems(this.tenant, [...newView.selectedRowMap.keys()]);
//           await this.updateTable({
//             ...newView,
//             selectedRowMap: new Map(),
//             caseRawDataColumns: []
//           });
//         } catch (error) {
//           this.view$.next({
//             ...newView,
//             loading: false
//           });
//           throw error;
//         }

//         this.snackBar.open('Raw data Deleted Successfully', 'CLOSE', { duration: 2000 });
//       }
//     });
//   }

//   onCreateCaseBtnClick(view: IRawDataView): void {
//     const isCreateCaseButtonClicked = !view.isCreateCaseButtonClicked;
//     let isAddToCaseClicked = view.isAddToCaseClicked;
//     if (isCreateCaseButtonClicked) {
//       isAddToCaseClicked = false;
//     }
//     this.view$.next({
//       ...view,
//       isCreateCaseButtonClicked,
//       isAddToCaseClicked
//     });
//   }

//   onAddToCaseBtnClick(view: IRawDataView): void {
//     const isAddToCaseClicked = !view.isAddToCaseClicked;
//     let isCreateCaseButtonClicked = view.isAddToCaseClicked;
//     view.isAddToCaseClicked = !view.isAddToCaseClicked;
//     if (isAddToCaseClicked) {
//       isCreateCaseButtonClicked = false;
//     }
//     this.view$.next({
//       ...view,
//       isCreateCaseButtonClicked,
//       isAddToCaseClicked
//     });
//   }

//   getDisabledRowClassObject(row: NavigationRow): IObjectMap<boolean> {
//     const enabled = RawDataStatusNameMap.is(row.dataItem[statusKey], RawDataStatus.Unassigned);
//     const css = { 'k-disabled': !enabled };
//     return css;
//   }

//   allEnabledRowsClassObject(row: NavigationRow): IObjectMap<boolean> {
//     const css = { 'k-disabled': false };
//     return css;
//   }

//   getKendoFieldName(key: string): string {
//     return toKendoProperty(key);
//   }

//   scrollToElement($element: Element, delay = 250): void {
//     setTimeout(() => {
//       $element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
//     }, delay);
//   }

//   getSelectedRows(view: IRawDataView): IObjectMap<any>[] {
//     return [...view.selectedRowMap.values()];
//   }

//   private createGridSettingsKey(tenantName: string): string {
//     const key = rawDataGridSettings + tenantName;
//     return key;
//   }

//   private async saveGridSettingsLocally(view: IRawDataView): Promise<void> {
//     // we need to wait a bit for kendo grid handle changes
//     await setTimeoutAsync(100);

//     const gridConfig = this.rawDataGridService.getGridSettingsFromGridComponent(this.grid);
//     const key = this.createGridSettingsKey(view.tenantName);
//     this.persistingService.set(key, gridConfig);
//   }

//   private getGridSettings(tenantName: string, columns: IConfigurableListItem[]): GridSettings {
//     let gridSettings = this.getLocalGridSettings(tenantName) || ({} as GridSettings);

//     if (!gridSettings?.columnsConfig) {
//       gridSettings.columnsConfig = columns.map((item) => {
//         const column: ColumnSettings = {
//           field: toKendoProperty(item.id),
//           title: upperFirst(item.viewName || item.name || ''),
//           _width: 190
//         };
//         return column;
//       });
//     }
//     return gridSettings;
//   }

//   private getLocalGridSettings(tenantName: string): GridSettings {
//     const key = this.createGridSettingsKey(tenantName);
//     const settings: string = this.persistingService.get(key);
//     const gridSettings = this.rawDataGridService.mapGridSettings(settings);
//     return gridSettings;
//   }

//   private async updateTable(view: IRawDataView): Promise<void> {
//     this.view$.next({
//       ...view,
//       loading: true
//     });
//     try {
//       const sortArr = view.kendo.sort
//         .filter((x) => !!x.field && !!x.dir)
//         .map((x) => {
//           const fieldId = kendoPropertyToNative(x.field);
//           const column = view.rawDataColumns.find((x) => x.id === fieldId);
//           return {
//             propertyName: column.name,
//             sort: toApiSort(x)
//           };
//         });
//       const state = view.kendo.state;
//       const paging: Paging = { skip: state.skip, take: state.take };
//       const filters = [];

//       const rawDataPage = await this.dynamicEntitiesService
//         .search$(view.tenantId, AreaTypeEnum.rawData, paging, sortArr, filters)
//         .toPromise();

//       const newView: IRawDataView = {
//         ...view
//       };

//       newView.kendo.gridData = mapRawDataToKendoData(rawDataPage, view.dateFormatDb, view.rawDataColumns);
//       this.view$.next({
//         ...newView
//       });
//     } finally {
//       this.view$.next({
//         ...this.view$.getValue(),
//         loading: false
//       });
//     }
//   }
// }
