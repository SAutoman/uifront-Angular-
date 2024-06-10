import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import { FieldType } from '@ngx-formly/material/form-field';
import { ConnectorFieldOption } from '@wfm/common/models/connector-field';
import { FieldTypeIds } from '@wfm/service-layer';

import { WorkflowsConnectorService } from '@wfm/service-layer/services/workflows-connector.service';
import { AuthState } from '@wfm/store';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-formly-connector-search-input',
  templateUrl: './formly-connector-search-input.component.html',
  styleUrls: ['./formly-connector-search-input.component.scss']
})
export class FormlyConnectorSearchInputComponent extends FieldType implements OnInit, OnDestroy {
  searchInput: FormControl;
  autoSelectedCases: ConnectorFieldOption[];
  showMessage: boolean;
  fastCreateWidget: boolean = false;
  get fieldTypes() {
    return FieldTypeIds;
  }
  loading: boolean;
  protected destroyed$ = new Subject<any>();
  allOptions: ConnectorFieldOption[] = [];
  selectedItemsLabel: string;
  constructor(private store: Store<AuthState>, private connectorService: WorkflowsConnectorService, private cd: ChangeDetectorRef) {
    super();
  }

  async ngOnInit() {
    super.ngOnInit();
    this.initSearching();
    this.fastCreateWidget = this.to.forFastCreate;
    this.allOptions = await this.connectorService.getConnectorFieldOptions(this.to.schemaFieldId, this.to.dynamicEntityId);
  }

  async initSearching(): Promise<void> {
    this.searchInput = new FormControl('');

    this.searchInput.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(async (searchKey) => {
      try {
        this.autoSelectedCases = null;
        this.selectedItemsLabel = '';
        if (searchKey) {
          this.loading = true;
          this.showMessage = true;

          const filteredOptions = this.filterOptions(searchKey);
          if (filteredOptions.length) {
            if (this.to.multiple) {
              this.autoSelectedCases = [...filteredOptions];
              this.autoSelectedCases.forEach((item, index) => {
                this.selectedItemsLabel += `<${item.label}>`;
                if (index + 1 < this.autoSelectedCases.length) {
                  this.selectedItemsLabel += ', ';
                }
              });
            } else {
              this.autoSelectedCases = [filteredOptions[0]];
              this.selectedItemsLabel = this.autoSelectedCases[0].label;
            }
          }
          this.loading = false;
          this.autoSelectedCases
            ? this.formControl.setValue(this.autoSelectedCases.map((item) => item.dynamicEntityId))
            : this.formControl.setValue(null);
        } else {
          this.showMessage = false;
          this.formControl.setValue(null);
        }
      } catch (error) {
        this.loading = false;
        this.formControl.setValue(null);
      }
    });
    if (this.formControl.value && this.formControl.value.length) {
      this.autoSelectedCases = this.allOptions.filter((item) => {
        return (<Array<string>>this.formControl.value).includes(item.dynamicEntityId);
      });
      this.cd.detectChanges();
    }
    this.subscribeToFormReset();
  }

  /**
   * if formControl is reset from its parent,
   * also reset the autoSelectedCases and searchInput
   */

  subscribeToFormReset(): void {
    this.formControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        filter((x) => x === undefined),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this.autoSelectedCases = null;
        this.searchInput.setValue(null);
      });
  }

  //full match, case insensitive
  filterOptions(searchKey): ConnectorFieldOption[] {
    return this.allOptions.filter((item) => {
      if (item.labelFieldsValues?.length && item.enabled) {
        for (let i = 0; i < item.labelFieldsValues.length; i++) {
          if (item.labelFieldsValues[i]?.trim()?.toLowerCase() === searchKey?.trim()?.toLowerCase()) {
            return true;
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.destroyed$.next({});
    this.destroyed$.complete();
  }
}
