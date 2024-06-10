/**
 * global
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';

/**
 * project
 */
import { CompanyService } from '../../service-layer/services/company.service';

@Injectable({
  providedIn: 'root'
})
export class CompanyGridService extends BehaviorSubject<GridDataResult> {
  constructor(private companyService: CompanyService) {
    super(null);
  }

  async query(state: any): Promise<void> {
    const data = await this.companyService.search();
    super.next(<GridDataResult>{ total: data.total, data: data.items });

    // this.companyService.search().pipe(
    //   map(x => <GridDataResult>{ total: x.total, data: x.items }))
    //   .subscribe(x => super.next(x));
  }
}
