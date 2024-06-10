import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { AreaTypeEnum, IFieldValidatorUi, ValidatorTypeMap } from '@wfm/service-layer';
import { TranslationService } from '@wfm/service-layer/services/translate.service';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListItemComponent {
  @Input() name: string = 'Field name';
  @Input() nameParam?: string;

  @Input() useRemove = true;
  @Input() useEdit = true;
  @Input() useDragEndDrop = false;

  @Input() disabledDragEndDrop = false;
  @Input() disabledRemove = false;
  @Input() disabledEdit = false;
  @Input() disabledAll = false;
  @Input() validators: IFieldValidatorUi[];
  @Input() additionalInfo?: string[] = [];
  @Input() fieldType: AreaTypeEnum;
  @Input() showExtIdentifierLabel?: boolean;

  @Output() edit = new EventEmitter<Event>();
  @Output() remove = new EventEmitter<Event>();

  constructor(private translate: TranslationService) {}

  onEdit(e: Event): void {
    this.edit.next(e);
  }

  onRemove(e: Event): void {
    this.remove.next(e);
  }

  getValidatorName(validatorType: string): string {
    const validatorKv = ValidatorTypeMap.get(validatorType);
    return validatorKv.viewValue;
  }

  ngOnChanges(change: SimpleChanges): void {
    if (change?.fieldType) {
      this.fieldType = +change.fieldType.currentValue;
    }
  }
}
