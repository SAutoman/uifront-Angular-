/**
 * global
 */
import { Injectable, Inject } from '@angular/core';
import {
  TranslateLoader,
  TranslateCompiler,
  USE_STORE,
  MissingTranslationHandler,
  TranslateParser,
  TranslateService,
  TranslateStore
} from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * project
 */

/**
 * local
 */

@Injectable()
export class CcxTranslateService extends TranslateService {
  constructor(
    store: TranslateStore,
    currentLoader: TranslateLoader,
    compiler: TranslateCompiler,
    parser: TranslateParser,
    missingTranslationHandler: MissingTranslationHandler,
    @Inject(USE_STORE) isolate?: boolean
  ) {
    super(store, currentLoader, compiler, parser, missingTranslationHandler, true, isolate, true, 'en-US');
  }

  get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
    return super.get(key, interpolateParams).pipe(
      map((res: string | any) => {
        const postProcessValues = (value: string) => {
          // trim the key
          const trimmedKey = value.trim();

          // check if a context is specified in the key
          const contextSeparator = '!@!';
          const contextSeparatorIndex = trimmedKey.indexOf(contextSeparator);
          if (contextSeparatorIndex === -1) {
            // no context specified
            return trimmedKey;
          }

          // return the value part
          return trimmedKey.substring(contextSeparatorIndex + contextSeparator.length);
        };

        if (typeof res === 'string') {
          return postProcessValues(res);
        } else {
          for (const k in res) {
            if (res.hasOwnProperty(k)) {
              const value = postProcessValues(res[k]);
              res[k] = value;
            }
          }
          return res;
        }
      })
    );
  }
}
