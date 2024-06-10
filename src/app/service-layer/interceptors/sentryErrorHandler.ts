import { ErrorHandler, Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as Sentry from '@sentry/browser';
import { AxiosError } from 'axios';

export interface SentryErrorHandler {
  extractError(error: any): any;
  handleError(error: any): any;
}

@Injectable({ providedIn: 'root' })
export class SentryErrorHandler implements ErrorHandler {
  static extractError(error: any): any {
    // Try to unwrap zone.js error.
    // https://github.com/angular/angular/blob/master/packages/core/src/util/errors.ts
    if (error && error.ngOriginalError) {
      error = error.ngOriginalError;
    }
    // We can handle messages and Error objects directly.
    if (typeof error === 'string' || error instanceof Error) {
      return error;
    }

    // If it's http module error, extract as much information from it as we can.
    if (error instanceof HttpErrorResponse) {
      // The `error` property of http exception can be either an `Error` object, which we can use directly...
      if (error.error instanceof Error) {
        return error.error;
      }

      // ... or an`ErrorEvent`, which can provide us with the message but no stack...
      if (error.error instanceof ErrorEvent) {
        return error.error.message;
      }

      // ...or the request body itself, which we can use as a message instead.
      if (typeof error.error === 'string') {
        return `Server returned code ${error.status} with body '${error.error}'`;
      }
      // If we don't have any detailed information, fallback to the request message itself.
      return error.message;
    }

    if (error.config?.url) {
      return {
        ...error,
        message: error.config?.url
      };
    }

    // Skip if there's no error, and let user decide what to do with it.
    return null;
  }

  static handleError(error: any): any {
    // Capture handled exception and send it to Sentry.
    const extractedError = SentryErrorHandler.extractError(error) || 'Handled unknown error';
    Sentry.captureException(extractedError);
    console.error(extractedError);
  }

  static captureAxiosException(error: AxiosError): any {
    // Capture handled exception and send it to Sentry.
    if (error.response?.status) {
      error.stack = error.response.status + ' ' + error.config?.url;
    }
    Sentry.captureException(error);
  }

  constructor() {}

  handleError(error: any): any {
    SentryErrorHandler.handleError(error);
  }
}
