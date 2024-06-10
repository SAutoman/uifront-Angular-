export interface IdentityServerConfig {
  identityEndpoint: string;
  clientId: string;
  hostUrl: string;
  requiredScopes: string;
  responseType: string;
  state: string;
  nonce: string;
}

export interface IApisConfig {
  apiBaseUrl: string;
  redirectTo: boolean;
  apiUploadUrl: string;
  apiTranslateUrl: string;
  ccxApplicationName: string;
  ccxLocalDomain: string;
}

export interface IClaimsTypeConfig {
  email: string;
  firstName: string;
  lastName: string;
  streetAddress: string;
  country: string;
  phone: string;
  userRole: string;
  isAdmin: string;
  city: string;
  emailDomain: string;
  tenant: string;
  title: string;
  invitationEmail: string;
  language: string;
  invitationSettingId?: string;
}

export interface IConfig {
  name: string;
  identityConfig: IdentityServerConfig;
  apisConfig: IApisConfig;
  claimsTypeConfig: IClaimsTypeConfig;
  production: boolean;
}
