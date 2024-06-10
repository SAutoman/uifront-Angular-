import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldType } from '@ngx-formly/material/form-field';

@Component({
  selector: 'app-formly-number-field',
  templateUrl: './formly-number-field.component.html',
  styleUrls: ['./formly-number-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyNumberFieldComponent extends FieldType implements OnInit {
  constructor() {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
