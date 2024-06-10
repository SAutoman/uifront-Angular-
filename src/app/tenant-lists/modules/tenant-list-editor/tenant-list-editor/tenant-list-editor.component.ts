/**
 * global
 */
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { cloneDeep, sortBy } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

/**
 * project
 */
import { IConfigurableListItem, IFormlyView, IKeyValueView, IValidableModel, KeyValueView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds, ListItemDto } from '@wfm/service-layer';

import { BaseComponent } from '@wfm/shared/base.component';
import { PopupAlertComponent } from '@wfm/shared/popup-alert/popup-alert.component';
import { unsavedDataWarningMessage } from '@wfm/shared/consts/unsaved-data-warning';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { ConfirmActionData } from '@wfm/service-layer/models/confirm-action';
import { emptyStringValidatorAsRequiredFn } from '@wfm/service-layer/helpers';
/**
 * local
 */

export interface IListForm {
  name: string;
  parentListItem?: IConfigurableListItem;
  listItemKeyEnabled?: boolean;
}

interface IParentViewItem {
  parent: ListItemDto;
  children: ListItemDto[];
}
interface IParentView {
  parentId: string;
  items: IParentViewItem[];
}

interface IView {
  listForm: IFormlyView<IListForm>;
  parent$: BehaviorSubject<IParentView>;
}

type Key = keyof IListForm;
const nameKey: Key = 'name';
const parentListItemKey: Key = 'parentListItem';
const keyForListItemKeyEnabled: Key = 'listItemKeyEnabled';

export interface ListItemDtoWithForm extends ListItemDto {
  form?: FormGroup;
}

