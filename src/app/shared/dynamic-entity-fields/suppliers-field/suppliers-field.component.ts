/**
 * global
 */
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { AuthState } from '@wfm/store/auth/auth.reducer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { UsersService } from '@wfm/service-layer';
import { CustomSuppliersAuditorsFilter } from '@wfm/service-layer/models/dynamic-entity-models';
import { SharedService } from '@wfm/service-layer/services/shared.service';

/**
 * local
 */
@Component({
  selector: 'app-suppliers-field',
  templateUrl: './suppliers-field.component.html',
  styleUrls: ['./suppliers-field.component.scss']
})
export class SuppliersFieldComponent extends TenantComponent implements OnInit {
  @Input() model: CustomSuppliersAuditorsFilter;
  selectItems: Array<{ id: string; name: string }> = [];
  @Output() isFieldChanged: EventEmitter<boolean> = new EventEmitter();

  componentId = '9aaf6c63-b04b-4258-ap8b-659c48c4a078';

  constructor(private usersService: UsersService, store: Store<AuthState>, private sharedService: SharedService) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    const data = await this.usersService.getSupplierCompanies(this.tenant);
    const items = data.map((item) => {
      return {
        id: item.companyPublicId,
        name: item.companyName
      };
    });
    this.selectItems = this.sharedService.getUniqueValuesByIDFromArray(items);
  }

  onChange(data: { value: string[] }): void {
    this.model.isValid = true;
    this.model.items = data.value;
    this.isFieldChanged.emit(true);
  }
}
