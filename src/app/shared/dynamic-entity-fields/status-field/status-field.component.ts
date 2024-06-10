/**
 * global
 */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { StatusFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { workflowStatusesSelector } from '@wfm/store/workflow';

/**
 * local
 */

interface StatusField {
  id: string | number;
  name: string;
  enabled: boolean;
  position: number;
}

@Component({
  selector: 'app-status-field',
  templateUrl: './status-field.component.html',
  styleUrls: ['./status-field.component.scss']
})
export class StatusFieldComponent extends TenantComponent implements OnInit {
  @Input() model: StatusFieldModel;
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();
  componentId = '5c0be93c-b9c3-4c0f-9161-0f1d13e68c84';
  statuses: StatusField[];

  constructor(private store: Store<ApplicationState>) {
    super(store);
  }

  async ngOnInit() {
    await this.getStatuses();
  }

  async getStatuses() {
    this.store.pipe(select(workflowStatusesSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      this.statuses = [];
      for (const status in x) {
        this.statuses.push(x[status]);
      }
      this.statuses.unshift({
        enabled: true,
        id: '-1',
        name: 'Unassigned',
        position: -1
      });
    });
    // if (this.model && this.model.items) {
    //   this.model.value = this.model.items;
    // }
    if (this.model?.items?.length) {
      for (let index = 0; index < this.model.items.length; index++) {
        if (this.model.items[index].toString() === '-1') {
          this.model.items[index] = '-1';
          break;
        }
      }
    }
  }

  onChange(data: MatSelectChange): void {
    this.model.isValid = data.value?.length;
    this.model.items = cloneDeep(data.value);
    this.isFieldChanged.emit(true);
  }
}
