import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { FormlySelectOptionsPipe } from '@ngx-formly/core/select';
import { FieldType } from '@ngx-formly/material';

import { IKeyValueView } from '@wfm/common/models';

import { Observable } from 'rxjs';
import { startWith, switchMap, map, filter } from 'rxjs/operators';

@Component({
  selector: 'app-formly-autocomplete',
  templateUrl: './formly-autocomplete.component.html',
  styleUrls: ['./formly-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FormlySelectOptionsPipe]
})
export class FormlyAutocompleteComponent extends FieldType implements OnInit {
  @ViewChild(MatInput) formFieldControl: MatInput;
  filter$: Observable<IKeyValueView<string, any>[]>;

  constructor(public formlySelectOptions: FormlySelectOptionsPipe) {
    super();
  }

  ngOnInit(): void {
    this.filter$ = this.formControl.valueChanges.pipe(
      startWith(''),
      filter((x) => typeof x === 'string'),
      switchMap((term) => this.filterFields(term))
    );
  }

  getOptionLabel(item: any): string {
    if (typeof item === 'object') {
      return item[this.to.labelProp];
    }
    return item;
  }

  private filterFields(name: string): Observable<any[]> {
    if (this.to.filter) {
      return this.to.filter(this.to.options, name);
    }
    const input = name.trim().toLowerCase();

    const opts = this.to.options || [];
    const labelProp = (this.to.labelProp as string) || '';

    const filterPredicate = (x: any) => {
      const val = (typeof x === 'object' ? x[labelProp] : x).toString().toLowerCase();
      return val.indexOf(input) > -1;
    };
    if (opts instanceof Observable) {
      const result = opts.pipe(map((items) => items.filter(filterPredicate)));
      return this.formlySelectOptions.transform(result, this.field);
    }
    const filteredResult = opts.filter(filterPredicate);
    return this.formlySelectOptions.transform(filteredResult, this.field);
  }
}
