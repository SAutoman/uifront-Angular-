import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { takeUntil } from 'rxjs/operators';

export interface IFieldHyperlinkSettingsOutput {
  isHyperlink?: boolean;
  hyperlinkTemplate?: string;
  dirty: boolean;
  valid: boolean;
  hyperLinkVisibility: HyperLinkVisibiltySettingEnum;
  customHyperLinkLabel?: string;
}

export enum HyperLinkVisibiltySettingEnum {
  hyperLinkWithValue = 0,
  onlyValue,
  custom
}

const urlRegexWithBraces = /^http(s)?:\/\/[(www\.)?a-zA-Z0-9@:%._\+~#={}]{2,256}\.[a-z{}]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//={}]*)/;

@Component({
  selector: 'app-field-hyperlink-settings',
  templateUrl: './field-hyperlink-settings.component.html',
  styleUrls: ['./field-hyperlink-settings.component.scss']
})
export class FieldHyperlinkSettingsComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<IFieldHyperlinkSettingsOutput>();
  localFieldCopy: IConfigurableListItem;
  hyperlinkForm: FormGroup;
  view: IFormlyView<any>;

  get allowHyperlinkControl(): FormControl {
    return <FormControl>this.hyperlinkForm?.get('allowHyperlink');
  }

  get hyperlinkTemplateControl(): FormControl {
    return <FormControl>this.hyperlinkForm?.get('hyperlinkTemplate');
  }

  get hyperLinkSetting() {
    return HyperLinkVisibiltySettingEnum;
  }

  constructor(private fb: FormBuilder, store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit() {
    this.localFieldCopy = { ...this.field };
    this.localFieldCopy.configuration = this.localFieldCopy.configuration || {
      position: 0
    };
    this.populateForm();
  }

  populateForm(): void {
    this.hyperlinkForm = this.fb.group({
      allowHyperlink: [],
      hyperlinkTemplate: [null, [Validators.required, Validators.pattern(urlRegexWithBraces)]],
      hyperLinkVisibilitySetting: [HyperLinkVisibiltySettingEnum.hyperLinkWithValue],
      customLabel: [null]
    });
    this.hyperlinkForm
      .get('allowHyperlink')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isHyperlinkAllowed) => {
        if (!isHyperlinkAllowed) {
          this.hyperlinkForm.get('hyperlinkTemplate').setValue(null, { emitEvent: false });
          this.hyperlinkForm
            .get('hyperLinkVisibilitySetting')
            .setValue(HyperLinkVisibiltySettingEnum.hyperLinkWithValue, { emitEvent: false });
        }
        setTimeout(() => {
          this.emitToParent();
        });
      });

    this.hyperlinkForm
      .get('hyperlinkTemplate')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        setTimeout(() => {
          this.emitToParent();
        });
      });

    this.hyperlinkForm
      .get('hyperLinkVisibilitySetting')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        setTimeout(() => {
          this.emitToParent();
        });
      });

    this.hyperlinkForm
      .get('customLabel')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        setTimeout(() => {
          this.emitToParent();
        });
      });

    if (this.localFieldCopy.configuration.isHyperlink) {
      this.hyperlinkForm.patchValue({
        allowHyperlink: this.localFieldCopy.configuration.isHyperlink,
        hyperlinkTemplate: this.localFieldCopy.configuration.hyperlinkTemplate,
        hyperLinkVisibilitySetting: this.localFieldCopy.configuration.hyperLinkVisibility,
        customLabel: this.localFieldCopy.configuration.customHyperLinkLabel
      });
    }
  }

  emitToParent(): void {
    const output = this.createOutputEvent();
    this.update.next(output);
  }

  createOutputEvent(): IFieldHyperlinkSettingsOutput {
    const formValue = this.hyperlinkForm.value;

    let output: IFieldHyperlinkSettingsOutput = {
      isHyperlink: formValue['allowHyperlink'],
      hyperlinkTemplate: formValue['hyperlinkTemplate'],
      dirty: this.hyperlinkForm.dirty,
      valid: this.isValid(formValue),
      hyperLinkVisibility: formValue.hyperLinkVisibilitySetting,
      customHyperLinkLabel:
        formValue.hyperLinkVisibilitySetting === HyperLinkVisibiltySettingEnum.custom ? formValue?.customLabel?.trim() : null
    };
    return output;
  }

  isValid(formValue: any): boolean {
    if (formValue?.allowHyperlink) {
      if (formValue?.hyperLinkVisibilitySetting === HyperLinkVisibiltySettingEnum.custom) {
        return formValue?.customLabel?.trim()?.length ? true : false;
      }
      return this.hyperlinkForm.valid;
    }
    return true;
  }
}
