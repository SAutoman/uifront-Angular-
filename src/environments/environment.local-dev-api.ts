import * as e from './environment.base';

export const environment = {
  ...e.environment,
  name: e.environment.name + ' (local-dev-api)',
  apisConfig: {
    ...e.environment.apisConfig,
    apiBaseUrl: 'https://wfm-api-dev.cargoclix.com/api/',
    baseUrl: 'https://wfm-api-dev.cargoclix.com/'
  }
};
