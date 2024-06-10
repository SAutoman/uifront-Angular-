import { Component, OnDestroy, OnInit } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';
import { getHyperlinkUrl } from '@wfm/shared/utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Addons } from '../addonNames';
import { HyperLinkVisibiltySettingEnum } from '@wfm/common/field/field-hyperlink-settings/field-hyperlink-settings.component';

export interface IFormlyHyperlinkConfig {
  hyperlinkTemplate: string;
  hyperLinkVisibility: HyperLinkVisibiltySettingEnum;
  customHyperLinkLabel?: string;
}

@Component({
  selector: 'app-formly-hyperlink-addon',
  templateUrl: './formly-hyperlink-addon.component.html',
  styleUrls: ['./formly-hyperlink-addon.component.scss']
})
export class FormlyHyperlinkAddonComponent extends FieldWrapper implements OnInit, OnDestroy {
  config: IFormlyHyperlinkConfig;
  finalUrl: string;
  protected destroyed$ = new Subject<any>();
  hyperLinkLabel: string;
  linkSetting: HyperLinkVisibiltySettingEnum;

  constructor() {
    super();
  }

  ngOnInit() {
    this.config = this.to[Addons.hyperlink];
    this.linkSetting = this.config?.hyperLinkVisibility
      ? this.config.hyperLinkVisibility
      : HyperLinkVisibiltySettingEnum.hyperLinkWithValue;
    if (this.formControl?.value || this.formControl?.value === false || this.formControl?.value === 0) {
      this.setLinkDetails(this.formControl.value);
    }
    this.listenForControlChanges();
  }

  listenForControlChanges(): void {
    this.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((newValue) => {
      if (newValue || newValue === false || newValue === 0) {
        // todo: add support for List fieldType
        this.setLinkDetails(newValue);
      } else this.finalUrl = null;
    });
  }

  setLinkDetails(value: any): void {
    this.finalUrl = getHyperlinkUrl(this.config.hyperlinkTemplate, value.toString());

    if (this.linkSetting === HyperLinkVisibiltySettingEnum.onlyValue) {
      this.hyperLinkLabel = value;
    } else if (this.linkSetting === HyperLinkVisibiltySettingEnum.custom) {
      this.hyperLinkLabel = this.config.customHyperLinkLabel;
    } else this.hyperLinkLabel = this.finalUrl;
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
