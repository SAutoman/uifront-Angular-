import * as e from './environment.base';

export const environment = {
  ...e.environment,
  name: e.environment.name + ' (Development)',
  identityConfig: {
    ...e.environment.identityConfig,
    // for lcoal
    // hostUrl: 'https://localhost:5999/',

    // for remote
    // hostUrl: 'https://wfm-dev.cargoclix.com/',

    /**
     * TODO Can't run it from localhost
     */
    hostUrl: 'https://wfm-dev.cargoclix.com/'
  },
  apisConfig: {
    ...e.environment.apisConfig,
    apiBaseUrl: 'https://wfm-api-dev.cargoclix.com/api/',
    baseUrl: 'https://wfm-api-dev.cargoclix.com/',

    redirectTo: true
  }
};
