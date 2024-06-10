/**
 * global
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { Roles, SchemaDto, SharedService, WorkflowDto } from '@wfm/service-layer';
import { WorkflowVisualPlanConfig } from '@wfm/service-layer/models/workflow-visual-plan.model';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { TenantSystem } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import {
  allVisualPlanConfigsSelector,
  DeleteWorkflowVisualPlan,
  GetWorkflowVisualPlanList,
  ResetVisualPlanOperations,
  visualPlanConfigsLoadingSelector,
  visualPlanDeleteSuccessSelector,
  visualPlanErrorSelector
} from '@wfm/store/workflow';

/**
 * local
 */
import { UpdateListEventData } from './plan-editor/plan-editor-canvas/plan-editor-canvas.component';
import { CanvasHelperService } from './services/canvas.helper.service';
import { MediaMatcher } from '@angular/cdk/layout';

export interface SaveEventData {
  isSave: boolean;
  newPlanName?: string;
}

@Component({
  selector: 'app-workflow-states-visual-plan-view',
  templateUrl: './workflow-states-visual-plan-view.component.html',
  styleUrls: ['./workflow-states-visual-plan-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkflowStatesVisualPlanViewComponent extends TenantComponent implements OnInit, OnDestroy {
  mobileQuery: MediaQueryList;
  @ViewChild('newPlanNameElement') newPlanNameElement;
  // @ViewChild('canvasTools') canvasTools: ElementRef;
  // @ViewChild('canvasTools', { static: false, read: ElementRef }) canvasTools: ElementRef<HTMLElement>;
  @Input() schema: SchemaDto;
  @Input() workflow: WorkflowDto;
  @Input('tenantInfo') tenantSystem: TenantSystem;
  @Input() showRawData: boolean;
  @Input() showCreateCaseButton: boolean;
  @Input() showProcessButton: boolean;
  @Input() showEditButton: boolean;

  @Output() openCaseCreateDialogue: EventEmitter<string> = new EventEmitter<string>();

  selectedVisualPlanConfig: WorkflowVisualPlanConfig;
  selectedVisualPlanConfigId: string;
  selectedVisualPlanConfig$ = new BehaviorSubject(null);
  resetVisualPlan$ = new BehaviorSubject(false);
  allVisualPlanConfigs: WorkflowVisualPlanConfig[] = [];
  isEditMode = false;
  isViewMode = false;
  isSetupMode = false;
  loading$: Observable<boolean>;
  saveClicked$ = new Subject<SaveEventData>();
  newPlanName: string = 'Untitled Visual';
  userRole: Roles;
  selectedVisualId: string;
  zoomMessage: string;
  activeEdit = false;
  activeView = false;
  activeRename = false;
  lastButtonText: string = '';
  lastActiveEdit: boolean = false;
  lastActiveView: boolean = false;

  get roles() {
    return Roles;
  }

  constructor(
    private store: Store<ApplicationState>,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private ts: TranslateService,
    private canvasHelper: CanvasHelperService,
    media: MediaMatcher,
    private changeDetectorRef: ChangeDetectorRef,
    public sharedService: SharedService
  ) {
    super(store);
    this.mobileQuery = media.matchMedia('(min-width: 1280px)');

    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
    this.mobileQuery.onchange = (e) => {
      this.sharedService.updateMobileQuery.next(e.matches);
    };
  }

  ngOnInit(): void {
    this.sharedService.updateMobileQuery.next(this.mobileQuery.matches);
    this.zoomMessage = this.canvasHelper.desktopZoomMessage;
    this.userRole = this.tenantSystem.tenant.roleNum;
    this.subscribeToVisualConfigState();
    this.subscribeToOperationMessages();
    this.loading$ = this.store.select(visualPlanConfigsLoadingSelector);
  }

  private mobileQueryListener(): void {
    this.changeDetectorRef?.detectChanges();
  }

  resetCanvasClicked(): void {
    this.resetVisualPlan$.next(true);
  }

  subscribeToVisualConfigState(): void {
    this.store
      .select(allVisualPlanConfigsSelector)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((configs) => {
        this.setSelectedPlan(null);
        this.allVisualPlanConfigs = cloneDeep(configs);

        if (this.allVisualPlanConfigs?.length) {
          this.isSetupMode = false;
          if (this.selectedVisualId) {
            this.setSelectedPlan(this.allVisualPlanConfigs.find((v) => v.workflowVisualPlanId === this.selectedVisualId));
          } else {
            this.setSelectedPlan(this.allVisualPlanConfigs[0]);
          }
          this.isEditMode = false;
          this.lastButtonText = 'view';
          this.manageActionSelection();
        } else {
          // if no ready plans, show an empty screen, let the user decide: create one or not
          this.toggleTheButtons('');
          this.isEditMode = false;
          this.isSetupMode = false;
        }
        this.cd.detectChanges();
      });
  }

  manageActionSelection(): void {
    switch (this.lastButtonText) {
      case 'edit':
        this.toggleEdit();
        break;
      case 'view':
        this.toggleViewCanvas();
        break;
      default:
        this.toggleViewCanvas();
        break;
    }
  }

  createVisual(): void {
    this.setSelectedPlan(null);
    this.newPlanName = 'Untitled Visual';

    setTimeout(() => {
      this.focusCursorOnNameInput();
    }, 1000);

    this.isSetupMode = true;
    this.toggleTheButtons('rename');
    this.activeEdit = true;

    this.cd.detectChanges();
    this.isEditMode = false;
  }

  focusCursorOnNameInput(): void {
    if (this.newPlanNameElement) {
      const end = this.newPlanNameElement.nativeElement.textContent.length;
      let text = this.newPlanNameElement.nativeElement.childNodes[0];
      let range = new Range();
      let selection = document.getSelection();
      range.setStart(text, end);
      range.setEnd(text, end);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  onVisualSelection(event: MatSelectChange): void {
    this.isSetupMode = false;
    this.isEditMode = false;
    this.setSelectedPlan(this.allVisualPlanConfigs.find((v) => v.workflowVisualPlanId === event.value));
    this.activeView = true;
    this.activeRename = false;
    this.activeEdit = false;
    this.lastButtonText = 'view';
    this.cd.detectChanges();
  }

  planNameInputKeyup(e: any): void {
    let target = e.target;
    if (target) this.newPlanName = target?.textContent;
  }

  renameVisualPlan(): void {
    this.activeRename = true;
    this.isSetupMode = false;
    this.toggleTheButtons('rename');

    this.lastActiveEdit = false;
    this.lastActiveView = false;
    this.isEditMode = true;
    switch (this.lastButtonText) {
      case 'edit':
        this.lastActiveEdit = true;
        this.isViewMode = false;
        break;
      case 'view':
        this.isViewMode = true;
        this.lastActiveView = true;
        break;
    }
  }

  saveVisualPlanConfig(): void {
    this.saveClicked$.next({ isSave: true, newPlanName: this.newPlanName });
    this.lastActiveEdit = false;
    this.lastActiveView = false;
  }

  toggleViewCanvas(): void {
    this.isSetupMode = false;
    this.lastActiveEdit = false;
    this.isEditMode = false;
    this.lastButtonText = 'view';
    this.toggleTheButtons('view');
    this.newPlanName = this.selectedVisualPlanConfig?.name;
  }

  toggleTheButtons(action: string): void {
    this.activeEdit = false;
    this.activeView = false;
    this.activeRename = false;
    switch (action) {
      case 'edit':
        this.activeEdit = true;
        break;
      case 'view':
        this.activeView = true;
        break;
      case 'rename':
        this.activeRename = true;
        setTimeout(() => {
          this.focusCursorOnNameInput();
        }, 1000);
        break;
    }
  }

  enableEditMode(): void {
    this.lastActiveEdit = false;
    this.lastActiveView = false;
    this.isSetupMode = false;
    this.isEditMode = true;
    this.activeRename = false;
  }

  toggleEdit(): void {
    this.lastButtonText = 'edit';
    this.toggleTheButtons('edit');
    this.enableEditMode();
    this.newPlanName = this.selectedVisualPlanConfig?.name;
  }

  async deleteVisualPlan(): Promise<void> {
    const confirm = this.dialog.open(PopupConfirmComponent, {
      width: '400px',
      data: {
        title: this.ts.instant('Delete Visual?'),
        message: this.ts.instant('Are you sure you want to delete this visual?')
      }
    });

    confirm.afterClosed().subscribe(async (result) => {
      if (result) {
        this.store.dispatch(
          new DeleteWorkflowVisualPlan({
            workflowId: this.workflow.id,
            visualConfigId: this.selectedVisualPlanConfig.workflowVisualPlanId,
            tenantId: this.tenant
          })
        );
      }
    });
  }

  updateList(data: UpdateListEventData): void {
    if (data.isUpdateList) {
      this.setSelectedPlan(null);

      this.getVisualPlanConfigs(data.id);
    }
  }

  getVisualPlanConfigs(visualId?: string): void {
    this.selectedVisualId = visualId;
    this.store.dispatch(new GetWorkflowVisualPlanList({ tenantId: this.tenant, workflowId: this.workflow.id }));
  }

  setSelectedPlan(plan: WorkflowVisualPlanConfig): void {
    this.selectedVisualPlanConfig = plan;
    this.selectedVisualPlanConfigId = this.selectedVisualPlanConfig?.workflowVisualPlanId;
    this.newPlanName = this.selectedVisualPlanConfig?.name;
    if (this.selectedVisualPlanConfig) {
      this.mapVisualPlanToUi(this.selectedVisualPlanConfig);
    }
    this.selectedVisualPlanConfig$.next(this.selectedVisualPlanConfig);
  }

  mapVisualPlanToUi(plan: WorkflowVisualPlanConfig): void {
    plan.units.forEach((unit) => {
      if (unit.dataBinding) {
        unit.dataBinding.unitId = unit.canvasObjectId;
        if (unit.dataBinding.fieldMappings) {
          try {
            unit.dataBinding.fieldMappingsUI = JSON.parse(unit.dataBinding.fieldMappings);
          } catch (error) {
            unit.dataBinding.fieldMappingsUI = { filters: [] };
          }
        }
      }
    });
  }

  subscribeToOperationMessages(): void {
    this.store
      .pipe(
        select(visualPlanDeleteSuccessSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe(async (visualId: string) => {
        this.snackBar.open(this.ts.instant('Visual Plan Deleted'), 'OK', { duration: 3000 });
        this.store.dispatch(new ResetVisualPlanOperations());
        this.setSelectedPlan(null);
        this.getVisualPlanConfigs();
      });

    this.store
      .pipe(
        select(visualPlanErrorSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.store.dispatch(new ResetVisualPlanOperations());
      });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }
}
