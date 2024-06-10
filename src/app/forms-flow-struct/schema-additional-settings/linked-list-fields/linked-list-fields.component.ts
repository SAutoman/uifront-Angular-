import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { IConfigurableListItem, IFormlyView, KeyValueView } from '@wfm/common/models';
import { IFormlyRightButtonAddonConfig, Addons, FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { adapterToConfig } from '@wfm/forms-flow-struct/form-rule-builder/fields';
import { FieldTypeIds, ListFieldsLink } from '@wfm/service-layer';
import { ColorEnum } from '@wfm/service-layer/models/color.enum';
import { BaseComponent } from '@wfm/shared/base.component';
import { distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { remove } from 'lodash-core';
import { from } from 'rxjs';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { ExpressionHelperService } from '@wfm/common/form-builder-components/expression-helper.service';
import { KeyValue } from '@angular/common';

export interface ListFieldLinkOutput extends ListFieldsLink {
  isValid: boolean;
}

export interface ListFieldDetails {
  path: string[];
  fieldName: string;
  label: string;
  children?: Array<ListFieldDetails>;
}

interface ListFieldLinkForm {
  listLink: {
    parentFieldPath: string;
    childFieldPath: string;
  };
}

interface IView {
  links: IFormlyView<ListFieldLinkForm>[];
}

@Component({
  selector: 'app-linked-list-fields',
  templateUrl: './linked-list-fields.component.html',
  styleUrls: ['./linked-list-fields.component.scss']
})
export class LinkedListFieldsComponent extends BaseComponent implements OnInit {
  @Input() fields: IConfigurableListItem[];
  @Input() linkedListFields: ListFieldsLink[];

  @Output() emitData: EventEmitter<ListFieldLinkOutput[]> = new EventEmitter(null);

  view: IView;

  listFieldRelations: { [key: string]: ListFieldDetails };

  parentListFields: KeyValueView<string, string[]>[] = [];
  childListFields: KeyValueView<string, string[]>[] = [];
  /**
   * store the selected children for duplicates validation
   */
  selectedChildren: string[] = [];
  fieldOptions: KeyValue<string, IConfigurableListItem>[];

  constructor(private fb: FormBuilder, private expressionHelper: ExpressionHelperService) {
    super();
  }

  ngOnInit(): void {
    this.fieldOptions = [];
    this.fields.forEach((field) => {
      let retrieved = this.expressionHelper.retrieveNestedFieldsHelper(field);
      this.fieldOptions.push(...retrieved);
    });

    this.populateListRelations();
    this.parentListFields = Object.keys(this.listFieldRelations).map((fieldName) => {
      const field = this.listFieldRelations[fieldName];
      return new KeyValueView(field.fieldName, field.path, field.label);
    });

    this.view = {
      links:
        this.linkedListFields?.map((link) => {
          return this.createLinkFormlyView(link);
        }) || []
    };
  }

  addLinkFormly(): void {
    this.view.links.push(this.createLinkFormlyView());
  }

  private createLinkFormlyView(link?: ListFieldsLink): IFormlyView {
    const config = this.linkToFormlyConfig(link);
    const formlyView = {
      fields: [config],
      form: this.fb.group({}),
      model: {}
    };

    formlyView.form.valueChanges.pipe(distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => {
      this.emitToParent();
    });

    return formlyView;
  }

  private linkToFormlyConfig(link?: ListFieldsLink): FormlyFieldConfig {
    const removeBtnConfig: IFormlyRightButtonAddonConfig = {
      icon: 'trash',
      color: ColorEnum.red,
      isFormGroup: true,
      onClick: () => {
        const link = this.view.links.find((x) => x.fields[0] === config);
        if (link) {
          remove(this.view.links, (x) => x === link);
          this.emitToParent();
        }
      }
    };
    const parentSelector = this.createParentSelector(link);
    const childSelector = this.createChild(link);

    const config: FormlyFieldConfig = {
      key: 'listLink',
      fieldGroupClassName: 'row',
      fieldGroup: [parentSelector, childSelector],
      templateOptions: {
        [Addons.formlyRightBtn]: removeBtnConfig
      }
    };

    return config;
  }

  createParentSelector(link?: ListFieldsLink): FormlyFieldConfig {
    const fieldOptions = Object.keys(this.listFieldRelations).map((fieldName) => {
      const field = this.listFieldRelations[fieldName];
      return new KeyValueView(field.path.join(pathSeparator), field.path, field.label);
    });

    const selectFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: 'Parent List Field',
      name: 'parentFieldPath',
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: fieldOptions
      },
      value: link?.parentFieldPath?.join(pathSeparator) || undefined,
      required: true
    });

    const selectFieldCfg = adapterToConfig(selectFieldAdapter, 'col-lg-12');
    selectFieldCfg.templateOptions.labelProp = 'viewValue';
    selectFieldCfg.templateOptions.valueProp = 'key';
    return selectFieldCfg;
  }

  createChild(link?: ListFieldsLink): FormlyFieldConfig {
    const selectFieldAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: 'Child List Field',
      name: 'childFieldPath',
      type: FieldTypeIds.ListField,
      valueInfo: {
        options: []
      },
      value: link?.childFieldPath?.join(pathSeparator) || undefined,
      required: true
    });

    const childFieldCfg = adapterToConfig(selectFieldAdapter, 'col-lg-12');
    childFieldCfg.templateOptions.labelProp = 'viewValue';
    childFieldCfg.templateOptions.valueProp = 'key';

    childFieldCfg.validators = {
      alreadyUsedAsSub: {
        expression: (control: FormControl) => {
          return !control.value || !this.selectedChildren.includes(control.value);
        },
        message: (error, field: FormlyFieldConfig) => `The field already has a parent`
      }
    };

    childFieldCfg.hooks = {
      onInit: (field: FormlyFieldConfig) => {
        const parentControl = field.form.get('parentFieldPath');
        field.form.valueChanges.subscribe((childField) => {
          this.selectedChildren = [];
          this.view.links.forEach((linkView) => {
            if (linkView.model?.listLink?.childFieldPath) {
              this.selectedChildren.push(linkView.model?.listLink?.childFieldPath);
            }
          });
        });

        field.templateOptions.options = parentControl.valueChanges.pipe(
          startWith(parentControl.value),
          switchMap((selectedFieldPathString: string) => {
            if (selectedFieldPathString) {
              const childOptions =
                this.listFieldRelations[selectedFieldPathString]?.children?.map((child) => {
                  return new KeyValueView(child.path.join(pathSeparator), child.path, child.label);
                }) || [];
              return from([childOptions]);
            }

            return from([]);
          })
        );
      }
    };
    return childFieldCfg;
  }

  emitToParent(): void {
    const data: ListFieldLinkOutput[] = [];

    this.view.links?.forEach((link: IFormlyView) => {
      if (link) {
        data.push({
          parentFieldPath: link.model?.listLink?.parentFieldPath?.split(pathSeparator),
          childFieldPath: link.model?.listLink?.childFieldPath?.split(pathSeparator),
          isValid: link.form.valid
        });
      }
    });
    this.emitData.next(data);
  }

  getAllListFields(): IConfigurableListItem[] {
    const allListFields = [];
    this.fieldOptions.forEach((option) => {
      const field = option.value;
      if (field.type === FieldTypeIds.ListField || field.type === FieldTypeIds.MultiselectListField) {
        allListFields.push({
          ...field,
          optionLabel: option.key,
          path: this.getPath(field, [])
        });
      }
    });
    return allListFields;
  }

  getPath(field, path: string[]): string[] {
    path.unshift(field.fieldName || field.name);
    if (field.parentField) {
      path = this.getPath(field.parentField, path);
    }
    return path;
  }

  /**
   * if there are potential parent/child fields,
   * populate them in a tree like structure
   * (the root is the potential parent)
   */
  populateListRelations(): void {
    const childToParentMap: { [key: string]: Array<IConfigurableListItem> } = {};

    this.listFieldRelations = {};

    const allListFields = this.getAllListFields();

    allListFields.forEach((f) => {
      const parentList = f.configuration?.listData?.parentList;
      if (parentList) {
        const potentialParents = allListFields.filter((f) => f.configuration.listId === parentList.list?.id);
        childToParentMap[f.path.join(pathSeparator)] = [...potentialParents];
      }
    });

    for (const key in childToParentMap) {
      if (childToParentMap.hasOwnProperty(key) && childToParentMap[key]) {
        const potentialParents: IConfigurableListItem[] = childToParentMap[key];
        const childField = allListFields.find((f) => f.path.join(pathSeparator) === key);
        potentialParents.forEach((parentField) => {
          const parentPathString = parentField.path.join(pathSeparator);
          if (!this.listFieldRelations[parentPathString]) {
            this.listFieldRelations[parentPathString] = <ListFieldDetails>{
              path: parentField.path,
              fieldName: parentField.fieldName,
              label: parentField.optionLabel,
              children: []
            };
          }
          this.listFieldRelations[parentPathString].children.push({
            path: childField.path,
            fieldName: childField.fieldName,
            label: childField.optionLabel,
            children: []
          });
        });
      }
    }
  }
}
