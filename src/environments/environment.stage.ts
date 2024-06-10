import * as e from './environment.base';

export const environment = {
  ...e.environment,
  production: true,
  name: e.environment.name + ' (Staging)',
  identityConfig: {
    ...e.environment.identityConfig,

    // for lcoal
    // hostUrl: 'https://localhost:5999/',

    // for remote
    // hostUrl: 'https://wfm-stage.cargoclix.com/',
    /**
     * TODO Can't run it from localhost
     */
    hostUrl: 'https://wfm-stage.cargoclix.com/'
  },
  apisConfig: {
    ...e.environment.apisConfig,
    apiBaseUrl: 'https://wfm-api-stage.cargoclix.com/api/',
    baseUrl: 'https://wfm-api-stage.cargoclix.com/',

    redirectTo: true
  }
};
