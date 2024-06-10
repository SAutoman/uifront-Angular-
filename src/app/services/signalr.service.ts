import { Inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Store } from '@ngrx/store';
import { AuthenticationService, SIGNALR_URL_TOKEN } from '@wfm/service-layer';
import { ApplicationState, currentTenantSelector } from '@wfm/store';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  hubUrl = 'hubs/wfm';
  tenantId: string;
  private hubConnection: signalR.HubConnection;
  constructor(
    @Inject(SIGNALR_URL_TOKEN) private readonly signalUrl: string,
    @Inject('AuthenticationService') private authService: AuthenticationService,

    private store: Store<ApplicationState>
  ) {
    this.store.select(currentTenantSelector).subscribe((tenantId) => {
      this.tenantId = tenantId;
    });
  }

  // init and start the connection.

  startConnection() {
    const token = this.authService.getUser()?.access_token;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.signalUrl}${this.hubUrl}?tenant_id=${this.tenantId}`, { accessTokenFactory: () => token })
      .configureLogging(signalR.LogLevel.Error)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connection started');
        this.addListeners();
      })
      .catch((err) => {
        console.log('Error while starting connection: ' + err);
      });
  }

  public addListeners() {
    this.hubConnection.on('DynamicEntityCreated', (data) => {
      console.log('DynamicEntityCreated', data);
    });

    this.hubConnection.on('DynamicEntityUpdated', (data) => {
      console.log('DynamicEntityUpdated', data);
    });
  }
}
