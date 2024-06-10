/**
 * global
 */
import { Injectable } from '@angular/core';
import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { MissingTranslationSaverService } from './missingtranslationsaver.service';

/**
 * project
 */

/**
 * local
 */

@Injectable()
export class MissingTranslationHandlerService implements MissingTranslationHandler {
  constructor(private missingTranslationSaver: MissingTranslationSaverService) {}

  public handle(params: MissingTranslationHandlerParams): string {
    if (
      params &&
      params.key &&
      params.translateService &&
      params.translateService.missingTranslationHandler &&
      params.translateService.currentLang
    ) {
      // trim the key
      const trimmedKey = params.key.trim();

      // check if a  context is specified in the keys
      const contextSeparator = '!@!';
      const contextSeparatorIndex = trimmedKey.indexOf(contextSeparator);
      if (contextSeparatorIndex !== -1) {
        // split by the context delimter
        const value = trimmedKey.substring(contextSeparatorIndex + contextSeparator.length);
        if (!value || value.length === 0) {
          // value not specified
          return trimmedKey;
        }
      }

      // check if the key is not already contained in the array
      const _thisHandler = params.translateService.missingTranslationHandler as MissingTranslationHandlerService;
      _thisHandler.missingTranslationSaver.addKey(trimmedKey);

      // return the current key as a translation
      return trimmedKey;
    }
    // console.log('a')
    // return the current key as a translation
    return params.key;
  }
}
