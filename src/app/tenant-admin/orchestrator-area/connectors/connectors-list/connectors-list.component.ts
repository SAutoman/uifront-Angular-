/**
 * global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration } from '@wfm/service-layer';
import { WorkflowSchemaConnectorEntity } from '@wfm/service-layer/models/orchestrator';
import { defaultConnectorsGridSettings } from '@wfm/shared/default-grid-settings';
import { GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import {
  DeleteConnector,
  GetAllConnectors,
  OrchestratorState,
  ResetConnectorOperationMsg,
  selectConnectorOperationMsg,
  selectConnectors
} from '@wfm/store/orchestrator';
/**
 * local
 */
import { ConnectorItemComponent } from '../connector-item/connector-item.component';
interface ConnectorGridData {
  id: string;
  name: string;
  source: string;
  destination: string;
  createdAt: Date;
}

@Component({
  selector: 'app-connectors-list',
  templateUrl: './connectors-list.component.html',
  styleUrls: ['./connectors-list.component.scss']
})
export class ConnectorsListComponent implements OnInit, OnDestroy {
  workflowConnectors: WorkflowSchemaConnectorEntity[];
  connectorsGridSettings: GridConfiguration = defaultConnectorsGridSettings;

  gridData: GridDataResultEx<ConnectorGridData>;
  gridActions: GridAction[];

  private destroyed$ = new Subject<any>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store<OrchestratorState>,
    private ts: TranslateService
  ) {}

  ngOnInit() {
    this.getAllConnectors();
    this.subscribeToStore();
    this.gridActions = [
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'delete',
        color: 'warn'
      }
    ];
    this.store.pipe(select(selectConnectorOperationMsg), takeUntil(this.destroyed$)).subscribe((msg) => {
      if (msg && msg?.toLowerCase().includes('success')) {
        this.snackBar.open(msg, this.ts.instant('Ok'), { duration: 3000 });
        this.store.dispatch(new ResetConnectorOperationMsg());
        this.getAllConnectors();
      }
    });
  }

  getAllConnectors(): void {
    this.store.dispatch(new GetAllConnectors());
  }

  createConnector(): void {
    const dialogRef = this.dialog.open(ConnectorItemComponent, {
      width: '600px',
      data: this.workflowConnectors
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.getAllConnectors();
      }
    });
  }

  async subscribeToStore(): Promise<void> {
    this.store.pipe(select(selectConnectors), takeUntil(this.destroyed$)).subscribe((data) => {
      this.workflowConnectors = null;
      if (data) {
        this.workflowConnectors = data;
        this.gridData = {
          data: this.workflowConnectors?.map((item) => {
            return <ConnectorGridData>{
              id: item.id,
              name: item.name,
              source: `Tenant: ${item.workflowSchemaSource.tenantName}, Workflow: ${item.workflowSchemaSource.name}`,
              destination: `Tenant: ${item.workflowSchemaDestination.tenantName}, Workflow: ${item.workflowSchemaDestination.name}`,
              createdAt: item.createdAt
            };
          }),
          total: this.workflowConnectors.length
        };
      }
    });
  }

  deleteConnector(connectorId: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(async (x) => {
        if (x) {
          this.store.dispatch(new DeleteConnector({ id: connectorId }));
        }
      });
  }

  onActionClick(event: { actionId: string; raw: ConnectorGridData }): void {
    switch (event.actionId) {
      case 'delete':
        this.deleteConnector(event.raw?.id);
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
