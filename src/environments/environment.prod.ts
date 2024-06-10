import * as e from './environment.base';

export const environment = {
  ...e.environment,
  name: e.environment.name + ' (Production)',
  production: true,
  identityConfig: {
    ...e.environment.identityConfig,
    identityEndpoint: 'https://login.cargoclix.com/',

    // for lcoal
    // hostUrl: 'https://localhost:5999/',

    // for remote
    // hostUrl: 'https://wfm.cargoclix.com/',
    /**
     * TODO Can't run it from localhost
     */
    hostUrl: 'https://wfm.cargoclix.com/'
  },
  apisConfig: {
    ...e.environment.apisConfig,
    apiBaseUrl: 'https://wfm-api.cargoclix.com/api/',
    baseUrl: 'https://wfm-api.cargoclix.com/',

    apiUploadUrl: 'https://document.cargoclix.com/api',
    apiTranslateUrl: 'https://translate.cargoclix.com/api',
    redirectTo: true,
    ccxApplicationName: 'wfm'
  }
};
