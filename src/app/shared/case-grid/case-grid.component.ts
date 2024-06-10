/**
 * global
 */
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, Inject } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

/**
 * project
 */

import { SettingsUI, AreaTypeEnum, ColumnSettings, FieldTypeIds } from '@wfm/service-layer';
import { ApplicationState, dateFormatSettingsSelector } from '@wfm/store';

/**
 * local
 */
import { BaseComponent } from '../base.component';
import DateTimeFormatHelper from '../dateTimeFormatHelper';
import { hyperLinkDataKey } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { Row } from '../dynamic-entity-grid/dynamic-entity-grid.component';

export enum CaseGridAction {
  DeleteItems,
  OpenRawDataInfo,
  OpenNotificationWidget
}

export interface CaseGridActionData {
  dataItem: any;
  action: CaseGridAction;
}

@Component({
  selector: 'app-case-grid',
  templateUrl: './case-grid.component.html',
  styleUrls: ['./case-grid.component.scss']
})
export class CaseGridComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() dataColumns: ColumnSettings[];
  @Input() itemsWithValues: Row[];
  @Input() allowActionsFor: AreaTypeEnum = AreaTypeEnum.case;

  @Output() caseGridActionEmitter: EventEmitter<CaseGridActionData> = new EventEmitter<CaseGridActionData>();

  isDialog: boolean = false;
  gridData: GridDataResult;
  dateFormatDb: SettingsUI;
  componentId = 'f29b9bca-5aaf-4441-96de-acefe7a7d46c';
  userDateFormat: string;
  userDateTimeFormat: string;
  get fieldTypes() {
    return FieldTypeIds;
  }

  get hyperLinkData() {
    return hyperLinkDataKey;
  }

  constructor(
    private store: Store<ApplicationState>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CaseGridComponent>
  ) {
    super();
    if (data && Object.keys(data).length !== 0) {
      this.itemsWithValues = data.itemsWithValues;
      this.dataColumns = data.dataColumns;
      this.isDialog = data.isDialog;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.itemsWithValues) {
      this.gridData = <GridDataResult>{ total: this.itemsWithValues.length, data: this.itemsWithValues };
    }
    if (changes?.dataColumns?.currentValue) {
      this.setColumns();
    }
  }

  ngOnInit() {
    this.populateDateFormats();
    this.store.pipe(takeUntil(this.destroyed$), select(dateFormatSettingsSelector)).subscribe((data) => {
      if (data) {
        this.dateFormatDb = { ...data };
      }
    });
    this.setColumns();
    this.gridData = <GridDataResult>{ total: this.itemsWithValues.length, data: this.itemsWithValues };
  }

  setColumns(): void {
    const actionColumn = {
      field: 'actions',
      title: ' Actions',
      _width: 140,
      isSystem: true
    };
    if (!this.dataColumns.find((x) => x.field === 'actions'))
      this.dataColumns = [actionColumn, ...this.dataColumns.filter((x) => x.title && x.field !== 'actions')];
    this.dataColumns = this.dataColumns.filter((x) => !x.hidden);
  }

  removeItem(dataItem): void {
    this.caseGridActionEmitter.emit({ dataItem: dataItem, action: CaseGridAction.DeleteItems });
  }

  populateDateFormats(): void {
    this.userDateFormat = DateTimeFormatHelper.getDateFormatConfig()?.display?.dateInput;
    this.userDateTimeFormat = DateTimeFormatHelper.getDateTimeFormatConfig()?.display?.dateInput;
  }

  onRawDataInfoClicked(dataItem): void {
    this.caseGridActionEmitter.emit({ dataItem: dataItem, action: CaseGridAction.OpenRawDataInfo });
  }

  onNotificationWidgetClicked(dataItem): void {
    this.caseGridActionEmitter.emit({ dataItem: dataItem, action: CaseGridAction.OpenNotificationWidget });
  }
}
