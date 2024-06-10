import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Roles, WorkflowStatusDto } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { AllWorkflowStatuses } from '../manual-creation-settings-by-schema.component';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

export interface DisabledCasesRoleBased {
  disabledCaseStatuses: string[];
  role?: Roles;
  groupId?: string;
}

@Component({
  selector: 'app-select-case-statuses',
  templateUrl: './select-case-statuses.component.html',
  styleUrls: ['./select-case-statuses.component.scss']
})
export class SelectCaseStatusesComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() schemaId: string;
  @Input() workflowStatuses: AllWorkflowStatuses[];
  @Input() casePermissionSetting?: DisabledCasesRoleBased;
  @Input() role?: Roles;
  @Input() groupId?: string;

  @Output() selectedStausesEmitter: EventEmitter<DisabledCasesRoleBased> = new EventEmitter();

  currentWorkflowStatuses: WorkflowStatusDto[] = [];
  selectedStatuses: FormControl = new FormControl([]);

  constructor(store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit(): void {
    this.selectedStatuses.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.emitData(x);
    });
  }

  emitData(value: string[]): void {
    const data: DisabledCasesRoleBased = {
      disabledCaseStatuses: value,
      role: this.role,
      groupId: this.groupId
    };
    this.selectedStausesEmitter.emit(data);
  }

  setCasesData(): void {
    if (this.casePermissionSetting) {
      this.selectedStatuses.setValue(this.casePermissionSetting?.disabledCaseStatuses, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.workflowStatuses?.currentValue) {
      this.filterStatuses();
      this.setCasesData();
    }
    if (changes?.schemaId?.currentValue) {
      this.filterStatuses();
      this.setCasesData();
    }
  }

  filterStatuses(): void {
    if (this.workflowStatuses?.length)
      this.currentWorkflowStatuses = this.workflowStatuses?.find((x) => x.schemaId === this.schemaId)?.statuses || [];
  }
}
