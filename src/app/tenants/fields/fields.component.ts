/**
 * global
 */
import { Component, OnInit } from '@angular/core';

import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { Store } from '@ngrx/store';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { environment } from '@src/environments/environment.base';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';
import { TenantAdminFieldsService } from '@wfm/tenant-admin/tenant-admin.service';
import { PagedData, FieldTypeIds, Paging, SortDirectionValue } from '@wfm/service-layer';
import { ApplicationState } from '@wfm/store/application-state';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { toApiSort } from '@wfm/shared/kendo-util';

/**
 * local
 */
import { EditFieldComponent } from './edit-field/edit-field.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FieldDtoAdmin, TenantFieldDto } from '@wfm/service-layer/models/FieldInfo';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Component({
  selector: 'app-fields',
  templateUrl: './fields.component.html',
  styleUrls: ['./fields.component.scss']
})
export class FieldsComponent extends TenantComponent implements OnInit {
  fields: PagedData<FieldDtoAdmin>;
  gridData: GridDataResult;
  componentId = '68e70f3f-63a6-4453-98ac-17e0aeaf11b1';

  state: State = {
    skip: 0,
    take: 7
  };

  sort: SortDescriptor[] = [
    {
      field: '',
      dir: SortDirectionValue.asc
    }
  ];

  filters: SearchFieldModel[];

  constructor(
    private tenantFieldsService: TenantAdminFieldsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    store: Store<ApplicationState>,
    private ts: TranslateService,
    private errorhandlerService: ErrorHandlerService
  ) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    let sortArr = null;

    if (this.sort[0].field && this.sort[0].dir) {
      sortArr = [{ propertyName: this.sort[0].field, sort: toApiSort(this.sort[0]) }];
    }

    const paging = <Paging>{ skip: this.state.skip, take: this.state.take };

    this.fields = (await this.tenantFieldsService.getFieldsByAppId(paging, sortArr, this.filters)) as PagedData<FieldDtoAdmin>;
    this.fields.items.map((f) => (f.type = <any>this.fieldTypeIds[f.type].split('Field')[0]));
    this.gridData = { data: this.fields.items, total: this.fields.total } as GridDataResult;
  }

  onPageChange(event: PageChangeEvent): void {
    this.state.skip = event.skip;
    this.loadData();
  }

  onEditClicked(field: FieldDtoAdmin): void {
    const dialogRef = this.dialog.open(EditFieldComponent, {
      width: '500px'
    });

    dialogRef.componentInstance.field = field;
    dialogRef.componentInstance.buttonText = 'Update';

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        const modelType = field.type;
        const type = this.fieldTypeIds[`${modelType}Field`];

        const cmd = {
          id: field.id,
          appPublicId: environment.appId,
          name: field.name,
          type: type,
          tenantId: this.tenant
        } as TenantFieldDto;
        try {
          await this.tenantFieldsService.updateField(field.id, cmd);
          await this.loadData();
          this.snackBar.open(this.ts.instant('Field updated successfully!'), 'CLOSE', { duration: 3000 });
        } catch (error) {
          this.errorhandlerService.getAndShowErrorMsg(error);
        }
      }
    });
  }

  onCreateClicked(): void {
    const dialogRef = this.dialog.open(EditFieldComponent, {
      width: '500px'
    });

    dialogRef.componentInstance.buttonText = 'Create';

    dialogRef.afterClosed().subscribe(async (model) => {
      if (model) {
        const type = this.fieldTypeIds[`${model.type}Field`];

        const cmd = {
          appPublicId: environment.appId,
          name: model.name,
          type: type,
          tenantId: this.tenant
        } as TenantFieldDto;

        try {
          const result = await this.tenantFieldsService.createField(cmd);
          if (result.id) {
            await this.loadData();
            this.snackBar.open(this.ts.instant('Field created successfully!'), 'CLOSE', { duration: 3000 });
          }
        } catch (error) {
          this.errorhandlerService.getAndShowErrorMsg(error);
        }
      }
    });
  }

  onDeleteClicked(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.tenantFieldsService.deleteField(id);
        this.loadData();
      }
    });
  }

  get fieldTypeIds() {
    return FieldTypeIds;
  }
}
