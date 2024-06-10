import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { debounceTime, filter, take, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { FormlyModel, IConfigurableListItem } from '@wfm/common/models';
import {
  APP_CLIENT_ID,
  AreaTypeEnum,
  CreateDynamicEntityDto,
  DynamicEntitiesService,
  EvokedAnswerSettingsEnum,
  FieldTypeIds,
  PermissionSettings,
  Roles,
  SchemaDto,
  SchemaFieldDto,
  SettingsUI,
  WorkflowDtoUi,
  WorkflowService,
  WorkflowSimplifiedDto
} from '@wfm/service-layer';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { SchemaPermissionsHelper } from '@wfm/service-layer/helpers/schema-permissions.helper';
import { BaseFieldValueType, EmbededFieldValueDto } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { AppBarData, ScreenType, SharedService } from '@wfm/service-layer/services/shared.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  currentSelectedRoleNum,
  SetSelectedRawDataSchema,
  showRawDataMenuSelector,
  tenantSettingsSelector,
  TenantSystem,
  workflowMenuItemsSelector
} from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { loggedInState } from '@wfm/store/auth/auth.selectors';
import {
  allVisualPlanConfigsSelector,
  CreateWorkflowStates,
  CreateWorkflowStatesSuccess,
  GetWorkflowVisualPlanList,
  selectedWorkflowSelector,
  SetSelectedReport,
  SetSelectedWorkflow,
  WorkflowActionTypes
} from '@wfm/store/workflow';
import { EvokedAnswerSettingService } from '@wfm/service-layer/services/evoked-answer-setting.service';
import { postCaseSaveSetting } from '@wfm/users/evoked-answer-settings/evoked-answer-settings.component';
import { FormlyDataOutput } from '@wfm/common/form-builder-components/form-builder-form-preview/form-builder-form-preview.component';
import { WorkflowVisualPlanConfig } from '@wfm/service-layer/models/workflow-visual-plan.model';

export enum CaseViewEnum {
  Grid = 'grid',
  Kanban = 'kanban',
  VisualPlan = 'visualPlan'
}
import { WorkflowsCacheService } from '@wfm/service-layer/services/workflows-cache.service';
import { schemaPermissionSettingsKey } from '@wfm/tenants/manual-creation-settings-by-schema/manual-creation-settings-by-schema.component';
import { casesActionsSettingKey, casesGroupSettingKey } from '@wfm/tenants/cases-setting/cases-setting.component';
import { CaseActionsEnum } from '../workflow-states-grid/workflow-states-grid.component';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import { ScreenMeasurements } from '../workflow-state.component';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';

export const caseProcessPanelWidthKey = 'case-process-panel-width';
export const mainPanelWidthKey = 'main-panel-width';

