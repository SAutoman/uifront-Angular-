/**
 * TODO: Used only in TenantAdminService, in all other areas HttpClientAxiosService is used
 * TODO: check the difference and if there are no, remove this one
 */

/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpHeaders, HttpParams, HttpClient } from '@angular/common/http';

/**
 * project
 */

import { Paging, Sorting, SearchParams, IFilter } from '../models';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { API_BASE_URL_TOKEN } from '../tokens/api-base-url.token';

/**
 * local
 */
import { AuthenticationService, UserOverrideService } from './authentication.service';
import { take } from 'rxjs/operators';
import { AxiosResponse } from 'axios';

export interface IRequestOptions {
  headers?: HttpHeaders;
  observe?: 'body';
  params?: HttpParams;
  reportProgress?: boolean;
  responseType?: 'json';
  withCredentials?: boolean;
  body?: any;
}

export interface IRequestOptionsForDownload extends IRequestOptions {
  observe?: any;
  responseType?: any;
}

// export let headerJson = '';

export interface HttpClientService {
  get<T>(endPoint: string, options?: IRequestOptions): Promise<T>;
  post<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T>;
  put<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T>;
  delete<T>(endPoint: string, options?: IRequestOptions, params?: Object): Promise<T>;
  setPaging(paging: Paging, httpParams: HttpParams): HttpParams;
  setSorting(sorting: Sorting[], httpParams: HttpParams): HttpParams;
  setFilters(filters: SearchFieldModel[], httpParams: HttpParams): HttpParams;
  buildSearchParams(paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): SearchParams;
  getFullResponse?<T>(endPoint: string, options?: IRequestOptionsForDownload): Promise<AxiosResponse<T>>;
  patch<T>(endPoint: string, params: Object, options?: IRequestOptions);
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationHttpClientService implements HttpClientService {
  // Extending the HttpClient through the Angular DI.
  public constructor(
    public http: HttpClient,
    @Inject('UserOverrideService') private userOverrideService: UserOverrideService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    @Inject(API_BASE_URL_TOKEN) private readonly BASE_URL: string
  ) {}

  /**
   * GET request
   * @param {string} endPoint it doesn't need / in front of the end point
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async get<T>(endPoint: string, options?: IRequestOptions): Promise<T> {
    return this.http.get<T>(this.BASE_URL + endPoint, this.SetHeaders(options)).toPromise();
  }

  /**
   * POST request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async post<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    return this.http
      .post<T>(this.BASE_URL + endPoint, params, this.SetHeaders(options))
      .pipe(take(1))
      .toPromise();
  }

  /**
   * PUT request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async put<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    return this.http.put<T>(this.BASE_URL + endPoint, params, this.SetHeaders(options)).toPromise();
  }

  /**
   * DELETE request
   * @param {string} endPoint end point of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async delete<T>(endPoint: string, options?: IRequestOptions, params?: Object): Promise<T> {
    let optionsExtended: IRequestOptions = {
      ...options,
      body: params
    };
    if (params) {
      optionsExtended.body = params;
    }
    return this.http.delete<T>(this.BASE_URL + endPoint, this.SetHeaders(optionsExtended)).toPromise();
  }

  /**
   * PATCH request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns
   */
  async patch<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    return this.http.patch<T>(this.BASE_URL + endPoint, params, this.SetHeaders(options)).toPromise();
  }

  setPaging(paging: Paging, httpParams: HttpParams): HttpParams {
    if (paging) {
      httpParams = httpParams.append('skip', paging.skip.toString()).append('take', paging.take.toString());
    }
    return httpParams;
  }

  setSorting(sorting: Sorting[], httpParams: HttpParams): HttpParams {
    if (sorting && sorting.length > 0) {
      httpParams = httpParams.append('sorting', JSON.stringify(sorting));
    }
    return httpParams;
  }

  setFilters(filters: SearchFieldModel[], httpParams: HttpParams): HttpParams {
    if (filters && filters.length > 0) {
      httpParams = httpParams.append('filter', JSON.stringify(filters));
    }

    return httpParams;
  }

  private SetHeaders(options?: IRequestOptions): IRequestOptions {
    const token = this.authService.getAuthorizationHeaderValue();
    const userOverride = this.userOverrideService.getUser();

    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', token);
      // headerJson = token;
    }

    if (userOverride) {
      headers = headers.append('USEROVERRIDE', userOverride);
    }

    return <any>{ ...options, headers: headers };
  }

  buildSearchParams(paging?: Paging, sorting?: Sorting[], filters?: IFilter[]): SearchParams {
    if (!paging) {
      paging = {
        skip: 0,
        take: 999
      };
    }

    const sendSearchParams: SearchParams = {
      paging,
      sorting: {
        sorting: sorting || []
      },
      filters: {
        filters: filters || []
      }
    } as SearchParams;

    return sendSearchParams;
  }
}
