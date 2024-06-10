/**
 * global
 */
import { AfterViewInit, ChangeDetectorRef, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { Canvas, ICanvasOptions } from 'fabric/fabric-impl';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash-core';
declare const fabric: FabricNamespace;

/**
 * project
 */
import {
  AdditionalSettings,
  AreaTypeEnum,
  DynamicEntitiesService,
  DynamicEntityDto,
  FieldTypeIds,
  keyForSchemaTitleSettings,
  SchemaDto,
  SchemaTitleSettingModel,
  SettingsUI,
  UiAreasEnum,
  WorkflowDto
} from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState, tenantSettingsSelector } from '@wfm/store';
import { WorkflowVisualPlanConfig, MappedPlanUnitItem, PlanUnitDataBinding } from '@wfm/service-layer/models/workflow-visual-plan.model';
import { TitleSettingsHelperService } from '@wfm/service-layer/services/title-settings-helper-service';
import { WorkflowStateUI } from '@wfm/workflow-state/workflow-states-kanban/workflow-states-kanban.component';
import { GetWorkflowVisualPlanMappedUnits, visualPlanMappedUnitsSelector } from '@wfm/store/workflow';

/**
 * local
 */
import { MatMenuTrigger } from '@angular/material/menu';
import { CanvasHelperService, FabricNamespace } from '../services/canvas.helper.service';
import { GridSystemFieldsEnum, SystemFieldsTitleFormatter } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { ConnectorFieldLabelSettings } from '@wfm/common/models/connector-field';

