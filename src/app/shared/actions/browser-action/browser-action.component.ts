import { KeyValue } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDto } from '@wfm/service-layer';
import { BrowserActionEventDto, BrowserActionTypeEnum, EventAreaScopes } from '@wfm/service-layer/models/actionDto';
import { BaseComponent } from '@wfm/shared/base.component';
import { takeUntil } from 'rxjs/operators';

export interface BrowserActionData {
  browserActionType: BrowserActionTypeEnum;
  actionParams: string;
  isValid: boolean;
}

@Component({
  selector: 'app-browser-action',
  templateUrl: './browser-action.component.html',
  styleUrls: ['./browser-action.component.scss']
})
export class BrowserActionComponent extends BaseComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: BrowserActionEventDto;
  @Input() actionScope?: EventAreaScopes;
  @Output() outputEmitter: EventEmitter<BrowserActionData> = new EventEmitter();
  browserActionTypes: KeyValue<string, BrowserActionTypeEnum>[];
  form: FormGroup;
  constructor(private fb: FormBuilder, private ts: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.browserActionTypes = [
      {
        key: this.ts.instant('Print The Case'),
        value: BrowserActionTypeEnum.Print
      },
      {
        key: this.ts.instant('Download The Case'),
        value: BrowserActionTypeEnum.Download
      }
    ];

    this.initForm();

    if (this.actionDto) {
      this.updateForm();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      actionType: [BrowserActionTypeEnum.Print, Validators.required]
    });
    this.emitData();
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.emitData();
    });
  }

  updateForm(): void {
    this.form.setValue({
      actionType: this.actionDto.browserActionType
    });
  }

  emitData(): void {
    const data: BrowserActionData = {
      browserActionType: this.form.get('actionType').value,
      actionParams: '',
      isValid: this.form.valid
    };
    this.outputEmitter.emit(data);
  }
}
