import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { isUndefinedOrNull } from '@wfm/shared/utils';

@Pipe({
  name: 'sanitize'
})
export class SanitizePipe implements PipeTransform {
  constructor(private domS: DomSanitizer) {}

  transform(content: any, type: string): string | SafeHtml {
    let sanitized: string | SafeHtml;
    if (!isUndefinedOrNull(content)) {
      switch (type) {
        case 'html':
          sanitized = this.domS.sanitize(SecurityContext.HTML, content.toString());
          break;
        case 'url':
          sanitized = <string>this.domS.sanitize(SecurityContext.URL, content.toString());
          break;
        case 'script':
          sanitized = <string>this.domS.sanitize(SecurityContext.SCRIPT, content.toString());
          break;
        case 'url':
          sanitized = <string>this.domS.sanitize(SecurityContext.URL, content.toString());
          break;
        case 'resourceUrl':
          sanitized = <string>this.domS.sanitize(SecurityContext.RESOURCE_URL, content.toString());
          break;
        case 'noSanitize':
          sanitized = <SafeHtml>this.domS.bypassSecurityTrustHtml(content);
        default:
          break;
      }
    }
    return sanitized;
  }
}
