export const environment = {
  name: 'Cargoclix WFM Web Application',
  production: false,
  identityConfig: {
    identityEndpoint: 'https://login-stage.cargoclix.com/',
    clientId: 'ccx.wfm',
    hostUrl: 'https://localhost:5999/',
    requiredScopes: 'openid profile ccx.wfm.api ccx.document.api',
    responseType: 'id_token token',
    state: '92b7d6c791e3431f973aebb31f39a31e',
    nonce: 'd36a1a893cbf47c8b57dbca433f5d767'
  },

  apisConfig: {
    apiBaseUrl: 'https://localhost:5001/api/',
    baseUrl: 'https://localhost:5001/',
    // apiBaseUrl: 'https://wfm-api-dev.cargoclix.com/api/',
    apiUploadUrl: 'https://document-stage.cargoclix.com/api',
    apiTranslateUrl: 'https://translate-stage.cargoclix.com/api',
    redirectTo: false,
    ccxApplicationName: 'wfm-stage',
    ccxLocalDomain: 'cargoclix.com'
  },

  claimsTypeConfig: {
    email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    firstName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    lastName: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
    streetAddress: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/streetaddress',
    country: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/country',
    phone: 'ccx.phone',
    userRole: 'ccx.userRole',
    isAdmin: 'ccx.isAdmin',
    city: 'ccx.city',
    emailDomain: 'ccx.emailDomain',
    tenant: 'ccx.tenant',
    title: 'ccx.userTitle',
    invitationEmail: 'ccx.invitationEmail',
    language: 'ccx.preferredLanguageCode',
    invitationSettingId: 'invitationSettingId'
  },
  appId: '11E9629D0A9C2F04BF7C02004C4F4F50',
  sentryDsn: 'https://2b7f4d6527acd1b17004b494ed4b3483@o435178.ingest.sentry.io/4506342978158592',
  hmr: true
};

// for testing registration page locally
// redirect_uri=https%3a%2f%2flocalhost:5999%2fauth_callback%3f%26
