import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IConfigurableListItem } from '@wfm/common/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { takeUntil } from 'rxjs/operators';

export enum FileNameSettingEnum {
  default = 1,
  dateTime
}

@Component({
  selector: 'app-file-name-settings',
  templateUrl: './file-name-settings.component.html',
  styleUrls: ['./file-name-settings.component.scss']
})
export class FileNameSettingsComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Output() fileNameSettingEmitter: EventEmitter<FileNameSettingEnum> = new EventEmitter();

  fileNameSettingControl: FormControl;

  get fileNameSetting() {
    return FileNameSettingEnum;
  }

  constructor(store: Store<ApplicationState>) {
    super(store);
    this.fileNameSettingControl = new FormControl(FileNameSettingEnum.default);
  }

  ngOnInit(): void {
    if (this.field?.configuration?.fileNameSetting) {
      this.fileNameSettingControl.setValue(this.field.configuration.fileNameSetting);
    }

    this.fileNameSettingControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      if (value) {
        this.fileNameSettingEmitter.emit(value);
      }
    });
  }
}
