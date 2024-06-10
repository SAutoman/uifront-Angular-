/**
 * Global
 */
import { takeUntil } from 'rxjs/operators';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
/**
 * Project
 */
import { IConfigurableListItem } from '@wfm/common/models/field/i-configurable-list-item';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
/**
 * Local
 */

export interface AutoIncrementSettingsOutput {
  isAutoIncremented: boolean;
  defaultIncrementValue: number;
  valid: boolean;
}

@Component({
  selector: 'app-auto-increment-field',
  templateUrl: './auto-increment-field.component.html',
  styleUrls: ['./auto-increment-field.component.scss']
})
export class AutoIncrementFieldComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<AutoIncrementSettingsOutput>();

  autoIncrementForm: FormGroup;

  constructor(private fb: FormBuilder, store: Store<ApplicationState>) {
    super(store);
    this.autoIncrementForm = this.fb.group({
      isAutoIncrementField: [false],
      autoIncrementValue: [null, Validators.compose([Validators.required, Validators.min(1)])]
    });
  }

  ngOnInit(): void {
    if (this.field?.configuration?.isAutoIncremented) {
      this.autoIncrementForm.patchValue({
        isAutoIncrementField: this.field.configuration.isAutoIncremented,
        autoIncrementValue: this.field.configuration.defaultIncrementValue
      });
    }
    this.autoIncrementForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
      this.emitToParent();
    });
  }

  emitToParent(): void {
    const output = this.createOutputEvent();
    this.update.next(output);
  }

  createOutputEvent(): AutoIncrementSettingsOutput {
    const formValue = this.autoIncrementForm.value;

    let output: AutoIncrementSettingsOutput = {
      isAutoIncremented: formValue.isAutoIncrementField,
      defaultIncrementValue: formValue.isAutoIncrementField ? formValue.autoIncrementValue : null,
      valid: formValue.isAutoIncrementField ? this.autoIncrementForm.valid : true
    };
    return output;
  }
}
