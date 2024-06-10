import { IFilter, Operation, PagedData, Paging, Settings, Sorting } from '../models';
import { Injectable, Inject } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { HttpClientService } from './application-http-client.service';
import { OperationService } from './operation.service';
import { AppSettingsDto, CreateAppSettingsDto, RemoveAppSettingsCommand, UpdateAppSettingsDto } from '../models/app-settings';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  private BASE_URL = `appSettings`;
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService, private operationsService: OperationService) {}

  async create(cmd: CreateAppSettingsDto): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/create`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async update(cmd: UpdateAppSettingsDto): Promise<Operation> {
    let operation = await this.httpClient.put<Operation>(`${this.BASE_URL}/update`, cmd);
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async delete(id: string): Promise<Operation> {
    let operation = await this.httpClient.post<Operation>(`${this.BASE_URL}/delete/${id}`, <RemoveAppSettingsCommand>{
      publicId: id
    });
    operation = await this.operationsService.waitForSuccessfullOperationAsync(operation.id);

    return operation;
  }

  async getByApp(appId: string): Promise<AppSettingsDto> {
    let result = await this.httpClient.get<AppSettingsDto>(`${this.BASE_URL}/byApp/${appId}`);
    return result;
  }

  async getById(id: string): Promise<Settings> {
    let result = await this.httpClient.get<Settings>(`${this.BASE_URL}/byId/${id}`);
    return result;
  }

  async getByAppAndKey(appId: string, key: string): Promise<Settings> {
    let result = await this.httpClient.get<Settings>(`${this.BASE_URL}/byAppAndKey/${appId}/${key}`);
    return result;
  }

  async search(paging: Paging, sorting?: Sorting[], filters?: IFilter[]): Promise<PagedData<Settings>> {
    const params = this.httpClient.buildSearchParams(paging, sorting, filters);
    return this.httpClient.post<PagedData<Settings>>(`${this.BASE_URL}/search`, params);
  }

  /**
   * @returns Operation
   */
  updateAppSettings$(cmd: AppSettingsDto, delay = 300): Observable<Operation> {
    return of(true).pipe(
      switchMap(() => {
        return from(this.httpClient.put<Operation>(`${this.BASE_URL}/update`, cmd));
      }),
      switchMap((task) => this.operationsService.waitTask(task.id, delay)),
      take(1)
    );
  }
}