@Component({
  selector: 'app-plan-viewer',
  templateUrl: './plan-viewer.component.html',
  styleUrls: ['./plan-viewer.component.scss']
})
export class PlanViewerComponent extends TenantComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() workflow: WorkflowDto;
  @Input() caseSchema: SchemaDto;
  @Input() visualPlanConfig$: Observable<WorkflowVisualPlanConfig>;
  @Input() showProcessButton: boolean;
  @Input() showEditButton: boolean;

  visualPlanConfig: WorkflowVisualPlanConfig;
  canvas: Canvas;
  mappedUnits: MappedPlanUnitItem[];
  bindings: { [key: string]: PlanUnitDataBinding } = {};
  mappedWorkflowStates: WorkflowStateUI[];
  isLoading: boolean;
  canvasWidth: number;
  canvasHeight: number;
  allTitleSettings: SettingsUI[];
  selectedUnit: PlanUnitDataBinding;
  zoomMessage: string;
  titleSettings: SchemaTitleSettingModel;

  get isDraggingMode(): boolean {
    return this.canvasHelper.isDragMode;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setCanvasDimensions();
    this.canvas.height = this.canvasHeight;
    this.canvas.width = this.canvasWidth;
    this.canvas.renderAll();
  }

  constructor(
    private deService: DynamicEntitiesService,
    private store: Store<ApplicationState>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private canvasHelper: CanvasHelperService,
    private titleSettingsHelperService: TitleSettingsHelperService,
    private cd: ChangeDetectorRef
  ) {
    super(store);
    this.zoomMessage = this.canvasHelper.desktopZoomMessage;
  }

  ngOnInit(): void {
    this.store
      .select(tenantSettingsSelector)
      .pipe(
        filter((x) => !!x),
        take(1)
      )
      .subscribe((tenantSettings) => {
        this.allTitleSettings = tenantSettings.filter((x) => x.key.includes(keyForSchemaTitleSettings));
      });

    this.store
      .select(visualPlanMappedUnitsSelector)
      .pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((data) => {
        this.mappedUnits = cloneDeep(data);

        if (this.canvas && data.length) {
          this.bindings = {};
          this.resetCanvas();
          this.loadCanvasFromVisualConfig();
          this.cd.detectChanges();
        }
      });
  }

  ngAfterViewInit(): void {
    this.setCanvasDimensions();
    this.initVisualPlan();

    this.visualPlanConfig$.pipe(takeUntil(this.destroyed$)).subscribe(async (data: WorkflowVisualPlanConfig) => {
      this.hideMappedCases();
      this.visualPlanConfig = cloneDeep(data);
      if (this.visualPlanConfig) {
        this.getMappedUnits();
      }
    });
  }

  openMenu(menuTrigger: MatMenuTrigger): void {
    //menuTrigger.triggersSubmenu();
    menuTrigger.updatePosition();
    menuTrigger.toggleMenu();
  }
  closeMenu(menuTrigger: MatMenuTrigger): void {
    menuTrigger.closeMenu();
  }

  setCanvasDimensions(): void {
    if (window.innerWidth > 1280) {
      this.canvasWidth = window.innerWidth - 235;
      this.canvasHeight = window.innerHeight - 184;
    } else {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight - 136;
    }
  }

  getMappedUnits(): void {
    this.store.dispatch(
      new GetWorkflowVisualPlanMappedUnits({
        tenantId: this.tenant,
        workflowId: this.visualPlanConfig.workflowSchemaId,
        visualConfigId: this.visualPlanConfig.workflowVisualPlanId
      })
    );
  }

  resetCanvas(): void {
    this.canvasHelper.resetCanvas(this.canvas, this.canvasWidth, this.canvasHeight);
  }

  async getCases(ids: string[]): Promise<void> {
    try {
      this.isLoading = true;
      this.cd.detectChanges();
      const casesData = await this.deService.getVisualViewCases(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId, ids);
      this.mappedWorkflowStates = casesData.items as WorkflowStateUI[];
      await this.setNames();
      this.isLoading = false;
      this.cd.detectChanges();
    } catch (error) {
      console.log(error);
      this.isLoading = false;
      this.cd.detectChanges();
    }
    this.cd.detectChanges();
  }

  async setNames(): Promise<void> {
    if (!this.titleSettings) {
      this.titleSettings = this.titleSettingsHelperService.findApplicableTitleSettings(
        this.workflow.caseSchemaId,
        this.allTitleSettings,
        UiAreasEnum.caseVisualTitle
      );
    }

    if (this.titleSettings) {
      for (const element of this.mappedWorkflowStates) {
        let titleFields = this.titleSettingsHelperService.populateTitleFields(
          element.fields,
          this.titleSettings,
          this.getSystemFields(element)
        );
        const caseName = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, this.titleSettings, this.caseSchema);
        element.caseNameField = caseName;
        element.titleHint = this.titleSettingsHelperService.extractStringFromHTML(caseName);
      }
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

  initVisualPlan(): void {
    this.canvas = new fabric.Canvas('yardViewer', <ICanvasOptions>{
      width: this.canvasWidth,
      height: this.canvasHeight,
      backgroundColor: 'white',
      selection: false
    });

    this.setCanvasMainEventHandlers();
    this.cd.detectChanges();
  }

  loadCanvasFromVisualConfig(): void {
    if (this.visualPlanConfig) {
      this.canvas.loadFromJSON(this.visualPlanConfig.canvas, () => {
        const parsedData = [];
        this.visualPlanConfig.units.forEach((item) => {
          try {
            const parsedObject = JSON.parse(item.canvasObject);
            this.bindings[item.canvasObjectId] = item.dataBinding;
            parsedData.push(parsedObject);
          } catch (error) {
            console.log(error);
          }
        });

        fabric.util.enlivenObjects(
          parsedData,
          async (canvasItems: fabric.Object[]) => {
            for (const i of canvasItems) {
              this.disableUnitMainInteractions(i);
              const isUnitMapped = await this.isUnitMapped(i);
              if (!isUnitMapped) {
                this.disableUnitSelection(i);
              }
              this.canvas.add(i);
            }
            this.canvas.selection = false;
            // dragging is enabled by default, no other actions needed in view mode
            this.canvasHelper.isDragMode = true;
            this.canvas.defaultCursor = 'grab';
            this.canvas.renderAll();
          },
          ''
        );
      });
    }
  }

  checkForMappedCases(canvasObject: fabric.Object): void {
    const mappedUnit = this.mappedUnits && this.mappedUnits.find((u) => u.unitId === canvasObject['id']);
    if (mappedUnit) {
      this.selectedUnit = this.visualPlanConfig.units.find((u) => u.canvasObjectId === canvasObject['id'])?.dataBinding;
      this.getCases(mappedUnit.workflowStateIds);
    }
  }

  setCanvasMainEventHandlers(): void {
    this.canvas.on('selection:created', (event) => {
      const activeObject = this.canvas.getActiveObject();
      this.checkForMappedCases(activeObject);
    });

    this.canvas.on('selection:updated', (event) => {
      const activeObject = this.canvas.getActiveObject();
      this.checkForMappedCases(activeObject);
    });

    this.setZoomEvent();
    this.setMouseMoveEvent();
  }

  setZoomEvent(): void {
    this.canvasHelper.setZoomEvent(this.canvas);
  }

  setMouseMoveEvent(): void {
    this.canvasHelper.setMoveEvents(this.canvas, false);
  }

  disableUnitMainInteractions(unit: fabric.Object): void {
    unit.set('selectable', true);
    unit.set('hasControls', false);
    unit.set('hasRotatingPoint', false);
    unit.set('lockMovementX', true);
    unit.set('lockMovementY', true);
    unit.set('lockRotation', true);
    unit.set('lockScalingX', true);
    unit.set('lockScalingY', true);
    unit.set('lockUniScaling', true);
    unit.set('lockSkewingX', true);
    unit.set('lockSkewingY', true);
    unit.set('lockScalingFlip', true);
    unit.hoverCursor = 'pointer';
  }

  disableUnitSelection(unit: fabric.Object): void {
    unit.set('selectable', false);
    unit.hoverCursor = 'default';
  }

  processWorkflowState(caseItem: DynamicEntityDto, isEditMode: boolean): void {
    this.router.navigate([], {
      queryParams: {
        workflowStateId: caseItem.id,
        isEditCase: isEditMode
      },
      relativeTo: this.activatedRoute
    });
  }

  async isUnitMapped(canvasObject: fabric.Object): Promise<boolean> {
    const mappedUnit = this.mappedUnits && this.mappedUnits.find((u) => u.unitId === canvasObject['id'] && u.isUnitMapped);
    if (mappedUnit) {
      const mappingSettings = this.bindings[canvasObject['id']];
      this.canvasHelper.colorObjects(mappingSettings?.color, [canvasObject], 'fill');
      if (mappingSettings?.titleSettings) {
        await this.applyDynamicTitle(canvasObject, mappingSettings, mappedUnit);
      }
      return true;
    }
    return false;
  }

  zoomOut(): void {
    this.canvasHelper.zoomOut(this.canvas);
  }

  zoomIn(): void {
    this.canvasHelper.zoomIn(this.canvas);
  }

  hideMappedCases(): void {
    this.mappedWorkflowStates = null;
    this.selectedUnit = null;
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }

  // toggleDragging(): void {
  //   this.canvasHelper.isDragMode = !this.canvasHelper.isDragMode;
  //   if (this.canvasHelper.isDragMode) {
  //     this.canvas.defaultCursor = 'grab';
  //   } else {
  //     this.canvas.defaultCursor = 'default';
  //   }
  // }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.canvasHelper.isDragMode = false;
  }

  // there are slight differences between ConnectorFieldLabelSettings and SchemaTitleSettingModel structure
  getSchemaTitleSetting(sett: ConnectorFieldLabelSettings): SchemaTitleSettingModel {
    const additionalSettings: AdditionalSettings = {};
    sett.fieldSettings.forEach((fieldSett) => {
      const fieldName = this.caseSchema.fields.find((f) => f.id === fieldSett.fieldId).fieldName;
      additionalSettings[fieldName] = {
        fieldName: fieldName,
        numberOfSymbolsFieldName: fieldSett.numberOfSymbolsFieldName,
        numberOfSymbolsFieldValue: fieldSett.numberOfSymbolsFieldValue,
        position: fieldSett.position
      };
    });

    const titleSetting: SchemaTitleSettingModel = {
      area: UiAreasEnum.visualUnitDynamicTitle,
      keyValueSeparator: sett.keyValueSeparator,
      fieldSeparator: sett.fieldSeparator,
      fields: Object.keys(additionalSettings),
      additionalSettings: additionalSettings
    };

    return titleSetting;
  }

  async applyDynamicTitle(
    canvasObject: fabric.Object,
    mappingSettings: PlanUnitDataBinding,
    mappedUnit: MappedPlanUnitItem
  ): Promise<void> {
    try {
      const unitTitleSettings: ConnectorFieldLabelSettings = JSON.parse(mappingSettings?.titleSettings);
      const schemaTitleSetting = this.getSchemaTitleSetting(unitTitleSettings);

      const firstCase = mappedUnit.workflowStateIds[0];

      const casesData = await this.deService.getVisualViewCases(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId, [firstCase]);

      let titleFields = this.titleSettingsHelperService.populateTitleFields(
        casesData.items[0].fields,
        schemaTitleSetting,
        this.getSystemFields(casesData.items[0])
      );
      const caseName = await this.titleSettingsHelperService.populateDynamicEntityTitle(titleFields, schemaTitleSetting, this.caseSchema);

      this.canvasHelper.setTextOnObjects([canvasObject], caseName);
    } catch (error) {
      console.log('Error when populating dynamic label', error);
    }
  }
}
