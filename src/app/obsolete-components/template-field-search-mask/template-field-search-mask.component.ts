// /**
//  * global
//  */
// import { takeUntil } from 'rxjs/operators';
// import { FormGroup } from '@angular/forms';
// import { Store, select } from '@ngrx/store';
// import { Component, OnInit, Output, EventEmitter, DoCheck } from '@angular/core';

// /**
//  * project
//  */
// import { SearchType, SearchFieldModel, CustomSearchType } from '@wfm/service-layer/models/dynamic-entity-models';
// import {
//   SchemaFieldDto,
//   SchemasService,
//   Paging,
//   FieldTypeIds,
//   UsersService,
//   SearchProfile,
//   UserSettingsDto,
//   appTemplateFieldSearchProfile,
//   Settings,
//   AreaTypeEnum
// } from '@wfm/service-layer';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { AuthState, loggedInState } from '@wfm/store';
// import { ConfirmProfileDeleteDialogComponent } from '@wfm/obsolete-components/confirm-profile-delete-dialog/confirm-profile-delete-dialog.component';
// import { ShareSearchProfileDialogComponent } from '@wfm/obsolete-components/share-search-profile-dialog/share-search-profile-dialog.component';

// /**
//  * local
//  */

// export interface TemplateFieldSearchProfileUI {
//   id: string;
//   name: string;
//   searchFields: SearchFieldModel[];
//   fromUser: string;
//   fromGroup: string;
// }

// export interface TemplateFieldInfoWithCustomSearch extends TemplateFieldInfoUI {
//   customSearchType: CustomSearchType;
// }

// export interface TemplateFieldInfoUI extends SchemaFieldDto {
//   allowedSearchTypes: SearchType[];
//   searchFieldModel: SearchFieldModel;
// }

// export interface TemplateFieldSearchProfile extends SearchProfile {
//   search: SearchFieldModel[];
// }

// @Component({
//   selector: 'app-template-field-search-mask',
//   templateUrl: './template-field-search-mask.component.html',
//   styleUrls: ['./template-field-search-mask.component.scss']
// })
// export class TemplateFieldSearchMaskComponent extends TenantComponent implements OnInit, DoCheck {
//   allowedFiltersPerFieldType: { [id: string]: SearchType[] } = {};

//   @Output() searchEvent: EventEmitter<SearchFieldModel[]> = new EventEmitter<SearchFieldModel[]>();

//   componentId = '250b663c-b8b1-4a54-b252-326f5c978c22';
//   expanded: boolean;

//   isSearchValid = false;

//   fields: TemplateFieldInfoUI[] = [];
//   selectedFields: TemplateFieldInfoUI[] = [];
//   selectedValue: TemplateFieldInfoUI;
//   searchFields: SearchFieldModel[];

//   length: number;
//   showNameInput: boolean;
//   showUpdateName: boolean = false;

//   searchProfiles: TemplateFieldSearchProfileUI[];
//   userSearchFields: SearchFieldModel[];
//   selectedProfile: TemplateFieldSearchProfileUI;
//   selectedProfileValue: TemplateFieldInfoUI;
//   updateName: string;

//   updateSearchProfileGroup: FormGroup;
//   searchProfileGroup: FormGroup;

//   userId: string;

//   constructor(
//     private schemasService: SchemasService,
//     private store: Store<AuthState>,
//     public snackBar: MatSnackBar,
//     private dialog: MatDialog,
//     private usersService: UsersService
//   ) {
//     super(store);

//     this.allowedFiltersPerFieldType = {
//       [FieldTypeIds.StringField.toString()]: [SearchType.Like],
//       [FieldTypeIds.IntField.toString()]: [SearchType.Range, SearchType.EqualTo],
//       [FieldTypeIds.DecimalField.toString()]: [SearchType.Range],
//       [FieldTypeIds.BoolField.toString()]: [SearchType.EqualTo],
//       [FieldTypeIds.DateField.toString()]: [SearchType.Range, SearchType.EqualTo],
//       [FieldTypeIds.TimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
//       [FieldTypeIds.DateTimeField.toString()]: [SearchType.Range, SearchType.EqualTo],
//       [FieldTypeIds.MultiselectListField.toString()]: [SearchType.List],
//       [FieldTypeIds.ListField.toString()]: [SearchType.List]
//     };
//   }

//   ngDoCheck(): void {}

//   ngOnInit(): void {}

//   async onSaveButtonClicked(formValue: any): Promise<void> {
//     const cmdSearchProfile: TemplateFieldSearchProfile = {
//       id: undefined,
//       name: formValue.name,
//       search: this.searchFields
//     };

//     const cmd: UserSettingsDto = {
//       id: undefined,
//       userId: this.userId,
//       tenantId: this.tenant,
//       settings: [<Settings>{ key: appTemplateFieldSearchProfile, value: cmdSearchProfile }]
//     };

//     await this.usersService.createUserSettings(this.tenant, cmd);
//     await this.loadUserSearchProfiles();
//     this.openSnackBar(`Profile ${cmdSearchProfile.name} Saved Successfully!`, 'CLOSE');

//     this.showNameInput = false;
//   }

//   async onSaveProfileClicked(): Promise<void> {
//     if (this.searchFields !== undefined) {
//       this.showNameInput = !this.showNameInput;
//     } else {
//       this.showNameInput = false;
//       this.openSnackBar('You must first make a search to be able to create a search profile!', 'CLOSE');
//     }
//   }

//   deleteSearchProfile(): void {
//     let role = '';
//     this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((authState) => {
//       role = authState.tenant.tenant.role;
//     });

