import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { FormlySelectOptionsPipe } from '@ngx-formly/core/select';
import { FieldType } from '@ngx-formly/material/form-field';
import { ListFullData } from '@wfm/service-layer';
import { Observable, combineLatest, of } from 'rxjs';
import { cloneDeep, isArray } from 'lodash-core';
import { startWith, distinctUntilChanged, switchMap, map, share } from 'rxjs/operators';
import { KeyValueDisabled } from '../../formly-field-adapter';
import { isUndefinedOrNull } from '@wfm/shared/utils';

@Component({
  selector: 'app-formly-selectbox',
  templateUrl: './formly-selectbox.component.html',
  styleUrls: ['./formly-selectbox.component.scss'],
  providers: [FormlySelectOptionsPipe]
})
export class FormlySelectboxComponent extends FieldType implements OnInit {
  filteredOptions$: Observable<any>;
  listData: ListFullData;
  cascadeSelectsForm: FormGroup;
  searchTerm: FormControl;
  tooltip$: Observable<string> = new Observable();
  get cascadeSelectGroups(): FormArray {
    return this.cascadeSelectsForm?.get('cascadeSelectGroups') as FormArray;
  }
  constructor(public formlySelectOptions: FormlySelectOptionsPipe, private fb: FormBuilder) {
    super();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.listData = this.to.listData;
    this.processSelectOptions();
    if (this.to.showTooltip) {
      this.populateTooltip();
    }
  }

  /**
   * subscribing to observables used here may cause issues
   * when we have an external subscription for the same observable
   * (it causes duplicate emission of the same value -> WFM-3869)
   * thus: avoid using this tooltip and use it only where needed and where it is not breaking the logic
   */
  populateTooltip(): void {
    const formChanges$ = this.formControl.valueChanges.pipe(startWith(this.formControl.value), share());
    this.tooltip$ = combineLatest([formChanges$, this.filteredOptions$]).pipe(
      switchMap((data) => {
        const value = data[0];
        const valueAsArray = isArray(value) ? value : !isUndefinedOrNull(value) ? [value] : [];

        const options = data[1];

        let tooltipLabels = [];

        options.forEach((item) => {
          if (valueAsArray.includes(item.value)) {
            tooltipLabels.push(item.label);
          }
        });
        return of(tooltipLabels.join(', '));
      })
    );
  }

  private filterOptionsBasedOnSearchTerm(term: string): Observable<any[]> {
    const opts = this.formlySelectOptions.transform(this.to.options, this.field);

    if (!term) {
      return opts;
    }
    const input = term.trim().toLowerCase();

    return opts.pipe(
      map((items) => {
        return items.filter((x: any) => {
          const val = x.label.toString().toLowerCase();
          return val.indexOf(input) > -1;
        });
      })
    );
  }

  // START -  custom methods
  makeCascadeSelectGroup(listData: ListFullData, isMain?: boolean): FormGroup {
    const group = this.fb.group({
      isMain: new FormControl({ value: isMain, disabled: true }),
      selectControl: [],
      name: new FormControl({ value: listData.list.name, disabled: true }),
      allOptions: new FormControl({ value: listData.items, disabled: true }),
      filteredOptions: [
        listData.items.map((item) => {
          return <KeyValueDisabled>{
            key: item.item,
            value: item.id,
            disabled: item.isDisabled
          };
        })
      ]
    });
    return group;
  }

  getSelectOptions(index: number): KeyValueDisabled[] {
    const group = this.cascadeSelectGroups.at(index) as FormGroup;
    const options = group?.get('filteredOptions')?.value;
    return options || [];
  }

  getSelectName(index: number): string {
    const group = this.cascadeSelectGroups.at(index) as FormGroup;
    const options = group?.get('name')?.value;
    return options || [];
  }

  processSelectOptions(): void {
    if (this.listData?.parentList && this.to.isCascadeSelect) {
      this.cascadeSelectsForm = this.fb.group({
        cascadeSelectGroups: this.fb.array([])
      });
      let cascadeSelects: FormGroup[] = [];

      cascadeSelects.push(this.makeCascadeSelectGroup(this.listData, true));

      let list: ListFullData = cloneDeep(this.listData);
      while (list.parentList) {
        const group = this.makeCascadeSelectGroup(list.parentList);
        cascadeSelects.push(group);
        list = list.parentList;
      }

      // revers to make the deepest parent first
      cascadeSelects.reverse();

      cascadeSelects.forEach((selectGroup) => {
        this.cascadeSelectGroups.push(selectGroup);
      });

      if (this.formControl.value) {
        let j = cascadeSelects.length - 1;
        const mainSelectGroup = this.cascadeSelectGroups.at(j) as FormGroup;
        mainSelectGroup?.get('selectControl')?.patchValue(this.formControl.value, { emitEvent: false });
        while (j > 0) {
          this.populateParentSelectValue(j);
          j--;
        }
      }

      let i = 0;
      while (this.cascadeSelectGroups.at(i)) {
        this.addValueChangeListener(i);
        i++;
      }
    } else {
      if (this.to.showSearchInput) {
        this.searchTerm = new FormControl(null);

        this.filteredOptions$ = this.searchTerm.valueChanges.pipe(
          startWith(''),
          switchMap((term) => this.filterOptionsBasedOnSearchTerm(term))
        );
      } else {
        this.filteredOptions$ = this.formlySelectOptions.transform(this.to.options, this.field);
      }
    }
  }

