/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * project
 */
import { Paging, Sorting, SearchParams } from '../models';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { API_BASE_URL_TOKEN } from '../tokens/api-base-url.token';

/**
 * local
 */
import { IRequestOptions, HttpClientService } from './application-http-client.service';
import { AuthenticationService, UserOverrideService } from './authentication.service';
import { SentryErrorHandler } from '@wfm/service-layer';

export let headerJson = '';

@Injectable({
  providedIn: 'root'
})
export class ApplicationHttpClientAxiosService implements HttpClientService {
  // Extending the HttpClient through the Angular DI.
  public constructor(
    @Inject('UserOverrideService') private userOverrideService: UserOverrideService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    @Inject(API_BASE_URL_TOKEN) private readonly BASE_URL: string
  ) {
    axios.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        SentryErrorHandler.captureAxiosException(error);

        switch (error.response.status) {
          case 401:
            this.authService.clear();
            window.localStorage.setItem('backUrl', window.location.href);
            this.authService.startAuthentication();
            break;
          case 500:
            error.message = 'Unexpected error occur while processing the request';
            break;
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   * @param {string} endPoint it doesn't need / in front of the end point
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */

  async get<T>(endPoint: string, options?: IRequestOptions): Promise<T> {
    const result = await axios.get<T>(this.BASE_URL + endPoint, this.SetHeaders());
    return result.data;
  }

  async getFullResponse<T>(endPoint: string, options?: IRequestOptions): Promise<AxiosResponse<T>> {
    return await axios.get<T>(this.BASE_URL + endPoint, this.SetHeaders(options));
  }

  /**
   * POST request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async post<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    const result = await axios.post<T>(this.BASE_URL + endPoint, params, this.SetHeaders());
    return result.data;
  }

  /**
   * PUT request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the request.
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async put<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    const result = await axios.put<T>(this.BASE_URL + endPoint, params, this.SetHeaders());
    return result.data;
  }

  /**
   * DELETE request
   * @param {string} endPoint end point of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns {Observable<T>}
   */
  async delete<T>(endPoint: string, options?: IRequestOptions, params?: Object): Promise<T> {
    let axiosOptions: AxiosRequestConfig = {
      ...options
    };
    if (params) {
      axiosOptions.data = params;
    }
    const result = await axios.delete<T>(this.BASE_URL + endPoint, this.SetHeaders(axiosOptions));
    return result.data;
  }

  /**
   * PATCH request
   * @param {string} endPoint end point of the api
   * @param {Object} params body of the api
   * @param {IRequestOptions} options options of the request like headers, body, etc.
   * @returns
   */
  async patch<T>(endPoint: string, params: Object, options?: IRequestOptions): Promise<T> {
    const result = await axios.patch<T>(this.BASE_URL + endPoint, params, this.SetHeaders());
    return result.data;
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

  private SetHeaders(options?: AxiosRequestConfig): AxiosRequestConfig {
    const token = this.authService.getAuthorizationHeaderValue();
    const userOverride = this.userOverrideService.getUser();
    const defaultOptions = <AxiosRequestConfig>{
      ...options,
      headers: {
        Authorization: ''
      }
    };

    if (token) {
      defaultOptions.headers.Authorization = token;
      headerJson = token;
    }

    if (userOverride) {
      defaultOptions.headers.USEROVERRIDE = userOverride;
    }
    return defaultOptions;
  }

  buildSearchParams(paging?: Paging, sorting?: Sorting[], filters?: SearchFieldModel[]): SearchParams {
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
