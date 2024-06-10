/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * project
 */
import { UserProfileResponse } from '../models';

/**
 * local
 */
import { HttpClientService } from './application-http-client.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  userProfile: UserProfileResponse;
  constructor(@Inject('HttpClientService') private httpClient: HttpClientService) {}

  getProfile(): Promise<UserProfileResponse> {
    return this.httpClient.get<UserProfileResponse>(`Users/profile`);
  }

  beginSession(): Observable<string> {
    // return this.httpClient.post('Users/begin-session', null);
    return of('sessionId123');
  }
}
