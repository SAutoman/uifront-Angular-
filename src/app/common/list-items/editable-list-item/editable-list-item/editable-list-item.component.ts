/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FormlyFieldConfig } from '@ngx-formly/core';

/**
 * project
 */
import { Animations } from '@wfm/animations/animations';
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
import { ListItemConfig } from '@wfm/tenant-lists/modules/tenant-list-editor/inner-tenant-list/inner-tenant-list.component';

/**
 * local
 */
import { IEditableListItemUpdateEvent } from './i-editable-listI-iem-update.event';
import { Observable, Subscription } from 'rxjs';
import { BaseComponent } from '@wfm/shared/base.component';

@Component({
  selector: 'app-editable-list-item',
  templateUrl: './editable-list-item.component.html',
  styleUrls: ['./editable-list-item.component.scss'],
  animations: Animations,
  encapsulation: ViewEncapsulation.None
})
export class EditableListItemComponent extends BaseComponent implements OnInit {
  @Input() item: any;
  @Input() valueProps$: Observable<ListItemConfig[]>;
  @Input() removeBtnCss: string[] = [];
  @Input() useRemove = true;
  @Input() options?: FormVariableDto;
  @Input() transformConfig?: (fieldConfig: FormlyFieldConfig) => void;

  @Output() edit = new EventEmitter<Event>();
  @Output() remove = new EventEmitter<Event>();
  @Output() update = new EventEmitter<IEditableListItemUpdateEvent>();

  formCss: string[] = ['col-md-8', 'col-6', 'p-0'];
  fieldClass = 'col-6';
  view: IFormlyView;
  isFirstChangeInForm: boolean;
  valueSubscription: Subscription;

  constructor(private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.valueProps$.pipe(takeUntil(this.destroyed$)).subscribe((valueProps) => {
      this.view = null;
      this.view = this.createView(valueProps);
    });
  }

  createView(valueProps: ListItemConfig[]): IFormlyView {
    if (this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }
    let model = {};
    let fields = [];

    valueProps.forEach((valueProp) => {
      model[valueProp.value] = this.item[valueProp.value];
      const dto: FormVariableDto = Object.assign(
        {
          label: valueProp.label,
          name: valueProp.value,
          type: valueProp.type,
          value: model[valueProp.value],
          required: valueProp.isRequired
        },
        this.options || {}
      );
      const adapter = FormlyFieldAdapterFactory.createAdapter(dto);

      const field = adapter.getConfig();
      field.className = this.fieldClass;

      if (valueProp.addTransformConfig && this.transformConfig) {
        this.transformConfig(field);
      }

      fields.push(field);
    });

    const view = {
      form: this.fb.group(model),
      model,
      fields
    };

    this.valueSubscription = view.form.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      if (this.isFirstChangeInForm) {
        this.update.next({
          item: this.item,
          newValue: view.model,
          valid: view.form.valid,
          // passing view.form because async validator updates form validity later than this event is emitted
          form: view.form
        });
      } else {
        this.isFirstChangeInForm = true;
      }
    });
    return view;
  }

  onEdit(e: Event): void {
    this.edit.next(e);
  }

  onRemove(e: Event): void {
    this.remove.next(e);
  }
}
