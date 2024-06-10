// /**
//  * global
//  */
// import { Component, OnInit, Input, Inject } from '@angular/core';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { filter, take, takeUntil } from 'rxjs/operators';
// import { select, Store } from '@ngrx/store';
// import { Actions } from '@ngrx/effects';

// /**
//  * project
//  */
// import {
//   CaseNoteDto,
//   Profile,
//   SettingsUI,
//   AreaTypeEnum,
//   FieldTypeIds,
//   DynamicEntitiesService,
//   SchemasService,
//   DynamicEntityDto,
//   SchemaFieldDto,
//   SchemasCacheService
// } from '../../service-layer';
// import { ApplicationState, getDateFormatSettingsSelector, userProfileSelector } from '@wfm/store';
// import { BaseComponent } from '@wfm/shared/base.component';
// import { BaseFieldValueType } from '@wfm/service-layer/models/FieldValueDto';
// import { UpdateWorkflowStateCase, WorkflowActionTypes, workflowSelector, workflowStateSelector } from '@wfm/store/workflow';
// import { APP_CLIENT_ID, CreateDynamicEntityDto, UpdateStateCase, WorkflowStateCaseDto, WorkflowStateUI } from '@wfm/service-layer';
// import { ConfirmDialogComponent } from '@wfm/confirm-dialog/confirm-dialog.component';

// /**
//  * local
//  */

// @Component({
//   selector: 'app-case-note',
//   templateUrl: './case-note.component.html',
//   styleUrls: ['./case-note.component.scss']
// })
// export class CaseNoteComponent extends BaseComponent implements OnInit {
//   @Input() tenantId: string;

//   commentForm: FormGroup;
//   commentFieldOpened = false;
//   caseNotes: CaseNoteDto[] = [];
//   dateFormatDb: SettingsUI;
//   comments: DynamicEntityDto[] = [];
//   caseDe: WorkflowStateCaseDto;
//   workflowState: WorkflowStateUI;
//   rawDataSchemaId: string;
//   commentSchemaId: string;
//   caseSchemaId: string;
//   profile: Profile;

//   componentId = '8dd92871-fed6-4695-ba91-9687d8897d22';

//   get fieldTypeIds() {
//     return FieldTypeIds;
//   }

//   constructor(
//     @Inject(APP_CLIENT_ID) readonly appId: string,
//     private store: Store<ApplicationState>,
//     private formBuilder: FormBuilder,
//     private action$: Actions,
//     private snackBar: MatSnackBar,
//     private dialog: MatDialog,
//     private dynamicEntitiesService: DynamicEntitiesService,
//     private schemasService: SchemasService,
//     private schemasCacheService: SchemasCacheService
//   ) {
//     super();
//   }

//   ngOnInit(): void {
//     this.commentForm = this.formBuilder.group({
//       comment: ['', [Validators.required]]
//     });

//     this.loadComments();

//     this.store.pipe(takeUntil(this.destroyed$), select(getDateFormatSettingsSelector)).subscribe((res) => {
//       if (res.settings) {
//         this.dateFormatDb = res.settings[0];
//       }
//     });

//     this.store.pipe(takeUntil(this.destroyed$), select(userProfileSelector)).subscribe((data) => {
//       this.profile = data;
//     });
//   }

//   onCommentAdd(): void {
//     this.commentFieldOpened = !this.commentFieldOpened;
//   }

//   mapSchemaFields(field: SchemaFieldDto, formData: string): BaseFieldValueType {
//     let f: BaseFieldValueType = { id: undefined, type: undefined, value: undefined };
//     switch (field.type) {
//       case FieldTypeIds.TextareaField:
//         f.id = field.fieldName;
//         f.type = field.type;
//         f.value = formData;
//         return f;
//       case FieldTypeIds.DateTimeField:
//         f.id = field.fieldName;
//         f.type = field.type;
//         f.value = new Date();
//         return f;
//       case FieldTypeIds.StringField:
//         f.id = field.fieldName;
//         f.type = field.type;
//         f.value = this.profile.name + ' ' + this.profile.lastName;
//         return f;
//       default:
//         return;
//     }
//   }

