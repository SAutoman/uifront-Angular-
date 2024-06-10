/**
 * global
 */
import { Inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, switchMap, take } from 'rxjs/operators';

/**
 * project
 */
import { AdminTenantFieldsService, APP_CLIENT_ID, IFieldBaseDto, Operation } from '@wfm/service-layer';

/**
 * local
 */

import {
  TenantFieldsActionTypes,
  GetTenantFields,
  TenantFieldsError,
  GetTenantFieldsSuccess,
  RemoveTenantField,
  AddOrUpdateTenantField,
  UpdateManyTenantFields,
  UpdateManyTenantFieldsError,
  RemoveTenantFieldSuccess,
  RemoveTenantFieldFailure
} from './tenant-fields.actions';
import { BaseFieldConverter } from '@wfm/service-layer/helpers';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';

@Injectable()
export class TenantFieldsEffects {
  constructor(
    private actions$: Actions,
    private formFieldsService: AdminTenantFieldsService,
    @Inject(APP_CLIENT_ID) readonly appId: string,
    private errorHandlerService: ErrorHandlerService
  ) {}

  getFields = createEffect(() =>
    this.actions$.pipe(
      ofType<GetTenantFields>(TenantFieldsActionTypes.GetTenantFields),
      switchMap((action) => this.formFieldsService.getAll$(action.payload.tenantId)),
      map((response) => {
        const total = response.total;
        const items = response.items
          .sort((x, y) => x.configuration.position - y.configuration.position)
          .map((x, idx) => BaseFieldConverter.toUi(x, idx));

        return new GetTenantFieldsSuccess({
          items,
          total
        });
      }),
      catchError((error) => of(new TenantFieldsError({ error })))
    )
  );

  removeField = createEffect(() =>
    this.actions$.pipe(
      ofType<RemoveTenantField>(TenantFieldsActionTypes.RemoveTenantField),
      switchMap((action) => {
        return this.formFieldsService.delete$(action.payload.id, action.payload.tenantId).pipe(
          take(1),
          map((x) => new RemoveTenantFieldSuccess({ msg: 'Field deleted successfully' })),
          catchError((error) => of(new RemoveTenantFieldFailure({ msg: this.errorHandlerService.getAndShowErrorMsg(error) })))
        );
      })
    )
  );

  addOrUpdateField$ = createEffect(() =>
    this.actions$.pipe(
      ofType<AddOrUpdateTenantField>(TenantFieldsActionTypes.AddOrUpdateTenantField),
      switchMap(async (action) => {
        const item = action.payload.item;
        const dto: IFieldBaseDto = BaseFieldConverter.toDto(item);
        dto.appPublicId = this.appId;
        let operation: Operation;
        try {
          if (action.payload?.item?.id) {
            operation = await this.formFieldsService.update$(dto).toPromise();
          } else {
            operation = await this.formFieldsService.create$(dto).toPromise();
          }
          if (operation.status.toString() === 'Success') {
            return new GetTenantFields({ tenantId: action.payload.tenantId });
          }
        } catch (error) {
          return new TenantFieldsError({ error: this.errorHandlerService.getAndShowErrorMsg(error) });
        }
      })
    )
  );

  /**
   * demo
   * TODO Update with backend https://jira.cargoclix.com/browse/WFM-888
   */
  updateMany = createEffect(() =>
    this.actions$.pipe(
      ofType<UpdateManyTenantFields>(TenantFieldsActionTypes.UpdateManyTenantFields),
      delay(500),
      switchMap(async (action) => {
        try {
          const result = await this.formFieldsService.bulkUpdate(action.payload.tenantId, action.payload.changedItems);
          if (result?.status.toString() === 'Success') {
            return new GetTenantFields({ tenantId: action.payload.tenantId, msg: 'Field position updated successfully' });
          }
        } catch (error) {
          return new UpdateManyTenantFieldsError(this.errorHandlerService.getAndShowErrorMsg(error));
        }
      }),
      catchError((error) => of(new UpdateManyTenantFieldsError(this.errorHandlerService.getAndShowErrorMsg(error))))
    )
  );

  // private updateTenantSettings(field: IConfigurableListItem, settings: SettingsUI[]): Observable<void> {
  //   return this.getCurrentTenantId$().pipe(
  //     switchMap((tenantId) => {
  //       const commands = [];
  //       if (field.useInObj.case) {
  //         commands.push(this.updateVisibilitySettings(ADMIN_CASE_FIELDS_VISIBILITY_KEY, tenantId, field, settings));
  //       }
  //       if (field.useInObj.rawData) {
  //         commands.push(this.updateVisibilitySettings(ADMIN_RAW_DATA_FIELDS_VISIBILITY_KEY, tenantId, field, settings));
  //       }
  //       if (!commands.length) {
  //         return of(null);
  //       }
  //       return forkJoin(commands).pipe(map(() => {}));
  //     })
  //   );
  // }

  // private updateVisibilitySettings(settingsKey: string, tenantId: string, field: IConfigurableListItem, allSettings: SettingsUI[]) {
  //   const sectionSetting: { value: AdminFieldSetting[] } = allSettings.find((x) => x.key === settingsKey) || { value: [] };
  //   const valueMap = new Map<string, AdminFieldSetting>();

  //   sectionSetting.value.forEach((x) => {
  //     valueMap.set(x.fieldId, cloneDeep(x));
  //   });

  //   if (!valueMap.has(field.id)) {
  //     valueMap.set(field.id, {
  //       fieldId: field.id,
  //       setting: {
  //         details: true,
  //         overview: true
  //       }
  //     });
  //   } else {
  //     return of(null);
  //   }
  //   const fieldSettings: AdminFieldSetting[] = [...valueMap.values()];
  //   const settings = <Settings>{
  //     key: settingsKey,
  //     value: { [settingsKey]: fieldSettings }
  //   };
  //   const cmd = <TenantSettingsDto>{
  //     settings: [settings],
  //     tenantId: tenantId
  //   };

  //   return this.tenantSettingsService.updateTenantSettings$(cmd).pipe(
  //     tap(() => {
  //       this.store.dispatch(
  //         new PatchTenantSettingsSection({
  //           id: settingsKey,
  //           key: settingsKey,
  //           value: fieldSettings
  //         })
  //       );
  //     }),
  //     map(() => {}),
  //     take(1)
  //   );
  // }

  // private getCurrentTenantId$(): Observable<string> {
  //   return this.store.select(currentTenantSelector).pipe(
  //     filter((x) => !!x),
  //     take(1)
  //   );
  // }
}
