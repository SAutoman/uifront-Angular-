/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { forkJoin, from, interval, Observable, of, throwError } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

/**
 * project
 */

import { OperationViewModel } from '@wfm/operations/operations/operation.view-model';
import { Paging, PagedData, Operation } from '@wfm/service-layer/models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
import { setTimeoutAsync } from '../helpers';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  BASE_URL = 'operations';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  getByIdAsync(id: string): Promise<Operation> {
    return this.httpClient.get<Operation>(`${this.BASE_URL}/${id}`);
  }

  getAll(actor: string, status: string, paging?: Paging): Promise<PagedData<OperationViewModel>> {
    return this.httpClient.post<PagedData<OperationViewModel>>(`${this.BASE_URL}/search`, {
      skip: paging.skip,
      take: paging.take,
      actor,
      status
    });
  }

  async waitForSuccessfullOperationAsync(id: string, delay: number = 1000): Promise<Operation | never> {
    let operation = <Operation>{};

    do {
      operation = await this.getByIdAsync(id);

      switch (operation?.status?.toString()) {
        case 'Success':
          return operation;
        case 'Failure':
          // Error Log for details
          console.log(operation);
          throw new Error(`${operation?.userErrorMsg || operation?.validationResult || operation?.errorMsg}`);
      }
      await setTimeoutAsync(delay);
    } while (true);
  }

  waitMany$(taskIds: string[], delay = 300): Observable<Operation[]> {
    const tasks$ = taskIds.map((x) => this.waitForSuccessfullOperationAsync(x, delay));
    return forkJoin(tasks$);
  }

  waitTask(taskId: string, delay = 300): Observable<Operation> {
    const task$ = of(true)
      .pipe(switchMap(() => from(this.getByIdAsync(taskId))))
      .pipe(take(1));

    return interval(delay).pipe(
      switchMap(() => task$),
      switchMap((x) => {
        console.log('wait task', { x, taskId });
        const status = x.status.toString();
        if (status === 'Success') {
          return of(x);
        } else if (status === 'Failure') {
          console.log(x);
          throw new Error(`${x?.userErrorMsg || x?.validationResult || x?.errorMsg}`);
        }
        return of(null);
      }),
      filter((x) => !!x),
      take(1)
    );
  }
}
