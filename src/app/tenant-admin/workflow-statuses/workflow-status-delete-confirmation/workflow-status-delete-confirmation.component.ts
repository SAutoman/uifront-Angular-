import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { WorkflowBuilderState } from '@wfm/store/workflow-builder/workflow-builder.reducer';

@Component({
  selector: 'app-workflow-status-delete-confirmation',
  templateUrl: './workflow-status-delete-confirmation.component.html',
  styleUrls: ['./workflow-status-delete-confirmation.component.scss']
})
export class WorkflowStatusDeleteConfirmationComponent extends TenantComponent implements OnInit {
  get isDeleteAllowed(): boolean {
    return !this.data?.workflowNames?.length && !this.data?.showDynamicEntityUsageMsg;
  }

  constructor(
    store: Store<WorkflowBuilderState>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      workflowNames: string[];
      showDynamicEntityUsageMsg: boolean;
      rawDataCountForStatus: number;
      casesCountForStatus: number;
    }
  ) {
    super(store);
  }

  ngOnInit(): void {}

  getTitle(): string {
    return this.data?.workflowNames?.length > 0 || this.data?.showDynamicEntityUsageMsg
      ? 'Warning - This status can not be removed'
      : 'Confirm Delete';
  }
}
