/**
 * global
 */

import { Component, Input, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { DateTime } from 'luxon';
import { filter, take } from 'rxjs/operators';
/**
 * project
 */
import { AreaTypeEnum, FieldTypeIds } from '@wfm/service-layer';
import {
  CustomSearchType,
  MappingSearchFieldModel,
  SearchFieldModel,
  SearchType,
  StatusFieldModel
} from '@wfm/service-layer/models/dynamic-entity-models';
import { ApplyMappingDto, MappingDto } from '@wfm/service-layer/models/mappings';
import { FieldWithSearchModel } from '@wfm/shared/dynamic-entity-field/dynamic-entity-field.component';
import { SearchFieldInfoUI } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.component';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplyMappingManual, mappingsOperationMsgSelector, ResetMappingsOperationMsg } from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

@Component({
  selector: 'app-mapping-manual-trigger',
  templateUrl: './mapping-manual-trigger.component.html',
  styleUrls: ['./mapping-manual-trigger.component.scss']
})
export class MappingManualTriggerComponent extends TenantComponent implements OnInit {
  @Input() mapping: MappingDto;
  deFilterFields: FieldWithSearchModel[] = [];
  selectedOption: SearchFieldInfoUI;
  selectedFields: SearchFieldInfoUI[] = [];
  constructor(
    private store: Store<ApplicationState>,
    private router: Router,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<MappingManualTriggerComponent>
  ) {
    super(store);
  }

  ngOnInit() {
    this.deFilterFields = [
      {
        showEditor: true,
        name: 'Created At',
        id: undefined,
        fieldName: 'createdAt',
        displayName: 'Created At',
        type: FieldTypeIds.DateTimeField,
        allowedSearchTypes: [SearchType.Range],
        configuration: {
          position: 0
        },
        searchFieldModel: {
          from: null,
          to: null,
          valueType: FieldTypeIds.DateTimeField,
          fieldName: 'createdAt',
          searchType: SearchType.Range,
          id: undefined,
          isValid: false
        }
      },
      {
        showEditor: true,
        id: undefined,
        type: FieldTypeIds.StringField,
        name: 'Status',
        fieldName: 'statusId',
        displayName: 'Status',
        isSystem: true,
        configuration: { position: 0 },
        allowedSearchTypes: [SearchType.Custom],
        customSearchType: CustomSearchType.Status,
        searchFieldModel: <StatusFieldModel>{
          customSearchType: CustomSearchType.Status,
          fieldName: 'statusId',
          isValid: false,
          searchType: SearchType.Custom,
          items: [],
          valueType: FieldTypeIds.StringField
        }
      }
    ];
  }

  onFieldRemove(field: SearchFieldInfoUI): void {
    this.selectedOption = null;
    field.value = '';
    this.selectedFields = this.selectedFields.filter((f) => f !== field);
  }

  onFieldSelected(event: MatSelectChange): void {
    if (this.selectedFields.findIndex((e) => event.value?.fieldName === e.fieldName) >= 0) {
      return;
    } else {
      this.selectedFields.push({ ...event.value });
    }
  }

  confirmDialog(): void {
    const dialogRef = this.dialog.open(ConfirmActionComponent, {
      data: {
        title: 'Confirm Reapply',
        message: 'Are you sure you want to reapply this item(s)?',
        showProceedBtn: true
      }
    });
    dialogRef.afterClosed().subscribe((x) => {
      if (x) {
        this.apply();
      }
    });
  }

  apply(): void {
    const filters = this.selectedFields.map((field) => {
      let clonedField = cloneDeep(field);
      let searchField: SearchFieldModel = cloneDeep(<SearchFieldModel>clonedField.searchFieldModel);
      delete searchField.displayName;
      delete searchField.isValid;
      delete searchField.displayName;
      if (searchField.fieldName === 'statusId') {
        delete searchField.value;
      }
      if (searchField.valueType === FieldTypeIds.DateTimeField && searchField.searchType === SearchType.Range) {
        if (!searchField.from) {
          searchField.from = DateTime.fromMillis(155695200000).toUTC().set({ hour: 0, minute: 0, second: 0 }).toJSDate();
        }

        if (!searchField.to) {
          searchField.to = DateTime.now().toUTC().set({ hour: 23, minute: 59, second: 59 }).toJSDate();
        }
      }
      return searchField;
    });

    let data: ApplyMappingDto = {
      searchFilters: {
        filters: <MappingSearchFieldModel[]>filters
      }
    };

    if (this.isAuditorArea()) {
      data.auditorMappingId = this.mapping.id;
    } else if (this.isSupplierArea()) {
      data.supplierMappingId = this.mapping.id;
    }

    this.store.dispatch(
      new ApplyMappingManual({
        tenantId: this.tenant,
        areaType: this.getMappingTypeFromUrl(),
        data
      })
    );
    this.listenForMappingProcessOperation();
  }

  listenForMappingProcessOperation(): void {
    this.store
      .select(mappingsOperationMsgSelector)
      .pipe(
        filter((x) => !!x),
        take(1)
      )
      .subscribe((message) => {
        this.dialogRef.close();
        this.snackbar.open(`${message}`, 'CLOSE', { duration: 5000 });
        this.store.dispatch(new ResetMappingsOperationMsg());
      });
  }

  getMappingTypeFromUrl(): AreaTypeEnum {
    return this.router.url.includes('case') ? AreaTypeEnum.case : AreaTypeEnum.rawData;
  }

  isSupplierArea(): boolean {
    return this.router.url.includes('suppliers');
  }

  isAuditorArea(): boolean {
    return this.router.url.includes('auditors');
  }

  isValid(): boolean {
    return !this.selectedFields || !this.selectedFields.length || this.selectedFields.every((field) => field.searchFieldModel.isValid);
  }
}
