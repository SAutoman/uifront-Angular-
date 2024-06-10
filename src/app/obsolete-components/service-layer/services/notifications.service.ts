// import { Inject, Injectable } from '@angular/core';
// import { SendNotificationCommand } from '../models/notification';
// import { Operation } from '../models/operation';
// import { HttpClientService } from './application-http-client.service';
// import { OperationService } from './operation.service';

// @Injectable()
// export class NotificationsService {
//   private BASE_URL = `notification`;

//   constructor(private operationsService: OperationService, @Inject('HttpClientService') private httpClient: HttpClientService) {}

//   async testSend(command: SendNotificationCommand): Promise<Operation> {
//     return await this.httpClient.post(`${this.BASE_URL}`, command);
//   }
// }
