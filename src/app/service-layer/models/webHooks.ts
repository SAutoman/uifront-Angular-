import { MethodTypes, PayloadTypes, SubscriptionAuthorizationTypes } from './webHooks-enum';

export interface WebHook {
  name: string;
  webhookUri: string;
  httpMethod: MethodTypes;
  payloadType: PayloadTypes;
  isActive: boolean;
  headers: { [key: string]: string };
  authorizationInfo: {
    type: SubscriptionAuthorizationTypes;
    basicAuthorizationInfo?: BasicAuthorizationInfo;
    oAuthInfo?: OAuthInfo;
    apiKeyAuthorization?: ApiKeyAuthorization;
    oAuthPasswordInfo?: OAuthPasswordInfo;
  };
}

export interface BasicAuthorizationInfo {
  username?: string;
  password?: string;
}

export interface ApiKeyAuthorization {
  key?: string;
  value?: string;
  addToHeader?: boolean;
}

export interface OAuthPasswordInfo extends BasicAuthorizationInfo {
  tokenEndpoint?: string;
  clientId?: string;
  clientSecret?: string;
  scopes?: string[];
}

export interface OAuthInfo {
  grantType?: number;
  clientCredentialsInfo?: ClientCredentialsInfo;
}

// interface GrantType {
//     clientCredentials: number;
// }

interface ClientCredentialsInfo {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
}

export interface AuthDetails {
  username: string;
  password: string;
  grantType: number;
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  key: string;
  value: string;
  addToHeader: boolean;
}

export interface WebHookData extends WebHook {
  clientId: string;
  id: string;
  subscribedEvents: any[];
}
