/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Store, select } from '@ngrx/store';
import { interval, Observable, of, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { takeUntil, filter, switchMap, take } from 'rxjs/operators';

/**
 * project
 */
import { loggedInState } from '@wfm/store/auth/auth.selectors';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application-state';
import { UploadedFile, DocumentFile } from '@wfm/service-layer/models/document-upload';

import { AuthState } from '@wfm/store/auth/auth.reducer';

/**
 * local
 */
import { AuthenticationService } from './authentication.service';
import { IRequestOptions } from './application-http-client.service';
import { AppConfigService } from './app-config.service';
import { Operation } from '../models/operation';
import { setTimeoutAsync } from '../helpers';

export enum HeaderStatus {
  Post,
  Get,
  Delete
}

@Injectable({
  providedIn: 'root'
})
export class DocumentUploadService extends TenantComponent {
  apiUploadUrl: string;
  apiBaseUrl: string;
  DOCUMENT_URL = 'documents';
  DOWNLOAD_URL = 'download';
  authState: AuthState;

  ccxApplicationName: string;

  constructor(
    public http: HttpClient,
    configService: AppConfigService,
    @Inject('AuthenticationService') private authService: AuthenticationService,
    private store: Store<ApplicationState>
  ) {
    super(store);
    this.apiUploadUrl = configService.config.apisConfig.apiUploadUrl;
    this.apiBaseUrl = configService.config.apisConfig.apiBaseUrl;
    this.ccxApplicationName = configService.config.apisConfig.ccxApplicationName;
  }

  getByIdAsync(id: string): Promise<Operation> {
    return this.http.get<Operation>(`${this.apiUploadUrl}/operations/${id}`, this.SetHeaders(null, HeaderStatus.Get)).toPromise();
  }
  // waitTask(taskId: string, delay = 300): Observable<Operation> {
  //   const task$ = this.http.get<Operation>(`${this.apiUploadUrl}/operations/${taskId}`);
  //   return interval(delay).pipe(
  //     switchMap(() => task$),
  //     switchMap((x) => {
  //       const status = x.status.toString();
  //       if (status === 'success') {
  //         return of(x);
  //       } else if (status === 'failure') {
  //         return throwError(`Operation ${taskId} failed`);
  //       }
  //       return of(null);
  //     }),
  //     filter((x) => !!x),
  //     take(1)
  //   );
  // }
  /**
   *
   * @param file
   * @param options
   * @returns Operation.id
   */
  // uploadFile(file: FormData, options?: IRequestOptions): Observable<string> {
  //   const upload$ = this.http.post<string>(`${this.apiUploadUrl}/${this.DOCUMENT_URL}`, file, this.SetHeaders(options, HeaderStatus.Post));
  //   return upload$;
  // }

  async waitForSuccessfulOperationAsync(id: string): Promise<Operation> {
    let operation = <Operation>{};
    do {
      operation = await this.getByIdAsync(id);
      const status = operation.status.toString();
      if (!status) {
        await setTimeoutAsync(1000);
      } else {
        switch (operation.status.toString()) {
          case 'success':
            return operation;
          case 'failure':
            throw new Error(`Operation ${operation.id} failed`);
        }
      }
    } while (true);
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async removeFile(documentId: string, options?: IRequestOptions): Promise<Operation> {
    const deleteOperationId = await this.http
      .delete<string>(`${this.apiUploadUrl}/${this.DOCUMENT_URL}/${documentId}`, this.SetHeaders(options, HeaderStatus.Delete))
      .toPromise();
    return await this.waitForSuccessfulOperationAsync(deleteOperationId);
  }

  async upload(file: FormData, options?: IRequestOptions): Promise<UploadedFile> {
    const upload = await this.http
      .post<string>(`${this.apiUploadUrl}/${this.DOCUMENT_URL}`, file, this.SetHeaders(options, HeaderStatus.Post))
      .toPromise();
    const operation = await this.waitForSuccessfulOperationAsync(upload);

    return await this.getDocumentInfo(operation.targetId).toPromise();
  }

  getDocumentInfo(documentId: string, options?: IRequestOptions): Observable<UploadedFile> {
    return this.http.get<UploadedFile>(`${this.apiUploadUrl}/documents/${documentId}`, this.SetHeaders(options, HeaderStatus.Get));
  }

  getDocuments(options?: IRequestOptions): Observable<UploadedFile[]> {
    return this.http.get<UploadedFile[]>(`${this.apiUploadUrl}/${this.DOCUMENT_URL}`, this.SetHeaders(options, HeaderStatus.Get));
  }

  getDocumentIdToken(tenant: string, documentId: string): Observable<DocumentFile> {
    return this.http.get<DocumentFile>(`${this.apiBaseUrl}ValidationDocService/token/${tenant}/${documentId}`, this.SetHeaders());
  }

  buildImage(documentId: string, token: string): string {
    return `${this.apiUploadUrl}/${this.DOWNLOAD_URL}/document/${documentId}?validationToken=${token}`;
  }

  private SetHeaders(options?: IRequestOptions, headerStatus?: HeaderStatus): IRequestOptions {
    this.store
      .pipe(
        takeUntil(this.destroyed$),
        select(loggedInState),
        filter((s) => !!s)
      )
      .subscribe((state) => {
        this.authState = state;
      });

    const token = this.authService.getAuthorizationHeaderValue();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('Authorization', token);
      if (headerStatus === HeaderStatus.Post) {
        // headers = headers.append('ccx-user-id', '123');
        headers = headers.append('ccx-user-name', this.authState.profile.name);
        headers = headers.append('ccx-target-object-guid', uuid());
        headers = headers.append('ccx-client', this.ccxApplicationName);
        headers = headers.append('ccx-create-share', 'false');
      } else if (headerStatus === HeaderStatus.Get) {
        headers = headers.append('ccx-client', this.ccxApplicationName);
        headers = headers.append('ccx-target-object-guid', '83154aee-189a-4996-915c-12217d834a46');
      }
    }
    return <any>{ ...options, headers: headers };
  }
}
