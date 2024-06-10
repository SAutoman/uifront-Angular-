// /**
//  * global
//  */
// import { Component, OnInit, Input } from '@angular/core';
// import { Validators, FormBuilder, ValidatorFn } from '@angular/forms';
// import { Router } from '@angular/router';
// import { Store, select } from '@ngrx/store';
// import { filter } from 'rxjs/operators';

// /**
//  * project
//  */
// import { currentTenantSelector, ApplicationState } from '@wfm/store';
// import {
//   FieldMetadataDto,
//   FieldValueDtoBase,
//   ValidatorType,
//   FieldValueDto,
//   ListItemDto,
//   ListsService,
//   IListValidatorUi
// } from '@wfm/service-layer';

// import { CaseFieldWrapperComponent } from '../../case-field-wrapper/case-field-wrapper.component';
// import { FieldControlApiValue, __isDevelop, BaseFieldComponent, FieldControlApiData } from '../field-control-api-value';
// import { ListValue } from '@wfm/service-layer/models/FieldValueDto';

// /**
//  * local
//  */
// export interface ListUi {
//   list: FieldMetadataDto;
//   listItems: ListItemDto[];
// }

// @Component({
//   selector: 'app-list-field-case-wrapper',
//   templateUrl: './list-field.component.html',
//   styleUrls: ['./list-field.component.scss']
// })
// export class ListFieldComponent extends BaseFieldComponent implements OnInit, FieldControlApiValue {
//   @Input() canEditField: boolean;
//   _fieldControlApiData: FieldControlApiData;
//   tenant: string;
//   private _isValid: boolean = true;
//   route: string;
//   processStepEditRoute: string = '/process-step/edit';
//   formsEditRoute: string = '/forms/edit';
//   processStepBuildRoute: string = '/process-step/build';
//   formsBuildRoute: string = '/forms/build';
//   componentId = 'b73172c0-5eb1-4b0e-b16e-e6d8f37f30de';

//   get ValidatorType() {
//     return ValidatorType;
//   }
//   fieldValue: ListValue;
//   list: ListUi;

//   @Input() set fieldControlApiData(value: FieldControlApiData) {
//     if (!value) {
//       return;
//     }

//     this._fieldControlApiData = value;
//     // no await here cause async in setter is no way
//     if (value.fieldMetadata.sourceListId) {
//       this.setListitems(value);
//     }

//     if (this._fieldControlApiData.fieldValue) {
//       this.fieldValue = (<FieldValueDto<ListValue>>this.fieldControlApiData.fieldValue).value;
//     }
//     const defaultValue = <FieldValueDto<ListValue>>this.fieldControlApiData.fieldMetadata.funcFieldProps.defaultValue;

//     if (!this.stepForm) {
//       this.createControl(
//         this.fieldValue ? this.fieldValue.listItemId : defaultValue ? defaultValue.value.listItemId : null,
//         value.fieldMetadata.position,
//         this.createValidators(value.fieldMetadata)
//       );
//     } else {
//       if (!this.stepForm.controls[value.fieldMetadata.position].value && defaultValue) {
//         this.stepForm.controls[value.fieldMetadata.position].setValue(defaultValue.value);
//       }
//     }
//   }

//   setListitems(value: FieldControlApiData) {
//     this.list = <ListUi>{ list: value.fieldMetadata, listItems: [] };

//     if (!this._fieldControlApiData.fieldMetadata.validators.length) {
//       this.list.listItems = value.fieldMetadata.listItems;
//       return;
//     }
//     this.setAllowedListItems(value.fieldMetadata.listItems);
//   }

//   get controlName(): string {
//     return this._fieldControlApiData.fieldMetadata.position.toString();
//   }

//   get fieldControlApiData() {
//     return this._fieldControlApiData;
//   }

//   constructor(formBuilder: FormBuilder, private listService: ListsService, private store: Store<ApplicationState>, private router: Router) {
//     super(formBuilder);

//     store
//       .pipe(
//         select(currentTenantSelector),
//         filter((id) => !!id)
//       )
//       .subscribe((t) => {
//         this.tenant = t;
//       });

//     this.route = this.router.url;
//   }

//   ngOnInit() {
//     if (
//       this.route.includes(this.processStepEditRoute) ||
//       this.route.includes(this.formsEditRoute) ||
//       this.route.includes(this.processStepBuildRoute) ||
//       this.route.includes(this.formsBuildRoute)
//     ) {
//       this.canEditField = true;
//     }
//   }

//   async getValueAndUpdate(): Promise<FieldValueDtoBase> {
//     return <FieldValueDto<ListValue>>{
//       id: this.fieldControlApiData.fieldMetadata.id,
//       type: this.fieldControlApiData.fieldMetadata.type,
//       value: this.fieldValue
//     };
//   }

//   getFieldMetadataDto(): FieldMetadataDto {
//     return this._fieldControlApiData.fieldMetadata;
//   }

//   getFormFieldValidators(): Validators[] {
//     const validators: Validators[] = [];
//     validators.push(Validators.required);
//     return validators;
//   }

//   getFormControlValue() {
//     // return field.listItems.find(li => li.id === (<FieldValueDto<ListValue>>value).value.listItemId);
//   }

//   async onChange() {
//     const listItemId = this.stepForm.get(this.controlName).value;
//     const listItem = this.list.listItems.find((x) => x.id === listItemId);
//     this.fieldValue = <ListValue>{ listItemId: listItem.id, listItemName: listItem.item };
//     this.fieldControlApiData.fieldValue = await this.getValueAndUpdate();
//     this.setChanged(this.fieldControlApiData);
//   }

//   validate() {
//     this._isValid = true;
//   }

//   isValid(): boolean {
//     return this._isValid;
//   }

//   createValidators(field: FieldMetadataDto): ValidatorFn[] {
//     const validators: ValidatorFn[] = [];
//     field.validators.forEach((v) => {
//       switch (v.validatorType) {
//         case ValidatorType.Required:
//           validators.push(Validators.required);
//           break;
//       }
//     });

//     return validators;
//   }

//   setAllowedListItems(data: ListItemDto[]) {
//     if (!data) {
//       return;
//     }

//     const allowedListItemValidator = <IListValidatorUi>(
//       this._fieldControlApiData.fieldMetadata.validators.find((x) => x.validatorType === ValidatorType.List)
//     );

//     if (!allowedListItemValidator || !allowedListItemValidator.allowedListItemIds.length) {
//       this.list.listItems = data;
//       return;
//     }

//     allowedListItemValidator.allowedListItemIds.forEach((x) => {
//       const itemToAdd = data.find((j) => j.id === x);
//       if (itemToAdd) {
//         this.list.listItems.push(itemToAdd);
//       }
//     });
//   }
// }
