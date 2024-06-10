// // import { GetFieldsByAppId } from '@wfm/tenant-admin/case-fields/modules/admin-case-fields-store';

// /**
//  * global
//  */
// import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';
// import { FormBuilder } from '@angular/forms';
// import { Store } from '@ngrx/store';

// import { from, Observable } from 'rxjs';
// import { distinctUntilChanged, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
// import { sortBy, cloneDeep, camelCase } from 'lodash-core';

// /**
//  * project
//  */
// import { IFormlyView, KeyValueView } from '@wfm/common/models';
// import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor';
// import { AreaTypeEnum, CaseBuilderDto, FieldTypeIds } from '@wfm/service-layer';
// import { TenantComponent } from '@wfm/shared/tenant.component';
// import { AdminCaseFieldsProxyService } from 'app/tenant-admin/case-fields/services/field/admin-case-fields-proxy.service';
// import { Animations } from '@wfm/animations/animations';
// import { IFormDto, IFormFieldModelDto } from '@wfm/forms-flow-struct';

// /**
//  * local
//  */
// import { ICaseOutputEvent } from './i-case-output.event';
// import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';

// interface ICaseFormModel {
//   name?: string;
//   [key: string]: any;
// }

// const caseFormDtoKey: string = 'caseFormDtoKey';

// interface IView {
//   caseDefinition: IFormlyView<IFormDto<CaseBuilderDto>>;
//   caseForm$?: Observable<IFormlyView<ICaseFormModel>>;
// }
// @Component({
//   selector: 'app-case-form-editor',
//   templateUrl: './case-form-editor.component.html',
//   styleUrls: ['./case-form-editor.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   animations: Animations
// })
// export class CaseFormEditorComponent extends TenantComponent implements OnInit {
//   @Output() update = new EventEmitter<ICaseOutputEvent>();
//   view$: Observable<IView>;
//   requiredFields: string[] = [];

//   constructor(
//     store: Store<any>,
//     private fb: FormBuilder,
//     private formService: AdminSchemasService,
//     private adminCaseFieldsProxyService: AdminCaseFieldsProxyService
//   ) {
//     super(store, false);
//   }

//   ngOnInit(): void {
//     this.view$ = this.tenant$.pipe(
//       switchMap((tenantId) => {
//         return from(this.formService.getList(tenantId, null, null, AreaTypeEnum.case)).pipe(
//           switchMap((list) => {
//             return this.adminCaseFieldsProxyService.getRequiredFields().pipe(
//               map((requiredFields) => {
//                 this.requiredFields = requiredFields;
//                 const model: IFormDto<CaseBuilderDto> = {} as any;
//                 const caseFormField = FormlyFieldAdapterFactory.createAdapter({
//                   label: 'Case Form',
//                   name: caseFormDtoKey,
//                   required: true,
//                   valueInfo: {
//                     options: list.items.map((x) => new KeyValueView(x.id, x, x.name))
//                   },
//                   type: FieldTypeIds.ListField,
//                   value: undefined
//                 }).getConfig();

//                 caseFormField.templateOptions.labelProp = 'viewValue';
//                 caseFormField.className = 'col';

//                 const view: IView = {
//                   caseDefinition: {
//                     form: this.fb.group(model),
//                     fields: [caseFormField],
//                     model
//                   },
//                   caseForm$: undefined
//                 };
//                 return view;
//               })
//             );
//           }),
//           tap((view: IView) => this.initForm(view))
//         );
//       })
//     );
//   }

//   private initForm(view: IView): void {
//     const defForm = view.caseDefinition.form;
//     view.caseForm$ = defForm.valueChanges.pipe(
//       filter(() => !!defForm.get(caseFormDtoKey)),
//       map(() => defForm.get(caseFormDtoKey).value),
//       distinctUntilChanged((a, b) => a?.id === b?.id),
//       map((formDto: IFormDto<CaseBuilderDto>) => {
//         const inputFields: IFormFieldModelDto<CaseBuilderDto>[] = sortBy(formDto.fields, [(x) => x.sourceDataRef.position]);

//         const fieldConfigs = inputFields.map((field) => {
//           const name = camelCase(field.name);

//           const variableDto: FormVariableDto = {
//             name: field.id,
//             label: field.name,
//             type: field.type,
//             required: field.required || name === 'name',
//             value: undefined
//           };

//           const adapter = FormlyFieldAdapterFactory.createAdapter(variableDto);
//           const config = adapter.getConfig();
//           config.className = 'col-md-3';
//           return config;
//         });

//         const model = {};
//         const caseView: IFormlyView<ICaseFormModel> = {
//           fields: fieldConfigs,
//           form: this.fb.group(model),
//           model
//         };
//         const fieldMap = new Map<string, CaseBuilderDto>();
//         inputFields.map((x) => fieldMap.set(x.id, x.sourceDataRef));

//         caseView.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((x) => {
//           const outputModel = Object.keys(x).map((fieldId) => {
//             const field = fieldMap.get(fieldId);
//             return {
//               propName: camelCase(field.name),
//               value: x[fieldId],
//               field: cloneDeep(field)
//             };
//           });

//           this.update.next({
//             model: outputModel,
//             /**
//              * @andro.gvamichava form was configured, do not need recheck validation again
//              */
//             valid: caseView.form.valid
//           });
//         });
//         return caseView;
//       })
//     );
//   }
// }
