/**
 * Global
 */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { KeyValue } from '@angular/common';
import { cloneDeep } from 'lodash-core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';

/**
 * Project
 */
import {
  CreateOrchestratorActionEntityDto,
  CreateOrchestratorEntityDto,
  OrchestratorActionEventTypesEnum,
  OrchestratorEntity,
  UpdateOrchestratorActionEntityDto,
  UpdateOrchestratorEntityDto,
  WorkflowSchemaConnectorEntity
} from '@wfm/service-layer/models/orchestrator';
import {
  AddOrchestratorAction,
  CreateOrchestrator,
  DeleteOrchestratorAction,
  GetAllConnectors,
  GetOrchestratorActionEventTypes,
  GetOrchestratorById,
  OrchestratorBulkUpdateActions,
  OrchestratorState,
  ResetOrchestratorOperationMsg,
  ResetSelectedOrchestrator,
  selectConnectors,
  selectCurrentOrchestrator,
  selectOrchestratorActionEventTypes,
  selectOrchestratorOperationMsg,
  UpdateOrchestrator,
  UpdateOrchestratorAction
} from '@wfm/store/orchestrator';

/**
 * Local
 */

@Component({
  selector: 'app-orchestrator-item',
  templateUrl: './orchestrator-item.component.html',
  styleUrls: ['./orchestrator-item.component.scss']
})
export class OrchestratorItemComponent implements OnInit {
  form: FormGroup;
  actions: CreateOrchestratorActionEntityDto[] = [];
  connectors: WorkflowSchemaConnectorEntity[];
  events: KeyValue<OrchestratorActionEventTypesEnum, string>[];
  orchestratorId?: string;
  orchestrator: OrchestratorEntity;
  actionDto: CreateOrchestratorActionEntityDto;
  hideActionBuilder: boolean = true;
  actionOrder: number;
  private destroyed$ = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<OrchestratorState>,
    private ts: TranslateService
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
    this.orchestratorId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.orchestratorId) {
      this.getOrchestrator(this.orchestratorId);

      this.store.pipe(select(selectCurrentOrchestrator), takeUntil(this.destroyed$)).subscribe((x) => {
        if (x) {
          this.orchestrator = cloneDeep(x);
          this.updateForm();
        }
      });
    }
    this.getTriggerEvents();
    this.store.dispatch(new GetAllConnectors());

    this.store.pipe(select(selectOrchestratorOperationMsg), takeUntil(this.destroyed$)).subscribe((msg) => {
      if (msg && msg.toLowerCase().includes('success')) {
        if (!this.orchestratorId) {
          const msgDetails: string[] = msg.split('-');
          this.snackBar.open(msgDetails[0], this.ts.instant('Ok'), { duration: 3000 });
          this.router.navigate(['..', 'edit', msgDetails[1]], {
            relativeTo: this.activatedRoute
          });
        } else {
          this.snackBar.open(msg, this.ts.instant('Ok'), { duration: 3000 });
          this.getOrchestrator(this.orchestratorId);
        }
      }
      this.store.dispatch(new ResetOrchestratorOperationMsg());
    });
    this.store.pipe(select(selectConnectors), takeUntil(this.destroyed$)).subscribe((x) => {
      this.connectors = x?.length ? x : [];
    });
  }

  getOrchestrator(id: string): void {
    if (id) {
      this.getOrchestratorById(id);
    }
  }

  getOrchestratorById(id: string): void {
    this.store.dispatch(new GetOrchestratorById({ id: id }));
  }

  toggle(): void {
    this.hideActionBuilder = !this.hideActionBuilder;
    if (this.hideActionBuilder) {
      this.actionDto = null;
    } else {
      this.actionOrder = this.actions?.length ? this.actions[this.actions.length - 1].order + 1 : 0;
    }
  }

  updateForm(): void {
    this.form.patchValue({ name: this.orchestrator.name });
    this.actions = this.orchestrator.orchestratorActions
      .sort((a, b) => a.order - b.order)
      .map((action) => {
        return {
          ...action,
          workflowSchemaConnectorId: action.workflowSchemaConnector.id
        };
      });
  }

  createOrchestrator(): void {
    const dto: CreateOrchestratorEntityDto = {
      name: this.form.get('name').value,
      orchestratorActions: this.actions
    };
    this.store.dispatch(new CreateOrchestrator({ data: dto }));
  }

  updateOrchestrator(): void {
    const dto: UpdateOrchestratorEntityDto = {
      name: this.form.get('name').value,
      id: this.orchestrator.id
    };
    this.store.dispatch(new UpdateOrchestrator({ data: dto }));
  }

  getTriggerEvents(): void {
    this.store.dispatch(new GetOrchestratorActionEventTypes());
    this.store.pipe(select(selectOrchestratorActionEventTypes), takeUntil(this.destroyed$)).subscribe((x) => {
      this.events = x?.length ? x : [];
    });
  }

  onActionDrag(e: CdkDragDrop<CreateOrchestratorActionEntityDto[]>): void {
    if (e.previousContainer === e.container && e.previousIndex !== e.currentIndex) {
      const reorderedData: CreateOrchestratorActionEntityDto[] = cloneDeep(e.container.data);
      moveItemInArray(reorderedData, e.previousIndex, e.currentIndex);
      this.actions = this.updateActionsOrders(reorderedData);
      if (this.orchestratorId) {
        this.updateActions();
      }
    }
  }

  updateActions(): void {
    const updateDto: UpdateOrchestratorActionEntityDto[] = this.actions.map((action) => {
      return {
        id: action['id'],
        name: action.name,
        order: action.order,
        orchestratorActionEventType: action.orchestratorActionEventType,
        workflowSchemaConnectorId: action.workflowSchemaConnectorId,
        orchestratorActionConfigurationJson: action.orchestratorActionConfigurationJson
      };
    });
    this.store.dispatch(
      new OrchestratorBulkUpdateActions({
        orchestratorId: this.orchestratorId,
        data: updateDto
      })
    );
  }

  openAction(action?: CreateOrchestratorActionEntityDto, index?: number): void {
    if (action) {
      this.actionDto = action;
    }
    this.hideActionBuilder = false;
    this.actionOrder = this.actions?.length ? this.actions[this.actions.length - 1].order + 1 : 0;
  }

  addAction(action: CreateOrchestratorActionEntityDto): void {
    this.store.dispatch(new AddOrchestratorAction({ orchestratorId: this.orchestratorId, data: action }));
  }

  updateAction(action: UpdateOrchestratorActionEntityDto): void {
    this.store.dispatch(new UpdateOrchestratorAction({ data: action }));
  }

  onRemoveClicked(action: CreateOrchestratorActionEntityDto, index: number): void {
    if (this.orchestratorId) {
      this.deleteAction(action, index);
      this.actions.splice(index, 1);
    } else {
      this.actions.splice(index, 1);
      this.actions = this.updateActionsOrders(this.actions);
    }
    this.actionDto = null;
    this.hideActionBuilder = true;
  }

  deleteAction(action: CreateOrchestratorActionEntityDto, index): void {
    this.store.dispatch(new DeleteOrchestratorAction({ actionId: action['id'] }));
  }

  private updateActionsOrders(items: CreateOrchestratorActionEntityDto[]): CreateOrchestratorActionEntityDto[] {
    const clonedItems = cloneDeep(items);
    clonedItems.forEach((x, idx) => {
      if (x.order !== idx) {
        x.order = idx;
      }
    });
    return clonedItems;
  }

  onActionReceived(action: CreateOrchestratorActionEntityDto | UpdateOrchestratorActionEntityDto): void {
    if (action) {
      if (this.orchestratorId) {
        if (action['id']) {
          this.updateAction(action as UpdateOrchestratorActionEntityDto);
        } else {
          this.addAction(action);
        }
      } else {
        if (!action['id'] && this.actionDto) {
          const index = this.actions.findIndex((x) => x.order === action.order);
          if (index >= 0) {
            this.actions[index] = cloneDeep(action);
          }
        } else {
          this.actions.push(action);
        }
      }
    }
    this.hideActionBuilder = true;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ResetSelectedOrchestrator());
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