//   async onSubmit(formData): Promise<void> {
//     try {
//       const commentSchema = await this.schemasCacheService.get(
//         this.commentSchemaId,
//         60,
//         async () => await this.schemasService.getById(this.commentSchemaId, this.tenantId, AreaTypeEnum.comment)
//       );
//       const fields = commentSchema?.fields?.map((f) => this.mapSchemaFields(f, formData.comment));

//       const createCmd: CreateDynamicEntityDto = {
//         appId: this.appId,
//         tenantId: this.tenantId,
//         schemaId: this.commentSchemaId,
//         areaType: AreaTypeEnum.comment,
//         fields: fields
//       };
//       const commentDe = await this.dynamicEntitiesService.create(createCmd);

//       const caseDe = this.workflowState.case;
//       let commentIds = caseDe?.fields?.find((f) => f.type === FieldTypeIds.ListOfLinksField && f['areaType'] === AreaTypeEnum.comment);
//       commentIds.value = [...commentIds.value, commentDe.targetId];

//       const updateCmd: UpdateStateCase = {
//         workflowStateId: this.workflowState.id,
//         tenantId: this.tenantId,
//         caseDynamicEntity: {
//           appId: this.appId,
//           tenantId: this.tenantId,
//           schemaId: this.caseSchemaId,
//           areaType: AreaTypeEnum.case,
//           fields: caseDe.fields
//         },
//         schemaId: this.caseSchemaId
//       };

//       this.store.dispatch(new UpdateWorkflowStateCase({ data: updateCmd, workflowStateId: this.workflowState.id }));

//       this.action$
//         .pipe(
//           filter((action) => action.type === WorkflowActionTypes.UpdateWorkflowStateCaseSuccess),
//           take(1)
//         )
//         .subscribe(() => {
//           this.snackBar.open('Case Updated Successfully!', 'CLOSE', { duration: 2000 });
//           this.commentFieldOpened = false;
//           this.commentForm.get('comment').setValue('');
//         });
//     } catch (error) {
//       console.log(error);
//     }
//   }

//   loadComments(): void {
//     this.store
//       .select(workflowStateSelector)
//       .pipe(takeUntil(this.destroyed$))
//       .subscribe((data) => (this.workflowState = data));

//     this.store
//       .select(workflowSelector)
//       .pipe(takeUntil(this.destroyed$))
//       .subscribe(async (data) => {
//         try {
//           this.caseSchemaId = data.caseSchemaId;
//           const caseSchema = await this.schemasCacheService.get(
//             data.caseSchemaId,
//             60,
//             async () => await this.schemasService.getById(data.caseSchemaId, this.tenantId, AreaTypeEnum.case)
//           );
//           const commentFieldFieldFiltered = caseSchema.fields.filter(
//             (f) => f.type === FieldTypeIds.ListOfLinksField && f.schemaFieldConfiguration['schemaAreaType'] === AreaTypeEnum.comment
//           );

//           this.commentSchemaId = commentFieldFieldFiltered[0]?.schemaFieldConfiguration['schemaId'];
//           const commentLinkField = this.workflowState.case.fields.filter(
//             (f) => f.type === FieldTypeIds.ListOfLinksField && f['areaType'] === AreaTypeEnum.comment
//           );

//           const comments = await this.dynamicEntitiesService.getMany(
//             this.tenantId,
//             AreaTypeEnum.comment,
//             this.commentSchemaId,
//             <string[]>commentLinkField[0]?.value
//           );
//           this.comments = comments.items;
//         } catch (error) {
//           console.log(error);
//         }
//       });
//   }

//   onCommentRemove(id: string): void {
//     const dialogRef = this.dialog.open(ConfirmDialogComponent);
//     dialogRef.afterClosed().subscribe(async (result) => {
//       if (result) {
//         await this.dynamicEntitiesService.deleteById(this.tenantId, id, this.commentSchemaId, AreaTypeEnum.comment);
//         this.loadComments();
//         this.snackBar.open('Comment deleted successfully', 'CLOSE', { duration: 3000 });
//       }
//     });
//   }

//   onCancel(): void {
//     this.commentFieldOpened = false;
//     this.commentForm.get('comment').setValue('');
//   }

//   scrollToElement($element: Element): void {
//     setTimeout(() => {
//       $element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
//     }, 250);
//   }
// }
