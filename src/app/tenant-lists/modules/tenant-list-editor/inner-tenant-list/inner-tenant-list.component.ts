/**
 * global
 */
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { remove, cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { ErrorMessageGenerator, ErrorMessageTypeEnum } from '@wfm/common/error-message-generator';

import { IDropHandler } from '@wfm/forms-flow-struct';
import { FieldTypeIds, ListItemDto } from '@wfm/service-layer';

import { IEditableListItemUpdateEvent } from '@wfm/common/list-items';
import { IValidableModel } from '@wfm/common/models';
import { Guid } from '@wfm/shared/guid';
import { BaseComponent } from '@wfm/shared/base.component';
import { emptyStringValidatorAsRequiredFn, uniqNameValidator } from '@wfm/service-layer/helpers';

/**
 * local
 */
import { IListForm } from '../tenant-list-editor/tenant-list-editor.component';

export interface ListItemConfig {
  label: string;
  value: string;
  type: FieldTypeIds;
  isRequired: boolean;
  addTransformConfig: boolean;
}

@Component({
  selector: 'app-inner-tenant-list',
  templateUrl: './inner-tenant-list.component.html',
  styleUrls: ['./inner-tenant-list.component.scss']
})
export class InnerTenantListComponent extends BaseComponent implements OnInit, IDropHandler<ListItemDto>, AfterViewInit {
  @Input() parentListId?: string;
  @Input() listData?: IListForm;
  @Input() currentListId?: string;
  /**
   * listItems
   */
  @Input() listItems?: ListItemDto[];
  @Input() keySetting$: Observable<boolean>;
  @Output() update = new EventEmitter<IValidableModel<ListItemDto[]>>();
  @Output() fieldChange = new EventEmitter<boolean>();

  listItems$: BehaviorSubject<ListItemDto[]> = new BehaviorSubject([]);
  transformConfigFn: (fieldConfig: FormlyFieldConfig) => void;
  keyEnabled: boolean;
  listItemProps$: BehaviorSubject<ListItemConfig[]> = new BehaviorSubject([]);

  constructor(private ts: TranslateService, private elementRef: ElementRef) {
    super();
  }

  ngOnInit(): void {
    this.transformConfigFn = (f) => {
      f.validators = {
        required: {
          expression: (x) => !emptyStringValidatorAsRequiredFn()(x)
        }
      };
      f.asyncValidators = {
        [ErrorMessageTypeEnum.uniqueName]: {
          expression: (x) => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                const propName = <string>f.key;
                const values = (this.listItems$.getValue() || []).map((x) => x[propName] || '');
                const validationError = uniqNameValidator(values)(x);
                resolve(!validationError);
              }, 300);
            });
          },
          message: ErrorMessageGenerator.get(ErrorMessageTypeEnum.uniqueName)
        }
      };
    };

    if (this.listItems) {
      this.listItems.forEach((x) => {
        x.valid = true;
        x.uiId = Guid.createQuickGuidAsString();
      });
      this.listItems$.next(this.listItems);
      this.emitNext(this.listItems);
    }

    this.keySetting$.pipe(takeUntil(this.destroyed$)).subscribe((keyEnabled: boolean) => {
      this.keyEnabled = keyEnabled;
      if (keyEnabled) {
        this.listItemProps$.next([
          {
            label: this.ts.instant('Disable'),
            value: 'isDisabled',
            type: FieldTypeIds.BoolField,
            isRequired: false,
            addTransformConfig: false
          },
          {
            label: this.ts.instant('Key'),
            value: 'key',
            type: FieldTypeIds.StringField,
            isRequired: true,
            // disabled based on requirement - WFM-3240
            addTransformConfig: false
          },
          {
            label: this.ts.instant('Value'),
            value: 'item',
            type: FieldTypeIds.StringField,
            isRequired: true,
            // disabled based on requirement - WFM-3240
            addTransformConfig: false
          }
        ]);
      } else {
        this.listItemProps$.next([
          {
            label: this.ts.instant('Disable'),
            value: 'isDisabled',
            type: FieldTypeIds.BoolField,
            isRequired: false,
            addTransformConfig: false
          },
          {
            label: this.ts.instant('Value'),
            value: 'item',
            isRequired: false,
            // disabled based on requirement - WFM-3240
            addTransformConfig: false,
            type: FieldTypeIds.StringField
          }
        ]);
      }
    });
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  onCreateItem(items: ListItemDto[]): void {
    const newItem: ListItemDto = {
      uiId: Guid.createQuickGuidAsString(),
      id: undefined,
      item: '',
      key: '',
      listId: this.currentListId,
      parentListItemId: this.parentListId,
      position: items?.length || 0,
      valid: false
    };

    const newItems: ListItemDto[] = [...items, newItem];
    this.updatePositions(newItems);
    setTimeout(() => {
      this.scrollToBottom();
    });

    this.listItems$.next(newItems);

    this.emitNext(newItems);
    this.fieldChange.emit(true);
  }

  onRemove(item: ListItemDto, items: ListItemDto[]): void {
    const newItems = cloneDeep(items);
    remove(newItems, (x) => x.uiId === item.uiId);

    this.updatePositions(newItems);
    this.listItems$.next(newItems);
    this.emitNext(newItems);
    this.fieldChange.emit(true);
  }

  onDrop(event: CdkDragDrop<ListItemDto[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.updatePositions(event.container.data);
      this.emitNext(event.container.data);
      this.fieldChange.emit(true);
    }
  }

  onUpdate(e: IEditableListItemUpdateEvent, items: ListItemDto[]): void {
    e.item.item = e.newValue?.item;
    if (this.keyEnabled) {
      e.item.key = e.newValue?.key;
    }
    e.item.isDisabled = e.newValue?.isDisabled;
    e.item.valid = e.valid;
    e.item.form = e.form;
    this.emitNext(items);
    this.fieldChange.emit(true);
  }

  private updatePositions(items: ListItemDto[]): void {
    items.forEach((x, idx) => {
      if (x.position !== idx) {
        x.position = idx;
      }
    });
  }

  private emitNext(items: ListItemDto[]): void {
    this.update.next({
      model: items,
      valid: items.every((x) => x.valid)
    });
  }

  scrollToBottom(): void {
    const container = this.elementRef.nativeElement.querySelector('#list-bottom');
    if (container) {
      container.scrollTop = container?.scrollHeight;
    }
  }
}
