import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
import { IConfig, INITIAL_CONFIG } from 'ngx-mask';

import { IMaskOptions } from './i-formly-input-mask.options';

@Component({
  selector: 'app-formly-input-mask',
  template: `
    <input
      matInput
      [id]="id"
      [type]="'text'"
      [readonly]="to.readonly"
      [required]="to.required"
      [errorStateMatcher]="errorStateMatcher"
      [formControl]="formControl"
      [formlyAttributes]="field"
      [tabindex]="to.tabindex"
      [placeholder]="to.placeholder"
      [mask]="maskOptions.mask"
      [patterns]="maskOptions.patterns"
      [prefix]="maskOptions.prefix"
      [suffix]="maskOptions.suffix"
      [dropSpecialCharacters]="maskOptions.dropSpecialCharacters"
      [showMaskTyped]="maskOptions.showMaskTyped"
      [clearIfNotMatch]="maskOptions.clearIfNotMatch"
      [validation]="maskOptions.validation"
      [hiddenInput]="maskOptions.hiddenInput"
      [thousandSeparator]="maskOptions.thousandSeparator"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Компонент поля ввода с маской
 */
export class FormlyInputMaskComponent extends FieldType implements OnInit {
  @ViewChild(MatInput) formFieldControl!: MatInput;

  maskOptions: IMaskOptions;

  constructor(@Inject(INITIAL_CONFIG) initialMaskConfig: Partial<IConfig>) {
    super();

    this.maskOptions = Object.assign({ mask: '' }, initialMaskConfig);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const templateOptions = this.field.templateOptions;

    if (templateOptions.maskOptions) {
      this.maskOptions = Object.assign(this.maskOptions, this.field.templateOptions.maskOptions);
    }
  }
}
