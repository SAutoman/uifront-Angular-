import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { WfmGridComponent } from '../../shared/wfm-grid/wfm-grid.component';
import { OperationListPageViewModel } from './operation.view-model';
import { GridConfiguration, Paging } from '../../service-layer';
import { defaultOperationsGridSettings } from '../../shared/default-grid-settings';
import { Store, select } from '@ngrx/store';
import { OperationsState } from '../../store/operations/operations.reducer';
import { getAllDataSelector } from '../../store/operations/operations.selector';
import { LoadOperations } from '../../store/operations/operations.actions';
import { LoadOperationsPayload } from '../../store/operations/operations-payload-models';
import { PageChangeEvent } from '@progress/kendo-angular-grid';
import { cloneDeep } from 'lodash-core';

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss']
})
export class OperationsComponent implements OnInit, AfterViewInit {
  model: OperationListPageViewModel;
  actor: string;
  status: string;
  @ViewChild('operationsGrid') grid: WfmGridComponent;
  operationsGridSettingsConf: GridConfiguration = defaultOperationsGridSettings;
  header: string = 'Operations';

  constructor(private store: Store<OperationsState>) {}

  ngOnInit(): void {
    this.store.pipe(select(getAllDataSelector)).subscribe((result) => {
      if (result) {
        this.model = cloneDeep(result.operationListPageViewModel);

        if (this.actor != result.selectedUser || this.status != result.selectedStatus) {
          this.actor = result.selectedUser;
          this.status = result.selectedStatus;

          if (this.grid?.grid) {
            this.grid.grid.skip = 0;
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    const paging = <Paging>{ skip: 0, take: 10 };
    this.loadData(paging, null, null);

    this.grid.grid.pageChange.subscribe(async (x) => {
      this.loadData(x, this.actor, this.status);
      this.grid.grid.skip = (<PageChangeEvent>x).skip;
    });
  }

  loadData(paging: Paging, actor: string, status: string) {
    this.store.dispatch(new LoadOperations(<LoadOperationsPayload>{ paging, actor: actor, status: status }));
  }
}