  populateParentSelectValue(index: number): void {
    const parentSelectGroup = this.cascadeSelectGroups.at(index - 1) as FormGroup;
    const currentSelectGroup = this.cascadeSelectGroups.at(index) as FormGroup;
    if (currentSelectGroup) {
      const parentItemId = this.getParentItemId(currentSelectGroup.get('allOptions').value, currentSelectGroup.get('selectControl').value);
      parentSelectGroup?.get('selectControl')?.patchValue(parentItemId);
    }
  }

  addValueChangeListener(index: number): void {
    const group = this.cascadeSelectGroups.at(index) as FormGroup;
    if (group) {
      let isFirstChange = true;
      const control = group.get('selectControl');
      control?.valueChanges.pipe(startWith(control.value), distinctUntilChanged()).subscribe((selectItemId: string) => {
        const childGroup = this.cascadeSelectGroups.at(index + 1);
        if (childGroup) {
          if (selectItemId && isFirstChange) {
            // the parent formControl value was set programmatically,
            // do not reset the child control
            isFirstChange = false;
          } else {
            childGroup.get('selectControl').patchValue(null);
          }

          const options: KeyValueDisabled[] = cloneDeep(childGroup.get('allOptions')?.value)
            .filter((item) => item.parentListItemId === selectItemId)
            .map((item) => {
              return <KeyValueDisabled>{
                key: item.item,
                value: item.id,
                disabled: item.isDisabled
              };
            });
          childGroup.get('filteredOptions')?.patchValue(options);
          if (options.length == 1) {
            childGroup.get('selectControl')?.patchValue(options[0].value);
          }
        } else if (group.get('isMain')?.value) {
          // if it's the main select, pass its value to the formly field
          if (isFirstChange) {
            isFirstChange = false;
          } else {
            this.formControl.setValue(selectItemId);
            this.formControl.updateValueAndValidity();
            this.formControl.markAsTouched();
            this.formControl.markAsDirty();
          }
        }
      });
    }
  }

  getParentItemId(listItems, selectedListId: string): string {
    const item = listItems.find((it) => it.id === selectedListId);
    return item?.parentListItemId;
  }

  resetValueForCascadeSelects(e?: Event): void {
    e?.stopPropagation();
    this.cascadeSelectGroups.at(0)?.get('selectControl')?.setValue(null);
    this.cascadeSelectsForm.updateValueAndValidity();
  }

  resetValue(e?: Event): void {
    e?.stopPropagation();
    this.formControl.setValue(null);
    this.formControl.updateValueAndValidity();
  }

  checkForResetEvent(event: KeyboardEvent): void {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (this.cascadeSelectGroups) {
        this.resetValueForCascadeSelects();
      } else {
        this.resetValue();
      }
    }
  }

  // END -  custom methods

  private selectAllValue!: { options: any; value: any[] };

  getSelectAllState(options: any[]): string {
    if (this.empty || this.value.length === 0) {
      return null;
    }
    return this.value.length !== this.getSelectAllValue(options).length ? 'indeterminate' : 'checked';
  }

  toggleSelectAll(options: any[]): void {
    const selectAllValue = this.getSelectAllValue(options);
    this.formControl.setValue(!this.value || this.value.length !== selectAllValue.length ? selectAllValue : []);
    this.formControl.markAsDirty();
  }

  change($event: MatSelectChange): void {
    this.to.change?.(this.field, $event);
    if (this.to.showSearchInput) {
      this.searchTerm.setValue('');
    }
  }

  _getAriaLabelledby(): string {
    if (this.to.attributes?.['aria-labelledby']) {
      return this.to.attributes['aria-labelledby'] as string;
    }
    return this.formField?._labelId;
  }

  _getAriaLabel(): string {
    return this.to.attributes?.['aria-label'] as string;
  }

  private getSelectAllValue(options: any[]): any[] {
    if (!this.selectAllValue || options !== this.selectAllValue.options) {
      const flatOptions: any[] = [];
      options.forEach((o) => (o.group ? flatOptions.push(...o.group) : flatOptions.push(o)));
      this.selectAllValue = {
        options,
        value: flatOptions.filter((o) => !o.disabled).map((o) => o.value)
      };
    }
    return this.selectAllValue.value;
  }

  ignoreSpaceKey(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.stopPropagation();
    }
  }
}
