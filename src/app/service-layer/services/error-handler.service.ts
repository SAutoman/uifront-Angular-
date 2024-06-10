import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar, private ts: TranslateService) {}

  getAndShowErrorMsg(op: Error, duration: number = 3000): string {
    const errorMsg = this.retrieveErrorMessage(op);
    if (errorMsg) {
      this.snackBar.open(errorMsg, this.ts.instant('Ok'), { duration: duration });
    }
    return errorMsg;
  }

  private retrieveErrorMessage(op: Error): string {
    const error = op;
    if (error instanceof Error && error?.message) {
      let errorObj;
      try {
        errorObj = JSON.parse(error.message);
      } catch {
        return error.message;
      }

      try {
        const entries = Object.entries(errorObj);
        const [fieldName, fieldErrors] = entries[0];
        const { ErrorMsg: errorMsg } = fieldErrors[0];
        return errorMsg.replace('Value', fieldName).replace(/^[a-z]/, (match) => match.toUpperCase());
      } catch {}
    }
    return 'Something went wrong';
  }
}
