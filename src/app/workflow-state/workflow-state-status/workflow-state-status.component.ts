/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { sortBy, cloneDeep } from 'lodash-core';
/**
 * project
 */

import { UpdateStatusCommand, WorkflowStateUI, WorkflowStatusDto } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { UpdateWorkflowStateStatus, workflowStateSelector } from '@wfm/store/workflow';
/**
 * local
 */
import { WorkflowStateUiService } from '../workflow-state-ui.service';

@Component({
  selector: 'app-workflow-state-status',
  templateUrl: './workflow-state-status.component.html',
  styleUrls: ['./workflow-state-status.component.scss']
})
export class WorkflowStateStatusComponent extends TenantComponent implements OnInit {
  workflowState: WorkflowStateUI;
  statuses: WorkflowStatusDto[];
  componentId = '081d37e1-65e7-4453-9d33-4968c1b0f840';

  constructor(private store: Store<ApplicationState>, private wfStateUiService: WorkflowStateUiService) {
    super(store);
  }

  ngOnInit(): void {
    this.initState();
  }

  initState(): void {
    this.store
      .select(workflowStateSelector)
      .pipe(
        filter((wfState) => !!wfState),
        takeUntil(this.destroyed$)
      )
      .subscribe((wfState) => {
        this.workflowState = cloneDeep(wfState);
        this.statuses = sortBy(this.workflowState.statuses, [(x: WorkflowStatusDto) => x.position]);
      });
  }

  onStatusClicked(status: WorkflowStatusDto): void {
    this.wfStateUiService
      .userWantsToProceed('Update Status?', 'updating status')
      .pipe(take(1))
      .subscribe((response: boolean) => {
        if (response) {
          const cmd = <UpdateStatusCommand>{
            statusId: status.id,
            workflowStateId: this.workflowState.id,
            tenantId: this.tenant,
            schemaId: this.workflowState.workflowId
          };
          this.store.dispatch(new UpdateWorkflowStateStatus({ data: cmd }));
        }
      });
  }
}
