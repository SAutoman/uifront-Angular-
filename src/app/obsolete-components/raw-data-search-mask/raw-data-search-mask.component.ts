// // SAT: unused, replaced with dynamicEntitySearchMask

// /**
//  * global
//  */
// import { Component, OnInit, Output, EventEmitter, DoCheck, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Store, select } from '@ngrx/store';
// import { filter, take, takeUntil } from 'rxjs/operators';
// import { User } from 'oidc-client';

// /**
//  * project
//  */
// import {
//   UserSettingsDto,
//   Settings,
//   appRawDataSearchProfile,
//   SettingsKeys,
//   UsersService,
//   SearchProfileType,
//   RawDataSearchProfile,
//   SchemasService,
//   FieldTypeIds,
//   AreaTypeEnum,
//   SchemaFieldDto
// } from '@wfm/service-layer';

// import {
//   userProfile,
//   loggedInState,
//   AuthState,
//   GetUserInfoAction,
//   currentTenantSearchMenuItems,
//   SetOpenedChildMenuAction,
//   FetchTenantSettingsAction
// } from '@wfm/store';
// import { TenantComponent } from '@wfm/shared/tenant.component';

// /**
//  * local
//  */
// import {
//   SearchType,
//   SearchFieldModel,
//   CustomSearchType,
//   RawDataFieldInfoUI,
//   RawDataSearchProfileUI
// } from '@wfm/service-layer/models/dynamic-entity-models';
// import { ConfirmProfileDeleteDialogComponent } from '@wfm/obsolete-components/confirm-profile-delete-dialog/confirm-profile-delete-dialog.component';
// import { ShareSearchProfileDialogComponent } from '../share-search-profile-dialog/share-search-profile-dialog.component';

// @Component({
//   selector: 'app-raw-data-search-mask',
//   templateUrl: './raw-data-search-mask.component.html',
//   styleUrls: ['./raw-data-search-mask.component.scss']
// })
// export class RawDataSearchMaskComponent extends TenantComponent implements OnInit, OnChanges {
//   @Input() schemaId: string;
//   @Output() searchEvent: EventEmitter<SearchFieldModel[]> = new EventEmitter<SearchFieldModel[]>();
//   componentId = 'f8ff173f-a527-458f-b7b5-8b249e1ebdca';
//   allowedFiltersPerFieldType: { [id: string]: SearchType[] } = {};
//   expanded: boolean = false;
//   /**
//    * fields of the schema that support searching
//    */
//   fields: SchemaFieldDto[] = [];
//   /**
//    * fields selected for searching
//    */
//   selectedFields: RawDataFieldInfoUI[] = [];
//   customSearchType: CustomSearchType;
//   /**
//    * field selected from the selectbox
//    */
//   selectedOption: RawDataFieldInfoUI;
//   /**
//    * the search configuration of the selected fields
//    */
//   searchFields: SearchFieldModel[];
//   showNameInput: boolean;
//   userId: string;
//   user: User;
//   authState: AuthState;
//   allSearchProfiles: RawDataSearchProfileUI[];
//   /**
//    * search profiles filtered by the current schemaId
//    */
//   searchProfiles: RawDataSearchProfileUI[];
//   selectedProfile: RawDataSearchProfileUI;
//   selectedProfileValue: RawDataSearchProfileUI;
//   showUpdateName: boolean = false;
//   oldSearchFields: SearchFieldModel[];
//   updateName: string;
//   updateSearchProfileGroup: FormGroup;
//   searchProfileGroup: FormGroup;
//   isSearchValid: boolean = false;

//   get searchTypes(): typeof SearchType {
//     return SearchType;
//   }
//   get customSearchTypes(): typeof CustomSearchType {
//     return CustomSearchType;
//   }
//   get fieldTypeIds(): typeof FieldTypeIds {
//     return FieldTypeIds;
//   }
//   get searchProfileType(): typeof SearchProfileType {
//     return SearchProfileType;
//   }

//   constructor(
//     private store: Store<AuthState>,
//     public snackBar: MatSnackBar,
//     private dialog: MatDialog,
//     private formBuilder: FormBuilder,
//     private usersService: UsersService,
//     private schemasService: SchemasService
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

//   async ngOnInit() {
//     this.store.pipe(takeUntil(this.destroyed$), select(userProfile)).subscribe((data) => {
//       if (data.profile) {
//         this.userId = data.profile.id;
//         this.user = data.user;
//       }
//     });

//     this.searchProfileGroup = this.formBuilder.group({
//       name: ['', Validators.required]
//     });

//     this.updateSearchProfileGroup = this.formBuilder.group({
//       updateName: [this.updateName, Validators.required]
//     });

//     this.getAuthState();
//     await this.prepareSearchFields();
//     await this.loadUserSearchProfiles();
//     setTimeout(() => {
//       this.subscribeToSearchProfileMenuItems();
//     });
//   }

