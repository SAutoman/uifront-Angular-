import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { FieldType } from '@ngx-formly/material/form-field';
import { ConnectorFieldOption } from '@wfm/common/models/connector-field';
import { AreaTypeEnum, FieldTypeIds, VirtualFieldValueDto } from '@wfm/service-layer';
import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { DynamicGridUiService } from '@wfm/service-layer/services/dynamic-grid-ui.service';
import { AuthState } from '@wfm/store';
import { Observable, Subject, from, of } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { KeyValueDisabled } from '../../formly-field-adapter';

interface ExposedData {
  fields: Array<{
    displayName: string;
    fieldName: string;
    type: FieldTypeIds;
    value: any;
  }>;
}

@Component({
  selector: 'app-formly-connector',
  templateUrl: './formly-connector.component.html',
  styleUrls: ['./formly-connector.component.scss']
})
export class FormlyConnectorComponent extends FieldType implements OnInit, OnDestroy {
  internalFormControl: FormControl;
  exposedData$: Observable<ExposedData>;
  searchInput: FormControl;
  filteredOptions$: Observable<KeyValueDisabled[]>;

  get fieldTypes() {
    return FieldTypeIds;
  }
  protected destroyed$ = new Subject<any>();
  constructor(
    private store: Store<AuthState>,
    private dynamicGridUiService: DynamicGridUiService,
    private adminSchemasService: AdminSchemasService
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    /**
     * the field value is saved as <string[]>, when in singleSelect mode, MatSelect expects <string>
     */
    this.initFiltering();
    if (this.to.multiple) {
      this.internalFormControl = new FormControl(this.formControl.value);
    } else if (this.formControl.value) {
      this.internalFormControl = new FormControl(this.formControl.value[0]);
    } else {
      this.internalFormControl = new FormControl(null);
    }
    if (this.to.exposedFieldsData) {
      this.populateExposedFields();
    }

    this.processFieldValue();
  }

  initFiltering(): void {
    this.searchInput = new FormControl('');
    this.filteredOptions$ = this.searchInput.valueChanges.pipe(
      startWith(''),
      switchMap((term) => {
        return this.filterOptionsBasedOnSearchTerm(term);
      })
    );
  }

  ignoreSpaceKey(event: KeyboardEvent): void {
    if (event.code === 'Space') {
      event.stopPropagation();
    }
  }

  filterOptionsBasedOnSearchTerm(searchKey: string): Observable<KeyValueDisabled[]> {
    const opts = this.to.options as Observable<KeyValueDisabled[]>;

    if (!searchKey) {
      return opts;
    }
    const filterPredicate = (item: KeyValueDisabled) => {
      //filtering in the whole label
      return item.key?.toLowerCase()?.includes(searchKey.trim().toLowerCase());

      // filtering only in values
      // if (item.labelFieldsValues?.length) {
      //   for (let i = 0; i < item.labelFieldsValues.length; i++) {
      //     if (item.labelFieldsValues[i].toLowerCase().includes(searchKey.trim().toLowerCase())) {
      //       return true;
      //     }
      //   }
      // }
    };
    return opts.pipe(
      map((items) => {
        return items.filter(filterPredicate);
      })
    );
  }

  /**
   * the field value is saved as <string[]>, when in singleSelect mode, MatSelect expects <string>
   */
  processFieldValue(): void {
    this.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((value) => {
      this.exposedData$ = null;
      if (this.to.multiple) {
        this.internalFormControl.setValue(this.formControl.value);
      } else if (this.formControl.value) {
        this.internalFormControl.setValue(this.formControl.value[0]);
      } else {
        this.internalFormControl.setValue(null);
      }
    });
  }

  change($event: MatSelectChange): void {
    this.to.change?.(this.field, $event);
    let value = $event.value;
    if (!this.to.multiple) {
      this.formControl.setValue([value]);
    } else {
      this.formControl.setValue(value);
    }
  }

  resetValue(e?: Event): void {
    e?.stopPropagation();
    this.formControl.setValue(null);
  }

  populateExposedFields(): void {
    const data = this.to.exposedFieldsData as VirtualFieldValueDto<BaseFieldValueType>;
    this.exposedData$ = from(this.adminSchemasService.getSchema(data.tenantId, AreaTypeEnum.case, data.caseSchemaId)).pipe(
      switchMap(async (schema) => {
        const fields = [];
        for (const exposedField of data.fields) {
          const d = {
            displayName: schema.fields.find((f) => f.fieldName === exposedField.id)?.displayName,
            fieldName: exposedField.id,
            type: exposedField.type,
            value: await this.dynamicGridUiService.getFormattedValue(exposedField, schema)
          };
          fields.push(d);
        }
        return <ExposedData>{ fields: fields };
      }),
      catchError((error) => {
        console.log(error);
        return of({ fields: [] });
      })
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
