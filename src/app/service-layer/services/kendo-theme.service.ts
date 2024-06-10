/**
 * global
 */
import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/**
 * project
 */
import { ColorEnum } from '@wfm/service-layer/models/color.enum';

@Injectable({
  providedIn: 'root'
})
export class KendoThemeService {
  theme: string;
  constructor(@Inject(DOCUMENT) private document: Document) {}

  applyTheme(color: ColorEnum): void {
    this.theme = color;
    const head = this.document.getElementsByTagName('head')[0];
    const style = this.document.createElement('link');
    style.id = 'css-styling';
    style.rel = 'stylesheet';
    style.href = color ? `../../../assets/styles/colors/kendo-colors/${color}.css` : '';
    head.appendChild(style);
  }
}
