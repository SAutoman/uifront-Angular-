/**
 * global
 */
import { Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */
import { ManualCreationSettings, PermissionSettings, SettingsUI } from '@wfm/service-layer/models/user-settings';
import {
  AuthState,
  groupsOfUserSelector,
  showRawDataMenuSelector,
  tenantSettingsSelector,
  loggedInState,
  workflowMenuItemsSelector
} from '@wfm/store';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { schemaPermissionSettingsKey } from '@wfm/tenants/manual-creation-settings-by-schema/manual-creation-settings-by-schema.component';
import { TenantComponent } from '@wfm/shared/tenant.component';

/**
 * local
 */
import { AreaTypeEnum, FieldTypeIds, IFieldBaseDto, SchemaDto, UserGroupsDto, WorkflowSimplifiedDto } from '..';
import { AdminSchemasService } from '../services/admin-schemas.service';
import { isUndefinedOrNull } from '@wfm/shared/utils';
import { pathSeparator } from '@wfm/shared/actions/field-path-generator/field-path-generator.component';
import { GridSystemFieldsEnum } from '@wfm/shared/dynamic-entity-grid/dynamic-grid-system-fields';

export interface SchemaAndSearchProfileSetting {
  allowedProfiles: string[];
  defaultProfile: string;
  schemaId: string;
  isSchemaHidden?: boolean;
}

@Injectable()
export class SchemaPermissionsHelper extends TenantComponent implements OnDestroy {
  tenantSettings: SettingsUI[];
  userData: AuthState;
  subs: Subscription;
  /**
   * {"userId_tenantId": Array<UserGroupsId>}
   */
  userGroupIdsCache: { [key: string]: string[] } = {};
  userGroups: UserGroupsDto[];
  showRawDataArea: boolean;

  constructor(private store: Store<ApplicationState>, private adminSchemasService: AdminSchemasService) {
    super(store);
    this.subs = this.store
      .pipe(
        select(tenantSettingsSelector),
        filter((x) => !!x)
      )
      .subscribe((data) => {
        this.tenantSettings = data;
      });

    this.store
      .pipe(
        select(loggedInState),
        filter((x) => !!x),
        take(1)
      )
      .subscribe((data) => {
        if (data.profile) {
          this.userData = cloneDeep(data);
        }
      });

    this.store
      .select(groupsOfUserSelector)
      .pipe(
        filter((x) => !!x),
        take(1)
      )
      .subscribe((groups) => {
        this.userGroups = cloneDeep(groups);
      });
    this.store.pipe(select(showRawDataMenuSelector), take(1)).subscribe((x) => {
      this.showRawDataArea = x;
    });
  }

  async getSchemaPermissions(schemaId: string, area: AreaTypeEnum, tenantId: string): Promise<PermissionSettings> {
    /**
     * TODO: Save permissions via NgRx for access in multiple areas
     */
    let defaultSettings: PermissionSettings = {
      add: false,
      edit: false,
      delete: false,
      hideGridSelection: false,
      enableLayoutAndGridOptions: false,
      allowGridStatusChange: false,
      allowedSearchProfiles: [],
      defaultSearchProfile: null,
      isSchemaHidden: false,
      disableMultiCreation: true,
      defaultLayout: null,
      statusesWithDisabledDelete: null,
      loadSearchAutomatically: null
    };
    const schemaSettings = this.tenantSettings.find((x) => {
      return x.key.includes(`${schemaPermissionSettingsKey}_${schemaId}_${area}`);
    });
    if (schemaSettings) {
      let allUserPermissions: PermissionSettings[] = [];

      const settingValue = <ManualCreationSettings>schemaSettings?.value;
      if (settingValue?.rolePermissions?.length) {
        const rolePermissions = settingValue.rolePermissions.find((rolePerm) => {
          return rolePerm.role === this.userData.currentTenantSystem.tenant.roleNum;
        });
        if (rolePermissions) {
          allUserPermissions.push({
            ...rolePermissions.permission,
            allowGridStatusChange: settingValue?.allowGridStatusChange,
            statusesWithDisabledDelete: rolePermissions.permission?.statusesWithDisabledDelete
          });
        }
      }
      if (settingValue?.userGroupPermissions?.length) {
        const groupIds = await this.getUsersGroupIds(tenantId);
        const groupSettings = settingValue.userGroupPermissions.filter((groupPermission) => {
          return groupIds.includes(groupPermission.groupId);
        });
        if (groupSettings) {
          allUserPermissions = [...allUserPermissions, ...groupSettings.map((sett) => sett.permission)];
        }
      }
      const finalSettings = allUserPermissions.reduce((settingsAcc: PermissionSettings, currentPermission: PermissionSettings) => {
        const currentSearchProfiles = currentPermission?.allowedSearchProfiles || [];
        settingsAcc = {
          add: settingsAcc.add || currentPermission.add || false,
          edit: settingsAcc.edit || currentPermission.edit || false,
          delete: settingsAcc.delete || currentPermission.delete || false,
          hideGridSelection: settingsAcc?.hideGridSelection || currentPermission?.hideGridSelection || false,
          enableLayoutAndGridOptions: settingsAcc?.enableLayoutAndGridOptions || currentPermission?.enableLayoutAndGridOptions || false,
          allowGridStatusChange: settingsAcc?.allowGridStatusChange || currentPermission?.allowGridStatusChange || false,
          // all searchProfiles from different groups/roles to be allowed,
          allowedSearchProfiles: [...settingsAcc?.allowedSearchProfiles, ...currentSearchProfiles],
          defaultSearchProfile: settingsAcc?.defaultSearchProfile || currentPermission?.defaultSearchProfile || null,
          isSchemaHidden: settingsAcc?.isSchemaHidden || currentPermission?.isSchemaHidden || false,
          disableMultiCreation: isUndefinedOrNull(settingValue.disableMultiCreation) ? true : settingValue.disableMultiCreation,
          defaultLayout: settingsAcc?.defaultLayout || currentPermission?.defaultLayout || null,
          statusesWithDisabledDelete: currentPermission?.statusesWithDisabledDelete?.length
            ? currentPermission?.statusesWithDisabledDelete
            : settingsAcc?.statusesWithDisabledDelete,
          loadSearchAutomatically: typeof settingValue?.loadSearchAutomatically === 'boolean' ? settingValue?.loadSearchAutomatically : true
        };
        return settingsAcc;
      }, defaultSettings);
      return finalSettings;
    } else {
      return defaultSettings;
    }
  }

  async getUsersGroupIds(tenantId: string): Promise<string[]> {
    const userId = this.userData.profile.id;
    if (this.userGroupIdsCache[`${userId}_${tenantId}`]) {
      return Promise.resolve(this.userGroupIdsCache[`${userId}_${tenantId}`]);
    } else {
      const ids = this.userGroups.map((group) => group.id) || [];
      this.userGroupIdsCache[`${userId}_${tenantId}`] = ids;
      return ids;
    }
  }

  getAllowedWorkflowsForCaseCreate(tenantId: string): Observable<Promise<WorkflowSimplifiedDto[]>> {
    return this.store.select(workflowMenuItemsSelector).pipe(
      filter((x) => !!x),
      takeUntil(this.destroyed$),
      map(async (allWorkflows) => {
        const allowedWorkflows = [];
        for (const wf of allWorkflows) {
          try {
            const schemaId = wf?.setting?.caseSchemaId;
            if (schemaId) {
              const caseSchema = await this.adminSchemasService.getSchema(tenantId, AreaTypeEnum.case, schemaId);
              const schemaPermissions = await this.getSchemaPermissions(caseSchema.id, AreaTypeEnum.case, tenantId);
              if (caseSchema && schemaPermissions) {
                const rawDataSchemaFields = caseSchema.fields.filter((field) => {
                  return field.type === FieldTypeIds.ListOfLinksField && field.configuration?.schemaAreaType === AreaTypeEnum.rawData;
                });
                if ((!this.showRawDataArea || !rawDataSchemaFields.length) && schemaPermissions.add) {
                  allowedWorkflows.push({ ...wf, disableMultiCreate: schemaPermissions.disableMultiCreation });
                }
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
        return allowedWorkflows.map((y) => {
          return { ...y.setting, disableMultiCreate: y?.disableMultiCreate };
        });
      })
    );
  }

  /**
   * based on FieldVisibility settings in schema,
   * filter out all the applicable fields formy role/groups
   */
  async checkSchemaFieldsVisibility(schema: SchemaDto, fields: IFieldBaseDto[]): Promise<IFieldBaseDto[]> {
    if (!schema.schemaConfiguration?.fieldVisibiltySettings?.length) {
      return fields;
    }

    const myGroups = await this.getUsersGroupIds(schema.tenantId);
    const myRole = this.userData.currentTenantSystem.tenant.roleNum;

    // array of fieldPathStrings
    const fieldsToHide: string[] = [];

    schema.schemaConfiguration.fieldVisibiltySettings.forEach((sett) => {
      if (sett.roles.includes(myRole) || myGroups.some((element) => sett.groups.includes(element))) {
        fieldsToHide.push(sett.fieldPath.join(pathSeparator));
      }
    });
    // TODO: to support nested fields use fieldPath instead of fieldName

    if (fieldsToHide.length) {
      fields = fields.filter((field) => {
        // handler Status field in filter widget
        if (field.fieldName === 'statusId' && fieldsToHide.includes(GridSystemFieldsEnum.STATUS)) {
          return false;
        }
        if (fieldsToHide.includes(field.fieldName)) {
          return false;
        }
        return true;
      });
    }
    return fields;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
