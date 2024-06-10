import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { IConfigurableListItem } from '@wfm/common/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { takeUntil } from 'rxjs/operators';

export interface ThumbnailSettingsOutput {
  thumbnailEnabled: boolean;
  imageMaxSize: number;
  aspectRatio?: string;
  valid: boolean;
}

@Component({
  selector: 'app-thumbnail-settings',
  templateUrl: './thumbnail-settings.component.html',
  styleUrls: ['./thumbnail-settings.component.scss']
})
export class ThumbnailSettingsComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<ThumbnailSettingsOutput>();

  thumbnailSettingForm: FormGroup;

  constructor(private fb: FormBuilder, store: Store<ApplicationState>, private snackbar: MatSnackBar, private ts: TranslateService) {
    super(store);
    this.thumbnailSettingForm = this.fb.group({
      enableSetting: [false],
      imageMaxSize: [null, Validators.compose([Validators.required, Validators.min(1), Validators.max(200)])],
      aspectRatio: [null],
      aspectRatioWidth: [null],
      aspectRatioHeight: [null]
    });
  }

  ngOnInit(): void {
    if (this.field?.configuration?.thumbnailEnabled) {
      let aspectRatioValues: string[];
      if (this.field?.configuration?.aspectRatio) {
        aspectRatioValues = this.field.configuration.aspectRatio?.split(':');
        this.thumbnailSettingForm.controls.aspectRatioWidth.setValue(+aspectRatioValues[0]);
        this.thumbnailSettingForm.controls.aspectRatioHeight.setValue(+aspectRatioValues[1]);
      }
      this.thumbnailSettingForm.patchValue({
        enableSetting: this.field.configuration.thumbnailEnabled,
        imageMaxSize: this.field.configuration.imageMaxSize,
        aspectRatio: this.field?.configuration?.aspectRatio ? true : false,
        aspectRatioWidth: aspectRatioValues?.length ? +aspectRatioValues[0] : null,
        aspectRatioHeight: aspectRatioValues?.length ? +aspectRatioValues[1] : null
      });
    }
    this.thumbnailSettingForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.emitToParent();
    });
    this.emitToParent();
  }

  emitToParent(): void {
    const output = this.createOutputEvent();
    this.update.next(output);
  }

  createOutputEvent(): ThumbnailSettingsOutput {
    const formValue = this.thumbnailSettingForm.value;

    let output: ThumbnailSettingsOutput = {
      thumbnailEnabled: formValue.enableSetting,
      imageMaxSize: formValue.enableSetting ? formValue.imageMaxSize : null,
      aspectRatio: formValue?.aspectRatio ? this.getAspectRatio(formValue) : null,
      valid: this.isValid(formValue)
    };
    return output;
  }

  isValid(formValue): boolean {
    if (formValue?.enableSetting) {
      if (!this.thumbnailSettingForm.valid) return false;
    }
    if (formValue?.aspectRatio) {
      if (formValue?.aspectRatioWidth <= 0 || formValue?.aspectRatioHeight <= 0) return false;
    }
    return true;
  }

  getAspectRatio(formValue): string {
    const aspectRatio = `${formValue?.aspectRatioWidth}:${formValue?.aspectRatioHeight}`;
    return aspectRatio;
  }
}
