import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Roles, Settings } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { distinctUntilChanged, takeUntil } from 'rxjs/operators';

export interface DefaultLayoutSetting {
  defaultLayoutId: string;
  role?: Roles;
  groupId?: string;
}

@Component({
  selector: 'app-layout-settings',
  templateUrl: './layout-settings.component.html',
  styleUrls: ['./layout-settings.component.scss']
})
export class LayoutSettingsComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() role?: Roles;
  @Input() groupId?: string;
  @Input() existingLayoutId?: string;
  @Input() layouts: Settings[];

  @Output() layoutSettingEmitter: EventEmitter<DefaultLayoutSetting> = new EventEmitter(null);

  defaultLayoutSelector: FormControl = new FormControl(null);

  constructor(store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit(): void {
    this.defaultLayoutSelector.valueChanges.pipe(takeUntil(this.destroyed$), distinctUntilChanged()).subscribe((x) => {
      const data: DefaultLayoutSetting = {
        defaultLayoutId: x
      };
      if (this.role) {
        data.role = this.role;
      } else {
        data.groupId = this.groupId;
      }

      this.layoutSettingEmitter.emit(data);
    });
    if (this.existingLayoutId) this.defaultLayoutSelector.setValue(this.existingLayoutId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.existingLayoutId) {
      this.defaultLayoutSelector.setValue(this.existingLayoutId ? this.existingLayoutId : null);
    }
  }

  clearSelectedLayout(): void {
    this.defaultLayoutSelector.reset();
  }
}
