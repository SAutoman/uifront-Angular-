import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';

@Component({
  selector: 'app-formly-signature',
  templateUrl: './formly-signature.component.html',
  styleUrls: ['./formly-signature.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlySignatureComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  clear(): void {
    this.formControl.reset();
    this.field.defaultValue = null;
  }
}
