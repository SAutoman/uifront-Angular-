/**
 * global
 */
import { ChangeDetectorRef, Component, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { User } from 'oidc-client';
import { MatTabChangeEvent } from '@angular/material/tabs';
/**
 * project
 */

import { Settings, TenantProfile, Roles, appStartPage, StartPage } from '@wfm/service-layer';

import {
  SwitchTenantSystemAction,
  ChangeMenuAction,
  Logout,
  AuthState,
  TenantSystem,
  MenuType,
  loggedInState,
  currentMenuType,
  SetSelectedRawDataSchema,
  showRawDataMenuSelector
} from '@wfm/store';
import { SearchFieldModel } from '@wfm/service-layer/models/dynamic-entity-models';
import { dataListRoute, dataMainRoute, dataViewRoute } from '@wfm/raw-data/raw-data.routing';
import { ChildrenItems } from '@wfm/shared/menu-items/menu-items';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { MenuItems } from '@wfm/shared/menu-items/menu-items';
import { convertTenantName, roleConverter } from '@wfm/shared/utils';
import { tenantMainRoute, tenantListsRoute } from '@wfm/tenant-admin/tenant-admin.routing';
import { SetSelectedReport, SetSelectedWorkflow } from '@wfm/store/workflow';
import { workflowStatesListRoute, workflowStatesMainRoute } from '@wfm/workflow-state/workflow-state.routing.module';

/**
 * local
 */

import { UserProfileSidebarView } from '../sidebar.models';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: []
})
export class AppSidebarComponent extends TenantComponent implements OnInit, OnDestroy {
  @Output() searchEvent: EventEmitter<SearchFieldModel[]> = new EventEmitter<SearchFieldModel[]>();
  selectedTabIndex: number = 0;

  mobileQuery: MediaQueryList;
  authState: AuthState;
  searchMenuItems: ChildrenItems[] = [];
  userProfileSidebarView: UserProfileSidebarView;
  user: User;
  private _mobileQueryListener: () => void;
  role: string | Roles;
  showRawDataMenu: boolean;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    public menuItems: MenuItems,
    private router: Router,
    private store: Store<any>
  ) {
    super(store);
    this.mobileQuery = media.matchMedia('(min-width: 768px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);

    this.loadSidebarContent();
    this.store.pipe(select(showRawDataMenuSelector), takeUntil(this.destroyed$)).subscribe((showMenu) => {
      this.showRawDataMenu = showMenu;
    });
  }
  get roles(): typeof Roles {
    return Roles;
  }
  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.user = data.user;
      }
    });
    this.checkRoleForTenantsMenu();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  mapToChildrenItems(setting: Settings): ChildrenItems {
    const s = <ChildrenItems>{};
    s.name = setting.value.name;
    s.setting = setting;
    s.type = 'layout';
    s.color = '';
    return s;
  }

  loadSidebarContent(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((authState) => {
      this.authState = cloneDeep(authState);
      this.userProfileSidebarView = <UserProfileSidebarView>{
        name: this.authState.profile?.name,
        lastName: this.authState.profile?.lastName,
        rolesPerTenant: this.authState.rolesPerTenant,
        tenant: this.authState.currentTenantSystem?.tenant,
        menuType: this.authState.menuType,
        // menu: this.menuItems.getMenuitem(),
        adminMenu: this.menuItems.getAdminMenuitem(this.authState?.showRawDataMenu)
      };
    });

    this.store
      .select(currentMenuType)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((menuType) => {
        const tenantPrefix = convertTenantName(this.authState?.currentTenantSystem?.tenant?.tenantName || '');
        if (menuType === MenuType.AdminMenuActivated) {
          this.router.navigateByUrl(`${tenantPrefix}/${tenantMainRoute}/${tenantListsRoute}`);
        } else if (menuType === MenuType.UserMenuActivated) {
          this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: null }));
          this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: null }));
          this.store.dispatch(new SetSelectedReport({ selectedReport: null }));

          const startPage = this.authState.userSettingsMap[appStartPage];
          if (!startPage || startPage?.value === StartPage.CasesList || !this.showRawDataMenu) {
            this.router.navigateByUrl(convertTenantName(tenantPrefix) + `/${workflowStatesMainRoute}/${workflowStatesListRoute}`);
          } else if (startPage && this.showRawDataMenu && startPage?.value === StartPage.RawDataList) {
            this.router.navigateByUrl(convertTenantName(tenantPrefix) + `/${dataListRoute}`);
          }
        }
        if (menuType === MenuType.UserMenu && this.selectedTabIndex !== 0) {
          this.selectedTabIndex = 0;
        } else if (menuType === MenuType.AdminMenu && this.selectedTabIndex !== 1) {
          this.selectedTabIndex = 1;
        }
      });

    this.selectedTabIndex =
      this.userProfileSidebarView.menuType == MenuType.AdminMenu || this.userProfileSidebarView.menuType == MenuType.AdminMenuActivated
        ? 1
        : 0;
  }

  switchSystem(role: TenantProfile): void {
    const currentSystem = this.authState.tenantSystems.get(role.tenantId);
    const tempProfile = { ...role };
    tempProfile.roleNum = roleConverter(role.role);

    this.store.dispatch(
      new SwitchTenantSystemAction({
        selectedTenantSystem: currentSystem || <TenantSystem>{ tenant: tempProfile }
      })
    );
  }

  onChangeMenu(menuType: MenuType): void {
    this.store.dispatch(new ChangeMenuAction({ menuType: menuType }));
  }
  onTabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.onChangeMenu(tabChangeEvent.index == 0 ? MenuType.UserMenuActivated : MenuType.AdminMenuActivated);
  }

  checkRoleForTenantsMenu(): void {
    for (const [key, value] of Object.entries(this.roles)) {
      if (this.userProfileSidebarView.tenant.role === key) {
        this.role = value;
      }
    }
  }

  onSignOut(): void {
    this.store.dispatch(new Logout());
  }
}