//     if ((this.selectedProfile.fromGroup || this.selectedProfile.fromUser) && role !== 'TenantAdmin') {
//       this.openSnackBar(`You don't have a permission to delete this profile!`, 'CLOSE');
//     } else {
//       const dialogRef = this.dialog.open(ConfirmProfileDeleteDialogComponent);
//       dialogRef.afterClosed().subscribe((result) => {
//         if (result) {
//           this.onDeleteDialogOkClicked();
//         }
//       });
//     }
//   }

//   refreshData(): void {
//     this.searchEvent.emit([]);
//     this.selectedValue = null;
//     this.selectedFields = [];
//     this.selectedProfile = undefined;
//     this.selectedProfileValue = null;
//     this.openSnackBar('Data Refreshed!', 'CLOSE');
//   }

//   onShareClicked(selectedProfileValue: any): void {
//     const header = 'Search Profile';

//     const dialogRef = this.dialog.open(ShareSearchProfileDialogComponent, {
//       width: '1000px'
//     });

//     dialogRef.componentInstance.name = selectedProfileValue.name;
//     dialogRef.componentInstance.tenantId = this.tenant;
//     dialogRef.componentInstance.selectedProfile = this.selectedProfile;
//     dialogRef.componentInstance.header = header;
//     dialogRef.componentInstance.message = 'profile';
//   }

//   async onDeleteDialogOkClicked(): Promise<void> {
//     const name = this.selectedProfile.name;

//     await this.usersService.deleteUserSettings(this.tenant, this.selectedProfile.id);
//     this.openSnackBar(`${name} Deleted Successfully!`, 'CLOSE');

//     this.selectedProfile = undefined;
//     this.loadUserSearchProfiles();
//   }

//   async onUpdateButtonClicked(formValue: any, selectedProfileValue: TemplateFieldSearchProfileUI): Promise<void> {
//     if (this.searchFields === undefined) {
//       this.searchFields = selectedProfileValue.searchFields;
//     }

//     const cmdSearchProfile: TemplateFieldSearchProfile = {
//       id: undefined,
//       name: formValue.updateName,
//       search: this.searchFields
//     };

//     const cmd = <UserSettingsDto>{
//       userId: this.userId,
//       tenantId: this.tenant,
//       settings: [{ key: appTemplateFieldSearchProfile, value: cmdSearchProfile, id: selectedProfileValue.id }]
//     };

//     await this.usersService.updateUserSettings(this.tenant, cmd);
//     await this.loadUserSearchProfiles();
//     this.openSnackBar(`Profile ${cmdSearchProfile.name} Upfated Successfully!`, 'CLOSE');

//     this.showUpdateName = false;
//     this.refreshData();
//   }

//   onUpdateClicked(): void {
//     this.showUpdateName = !this.showUpdateName;
//   }

//   applyProfile(event: TemplateFieldSearchProfileUI): void {
//     this.selectedProfile = event;
//     this.userSearchFields = event.searchFields;
//     this.updateName = event.name;
//     this.searchEvent.emit(this.userSearchFields);
//     this.openSnackBar('Data Loaded Successfuly!', 'CLOSE');
//   }

//   onReset(): void {
//     this.expanded = false;
//     this.searchEvent.emit([]);
//     this.selectedValue = null;
//     this.selectedFields = [];
//     this.searchFields = undefined;
//     this.showNameInput = false;
//     this.showUpdateName = false;
//     this.openSnackBar('Data is Reset!', 'CLOSE');
//   }

//   expandedState(): void {
//     this.expanded = true;
//   }

//   openSnackBar(message: string, action: string): void {
//     this.snackBar.open(message, action, {
//       duration: 3000
//     });
//   }

//   onFieldSelected(event): void {
//     if (this.selectedFields.findIndex((e) => event.value === e) > 0) {
//       return;
//     }

//     this.selectedFields.push(event.value);
//   }

//   onSearch(): void {
//     this.searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
//     this.searchEvent.emit(this.searchFields);
//     this.openSnackBar('Data Loaded Successfuly!', 'CLOSE');
//   }

//   onRemove(item: any): void {
//     if (this.selectedFields.length < 1) {
//       this.searchFields = undefined;
//       this.showNameInput = false;
//       this.showUpdateName = false;
//       this.searchEvent.emit([]);
//     }

//     this.selectedValue = null;
//     this.selectedFields = this.selectedFields.filter((x) => x.id !== item.id);
//     const searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
//     this.searchEvent.emit(searchFields);
//   }

//   onFieldChanged(): void {
//     this.isSearchValid = this.selectedFields.every((x) => x.searchFieldModel.isValid) ? true : false;
//   }

//   async loadData(): Promise<void> {
//     const queryParams: Paging = { skip: 0, take: 256 };
//     const hardcodedTemplate = (await this.schemasService.search(this.tenant, AreaTypeEnum.all, queryParams)).items[0];

//     const data = hardcodedTemplate.fields;
//     this.fields = data.map((d) => {
//       const ui = <TemplateFieldInfoUI>d;
//       ui.allowedSearchTypes =
//         ui.id === 'status' || ui.id === 'externalSystemRef' ? [SearchType.Custom] : this.allowedFiltersPerFieldType[d.type];

//       if (ui.id === 'externalSystemRef') {
//         (<TemplateFieldInfoWithCustomSearch>ui).customSearchType = CustomSearchType.ExternalKey;
//       }
//       if (ui.id === 'status') {
//         (<TemplateFieldInfoWithCustomSearch>ui).customSearchType = CustomSearchType.Status;
//       }

//       ui.id = ui.id === 'systemCreatedAt' ? 'createdAt' : ui.id;
//       ui.id = ui.id === 'systemUpdatedAt' ? 'updatedAt' : ui.id;
//       return ui;
//     });
//   }

//   async loadUserSearchProfiles(): Promise<void> {
//   }
// }
