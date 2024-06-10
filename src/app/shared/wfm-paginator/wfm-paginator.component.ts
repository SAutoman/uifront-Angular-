/**
 * global
 */
import { Component, OnInit, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
/**
 * project
 */

import { DataSourceBase } from '../../service-layer/models';

/**
 * local
 */

@Component({
  selector: 'app-wfm-paginator',
  templateUrl: './wfm-paginator.component.html',
  styleUrls: ['./wfm-paginator.component.scss']
})
export class WfmPaginatorComponent implements OnInit {
  _dataSource: DataSourceBase;

  @Input() set dataSource(value: DataSourceBase) {
    this._dataSource = value;
    this._dataSource.setPageSizeAndIndex(0, this.pageSize);
    this._dataSource.length.subscribe((x) => (this.length = x));
  }

  get dataSource() {
    return this._dataSource;
  }

  length: number;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  constructor() {}

  ngOnInit() {}

  onPageChange(event: PageEvent) {
    this.dataSource.setPageSizeAndIndex(event.pageIndex, event.pageSize);
  }
}