//   getAuthState() {
//     this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((authState) => {
//       this.authState = authState;
//     });
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     // when a new schema is selected, reset the search masks and collapse the expanded panel
//     if (changes.schemaId && !changes.schemaId.firstChange && changes.schemaId.currentValue !== changes.schemaId.previousValue) {
//       this.resetSearchMasks();
//       this.prepareSearchFields();
//       this.loadUserSearchProfiles();
//     }
//   }

//   openSnackBar(message: string, action: string): void {
//     this.snackBar.open(message, action, {
//       duration: 3000
//     });
//   }

//   /**
//    * populate the fields that will be shown in the search mask selectbox
//    */
//   async prepareSearchFields(): Promise<void> {
//     const allowedFieldTypes = [
//       FieldTypeIds.IntField,
//       FieldTypeIds.StringField,
//       FieldTypeIds.DecimalField,
//       FieldTypeIds.BoolField,
//       FieldTypeIds.DateField,
//       FieldTypeIds.TextareaField,
//       FieldTypeIds.DateTimeField,
//       FieldTypeIds.ListField,
//       FieldTypeIds.TimeField
//     ];
//     try {
//       const schemaFields = (await this.schemasService.getById(this.schemaId, this.tenant, AreaTypeEnum.rawData)).fields;

//       this.fields = schemaFields
//         .filter((f) => allowedFieldTypes.includes(f.type))
//         .map((d) => {
//           const ui = <SchemaFieldDto>d;
//           ui.allowedSearchTypes = this.allowedFiltersPerFieldType[d.type];
//           return ui;
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   async loadUserSearchProfiles(): Promise<void> {
//     const settingsKeys: SettingsKeys = { keys: [appRawDataSearchProfile], isExclusive: false };
//     const data = await this.usersService.getUserSettingsByKeys(this.tenant, this.userId, settingsKeys);

//     this.allSearchProfiles = data.settings.map((x) => this.mapSearchProfileToUI(x));
//     this.searchProfiles = this.getSchemaSearchProfiles(this.allSearchProfiles, this.schemaId);
//   }

//   getSchemaSearchProfiles(profiles: RawDataSearchProfileUI[], schemaId: string): RawDataSearchProfileUI[] {
//     return profiles.filter((x) => x.schemaId === schemaId);
//   }

//   /**
//    * check if there is a selected profile
//    */

//   subscribeToSearchProfileMenuItems(): void {
//     this.store
//       .pipe(
//         select(currentTenantSearchMenuItems),
//         filter((x) => !!x),
//         takeUntil(this.destroyed$)
//       )
//       .subscribe((x) => {
//         const selectedProfile = x.find((x) => x.isOpened);
//         if (this.searchProfiles?.length && selectedProfile?.setting?.value) {
//           const selectedFromList = this.searchProfiles.find((x) => x.id === selectedProfile.setting.id);
//           this.applyProfile(selectedFromList, false);
//         }
//       });
//   }

//   mapSearchProfileToUI(x: Settings): RawDataSearchProfileUI {
//     const value = <RawDataSearchProfile>x.value;
//     return <RawDataSearchProfileUI>{
//       id: x.id,
//       name: value.name,
//       searchFields: value.search,
//       fromUser: x.fromUser,
//       fromGroup: x.fromGroup,
//       schemaId: x.value.schemaId
//     };
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
//     // better to have it in dynamicGrid component where the actual loading happens

//     // this.openSnackBar('Data Loaded Successfuly!', 'CLOSE');
//   }

//   async applyProfile(event: RawDataSearchProfileUI, fromUI: boolean = true): Promise<void> {
//     if (event) {
//       this.resetSelectedFields();
//       this.selectedProfile = event;
//       this.updateName = event.name;
//       /**
//        * if this event is not fired from html when select option has been chosen,
//        * then we don't need emit and snackbar,
//        * so define this.selectedProfileValue manually and return from function
//        */
//       if (!fromUI) {
//         this.selectedProfileValue = event;
//         return;
//       }
//       await this.searchEvent.emit(event.searchFields);
//       /**
//        * update active child-menu in state -> auth -> tenant -> searchMenuItems -> 'item'?.isOpened?
//        */
//       this.store.dispatch(new SetOpenedChildMenuAction({ itemName: event.name }));
//       this.openSnackBar('Data Loaded Successfully!', 'CLOSE');
//     }
//   }

//   resetSelectedFields() {
//     this.selectedOption = null;
//     this.selectedFields = [];
//     this.searchFields = undefined;
//   }

//   resetSearchMasks(showPopup?: boolean): void {
//     this.expanded = false;
//     this.searchEvent.emit([]);
//     this.resetSelectedFields();
//     this.showNameInput = false;
//     this.showUpdateName = false;
//     showPopup ? this.openSnackBar('Data is Reset!', 'CLOSE') : '';
//   }

//   refreshData(): void {
//     this.searchEvent.emit([]);
//     this.resetSelectedFields();
//     this.selectedProfileValue = null;
//     /**
//      * update active child-menu in state -> auth -> tenant -> searchMenuItems -> 'item'?.isOpened?
//      */
//     this.store.dispatch(new SetOpenedChildMenuAction({ itemName: '' }));
//     this.openSnackBar('Data Refreshed!', 'CLOSE');
//   }

//   expandedState(): void {
//     this.expanded = true;
//   }

//   async onRemove(item): Promise<void> {
//     if (this.selectedFields.length < 1) {
//       this.searchFields = undefined;
//       this.showNameInput = false;
//       this.showUpdateName = false;
//       this.searchEvent.emit([]);
//     }

//     this.selectedOption = null;
//     this.selectedFields = await this.selectedFields.filter((x) => x.id !== item.id);
//     const searchFields = this.selectedFields.map((f) => f.searchFieldModel).filter((x) => x.isValid);
//     this.searchEvent.emit(searchFields);
//   }

//   async onSaveProfileClicked(): Promise<void> {
//     if (this.searchFields !== undefined) {
//       this.showNameInput = !this.showNameInput;
//     } else {
//       this.showNameInput = false;
//       this.openSnackBar('You must first make a search to be able to create a search profile!', 'CLOSE');
//     }
//   }

//   async onSaveButtonClicked(formValue): Promise<void> {
//     const cmdSearchProfile = <RawDataSearchProfile>{
//       name: formValue.name,
//       search: this.searchFields,
//       schemaId: this.schemaId
//     };

//     const cmd = <UserSettingsDto>{
//       userId: this.userId,
//       tenantId: this.tenant,
//       settings: [<Settings>{ key: appRawDataSearchProfile, value: cmdSearchProfile }]
//     };

//     try {
//       await this.usersService.createUserSettings(this.tenant, cmd);
//       await this.loadUserSearchProfiles();
//       this.openSnackBar(`Profile ${cmdSearchProfile.name} Saved Successfully!`, 'CLOSE');

//       // get settings for sidebar
//       this.store.dispatch(new GetUserInfoAction({ user: this.user, backUrl: '' }));
//     } catch (error) {
//       this.showError(error);
//     }

//     this.showNameInput = false;
//   }

//   async onDeleteDialogOkClicked(): Promise<void> {
//     const name = this.selectedProfile.name;

//     await this.usersService.deleteUserSettings(this.tenant, this.selectedProfile.id);
//     this.openSnackBar(`${name} Deleted Successfully!`, 'CLOSE');

//     this.selectedProfile = undefined;
//     this.loadUserSearchProfiles();
//     /**
//      * update active child-menu in state -> auth -> tenant -> searchMenuItems -> 'item'?.isOpened?
//      */
//     this.store.dispatch(
//       new FetchTenantSettingsAction({
//         tenant: this.authState.tenant.tenant,
//         userId: this.userId
//       })
//     );
//   }

//   deleteSearchProfile(): void {
//     let role = this.authState?.tenant?.tenant?.role;
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

//   onUpdateClicked(): void {
//     this.showUpdateName = !this.showUpdateName;
//   }

//   async onUpdateButtonClicked(formValue, selectedProfileValue: RawDataSearchProfileUI): Promise<void> {
//     if (this.searchFields === undefined) {
//       this.searchFields = selectedProfileValue.searchFields;
//     }

//     const cmdSearchProfile = <RawDataSearchProfile>{
//       name: formValue.updateName,
//       search: this.searchFields
//     };

//     const cmd = <UserSettingsDto>{
//       userId: this.userId,
//       tenantId: this.tenant,
//       settings: [<Settings>{ key: appRawDataSearchProfile, value: cmdSearchProfile, id: selectedProfileValue.id }]
//     };

//     await this.usersService.updateUserSettings(this.tenant, cmd);
//     await this.loadUserSearchProfiles();
//     this.openSnackBar(`Profile ${cmdSearchProfile.name} Upfated Successfully!`, 'CLOSE');

//     this.showUpdateName = false;
//     this.refreshData();
//   }

//   onShareClicked(selectedProfileValue): void {
//     const header = 'Search Profile';

//     const dialogRef = this.dialog.open(ShareSearchProfileDialogComponent, {
//       width: '1000px'
//     });

//     dialogRef.componentInstance.name = selectedProfileValue.name;
//     dialogRef.componentInstance.tenantId = this.tenant;
//     dialogRef.componentInstance.selectedProfile = this.selectedProfile;
//     dialogRef.componentInstance.header = header;
//     dialogRef.componentInstance.message = 'profile';
//     dialogRef.componentInstance.schemaId = this.schemaId;
//   }

//   onFieldChanged(z: boolean): void {
//     const validation = this.selectedFields.every((x) => x.searchFieldModel.isValid) ? true : false;
//     setTimeout(() => {
//       this.isSearchValid = validation;
//     }, 50);
//   }

//   showError(error) {
//     this.openSnackBar(`Error: ${error}`, 'CLOSE');
//   }
// }
