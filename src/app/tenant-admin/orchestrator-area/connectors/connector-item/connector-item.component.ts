/**
 * Global
 */
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep } from 'lodash-core';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
/**
 * Project
 */
import { ConnectorSide, CrossTenantWorkflowSchemaGroup, WorkflowSchemaConnectorEntity } from '@wfm/service-layer/models/orchestrator';
import {
  CreateConnector,
  GetAllAccessibleWorkflows,
  OrchestratorState,
  ResetConnectorOperationMsg,
  selectAllWorkflows,
  selectConnectorOperationMsg
} from '@wfm/store/orchestrator';

/**
 * local
 */
interface TenantWorkflowsOptions {
  tenantName: string;
  workflows: ConnectorWorkflow[];
}

interface ConnectorWorkflow {
  id: string;
  name: string;
  caseSchemaId: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-connector-item',
  templateUrl: './connector-item.component.html',
  styleUrls: ['./connector-item.component.scss']
})
export class ConnectorItemComponent implements OnInit, OnDestroy {
  tenantWorkflowOptions: CrossTenantWorkflowSchemaGroup[] = [];
  connectorForm: FormGroup;
  sourceOptions: TenantWorkflowsOptions[];
  destinationOptions: TenantWorkflowsOptions[];
  private destroyed$ = new Subject<any>();

  sources: Observable<TenantWorkflowsOptions[]>;
  destinations: Observable<TenantWorkflowsOptions[]>;

