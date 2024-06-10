/**
 * global
 */
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { RawDataCreateUpdate, RawDataImport, RawDataImportCreate } from '../models';
import { DynamicEntityFieldInfo } from '../models/FieldInfo';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class RawDataImportService {
  BASE_URL = 'import';

  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  getRawData(tenantId: string): Promise<DynamicEntityFieldInfo> {
    return this.httpClient.get<DynamicEntityFieldInfo>(`${this.BASE_URL}/rawData/${tenantId}`);
  }

  importRawData(cmd: RawDataImport): Promise<RawDataImport> {
    return this.httpClient.post<RawDataImport>(`${this.BASE_URL}/rawData/bulk-update`, cmd);
  }

  async importNew(cmd: RawDataImportCreate, tenantId: string): Promise<any> {
    return await this.httpClient.post<any>(`${this.BASE_URL}/${tenantId}`, cmd);
  }

  createRawData(cmd: RawDataCreateUpdate): Promise<RawDataCreateUpdate> {
    return this.httpClient.post<RawDataCreateUpdate>(`${this.BASE_URL}/rawData/update`, cmd);
  }

  updateRawData(rawDataId: string, cmd: RawDataCreateUpdate): Promise<RawDataCreateUpdate> {
    return this.httpClient.put<RawDataCreateUpdate>(`${this.BASE_URL}/rawData/update/${rawDataId}`, cmd);
  }
}