@Component({
  selector: 'app-tenant-list-editor',
  templateUrl: './tenant-list-editor.component.html',
  styleUrls: ['./tenant-list-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }]
})
export class TenantListEditorComponent extends BaseComponent implements OnInit {
  /**
   * all existing lists in app
   */
  @Input() lists: IConfigurableListItem[] = [];
  /**
   * List item for edit
   */
  @Input() listField?: IConfigurableListItem;

  @Output() save = new EventEmitter<IConfigurableListItem>();

  view$: Observable<IView>;
  isUpdate: boolean = false;

  private listWithoutParent: IValidableModel<ListItemDtoWithForm[]>;
  private listMapWithParent = new Map<string, IValidableModel<ListItemDtoWithForm[]>>();

  fieldChange: boolean;
  listItemKeySetting$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private fb: FormBuilder, private dialog: MatDialog, private ts: TranslateService) {
    super();
  }

  ngOnInit(): void {
    this.isUpdate = !!this.listField;
    this.view$ = this.createView();
  }

  private createView(): Observable<IView> {
    return of(true).pipe(
      map(() => {
        const listForm = this.createListView();
        const parentFieldRef = listForm.fields[1];
        const parent$ = new BehaviorSubject<IParentView>(undefined);

        parentFieldRef.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((parent) => {
          parent$.next(this.createParentView(parent));
        });

        setTimeout(() => {
          listForm.form
            .get(keyForListItemKeyEnabled)
            .valueChanges.pipe(takeUntil(this.destroyed$))
            .subscribe((keyEnabled: boolean) => {
              this.listItemKeySetting$.next(keyEnabled);
            });
        });

        const view: IView = {
          listForm: listForm,
          parent$: parent$
        };

        if (listForm.model.parentListItem) {
          parent$.next(this.createParentView(listForm.model.parentListItem));
        }
        return view;
      })
    );
  }

  isValidForm(view: IView): boolean {
    return view.listForm.form.valid && this.areListItemsValid();
  }

  areListItemsValid(): boolean {
    if (this.listWithoutParent) {
      return this.checkListItemsValidity(this.listWithoutParent.model);
    } else if (this.listMapWithParent?.size > 0) {
      return [...this.listMapWithParent.values()].every((item) => {
        return this.checkListItemsValidity(item.model);
      });
    }
    return true;
  }

  checkListItemsValidity(items: ListItemDtoWithForm[]): boolean {
    return items.every((item) => {
      return item.valid || item.form?.valid;
    });
  }

  onSaveForm(view: IView): void {
    if (this.isListNameAlreadyUsed(view)) {
      this.dialog.open(PopupAlertComponent, {
        data: { message: this.ts.instant('There is another List with the same name already!') },
        minWidth: 300,
        panelClass: []
      });
      return;
    }
    const parentList = view.parent$.getValue();
    const listField: IConfigurableListItem = cloneDeep(this.listField) || this.createEmptyList(view);
    let options: ListItemDto[] = [];
    if (!parentList) {
      listField.configuration.parentListId = undefined;
      options = (this.listWithoutParent?.model || []).map((listItem) => {
        return this.processListItemKey(listItem, view.listForm.model.listItemKeyEnabled);
      });
    } else {
      [...this.listMapWithParent.values()].forEach((x) => {
        (x.model || []).forEach((listItem) => {
          options.push(this.processListItemKey(listItem, view.listForm.model.listItemKeyEnabled));
        });
      });
    }
    this.updateInternal(options, view, listField, parentList?.parentId);
    this.fieldChange = false;
  }

  processListItemKey(listItem: ListItemDtoWithForm, isListItemKeyEnabled: boolean): ListItemDto {
    if (!isListItemKeyEnabled && listItem.key) {
      delete listItem.key;
    }
    delete listItem.form;
    return listItem;
  }

  async onCloseForm(view: IView): Promise<void> {
    if (view.listForm.form.dirty || this.fieldChange) {
      const dialogRef = this.dialog.open(ConfirmActionComponent, {
        disableClose: true,
        data: <ConfirmActionData>{ title: 'Alert', message: unsavedDataWarningMessage, showProceedBtn: true }
      });
      if (await dialogRef.afterClosed().toPromise()) {
        this.dialog.closeAll();
      }
    } else {
      this.dialog.closeAll();
    }
  }

  isListNameAlreadyUsed(view: IView): boolean {
    let listName = view.listForm?.model?.name;
    let foundList = this.lists.find((list) => {
      return list.name === listName && (!this.listField || list.id !== this.listField.id);
    });
    return !!foundList;
  }

  getListWithoutParentOptions(): ListItemDto[] {
    if (this.listField?.configuration?.options?.length) {
      const opts: ListItemDto[] = this.listField.configuration.options.map((x) => x.value);
      return cloneDeep(opts);
    } else {
      return [];
    }
  }

  onListWithoutParentUpdate(e: IValidableModel<ListItemDto[]>): void {
    this.listWithoutParent = e;
  }

  onListWithParentUpdate(e: IValidableModel<ListItemDto[]>, parentView: IParentViewItem) {
    this.listMapWithParent.set(parentView.parent.id, e);
  }

  private updateInternal(uiOptions: ListItemDto[], view: IView, srcListItem: IConfigurableListItem, parentId: string): void {
    const options: ListItemDto[] = cloneDeep(uiOptions);

    options.forEach((x) => {
      delete x.valid;
      delete x.uiId;
    });
    const updatedItem: IConfigurableListItem = cloneDeep(srcListItem);
    updatedItem.name = view.listForm.model.name;
    updatedItem.isChanged = true;
    updatedItem.isValid = true;

    const newOptions = options.map((x) => new KeyValueView(x.id, x, x.item));
    updatedItem.configuration.options = sortBy(newOptions, [(x) => x.value.position]);
    updatedItem.configuration.parentListId = parentId;
    updatedItem.configuration.listItemKeyEnabled = view.listForm.model.listItemKeyEnabled || false;

    this.save.next(updatedItem);
  }

  private createListView(): IFormlyView<IListForm> {
    const model: IListForm = {
      name: '',
      parentListItem: undefined,
      listItemKeyEnabled: false
    };

    const parentList = this.createParentListOptions();
    if (this.isUpdate) {
      model.name = this.listField.name;
      if (this.listField.configuration.parentListId) {
        model.parentListItem = parentList.find((x) => x.key === this.listField.configuration.parentListId)?.value;
      }
      model.listItemKeyEnabled = this.listField.configuration.listItemKeyEnabled || false;
      if (model.listItemKeyEnabled) {
        this.listItemKeySetting$.next(true);
      }
    }

    const nameField = FormlyFieldAdapterFactory.createAdapter({
      name: nameKey,
      type: FieldTypeIds.StringField,
      label: this.ts.instant('List Name'),
      required: true,
      value: model.name
    }).getConfig();

    nameField.validators = Object.assign(nameField.validators || {}, {
      required: {
        expression: (x) => !emptyStringValidatorAsRequiredFn()(x)
      }
    });

    nameField.className = 'col-6';
    const parentRefField = FormlyFieldAdapterFactory.createAdapter({
      name: parentListItemKey,
      type: FieldTypeIds.ListField,
      label: this.ts.instant('Select Parent'),
      required: false,
      valueInfo: {
        options: [
          {
            key: undefined,
            value: undefined,
            viewValue: 'None'
          },
          ...parentList
        ],
        labelProp: 'viewValue',
        valueProp: 'value'
      },
      value: model[parentListItemKey]
    }).getConfig();

    parentRefField.formControl = this.fb.control(undefined);
    parentRefField.className = 'col-6';
    const enableListItemKey = FormlyFieldAdapterFactory.createAdapter({
      name: keyForListItemKeyEnabled,
      type: FieldTypeIds.BoolField,
      label: this.ts.instant('Enable Key/Value pairs in List Items'),
      required: false,
      value: model.listItemKeyEnabled
    }).getConfig();
    enableListItemKey.className = 'col-12';

    const fields = [nameField, parentRefField, enableListItemKey];

    const view: IFormlyView<IListForm> = {
      form: this.fb.group({}),
      fields,
      model
    };
    return view;
  }

  private createParentListOptions(): IKeyValueView<string, IConfigurableListItem>[] {
    const lists = this.isUpdate ? this.lists.filter((x) => x.id !== this.listField.id) : this.lists;
    return lists
      .map((x) => cloneDeep(x))
      .map((x: IConfigurableListItem) => {
        return new KeyValueView(x.id, x, x.name);
      });
  }

  private createParentView(parent: IConfigurableListItem): IParentView {
    if (!parent) {
      return undefined;
    }
    this.listMapWithParent = new Map();
    const items: IParentViewItem[] = [];
    const opts = parent?.configuration?.options || [];
    const currentListOpts = (this.listField?.configuration?.options || []).filter((x) => !!x.value?.parentListItemId);

    opts
      .map((parent) => parent.value as ListItemDto)
      .forEach((parentListItem) => {
        let children: ListItemDto[] = [];

        currentListOpts
          .map((x) => x.value as ListItemDto)
          .filter((x) => x.parentListItemId === parentListItem.id)
          .forEach((x) => {
            children.push(x);
          });
        children = sortBy(children, [(x) => x.position]);

        const item: IParentViewItem = {
          children: cloneDeep(children),
          parent: parentListItem
        };
        items.push(item);
      });

    const parentView: IParentView = {
      parentId: parent.id,
      items: items
    };

    return parentView;
  }

  private createEmptyList(view: IView): IConfigurableListItem {
    const parentList = view.listForm.model?.parentListItem;

    return {
      id: undefined,
      name: '',
      type: FieldTypeIds.ListField,
      configuration: {
        position: 0,
        options: [],
        listId: undefined,
        parentListId: parentList?.id
      },
      isClientId: true,
      isChanged: true
    };
  }

  onFieldChanged(flag: boolean): void {
    this.fieldChange = flag;
  }
}