  sourceCtrl: FormControl = new FormControl(null);
  destinationCtrl: FormControl = new FormControl(null);
  selectedSourceOption: string;
  selectedDestinationOption: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ConnectorItemComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private dialogData: WorkflowSchemaConnectorEntity[],
    private ts: TranslateService,
    private store: Store<OrchestratorState>
  ) {}

  ngOnInit() {
    this.getAllAccessibleWorkflows();
    this.connectorForm = this.fb.group({
      name: ['', Validators.required],
      source: [null, Validators.required],
      destination: [null, Validators.required]
    });
    this.subscribeToStore();
  }

  subscribeToStore(): void {
    this.store.pipe(select(selectConnectorOperationMsg), takeUntil(this.destroyed$)).subscribe((msg) => {
      if (msg && msg?.toLowerCase().includes('success')) {
        this.snackBar.open(msg, this.ts.instant('Ok'), { duration: 3000 });
        this.dialogRef.close();
        this.store.dispatch(new ResetConnectorOperationMsg());
      }
    });
    this.store.pipe(select(selectAllWorkflows), takeUntil(this.destroyed$)).subscribe((x) => {
      this.tenantWorkflowOptions = null;
      if (x) {
        this.tenantWorkflowOptions = x;
        this.sourceOptions = this.tenantWorkflowOptions
          .filter((item) => item.crossTenantWorkflowSchemas.length)
          .map((item) => {
            return <TenantWorkflowsOptions>{
              tenantName: item.tenantName,
              workflows: item.crossTenantWorkflowSchemas.map((w) => {
                return {
                  id: w.workflowSchemaId,
                  name: w.name,
                  disabled: false
                };
              })
            };
          });
        this.destinationOptions = cloneDeep(this.sourceOptions);

        this.sources = this.sourceCtrl.valueChanges.pipe(
          startWith(''),
          takeUntil(this.destroyed$),
          map((value) => this._filterOptions(ConnectorSide.Source, value))
        );
        this.destinations = this.destinationCtrl.valueChanges.pipe(
          startWith(''),
          takeUntil(this.destroyed$),
          map((value) => this._filterOptions(ConnectorSide.Destination, value))
        );
      }
    });
  }

  _filter = (opts: ConnectorWorkflow[], value: string): ConnectorWorkflow[] => {
    const filterValue = value.toLowerCase();
    return opts.filter((item) => item.name?.toLowerCase().includes(filterValue));
  };

  private _filterOptions(type: ConnectorSide, value: string): TenantWorkflowsOptions[] {
    if (type && value?.trim()?.length) {
      if (type === ConnectorSide.Source)
        return this.sourceOptions
          .map((tenant) => ({ tenantName: tenant.tenantName, workflows: this._filter(tenant.workflows, value) }))
          .filter((tenant) => tenant.workflows.length > 0);
      else
        return this.destinationOptions
          .map((tenant) => ({ tenantName: tenant.tenantName, workflows: this._filter(tenant.workflows, value) }))
          .filter((tenant) => tenant.workflows.length > 0);
    }
    return type === ConnectorSide.Source ? this.sourceOptions : this.destinationOptions;
  }

  getAllAccessibleWorkflows(): void {
    this.store.dispatch(new GetAllAccessibleWorkflows());
  }

  // (no repeating pair of source-destination within different connectors)
  createConnector(): void {
    const formValue = this.connectorForm.value;
    this.store.dispatch(
      new CreateConnector({
        data: {
          name: formValue.name,
          workflowSchemaSourceId: formValue.source,
          workflowSchemaDestinationId: formValue.destination
        }
      })
    );
  }

  onSourceChanged(event: MatSelectChange): void {
    this.selectedSourceOption = event.value;
    this.disableWorkflows(event.value, ConnectorSide.Destination);
  }

  onDestinationChanged(event: MatSelectChange): void {
    this.selectedDestinationOption = event.value;
    this.disableWorkflows(event.value, ConnectorSide.Source);
  }

  enableAllWorkflows(type: ConnectorSide): void {
    switch (type) {
      case ConnectorSide.Source:
        this.sourceOptions.forEach((x) => {
          if (x.workflows?.length) {
            x.workflows.forEach((w) => (w.disabled = false));
          }
        });
        break;
      case ConnectorSide.Destination:
        this.destinationOptions.forEach((x) => {
          if (x.workflows?.length) {
            x.workflows.forEach((w) => (w.disabled = false));
          }
        });
        break;
      default:
        break;
    }
  }

  disableWorkflows(wfId: string, type: string): void {
    switch (type) {
      case ConnectorSide.Source:
        this.enableAllWorkflows(ConnectorSide.Source);
        // Filter out all the connectors with same workflow as destination
        const filteredConnectorsByDestination = this.dialogData.filter((x) => x.workflowSchemaDestination.id === wfId);
        if (filteredConnectorsByDestination?.length && this.sourceOptions?.length) {
          // Loop over filtered connectors
          for (let index = 0; index < filteredConnectorsByDestination.length; index++) {
            const connector = filteredConnectorsByDestination[index];
            /**
             * Loop over the source options & check if the source's workflows has
             * any item who's id == connector's source workflow schema Id.
             * If yes, then disable it
             * */
            const destinationId = this.connectorForm.controls.destination.value;
            for (let j = 0; j < this.sourceOptions.length; j++) {
              const source = this.sourceOptions[j];
              const wf = source.workflows.filter((x) => x.id === connector.workflowSchemaSource.id || x.id === destinationId);
              if (wf.length) {
                wf.forEach((w) => (w.disabled = true));
              }
            }
          }
        }
        break;
      case ConnectorSide.Destination:
        this.enableAllWorkflows(ConnectorSide.Destination);
        // Filter out all the connectors with same workflow as source
        let filteredConnectorsBySource = this.dialogData.filter((x) => x.workflowSchemaSource.id === wfId);
        if (filteredConnectorsBySource?.length && this.destinationOptions?.length) {
          // Loop over filtered connector
          for (let index = 0; index < filteredConnectorsBySource.length; index++) {
            const connector = filteredConnectorsBySource[index];
            /**
             * Loop over the destination options & check if the destination's workflows has
             * any item who's id == connector's destination workflow schema Id.
             * If yes, then disable it
             * */
            const sourceId = this.connectorForm.controls.source.value;
            for (let j = 0; j < this.destinationOptions.length; j++) {
              const destination = this.destinationOptions[j];
              const wf = destination.workflows.filter((x) => x.id === connector.workflowSchemaDestination.id || x.id === sourceId);
              if (wf.length) {
                wf.forEach((w) => (w.disabled = true));
              }
            }
          }
        }
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
