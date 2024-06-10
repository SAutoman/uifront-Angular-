/**
 * global
 */

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { IConfigurableListItem, IFormlyView } from '@wfm/common/models';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
export interface IFieldHighlightOutput {
  allowHighlighting?: boolean;
  highlightColor?: string;
  dirty: boolean;
  valid: boolean;
}

/**
 * local
 */
@Component({
  selector: 'app-field-highlights',
  templateUrl: './field-highlights.component.html',
  styleUrls: ['./field-highlights.component.scss']
})
export class FieldHighlightsComponent extends TenantComponent implements OnInit {
  @Input() field?: IConfigurableListItem;
  @Output() update = new EventEmitter<IFieldHighlightOutput>();
  localFieldCopy: IConfigurableListItem;
  highlightForm: FormGroup;
  view: IFormlyView<any>;
  highlightColors = [
    {
      key: 'red',
      name: 'Red'
    },
    {
      key: 'blue',
      name: 'Blue'
    },
    {
      key: 'green',
      name: 'Green'
    },
    {
      key: 'yellow',
      name: 'Yellow'
    }
  ];
  get allowHighlighting(): FormControl {
    return <FormControl>this.highlightForm.get('allowHighlighting');
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
    this.highlightForm = this.fb.group({
      allowHighlighting: [],
      highlightColor: [null, Validators.required]
    });

    this.highlightForm
      .get('allowHighlighting')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((isHighlightAllowed) => {
        if (!isHighlightAllowed) {
          this.highlightForm.get('highlightColor').setValue(null, { emitEvent: false });
        }
        setTimeout(() => {
          this.emitToParent();
        });
      });

    this.highlightForm
      .get('highlightColor')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        setTimeout(() => {
          this.emitToParent();
        });
      });

    if (this.localFieldCopy.configuration.allowHighlighting) {
      this.highlightForm.patchValue({
        allowHighlighting: this.localFieldCopy.configuration.allowHighlighting,
        highlightColor: this.localFieldCopy.configuration.highlightColor
      });
    }
  }

  emitToParent(): void {
    const output = this.createOutputEvent();
    this.update.next(output);
  }

  createOutputEvent(): IFieldHighlightOutput {
    const formValue = this.highlightForm.value;

    let output: IFieldHighlightOutput = {
      allowHighlighting: formValue['allowHighlighting'],
      highlightColor: formValue['highlightColor'],
      dirty: this.highlightForm.dirty,
      valid: formValue['allowHighlighting'] ? this.highlightForm.valid : true
    };
    return output;
  }
}
