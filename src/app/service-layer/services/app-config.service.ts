/**
 * global
 */
import { Injectable, Inject, InjectionToken } from '@angular/core';

/**
 * project
 */
import { IConfig } from '../models';
/**
 * local
 */

export let APP_CONFIG_TOKEN = new InjectionToken('app.config');

@Injectable()
export class AppConfigService {
  get config(): IConfig {
    // console.log(this.conf.name);
    return this.conf;
  }

  constructor(@Inject(APP_CONFIG_TOKEN) private conf: IConfig | null) {}
}
