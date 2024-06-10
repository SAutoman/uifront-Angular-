import { Injectable } from '@angular/core';
import * as Sentry from '@sentry/angular-ivy';
import { environment } from '@src/environments/environment';
import { select, Store } from '@ngrx/store';
import { loggedInState } from '@wfm/store';

@Injectable({
  providedIn: 'root'
})
export class SentryService {
  private userName: string;
  private userId: string;

  constructor(private store: Store<any>) {
    this.store.pipe(select(loggedInState)).subscribe((data): any => {
      if (data.profile) {
        this.userName = data.profile.name + ' ' + data.profile.lastName;
        this.userId = data.profile.id;
      }
    });
  }

  public initSentry(): void {
    // exclude requests from localhost
    // ignore errors from Automated Tests User (WFM-4096)
    if (this.userId === '016CAD6D0C873E4F8B8CF09557A3EC30' || location.host.indexOf('localhost') > -1) {
      return;
    }

    Sentry.init({
      dsn: environment.sentryDsn,
      environment: environment.name,
      integrations: [
        new Sentry.BrowserTracing({
          // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
          tracePropagationTargets: ['localhost', /^\//],
          routingInstrumentation: Sentry.routingInstrumentation
        }),
        new Sentry.Integrations.TryCatch({
          XMLHttpRequest: true
        })
        // https://github.com/angular/components/issues/24979
        // new Sentry.Replay()
      ],
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100%
      // while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample
      // rate to 100% when sampling sessions where errors occur.
    });

    this.setSentryContext();
  }

  private setSentryContext(): void {
    Sentry.setExtra('userName', this.userName);
  }

  public reportProblem(): void {
    Sentry.showReportDialog({
      eventId: Sentry.captureMessage('showReportDialog')
    });
  }
}