@Component({
  selector: 'app-workflow-states-list',
  templateUrl: './workflow-states-list.component.html',
  styleUrls: ['./workflow-states-list.component.scss']
})
export class WorkflowStatesListComponent extends TenantComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('addCaseTemplate') addCaseTemplate: TemplateRef<any>;
  // @ViewChild(CdkDrag) panelDragger: CdkDrag;
  @ViewChild('panelDragger', { read: CdkDrag }) panelDragger: CdkDrag;

  selectedCaseView: CaseViewEnum | string;
  checked: boolean;
  workflow: WorkflowDtoUi;
  workflowStateId: String;
  workflowSchemaId: String;
  tenantSettingsForCase: SettingsUI;
  tenantSystem: TenantSystem;
  openSidePanel: boolean = false;
  userId: string;
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'Cases', type: ScreenType.CASES } as AppBarData;
  showRawDataArea: boolean;
  caseSchemaFields$: Observable<IConfigurableListItem[]>;
  caseSchema: SchemaDto;
  createCaseDialog: MatDialogRef<any, any>;
  showCreateCaseButton: boolean = false;
  numberOfEntitiesControl: FormControl;
  showProcessButton: boolean = false;
  allWorkflows: WorkflowSimplifiedDto[];
  workflowIdFromParams: string;
  isVisualViewAllowed: boolean;
  userRole: Roles;
  allVisualPlanConfigs: WorkflowVisualPlanConfig[] = [];
  hideMultiCreationButton: boolean = true;
  showEditButton: boolean;
  showPrintButton: boolean;
  showDownloadButton: boolean;
  // showInfoButton: boolean;
  tenantSettings: SettingsUI[];
  schemaPermissions: PermissionSettings;
  mainPanelWidth: number;
  isMobile: boolean;
  get areaTypes() {
    return AreaTypeEnum;
  }
  showCaseButtons: boolean = true;

  uiProps: ScreenMeasurements = {
    containerWidth: 100,
    x: 100,
    panelWidth: 720,
    offsetX: 0,
    tempPanelWidth: 720
  };

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload() {
    this.storePanelWidth();
  }

  @HostListener('window:resize', ['$event']) onResize(event) {
    this.getMainPanelWidth();
  }

  constructor(
    private store: Store<ApplicationState>,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private adminSchemasService: AdminSchemasService,
    private action$: Actions,
    private snackBar: MatSnackBar,
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private schemaPermissionsHelper: SchemaPermissionsHelper,
    private evokedSettingService: EvokedAnswerSettingService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dynamicEntitiesService: DynamicEntitiesService,
    private ts: TranslateService,
    private wfService: WorkflowService,
    private workflowsCacheService: WorkflowsCacheService,
    private changeDetectorRef: ChangeDetectorRef,
    public breakpointObserver: BreakpointObserver,
    public el: ElementRef<HTMLElement>
  ) {
    super(store);
    this.store
      .pipe(
        select(tenantSettingsSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (sett) => {
        this.tenantSettings = [...sett];
      });
    this.subscribeToSelectedWorkflow();
    this.store.pipe(select(loggedInState), takeUntil(this.destroyed$)).subscribe((data) => {
      if (data) {
        this.tenantSystem = data.currentTenantSystem;
        this.userRole = this.tenantSystem.tenant.roleNum;
      }
      this.userId = data.profile.id;
    });

    this.store
      .pipe(
        select(workflowMenuItemsSelector),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((workflows) => {
        this.allWorkflows = workflows.map((item) => {
          return item.setting;
        });
        this.checkRoute();
      });

    this.initAppBarData();
  }

  ngOnInit() {
    this.store.pipe(select(showRawDataMenuSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.showRawDataArea = x;
      this.checkCreateCaseRights();
    });
    this.numberOfEntitiesControl = new FormControl(1, [Validators.min(1), Validators.pattern(/^\d*$/)]);
  }

  ngAfterViewInit(): void {
    this.breakpointObserver
      .observe(['(max-width:660px)'])
      .pipe(debounceTime(100), takeUntil(this.destroyed$))
      .subscribe((state: BreakpointState) => {
        if (state.matches === true) {
          this.isMobile = true;
        } else {
          this.isMobile = false;
          const width = localStorage.getItem(mainPanelWidthKey);
          this.mainPanelWidth = Number(width);
        }
      });
    this.setPanelSizes();

    this.panelDragger?.moved
      .pipe(
        takeUntil(this.destroyed$)
        // debounceTime(50)
      )
      .subscribe((e: CdkDragMove) => {
        this.onResizeLeftColumn(e);
      });
  }

  addWorkflowIdParam(): void {
    if (this.allWorkflows.length) {
      this.router.navigate([this.allWorkflows[0]?.id], { relativeTo: this.activatedRoute });
    }
  }

  checkRoute(): void {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe((paramsMap) => {
      this.workflowIdFromParams = paramsMap['workflowId'];
      if (this.workflowIdFromParams) {
        let workflow = this.allWorkflows.find((w) => w.id === this.workflowIdFromParams);
        if (workflow && (!this.workflow || this.workflow.id !== workflow.id)) {
          this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: { ...workflow } }));
          this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: null }));
          this.store.dispatch(new SetSelectedReport({ selectedReport: null }));
        }
      } else {
        this.addWorkflowIdParam();
      }
    });

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((paramsMap) => {
      if (paramsMap['workflowStateId']) {
        this.openSidePanel = true;
        const width = localStorage.getItem(mainPanelWidthKey);
        this.mainPanelWidth = Number(width);
      } else {
        this.openSidePanel = false;
      }
    });
  }

  /**
   * get user's preferred view: grid/kanban/visualPlan
   */
  initCasesView(settings: SettingsUI[]): void {
    this.selectedCaseView = CaseViewEnum.Grid;
    const savedUserCasesViewSetting = localStorage.getItem(`CasesView_${this.userId}`);
    if (savedUserCasesViewSetting) {
      this.selectedCaseView = savedUserCasesViewSetting;
    } else {
      const caseViewSetting = settings?.find((x) => x.key === `${schemaPermissionSettingsKey}_${this.caseSchema.id}_${AreaTypeEnum.case}`);
      if (caseViewSetting?.value?.caseViewSetting) {
        this.selectedCaseView = caseViewSetting.value.caseViewSetting;
      }
    }
  }

  initAppBarData(): void {
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.sharedService.setAppBarData(this.appBarData);
    this.sharedService
      .getAppBarData()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((appBarData: AppBarData) => {
        if (appBarData.type == ScreenType.CASES && appBarData.caseViewSwitched != undefined) {
          this.selectedCaseView = appBarData.caseViewSwitched || CaseViewEnum.Grid;
        }
      });
  }

  checkCreateCaseRights(): void {
    this.showCreateCaseButton = false;
    if (this.workflow && this.caseSchema) {
      const rawDataSchemaFields = this.caseSchema.fields.filter((field) => {
        return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
      });
      if (this.showRawDataArea === false || !rawDataSchemaFields.length) {
        this.store
          .pipe(
            select(currentSelectedRoleNum),
            filter((x) => !!x),
            take(1)
          )
          .subscribe(() => {
            this.store
              .pipe(
                select(tenantSettingsSelector),
                filter((x) => !!x),
                take(1)
              )
              .subscribe(async () => {
                this.showCreateCaseButton = this.schemaPermissions.add;
              });
          });
      }
    }
  }

  toggleSwitched(type?: string): void {
    localStorage.setItem(`CasesView_${this.userId}`, this.selectedCaseView);
    if (type) {
      this.selectedCaseView = type;
    }
    if (this.openSidePanel) {
      this.closeWorkflowState(Event);
    }
  }

  subscribeToSelectedWorkflow(): void {
    this.store
      .select(allVisualPlanConfigsSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((configs) => {
        this.allVisualPlanConfigs = configs;
      });

    this.store
      .select(selectedWorkflowSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (w) => {
        if (w && this.workflowIdFromParams) {
          this.workflow = await this.workflowsCacheService.get(w.id, 60, async () => {
            return await this.wfService.get(w.id, this.tenant);
          });
          this.workflow.caseSchema = cloneDeep(w.caseSchema);
          await this.getSchemaPermissions();
          this.checkWorkflowStateProcessButton();
          this.checkButtons();
          await this.getCaseSchema();
          this.checkCreateCaseRights();
          this.store.dispatch(new GetWorkflowVisualPlanList({ tenantId: this.tenant, workflowId: this.workflow.id }));
          this.isVisualViewAllowed = false;
          if (this.tenantSettings?.length && this.caseSchema?.id) {
            const selectedSchemaSettings = this.tenantSettings?.find((x) =>
              x.key.includes(`${schemaPermissionSettingsKey}_${this.caseSchema.id}_${AreaTypeEnum.case}`)
            );
            if (selectedSchemaSettings) {
              if (!isUndefinedOrNull(selectedSchemaSettings?.value['disableMultiCreation'])) {
                this.hideMultiCreationButton = selectedSchemaSettings?.value?.disableMultiCreation;
              }
              const rolePermissions = selectedSchemaSettings?.value?.rolePermissions?.find((x) => x.role === this.userRole);
              if (rolePermissions?.permission?.showVisualView) {
                this.isVisualViewAllowed = true;
              }
            }
            this.initCasesView(this.tenantSettings);
          }
        }
      });
  }

  async getSchemaPermissions(): Promise<void> {
    this.schemaPermissions = await this.schemaPermissionsHelper.getSchemaPermissions(
      this.workflow.caseSchemaId,
      AreaTypeEnum.case,
      this.tenant
    );
  }

  checkButtons(): void {
    const actionSettings = this.tenantSettings?.find((x) => x.key === `${casesActionsSettingKey}_${this.workflow.id}`);

    this.showDownloadButton = false;
    this.showEditButton = false;
    this.showPrintButton = false;
    // this.showInfoButton = false;

    actionSettings &&
      actionSettings.value?.actions?.forEach((action) => {
        switch (action) {
          case CaseActionsEnum.Download:
            this.showDownloadButton = true;
            break;
          case CaseActionsEnum.Edit:
            this.showEditButton = true;
            break;
          case CaseActionsEnum.CasePrintPreview:
            this.showPrintButton = true;
            break;
          // case CaseActionsEnum.Info:
          //   this.showInfoButton = true;
          //   break;
        }
      });
  }

  checkWorkflowStateProcessButton(): void {
    this.showProcessButton = false;
    const hasProcessStepLinks = this.workflow.processStepLinks?.length ? true : false;
    if (hasProcessStepLinks && this.schemaPermissions.edit) {
      this.showProcessButton = true;
    }
  }

  async getCaseSchema(): Promise<void> {
    this.caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId);
  }

  closeWorkflowState(event: any): void {
    this.openSidePanel = false;
    this.router.navigate([], {
      queryParams: {
        workflowStateId: null,
        isEditCase: null
      },
      queryParamsHandling: 'merge',
      relativeTo: this.activatedRoute
    });
    this.getMainPanelWidth();
  }

  async openCaseCreateDialogue(): Promise<void> {
    this.caseSchemaFields$ = of(this.caseSchema?.fields?.map((field) => BaseFieldConverter.toUi(field)));
    this.createCaseDialog = this.dialog.open(this.addCaseTemplate, {
      width: '500px',
      maxHeight: '95vh',
      maxWidth: '95vw',
      panelClass: []
    });

    this.createCaseDialog.afterClosed().subscribe(() => {
      this.numberOfEntitiesControl?.setValue(1);
    });
  }

  createCaseWithNoRawData(data: FormlyDataOutput): void {
    try {
      const caseDynamicPayload: CreateDynamicEntityDto = {
        appId: this.appId,
        tenantId: this.tenant,
        areaType: AreaTypeEnum.case,
        schemaId: this.caseSchema.id,
        fields: this.populateDynamicEntityFields(data.model, this.caseSchema.fields)
      };
      this.store.dispatch(
        new CreateWorkflowStates({
          tenantId: this.tenant,
          case: caseDynamicPayload,
          schemaId: this.workflow.id,
          numberOfItems: this.numberOfEntitiesControl.value || 1
        })
      );
      this.action$
        .pipe(
          filter((action) => action.type === WorkflowActionTypes.CreateWorkflowStatesSuccess),
          take(1)
        )
        .subscribe((action: CreateWorkflowStatesSuccess) => {
          let wfId = action.payload?.workflowStateId;
          if (wfId) {
            this.snackBar.open(this.ts.instant('Case Created Successfully!'), 'CLOSE', { duration: 2000 });
          } else {
            // if no workflowStateId is passed, we are creating multiple cases
            this.snackBar.open(this.ts.instant('Cases Created Successfully!'), 'CLOSE', { duration: 2000 });
          }

          if (!data.keepFormOpen) {
            this.createCaseDialog.close();
            let existingSetting: SettingsUI = this.evokedSettingService.checkForEvokedAnswerSetting(postCaseSaveSetting);
            const settingValue: EvokedAnswerSettingsEnum = existingSetting?.value?.setting;
            this.evokedSettingService.makePostCaseCreationAction(
              settingValue,
              existingSetting,
              postCaseSaveSetting,
              wfId,
              this.workflow.id,
              this.userId,
              this.workflow.processStepLinks.length,
              this.workflow.caseSchemaId
            );
          }
        });
    } catch (error) {
      console.log(error);
    }
  }

  private populateDynamicEntityFields(formModel: FormlyModel, schemaFields: SchemaFieldDto[]): BaseFieldValueType[] {
    let fields = [];
    schemaFields.forEach((field) => {
      const key = field.fieldName;
      if (field.type !== FieldTypeIds.EmbededField) {
        let data = <BaseFieldValueType>{
          id: key,
          type: field.type
        };
        const value = this.dynamicEntitiesService.mapFieldTypeToBaseFieldValue(field.type, formModel[key]);
        if (!isUndefinedOrNull(value)) {
          data.value = value;
          fields.push(data);
        }
      } else {
        const embeddedFields = this.populateDynamicEntityFields(formModel[key], field.fields);
        const data = <EmbededFieldValueDto>{
          id: key,
          type: FieldTypeIds.EmbededField,
          value: embeddedFields
        };
        fields.push(data);
      }
    });

    return fields;
  }

  hasError(errorName: string): boolean {
    return this.numberOfEntitiesControl.hasError(errorName);
  }

  setPanelSizes(): void {
    // this.uiProps.containerWidth = this.el.nativeElement.getBoundingClientRect().width;
    this.uiProps.containerWidth = window.innerWidth;
    const mainAreaWrapper = document.getElementById('main-area');
    if (mainAreaWrapper) {
      this.uiProps.offsetX = mainAreaWrapper.offsetLeft;
      if (caseProcessPanelWidthKey in localStorage) {
        this.uiProps.panelWidth = +localStorage.getItem(caseProcessPanelWidthKey);
        this.uiProps.tempPanelWidth = +localStorage.getItem(caseProcessPanelWidthKey);
        if (this.uiProps.panelWidth <= 550) {
          this.showCaseButtons = false;
        } else {
          this.showCaseButtons = true;
        }
      }
      mainAreaWrapper.style.width = `calc( 100% - ${this.uiProps.panelWidth}px`;
      this.getMainPanelWidth();
      const width = localStorage.getItem(mainPanelWidthKey);
      this.mainPanelWidth = Number(width);
    }
  }

  onResizeLeftColumn(e: CdkDragMove): void {
    this.uiProps.x = (e.event as MouseEvent).pageX - this.uiProps.offsetX;
    this.uiProps.panelWidth = Math.floor(this.uiProps.containerWidth - this.uiProps.x);

    if (this.uiProps.panelWidth <= 550) {
      this.showCaseButtons = false;
    } else {
      this.showCaseButtons = true;
    }
    if (this.uiProps.panelWidth <= 400) {
      this.uiProps.panelWidth = 400;
      return;
    }

    document.getElementById('main-area').style.width = `calc( 100% - ${this.uiProps.panelWidth}px`;
    this.getMainPanelWidth('resize');
  }

  storePanelWidth(): void {
    if (this.uiProps.tempPanelWidth != this.uiProps.panelWidth && this.uiProps.panelWidth >= 200) {
      localStorage.setItem(caseProcessPanelWidthKey, String(this.uiProps.panelWidth));
    }
  }

  getMainPanelWidth(resize?: string): void {
    const mainArea = document.getElementById('main-area') as HTMLElement;
    this.mainPanelWidth = mainArea.clientWidth;

    if (resize) {
      localStorage.setItem(mainPanelWidthKey, String(this.mainPanelWidth));
    }
  }

  areToolButtonsVisible(): boolean {
    if (this.isMobile) {
      return false;
    }
    if (this.mainPanelWidth > 863 || !this.openSidePanel) {
      return true;
    }
    return false;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.storePanelWidth();
  }
}
