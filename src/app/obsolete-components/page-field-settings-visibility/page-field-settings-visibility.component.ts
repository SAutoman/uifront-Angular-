/**
 * global
 */
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { Observable, Subject } from 'rxjs';
import { finalize, map, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { IFormlyView, IKeyValueView } from '@wfm/common/models';
import { FieldTypeIds } from '@wfm/service-layer';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import {
  AdminRawDataFieldSettingsVisibilityService,
  IFieldSettingsVisibilityConfig
} from '@wfm/tenant-admin/raw-data-fields/services/field-settings-visibility/admin-raw-data-field-settings-visibility.service';
/**
 * local
 */
import {
  builderViewToFormlyFieldConfig,
  createFormNameField,
  mapVariableToFormlyConfig
} from '../../forms-flow-struct/page-form-builder/maps';
import { IFieldSettingsVisibilityDto } from '../../forms-flow-struct/interface';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

interface IViewModel extends IFormlyView {
  ref: IFieldSettingsVisibilityConfig;
  name: string;
  pending: boolean;
  toched: boolean;
}

interface CustomFormlyFieldConfig extends FormlyFieldConfig {
  fieldId?: string;
}

@Component({
  selector: 'app-page-field-settings-visibility',
  templateUrl: './page-field-settings-visibility.component.html',
  styleUrls: ['./page-field-settings-visibility.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageFieldSettingsVisibilityComponent implements OnInit, OnDestroy {
  config$: Observable<IViewModel>;
  private itemsKey = 'items';
  componentId = '77cd8109-5be8-4058-9b8f-8cd1cda838e6';
  updateModel: string[] = [];
  loading: boolean = true;
  isDeskTop: boolean = true;
  appBarData: AppBarData = {} as AppBarData;
  protected destroyed$ = new Subject<any>();
  constructor(
    private service: AdminRawDataFieldSettingsVisibilityService,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private errorHandlerService: ErrorHandlerService
  ) {
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
  }

  init(): void {
    this.config$ = this.service.getConfig().pipe(
      map((config) => {
        this.appBarData.title = config.name;
        this.sharedService.setAppBarData(this.appBarData);
        const fields: FormlyFieldConfig[] = [
          {
            key: this.itemsKey,
            fieldGroup: this.mapItemsToFormly(config.items)
          }
        ];

        const model: IViewModel = {
          name: config.name,
          ref: config,
          fields: fields,
          model: {} as any,
          form: this.fb.group({}),
          pending: false,
          toched: false
        };
        this.loading = false;
        return model;
      })
    );
  }

  isEmpty(model: IViewModel): boolean {
    const itemsField = model.fields.find((x) => x.key === this.itemsKey);

    if (!itemsField || !itemsField.fieldGroup || !itemsField.fieldGroup.length) {
      return true;
    }
    return false;
  }

  onSave(config: IViewModel): void {
    this.loading = true;
    config.pending = true;
    const items = this.patchValue(config);
    try {
      this.service
        .bulkUpdate(items, config.ref.tenantId)
        .pipe(
          take(1),
          finalize(() => {
            config.ref.items = items;
            config.pending = false;
            config.toched = false;
            this.updateModel = [];
          })
        )
        .subscribe();
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  private mapItemsToFormly(items: IFieldSettingsVisibilityDto[]): FormlyFieldConfig[] {
    const groups: FormlyFieldConfig[] = [];

    items.forEach((item) => {
      const groupFields = [];

      const variableNameDto = createFormNameField('name', item.name, '');
      variableNameDto.configuration.required = false;
      const name = builderViewToFormlyFieldConfig(variableNameDto);

      name.className = 'row-name';
      groupFields.push(name);

      const optionMap = new Map<string, IKeyValueView<string, boolean>>();

      item.options.forEach((n) => optionMap.set(n.key, n));

      item.useKeys
        .filter((x) => optionMap.has(x))
        .map((x) => optionMap.get(x))
        .forEach((x) => {
          const mappedConfig = mapVariableToFormlyConfig({
            type: FieldTypeIds.BoolField,
            label: x.viewValue,
            name: x.key,
            value: x.value
          });

          const config: CustomFormlyFieldConfig = {
            ...mappedConfig,
            templateOptions: {
              label: x.viewValue,
              click: (field: FormlyFieldConfig) => {
                this.changeFunction(field);
              }
            }
          };
          config.fieldId = item.id;

          config.className = 'option-item';
          groupFields.push(config);
        });

      const group: FormlyFieldConfig = {
        key: item.id,
        fieldGroup: groupFields,
        className: 'row-form'
      };
      groups.push(group);
    });
    return groups;
  }

  private patchValue(config: IViewModel): IFieldSettingsVisibilityDto[] {
    const selectedItems = config.ref.items.filter((x) => this.updateModel.includes(x.id));
    const items: IFieldSettingsVisibilityDto[] = cloneDeep(selectedItems);
    items.forEach((x) => {
      const item = config.model.items[x.id];
      x.useKeys.forEach((key) => {
        const option = x.options.find((opt) => opt.key === key);
        if (!x.toched) {
          const ctrl = config.form.get(this.itemsKey).get(x.id).get(option.key);
          x.toched = ctrl.touched || ctrl.dirty;
        }
        option.value = item[key];
      });
    });
    return items;
  }

  private changeFunction(field) {
    this.updateModel = this.updateModel.filter((x) => x !== field.fieldId);
    this.updateModel.push(field.fieldId);
  }
}
