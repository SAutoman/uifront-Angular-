import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BaseBrush, Canvas, ICanvasOptions, IImageOptions, Object } from 'fabric/fabric-impl';
import { cloneDeep } from 'lodash-core';
import { Observable, Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
declare const fabric: FabricNamespace;

/**
 * project
 */
import { Guid } from '@wfm/shared/guid';
import { DocumentUploadService, SchemaDto, SharedService, tenantDocumentManagementSettingKey, WorkflowDto } from '@wfm/service-layer';
import { FilterFieldsService } from '@wfm/shared/dynamic-entity-field/filter-fields.service';
import { AuthState, loggedInState } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import {
  WorkflowVisualPlanConfig,
  PlanUnitDataBinding,
  CreateWorkflowVisualPlanConfig,
  PlanUnit
} from '@wfm/service-layer/models/workflow-visual-plan.model';
import {
  CreateWorkflowVisualPlan,
  ResetVisualPlanOperations,
  UpdateWorkflowVisualPlan,
  visualPlanOperationSuccessSelector
} from '@wfm/store/workflow';

/**
 * local
 */
import { CanvasHelperService, CanvasObjectTypes, ColorOption, FabricNamespace } from '../../services/canvas.helper.service';
import { SaveEventData } from '../../workflow-states-visual-plan-view.component';
import { PlanUnitDataBindingComponent } from '../plan-unit-data-binding/plan-unit-data-binding.component';
import { defaultFillColor, defaultStrokeColor, PolygonDrawerService } from '../../services/polygon-drawer.service';
import { MatMenuTrigger } from '@angular/material/menu';

export interface UpdateListEventData {
  isUpdateList: boolean;
  id?: string;
}

@Component({
  selector: 'app-plan-editor-canvas',
  templateUrl: './plan-editor-canvas.component.html',
  styleUrls: ['./plan-editor-canvas.component.scss'],
  providers: [FilterFieldsService]
})
export class PlanEditorCanvasComponent extends TenantComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() schema: SchemaDto;
  @Input() visualPlanConfig$: Observable<WorkflowVisualPlanConfig>;
  @Input() resetCanvas$: Observable<boolean>;
  @Input() workflow: WorkflowDto;
  @Input() saveClickEvent: Observable<any>;
  @Output() updateListEmitter: EventEmitter<UpdateListEventData> = new EventEmitter();

  visualPlanConfig: WorkflowVisualPlanConfig;

  canvas: Canvas;
  selection: fabric.Object;
  brush: BaseBrush;
  bindings: { [key: string]: PlanUnitDataBinding } = {};
  activeBinding: PlanUnitDataBinding;
  auth: AuthState;
  canvasWidth: number;
  canvasHeight: number;
  maxAllowedFileSize: number = 10;
  planName: string;
  /**
   * unsavedChanges guard not implemented
   */
  hasUnsavedChangesPlan: boolean;
  allowedColors: ColorOption[];

  get polygonModeActive(): boolean {
    return this.polygonService.polygonMode;
  }

  get isDraggingMode(): boolean {
    return this.canvasHelper.isDragMode;
  }

  get canvasObjectTypes() {
    return CanvasObjectTypes;
  }
  zoomMessage: string;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setCanvasDimensions();
    this.canvas.height = this.canvasHeight;
    this.canvas.width = this.canvasWidth;
    this.canvas.renderAll();
  }

  constructor(
    private store: Store<AuthState>,
    private polygonService: PolygonDrawerService,
    private documentService: DocumentUploadService,
    private dialog: MatDialog,
    private ts: TranslateService,
    private snackBar: MatSnackBar,
    private canvasHelper: CanvasHelperService,
    private cd: ChangeDetectorRef
  ) {
    super(store);
    this.allowedColors = this.canvasHelper.getAllowedColors();
    this.zoomMessage = this.canvasHelper.desktopZoomMessage;
  }

  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((auth) => {
      this.auth = auth;
      this.getMaxDocumentSizeAllowed();
    });
    this.subscribeToOperationStatus();

    this.saveClickEvent.pipe(takeUntil(this.destroyed$)).subscribe((event: SaveEventData) => {
      if (event?.isSave) {
        this.saveVisualPlanConfig(event.newPlanName);
      }
    });

    this.resetCanvas$.pipe(takeUntil(this.destroyed$)).subscribe((res: boolean) => {
      if (res) this.resetCanvasClicked();
    });
  }

  openMenu(menuTrigger: MatMenuTrigger): void {
    menuTrigger.openMenu();
  }
  closeMenu(menuTrigger: MatMenuTrigger): void {
    menuTrigger.closeMenu();
  }

  ngAfterViewInit(): void {
    this.setCanvasDimensions();
    this.initCanvas();
    this.setCanvasMainEventHandlers();
    this.visualPlanConfig$.pipe(takeUntil(this.destroyed$)).subscribe((data: WorkflowVisualPlanConfig) => {
      this.visualPlanConfig = cloneDeep(data);
      if (this.canvas) {
        this.resetCanvas();
        this.bindings = {};
        this.loadCanvasFromVisualConfig();
      }
    });
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

  initCanvas(): void {
    this.canvas = new fabric.Canvas('yardBuilder', <ICanvasOptions>{
      width: this.canvasWidth,
      height: this.canvasHeight,
      backgroundColor: 'white',
      allowTouchScrolling: true
    });
    this.cd.detectChanges();
  }

  setCanvasMainEventHandlers(): void {
    this.canvas.on('selection:created', (event) => {
      this.getSelection(event);
    });

    this.canvas.on('selection:updated', (event) => {
      this.getSelection(event);
    });

    this.canvas.on('selection:cleared', (event) => {
      this.selection = null;
      this.cd.detectChanges();
    });

    this.canvas.on('path:created', (event) => {
      const drawnPath: fabric.Path = event['path'];
      this.addCustomProps(drawnPath);
      this.hasUnsavedChangesPlan = true;
    });

    this.canvas.on('object:modified', (event: fabric.IEvent) => {
      this.cd.detectChanges();
    });

    this.setZoomEvent();
    this.setMouseMoveEvent();
  }

  setZoomEvent(): void {
    this.canvasHelper.setZoomEvent(this.canvas);
  }

  setMouseMoveEvent(): void {
    this.canvasHelper.setMoveEvents(this.canvas, true);
  }

  getSelection(event): void {
    this.selection = this.canvas.getActiveObject();
    if (this.selection.type !== this.canvasObjectTypes.SELECTION) {
      this.setActiveDataBinding(this.selection);
    }
    this.cd.detectChanges();
  }

  newRect(): void {
    this.canvas.isDrawingMode = false;
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      stroke: defaultStrokeColor,
      fill: defaultFillColor,
      width: 100,
      height: 100
    });
    this.addCustomProps(rect);

    this.selection = rect;
    this.canvas.add(rect);
    this.hasUnsavedChangesPlan = true;
  }

  newCircle(): void {
    this.canvas.isDrawingMode = false;
    const circle = new fabric.Circle({
      left: 0,
      top: 0,
      stroke: defaultStrokeColor,
      fill: defaultFillColor,
      radius: 50
    });
    this.addCustomProps(circle);

    this.selection = circle;
    this.canvas.add(circle);
    this.hasUnsavedChangesPlan = true;
  }

  newPolygon(): void {
    this.canvas.isDrawingMode = false;

    this.polygonService.startPolygon(this.canvas);
    this.hasUnsavedChangesPlan = true;
  }

  changeFillColor(color: string): void {
    const activeObjects = this.canvas.getActiveObjects();
    this.canvasHelper.colorObjects(color, activeObjects, 'fill');

    this.canvas.requestRenderAll();
    this.hasUnsavedChangesPlan = true;
  }

  changeStrokeColor(color: string): void {
    const activeObjects = this.canvas.getActiveObjects();
    this.canvasHelper.colorObjects(color, activeObjects, 'stroke');
    this.canvas.requestRenderAll();
    this.hasUnsavedChangesPlan = true;
  }

  delete(): void {
    const confirm = this.dialog.open(PopupConfirmComponent, {
      width: '400px',
      data: {
        title: this.ts.instant('Remove Selection?'),
        message: this.ts.instant('Are you sure you want to remove the selection?')
      }
    });
    confirm.afterClosed().subscribe(async (result) => {
      if (result === true) {
        const activeObjects = this.canvas.getActiveObjects();
        activeObjects.forEach((obj) => {
          if (obj.isType(CanvasObjectTypes.IMAGE) && obj['id']) {
            this.documentService.removeFile(obj['id']);
          }
          this.canvas.remove(obj);
        });
        this.hasUnsavedChangesPlan = true;
        this.cd.detectChanges();
      }
    });
  }

  resetCanvasClicked(): void {
    const confirm = this.dialog.open(PopupConfirmComponent, {
      width: '400px',
      data: {
        title: this.ts.instant('Reset Canvas?'),
        message: this.ts.instant("Are you sure you want to reset the visual's configuration?")
      }
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result === true) {
        this.resetCanvas();
        this.bindings = {};
        this.hasUnsavedChangesPlan = true;
        this.cd.detectChanges();
      }
    });
  }

  resetCanvas(): void {
    this.canvasHelper.resetCanvas(this.canvas, this.canvasWidth, this.canvasHeight);
  }

  addText(): void {
    this.canvas.isDrawingMode = false;
    const defaultText = this.ts.instant('Tap and Type');

    const text = new fabric.IText(defaultText, {
      left: 0,
      top: 0,
      fontSize: 25
    });
    this.addCustomProps(text);
    this.canvas.add(text);
    this.hasUnsavedChangesPlan = true;
  }

  async onUpload(event: Event, isBackground: boolean): Promise<void> {
    try {
      this.canvas.isDrawingMode = false;

      const target = event.target as HTMLInputElement;
      const files = target.files as FileList;
      const file = files[0];
      if (this.isFilePassingValidation(file)) {
        const formData = new FormData();
        formData.append('file', file);
        const result = await this.documentService.upload(formData);
        const url = await this.documentService.buildImage(result.id, this.auth.sessionId);
        fabric.Image.fromURL(url, (img: fabric.Image) => {
          if (isBackground) {
            this.canvas.setBackgroundImage(<fabric.Image>img, this.canvas.renderAll.bind(this.canvas), <IImageOptions>{
              opacity: 0.8,
              top: 0,
              left: 0,
              scaleX: this.canvas.width / img.width,
              scaleY: this.canvas.height / img.height
            });
          } else {
            this.addCustomProps(img, result.id);
            this.canvas.add(img);
          }
          this.hasUnsavedChangesPlan = true;
        });
      }
    } catch (error) {
      console.log(error);
      this.snackBar.open(`${this.ts.instant('Failed to upload the selected file')}: ${error.toString()}`, 'OK', { duration: 5000 });
    }
  }

  isFilePassingValidation(file: File): boolean {
    const alowedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/bmp', 'image/gif', 'image/svg+xml'];
    if (alowedFormats.includes(file.type)) {
      if (file.size > this.maxAllowedFileSize * 1024 * 1024) {
        this.snackBar.open(`${this.ts.instant('Maximum allowed image size is')} ${this.maxAllowedFileSize} MB`, 'OK', { duration: 3000 });
        return false;
      }
      return true;
    }
    this.snackBar.open(`${this.ts.instant('Invalid image type')} ${file.type}`, 'OK', { duration: 3000 });
    return false;
  }

  removeBackground(): void {
    const src = (<fabric.Image>this.canvas.backgroundImage)?.getSrc();
    if (src) {
      const splits = src.split('/');
      const id = splits[splits.length - 1].split('?')[0];
      if (id) {
        this.documentService.removeFile(id);
      }
    }
    this.canvas.setBackgroundImage(null, this.canvas.renderAll.bind(this.canvas));
    this.hasUnsavedChangesPlan = true;
  }

  toggleDrawing(): void {
    if (this.canvas.isDrawingMode) {
      this.canvas.isDrawingMode = false;
    } else {
      this.canvas.isDrawingMode = true;
      this.canvas.freeDrawingBrush.color = defaultStrokeColor;
      this.canvas.freeDrawingBrush.width = 1.3;
    }
  }

  toggleDragging(): void {
    this.canvasHelper.isDragMode = !this.canvasHelper.isDragMode;
    if (this.canvasHelper.isDragMode) {
      this.canvas.defaultCursor = 'grab';
    } else {
      this.canvas.defaultCursor = 'default';
    }
  }

  copyObject(): void {
    if (this.selection.type !== this.canvasObjectTypes.SELECTION) {
      this.selection.clone((cloned: fabric.Object) => {
        delete cloned['id'];
        this.addCustomProps(cloned);
        cloned.left = 0;
        cloned.top = 0;
        this.canvas.add(cloned);
      });
    }
  }

  groupItems(): void {
    this.canvas.isDrawingMode = false;
    if (!this.canvas.getActiveObject() || this.canvas.getActiveObject().type !== this.canvasObjectTypes.SELECTION) {
      return;
    }
    const activeObjects = this.canvas.getActiveObjects();
    let anyDataBinding = false;
    for (let i = 0; i < activeObjects.length; i++) {
      const obj = activeObjects[i];
      const binding = this.bindings[obj['id']];
      if (binding?.fieldMappingsUI?.filters?.length) {
        anyDataBinding = true;
        break;
      }
    }
    if (anyDataBinding) {
      const confirm = this.dialog.open(PopupConfirmComponent, {
        width: '400px',
        data: {
          title: this.ts.instant('Group Units?'),
          message: this.ts.instant('Your bindings on separate Units will be lost.')
        }
      });
      confirm.afterClosed().subscribe(async (result) => {
        if (result === true) {
          this.processGrouping();
        }
      });
    } else {
      this.processGrouping();
    }
  }

  ungroupItems(): void {
    this.canvas.isDrawingMode = false;
    if (!this.canvas.getActiveObject() || this.canvas.getActiveObject().type !== CanvasObjectTypes.GROUP) {
      return;
    }
    const groupedObject = this.canvas.getActiveObject();
    const binding = this.bindings[groupedObject['id']];

    if (binding?.fieldMappingsUI?.filters?.length) {
      const confirm = this.dialog.open(PopupConfirmComponent, {
        width: '400px',
        data: {
          title: this.ts.instant('Ungroup?'),
          message: this.ts.instant('Your bindings on this Unit will be lost.')
        }
      });
      confirm.afterClosed().subscribe(async (result) => {
        if (result === true) {
          this.processUngrouping();
        }
      });
    } else {
      this.processUngrouping();
    }
  }

  processGrouping(): void {
    const group = (<fabric.ActiveSelection>this.canvas.getActiveObject()).toGroup();
    this.canvas.requestRenderAll();
    this.addCustomProps(group);
  }

  processUngrouping(): void {
    (<fabric.Group>this.canvas.getActiveObject()).toActiveSelection();
    this.canvas.requestRenderAll();
  }

  moveToTop(): void {
    this.canvas.bringToFront(this.selection);
  }

  addCustomProps(canvasObject: Object, explicitId?: string): void {
    canvasObject.toObject = (function (toObject) {
      return function () {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })(canvasObject.toObject);
    if (!canvasObject['id']) {
      if (explicitId) {
        canvasObject['id'] = explicitId;
      } else {
        canvasObject['id'] = Guid.createQuickGuid().toString();
      }
    }
  }

  zoomOut(e: Event): void {
    e.stopPropagation();
    this.canvasHelper.zoomOut(this.canvas);
  }

  zoomIn(e: Event): void {
    e.stopPropagation();
    this.canvasHelper.zoomIn(this.canvas);
  }

  resetZoom(e: Event): void {
    e.stopPropagation();
    this.canvasHelper.resetZoom(this.canvas);
  }

  setActiveDataBinding(canvasObject: Object): void {
    const id = canvasObject['id'];
    this.activeBinding = this.bindings[id];
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
          (canvasItems: fabric.Object[]) => {
            canvasItems.forEach((item) => {
              this.addCustomProps(item);
              this.canvas.add(item);
            });
            this.canvas.renderAll();
          },
          ''
        );
      });
    }
  }

  async saveVisualPlanConfig(newPlanName: string): Promise<void> {
    const canvasData = this.canvas.toObject();
    const canvasItems: fabric.Object[] = cloneDeep(this.canvas.getObjects());
    const planUnits = this.visualPlanConfig?.units || [];
    canvasData.objects = [];

    const dto: CreateWorkflowVisualPlanConfig = {
      name: newPlanName,
      tenantId: this.tenant,
      workflowSchemaId: this.workflow.id,
      canvas: JSON.stringify(canvasData),
      units: canvasItems.map((item) => {
        const dataBinding = cloneDeep(this.bindings[item['id']]) || ({ name: '', color: '' } as PlanUnitDataBinding);
        if (dataBinding.fieldMappingsUI?.filters?.length) {
          dataBinding.fieldMappings = JSON.stringify(dataBinding.fieldMappingsUI);
        } else {
          dataBinding.fieldMappings = '';
        }
        delete dataBinding.fieldMappingsUI;
        const unitDataDto: PlanUnit = {
          canvasObjectId: item['id'],
          canvasObject: JSON.stringify(item),
          dataBinding: dataBinding
        };
        const existingUnit = planUnits.find((unit) => unit.canvasObjectId === item['id']);
        if (existingUnit && existingUnit.id) {
          unitDataDto.id = existingUnit.id;
        }
        return unitDataDto;
      })
    };

    if (this.visualPlanConfig?.workflowVisualPlanId) {
      (<WorkflowVisualPlanConfig>dto).workflowVisualPlanId = this.visualPlanConfig?.workflowVisualPlanId;
      this.store.dispatch(new UpdateWorkflowVisualPlan({ data: <WorkflowVisualPlanConfig>dto }));
    } else {
      this.store.dispatch(new CreateWorkflowVisualPlan({ data: dto }));
    }
  }

  subscribeToOperationStatus(): void {
    this.store
      .pipe(
        select(visualPlanOperationSuccessSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (visualId: string) => {
        this.hasUnsavedChangesPlan = false;
        this.snackBar.open(
          `${this.ts.instant('Visual')} ${
            this.visualPlanConfig?.workflowVisualPlanId ? this.ts.instant('Updated') : this.ts.instant('Created')
          }`,
          'OK',
          { duration: 3000 }
        );
        this.store.dispatch(new ResetVisualPlanOperations());
        this.updateListEmitter.emit({ isUpdateList: true, id: visualId });
      });
  }

  saveDataBinding(dataBinding: PlanUnitDataBinding): void {
    this.bindings[dataBinding.unitId] = this.activeBinding = dataBinding;
    this.hasUnsavedChangesPlan = true;
  }

  isButtonDisabled(toolKey: string): boolean {
    if (this.polygonModeActive || this.isDraggingMode) {
      return true;
    }
    switch (toolKey) {
      // case 'zoomOut':
      //   break;
      // case 'wallpaper':
      //   break;
      // case 'rectangle':
      //   break;
      // case 'draw':
      //   break;
      // case 'polygon':
      //   break;
      // case 'text':
      //   break;
      // case 'picture':
      //   break;
      case 'color':
        if (!this.canvas.getActiveObject()) {
          return true;
        }
        break;
      case 'moveTop':
      case 'copy':
      case 'remove':
        if (!this.canvas.getActiveObject()) {
          return true;
        }
        break;
      case 'group':
        if (!this.canvas.getActiveObject() || this.canvas.getActiveObject().type !== CanvasObjectTypes.SELECTION) {
          return true;
        }
        break;
      case 'ungroup':
        if (!this.canvas.getActiveObject() || this.canvas.getActiveObject().type !== CanvasObjectTypes.GROUP) {
          return true;
        }
        break;

      case 'save':
        break;

      default:
        break;
    }
    return false;
  }

  getMaxDocumentSizeAllowed(): void {
    const settings = this.auth.currentTenantSystem.tenantSettings;
    const documentSetting = settings.find(
      (x) => x.key === `${tenantDocumentManagementSettingKey}_${this.auth.currentTenantSystem.tenant.tenantId}`
    );
    if (documentSetting) {
      this.maxAllowedFileSize = documentSetting.value?.fileSize;
    }
  }

  openDataBindings(): void {
    const dialogRef = this.dialog.open(PlanUnitDataBindingComponent, {
      width: '400px',
      disableClose: true
    });
    dialogRef.componentInstance.schema = this.schema;
    dialogRef.componentInstance.unitId = this.selection['id'];
    dialogRef.componentInstance.binding = this.activeBinding;
    dialogRef.componentInstance.unit = this.selection;
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        this.saveDataBinding(result.data);
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.canvas.dispose();
  }
}
