// /**
//  * global
//  */
// import { AfterViewInit } from '@angular/core';
// import { Component, OnInit, ViewEncapsulation } from '@angular/core';
// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

// import { Store } from '@ngrx/store';

// /**
//  * project
//  */

// import { RawDataFieldsService, TranslationService, FieldTypeIds, RawDataFieldInfo, FieldDtoAdmin, DataEntity } from '@wfm/service-layer';
// import {
//   getFieldsByTenantSelector,
//   getAdminFieldsByTenantSelector,
//   GetFieldsByTenant,
//   RemoveRawDataField,
//   AddRawDataField
// } from '@wfm/store';
// import { TenantComponent } from '@wfm/shared/tenant.component';

// import { CreateRawDataFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
// import { Guid } from '@wfm/shared/guid';
// import { IConfigurableListItem, IFieldConfiguration } from '@wfm/common/models';

// /**
//  * local
//  */
// import { IDropHandler } from '../shared';
// import { MatDialog } from '@angular/material/dialog';
// import { MatSnackBar } from '@angular/material/snack-bar';

// export interface RawDataFieldViewModel extends FieldDtoAdmin, IConfigurableListItem<IFieldConfiguration> {
//   id: string;
//   type: FieldTypeIds;
//   rawDataFieldPublicId: string;
//   isChanged: boolean;
//   isSystem: boolean;
//   publicId?: string;
// }

// @Component({
//   selector: 'app-table-builder',
//   templateUrl: './table-builder.component.html',
//   styleUrls: ['./table-builder.component.scss'],
//   encapsulation: ViewEncapsulation.None
// })
// /**
//  * @deprecated
//  */
// export class TableBuilderComponent
//   extends TenantComponent
//   implements OnInit, AfterViewInit, IDropHandler<RawDataFieldViewModel | RawDataFieldInfo>
// {
//   adminFieldSelector: (item: RawDataFieldViewModel) => boolean;
//   targetFieldSelector: (item: RawDataFieldInfo) => boolean;
//   targetSorting: (a: RawDataFieldInfo, b: RawDataFieldInfo) => number;

//   sourceListId: string;
//   targetListId: string;
//   adminSelector = getAdminFieldsByTenantSelector;
//   targetSelector = getFieldsByTenantSelector;
//   private snackBarDelayMs = 2000;

//   private sourceFields: RawDataFieldViewModel[] = [];
//   private selectedFields: RawDataFieldViewModel[] = [];
//   private deleteSourceList: RawDataFieldViewModel[] = [];

//   constructor(
//     private store: Store<any>,
//     private snackBar: MatSnackBar,
//     public dialog: MatDialog,
//     private rawDataFieldsService: RawDataFieldsService,
//     private translationService: TranslationService
//   ) {
//     super(store);
//     this.sourceListId = Guid.createQuickGuidAsString();
//     this.targetListId = Guid.createQuickGuidAsString();

//     this.adminFieldSelector = (x) => {
//       const selectedField = this.selectedFields.find((s) => s.publicId === x.id);
//       if (selectedField) {
//         return false;
//       }
//       return true;
//     };
//     this.targetFieldSelector = (x) => !x.isSystem;
//   }

//   ngOnInit(): void {
//     this.translationService.translateDefault();
//   }
//   ngAfterViewInit(): void {
//     this.store.dispatch(new GetFieldsByTenant({ id: this.tenant }));
//   }

//   drop(event: CdkDragDrop<(RawDataFieldViewModel | RawDataFieldInfo)[]>): void {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
//       this.updatePositions();
//     } else {
//       if (event.previousContainer.id === this.targetListId) {
//         this.addOrRemoveDragDropField(event, true);
//       } else {
//         // add  field to source
//         this.addOrRemoveDragDropField(event, false);
//       }
//     }
//   }

//   addOrRemoveDragDropField(event: CdkDragDrop<(RawDataFieldViewModel | RawDataFieldInfo)[]>, isRemove: boolean): void {
//     if (isRemove) {
//       const itemToDelete = this.selectedFields[event.previousIndex];
//       transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
//       this.store.dispatch(new RemoveRawDataField({ tenantId: this.tenant, RawDataField: itemToDelete.rawDataFieldPublicId }));
//     } else {
//       console.log('addOrRemoveDragDropField', { event });

//       const field = this.sourceFields[event.previousIndex];
//       transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
//       this.store.dispatch(new AddRawDataField({ tenantId: this.tenant, data: this.mapFieldInfo(field) }));
//     }
//   }
//   updatePositions(): void {
//     this.selectedFields.forEach((x, idx) => {
//       if (x.configuration.position !== idx) {
//         x.configuration.position = idx;
//         x.isChanged = true;
//       }
//     });
//   }

//   onTargetFieldsChange(fields: RawDataFieldViewModel[]): void {
//     this.selectedFields = fields || [];
//   }
//   onSourceFieldsChange(fields: RawDataFieldViewModel[]): void {
//     this.sourceFields = fields || [];
//   }
//   async saveChangedFields(changedFields: RawDataFieldViewModel[]): Promise<void> {
//     const len = changedFields.length;
//     const waitFields = changedFields.map((field) => {
//       const fieldModel = {
//         fieldId: field.rawDataFieldPublicId,
//         configuration: field.configuration
//       } as CreateRawDataFieldModel;
//       // return this.rawDataFieldsService.update(this.tenant, field.rawDataFieldPublicId, fieldModel);
//       return this.rawDataFieldsService.updateDeleteMeAfterDemo(this.tenant, field.rawDataFieldPublicId, fieldModel);
//     });
//     await Promise.all(waitFields);

//     this.snackBar.open(`${len} Field(s) Updated Successfully`, 'CLOSE', { duration: this.snackBarDelayMs });
//   }

//   private mapFieldInfo(field: RawDataFieldViewModel): CreateRawDataFieldModel {
//     return {
//       fieldId: field.rawDataFieldPublicId || field.id,
//       configuration: this.addConfigurationProperty(field)
//     } as CreateRawDataFieldModel;
//   }

//   private addConfigurationProperty(field: RawDataFieldViewModel): IFieldConfiguration {
//     const configuration: IFieldConfiguration = {} as any;
//     switch (field.type) {
//       case FieldTypeIds.StringField:
//         configuration.required = false;
//         configuration.typeId = FieldTypeIds.StringField;
//         break;
//       case FieldTypeIds.DecimalField:
//         configuration.min = 0;
//         configuration.max = 0;
//         configuration.typeId = FieldTypeIds.DecimalField;
//         break;
//       case FieldTypeIds.IntField:
//         configuration.min = 0;
//         configuration.max = 0;
//         configuration.typeId = FieldTypeIds.IntField;
//         break;
//       case FieldTypeIds.DateField:
//         configuration.etdDate = new Date();
//         configuration.typeId = FieldTypeIds.DateField;
//         break;
//       case FieldTypeIds.ListField:
//         configuration.typeId = FieldTypeIds.ListField;
//         break;
//       case FieldTypeIds.BoolField:
//         configuration.typeId = FieldTypeIds.BoolField;
//         break;
//       case FieldTypeIds.TimeField:
//         configuration.typeId = FieldTypeIds.TimeField;
//         break;
//       case FieldTypeIds.DateTimeField:
//         configuration.typeId = FieldTypeIds.DateTimeField;
//         break;
//     }
//     return configuration;
//   }
// }
