import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * Global
 */
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { GridConfiguration } from '@wfm/service-layer';
import { OrchestratorEntity } from '@wfm/service-layer/models/orchestrator';
import { defaultOrchestratorsGridSettings } from '@wfm/shared/default-grid-settings';
import { GridAction } from '@wfm/shared/dynamic-entity-grid/model/dynamic-entity-grid.model';
import { GridDataResultEx } from '@wfm/shared/kendo-util';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  DeleteOrchestrator,
  GetOrchestrators,
  OrchestratorState,
  ResetOrchestratorOperationMsg,
  selectOrchestratorOperationMsg,
  selectOrchestrators
} from '@wfm/store/orchestrator';
import { TranslateService } from '@ngx-translate/core';
/**
 * Project
 */
@Component({
  selector: 'app-orchestrators-list',
  templateUrl: './orchestrators-list.component.html',
  styleUrls: ['./orchestrators-list.component.scss']
})
export class OrchestratorsListComponent extends TenantComponent implements OnInit {
  orchestrators: OrchestratorEntity[];
  orchestratorsGridSettings: GridConfiguration = defaultOrchestratorsGridSettings;

  gridData: GridDataResultEx<OrchestratorEntity>;
  gridActions: GridAction[];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<OrchestratorState>,
    private ts: TranslateService
  ) {
    super(store);
  }

  ngOnInit() {
    this.subscribe();
    this.getAllOrchestrators();
    this.gridActions = [
      {
        title: 'Edit',
        actionId: 'edit',
        icon: 'edit',
        color: 'primary'
      },
      {
        title: 'Delete',
        actionId: 'delete',
        icon: 'delete',
        color: 'warn'
      }
    ];
    this.subscribeToOrchestratorOperationMsg();
  }

  subscribeToOrchestratorOperationMsg(): void {
    this.store.pipe(select(selectOrchestratorOperationMsg), takeUntil(this.destroyed$)).subscribe((msg) => {
      if (msg && msg.toLowerCase()?.includes('success')) {
        this.snackBar.open(msg, this.ts.instant('Ok'), { duration: 3000 });
        this.store.dispatch(new ResetOrchestratorOperationMsg());
        this.getAllOrchestrators();
      }
    });
  }

  createOrchestrator(): void {
    this.router.navigate(['..', 'create'], {
      relativeTo: this.activatedRoute
    });
  }

  editOrchestrator(id: string): void {
    this.router.navigate(['..', 'edit', id], {
      relativeTo: this.activatedRoute
    });
  }

  subscribe(): void {
    this.store
      .pipe(
        select(selectOrchestrators),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((items) => {
        this.orchestrators = cloneDeep(items);
        this.gridData = {
          data: this.orchestrators.map((item) => {
            return {
              ...item
            };
          }),
          total: this.orchestrators.length
        };
      });
  }

  getAllOrchestrators(): void {
    this.orchestrators = null;
    this.store.dispatch(new GetOrchestrators());
  }

  deleteOrchestrator(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((x) => {
        if (x) {
          try {
            this.store.dispatch(new DeleteOrchestrator({ id: id }));
          } catch (error) {
            this.snackBar.open(error.toString(), this.ts.instant('CLOSE'), {
              duration: 2000
            });
          }
        }
      });
  }

  onActionClick(event: { actionId: string; raw: OrchestratorEntity }): void {
    switch (event.actionId) {
      case 'edit':
        this.editOrchestrator(event.raw?.id);
        break;
      case 'delete':
        this.deleteOrchestrator(event.raw?.id);
        break;
      default:
        break;
    }
  }
}
