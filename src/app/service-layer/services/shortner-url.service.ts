import { Injectable } from '@angular/core';

/**
 * global
 */
import { Inject } from '@angular/core';

/**
 * project
 */
import { ShortUrlDto } from '@wfm/tenant-admin/workflows/workflow-field-link/field-link.model';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';
@Injectable()
export class ShortenerUrlService {
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  async getShortUrl(longUrl: string): Promise<ShortUrlDto> {
    let result = await this.httpClient.post<ShortUrlDto>(`url-shortener`, { longUrl: longUrl });
    return result;
  }
}
