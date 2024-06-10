/**
 * global
 */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Router, RouterEvent } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { takeUntil, filter, distinctUntilChanged } from 'rxjs/operators';
import { User } from 'oidc-client';
import { Subscription } from 'rxjs';
import { cloneDeep } from 'lodash-core';
/**
 * project
 */

import {
  WorkflowDto,
  TenantSettingsService,
  StatePersistingService,
  AreaTypeEnum,
  TenantProfile,
  appReportSearchProfile,
  appRawDataSearchProfile,
  appCaseSearchProfile,
  Roles
} from '@wfm/service-layer';
import {
  loggedInState,
  MenuType,
  ApplicationState,
  rawDataSelectedSchemaIdSelector,
  SetSelectedSearchProfile,
  showRawDataMenuSelector,
  SetHasRawDataSchemas,
  workflowMenuDataSelector,
  WorkflowMenuData,
  SetSelectedRawDataSchema
} from '@wfm/store';
import { SharedService } from '@wfm/service-layer/services/shared.service';
import { ChildrenItems, MainMenuTypeEnum, Menu, MenuItems, SubChildren } from '@wfm/shared/menu-items/menu-items';
import { convertTenantName } from '@wfm/shared/utils';
import { BaseComponent } from '@wfm/shared/base.component';

import { dataListRoute } from '@wfm/raw-data/raw-data.routing';

import { workflowStatesListRoute, workflowStatesMainRoute } from '@wfm/workflow-state/workflow-state.routing.module';
import { keyForLastUsedSearchProfile } from '@wfm/shared/dynamic-entity-search-mask/dynamic-entity-search-mask.component';
import { SetSelectedReport, SetSelectedWorkflow, selectedReportSelector, selectedWorkflowSelector } from '@wfm/store/workflow';
import { DataSourceSimplified } from '@wfm/report/report-datasource.model';
import { reportsMainRoute } from '@wfm/report/report.routing';
import { SchemaPermissionsHelper, SchemaAndSearchProfileSetting } from '@wfm/service-layer/helpers/schema-permissions.helper';

/**
 * local
 */
enum MenuChildType {
  rawData = 0,
  workFlow,
  report
}
interface UserSidebarMenuData {
  tenant: TenantProfile;
  menuType: MenuType;
}

@Component({
  selector: 'app-user-items-sidebar',
  templateUrl: './user-items-sidebar.component.html',
  styleUrls: ['./user-items-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserItemsSidebarComponent extends BaseComponent implements OnInit {
  sidebarData: UserSidebarMenuData;
  articlesUrl: string;
  casesUrl: string;
  userId: string;
  reportUrl: string;
  activeSchemaId: string;
  activeSearchProfileId: string;
  workflows: ChildrenItems[] = [];
  rawDataSubs: Subscription;
  workflowSubs: Subscription;
  reportSubs: Subscription;
  hasRawDataSchemas: boolean = false;
  hasWorkflows: boolean = false;
  sidebarMenu: Menu[];

  get menuTypeEnum() {
    return MenuType;
  }
  schemaId: string;
  user: User;
  showRawDataMenu: boolean;
  searchProfileQueryParam: string;
  userRole: Roles;
  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public tenantSetting: TenantSettingsService,
    public sharedService: SharedService,
    private persistingService: StatePersistingService,
    private store: Store<ApplicationState>,
    private cd: ChangeDetectorRef,
    public menuItems: MenuItems,
    private schemaPermissionHelper: SchemaPermissionsHelper
  ) {
    super();
    this.store.pipe(select(showRawDataMenuSelector), takeUntil(this.destroyed$)).subscribe((showMenu) => {
      this.showRawDataMenu = showMenu;
    });
  }

  ngOnInit(): void {
    this.sidebarMenu = cloneDeep(this.menuItems.getMenuitem());

    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((paramMap) => {
      this.searchProfileQueryParam = paramMap.searchProfile;
    });

    this.listenForRouteChanges();
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.user = data.user;
        this.userId = data.profile.id;
        this.userRole = data.currentTenantSystem.tenant.roleNum;

        this.sidebarData = {
          tenant: data.currentTenantSystem.tenant,
          menuType: data.menuType
        };

        if (!this.articlesUrl) {
          const tenantPrefix = convertTenantName(data.currentTenantSystem.tenant.tenantName);
          this.articlesUrl = '/' + tenantPrefix + '/' + dataListRoute;
          this.casesUrl = '/' + tenantPrefix + `/${workflowStatesMainRoute}/${workflowStatesListRoute}`;
          this.reportUrl = '/' + tenantPrefix + `/${reportsMainRoute}`;
        }
      }
    });
    this.listenForWorkflowDataChanges();
  }

  async listenForWorkflowDataChanges(): Promise<void> {
    this.store
      .select(workflowMenuDataSelector)
      .pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(async (menuData: WorkflowMenuData) => {
        if (menuData) {
          const data = cloneDeep(menuData);
          this.sidebarMenu = cloneDeep(this.menuItems.getMenuitem());

          if (this.showRawDataMenu) {
            /**
             * filter profiles based on active raw-data schema id
             */
            const rawDataMenuItems: ChildrenItems[] = data.rawDataMenuItems?.filter((x) => !x.setting?.isChildRef) || [];
            // SP filter based on allowed profils
            for (let item of rawDataMenuItems) {
              await this.setSchemaAndSearchProfilesBySetting(item, AreaTypeEnum.rawData);
            }
            const articlesMenu = this.sidebarMenu.find((x) => x.name === 'Articles');
            articlesMenu.children = articlesMenu.children.concat(rawDataMenuItems?.filter((x) => !x.isHidden));
            if (!this.rawDataSubs) {
              this.subscribeToRawDataMenuSelection();
            }

            /** removing duplicate schemas showing in side menu */
            articlesMenu.children = this.getUniqueChildren(articlesMenu.children);
            this.hasRawDataSchemas = articlesMenu?.children && articlesMenu.children.filter((x) => x.type === 'schema')?.length > 0;
            this.store.dispatch(new SetHasRawDataSchemas({ hasRawDataSchemas: this.hasRawDataSchemas }));
          }
          /**
           * showing all workflows fo cases area in siebar
           */
          const workflows: ChildrenItems[] = data.workflowMenuItems || [];
          // SP
          for (let item of workflows) {
            await this.setSchemaAndSearchProfilesBySetting(item, AreaTypeEnum.case);
          }
          const caseItem = this.sidebarMenu.find((x) => x.name === 'Cases');
          caseItem.children = caseItem.children.concat(workflows?.filter((x) => !x.isHidden));
          this.hasWorkflows = caseItem.children && caseItem.children.filter((x) => x.type === 'workflow')?.length > 0;
          if (!this.workflowSubs) {
            this.subscribeToWorkflowMenuSelection();
          }
          // for now the reports are only for Tenants
          if (this.userRole === Roles.TenantAdmin || this.userRole === Roles.Tenant) {
            const reportItems = data.reportMenuItems || [];
            const reportsMenu = this.sidebarMenu.find((x) => x.name === 'Reports');
            reportsMenu.children = reportsMenu.children.concat(reportItems);
            //Create Report menu-item

            reportsMenu.children.unshift({
              child: [],
              name: 'Create Report',
              setting: {
                id: '',
                workflowSchemaId: '',
                name: 'Create Report',
                reportType: 1
              },
              type: 'report-create'
            });

            if (!this.reportSubs) {
              this.subscribeToReportMenuSelection();
            }
          }

          this.checkOpenLink();
        }
      });
  }

  async setSchemaAndSearchProfilesBySetting(item: ChildrenItems, areaType: AreaTypeEnum): Promise<void> {
    const schemaSetting = await this.getSchemaSettings(item, areaType);
    item.isHidden = schemaSetting?.isSchemaHidden;
    if (item?.isHidden) return;
    if (schemaSetting?.allowedProfiles) item.child = this.filterChilds(item.child, schemaSetting);
    if (schemaSetting?.defaultProfile) {
      const defaultChildItem = item.child?.find((x) => x.setting?.id === schemaSetting?.defaultProfile);
      if (defaultChildItem) {
        defaultChildItem.isDefault = true;
      }
    }
  }

  async getSchemaSettings(item: ChildrenItems, areaType: AreaTypeEnum): Promise<SchemaAndSearchProfileSetting> {
    const schemaId =
      areaType === AreaTypeEnum.rawData ? item?.setting?.id : areaType === AreaTypeEnum.case ? item?.setting?.caseSchemaId : null;
    if (schemaId) {
      const permissions = await this.schemaPermissionHelper.getSchemaPermissions(schemaId, areaType, this.sidebarData.tenant.tenantId);
      return {
        allowedProfiles: permissions?.allowedSearchProfiles,
        defaultProfile: permissions?.defaultSearchProfile,
        schemaId: schemaId,
        isSchemaHidden: permissions?.isSchemaHidden
      };
    }
    return null;
  }

  filterChilds(childs: SubChildren[], setting: SchemaAndSearchProfileSetting): SubChildren[] {
    return (
      childs?.filter((x) => {
        return setting?.allowedProfiles?.includes(x?.setting?.id);
      }) || []
    );
  }

  listenForRouteChanges(): void {
    this.router.events
      .pipe(filter((event: RouterEvent) => event instanceof NavigationEnd))
      .pipe(takeUntil(this.destroyed$))
      .subscribe((routeEvent) => {
        this.checkOpenLink();
      });
  }

  /**
   * activate respective menu item based on route
   */
  checkOpenLink(): void {
    if (this.sidebarMenu) {
      this.sidebarMenu.forEach((menu: Menu) => {
        const routeUrl = this.router.url;
        const currentUrl = routeUrl.split('/');
        menu.opened = currentUrl.indexOf(menu.state) > 0;
        menu.isSelected = currentUrl.indexOf(menu.state) > 0;
      });
      //Set selected workflow when redirection is directly to Full Screen case view
      this.setSelectedWorkflow();
      this.cd.detectChanges();
    }
  }

  setSelectedWorkflow(): void {
    const selectedMenuItem = this.sidebarMenu.find((x) => x.isSelected && x.state === workflowStatesMainRoute);
    if (selectedMenuItem && !this.activeSchemaId) {
      const childToOpen = selectedMenuItem.children.find((x) => this.router.url.includes(x.setting?.id));
      if (childToOpen) this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: childToOpen?.setting }));
    }
  }

  /**
   * get active raw-data schemaId for search-profiles
   */
  subscribeToRawDataMenuSelection(): void {
    this.rawDataSubs = this.store.pipe(takeUntil(this.destroyed$), select(rawDataSelectedSchemaIdSelector)).subscribe((schemaId) => {
      this.removeRawDataSchemaSelection();
      if (schemaId) {
        this.activeSchemaId = schemaId;
        const rawDatasMenu = this.sidebarMenu.find((x) => x.name === 'Articles');
        const activatedSchemMenuItem = rawDatasMenu.children?.find((y) => y?.setting?.id === schemaId);

        if (activatedSchemMenuItem) {
          activatedSchemMenuItem.isOpened = true;
          this.checkForActiveSearchProfile(activatedSchemMenuItem, AreaTypeEnum.rawData, rawDatasMenu);
          this.cd.detectChanges();
        }
        if (this.router.url.includes(this.articlesUrl) && !this.router.url.includes(schemaId)) {
          this.router.navigate([`${convertTenantName(this.sidebarData.tenant.tenantName)}/${dataListRoute}/${schemaId}`]);
        }
      }
    });
  }

  subscribeToWorkflowMenuSelection(): void {
    this.workflowSubs = this.store.pipe(takeUntil(this.destroyed$), select(selectedWorkflowSelector)).subscribe((workflow) => {
      this.removeWorkflowSelection();
      if (workflow) {
        const casesMenu = this.sidebarMenu.find((x) => x.name == 'Cases');
        this.activeSchemaId = workflow.caseSchemaId;
        const activatedMenuItem = casesMenu.children?.find((y) => y?.setting?.caseSchemaId === workflow.caseSchemaId);

        if (activatedMenuItem) {
          activatedMenuItem.isOpened = true;
          this.checkForActiveSearchProfile(activatedMenuItem, AreaTypeEnum.case, casesMenu);
          this.cd.detectChanges();
        }
        if (this.router.url.includes(this.casesUrl) && !this.router.url.includes(workflow.id)) {
          this.router.navigate([`${this.casesUrl}/${workflow.id}`]);
        }
      }
    });
  }

  subscribeToReportMenuSelection(): void {
    this.reportSubs = this.store.pipe(takeUntil(this.destroyed$), select(selectedReportSelector)).subscribe((report) => {
      this.removeReportSelection();

      if (report) {
        const reportMenu = this.sidebarMenu.find((x) => x.name == 'Reports');
        this.activeSchemaId = report.id;
        const activatedMenuItem = reportMenu.children?.find((y) => y?.setting?.id === report.id);

        if (activatedMenuItem) {
          activatedMenuItem.isOpened = true;
          this.checkForActiveSearchProfile(activatedMenuItem, AreaTypeEnum.workflowState, reportMenu);

          this.cd.detectChanges();
        }
        if (this.router.url.includes(this.reportUrl) && !this.router.url.includes(report.id)) {
          this.router.navigate([`${this.reportUrl}/${report.id}`]);
        }
      }
    });
  }

  /**
   * reset all Articles menuItems' isOpened prop to false
   */

  removeRawDataSchemaSelection() {
    const articleMenu = this.sidebarMenu.find((x) => x.name === 'Articles');
    articleMenu?.children?.forEach((c) => {
      if (c) {
        c.isOpened = false;
      }
    });
  }

  /**
   * reset all workflow menuItems' isOpened prop to false
   */
  removeWorkflowSelection() {
    const workflowMenu = this.sidebarMenu.find((x) => x.name === 'Cases');
    workflowMenu?.children?.forEach((c) => {
      if (c) {
        c.isOpened = false;
      }
    });
  }

  removeReportSelection(): void {
    const menu = this.sidebarMenu.find((x) => x.name === 'Reports');
    menu?.children?.forEach((c) => {
      if (c) {
        c.isOpened = false;
      }
    });
  }

  applySchema(schemaMenuItem: ChildrenItems, menuItem: Menu, profileMenuItem?: SubChildren) {
    this.closeWorkflowSidebar();
    const articleItem = this.sidebarMenu?.find((x) => x.name === 'Articles');
    const routerLink = `/${this.sidebarData.tenant.tenantName.replace(/\s/g, '-')}/${menuItem.state}/${articleItem.children[0]?.state}/${
      schemaMenuItem.setting?.id
    }`;
    let navigationExtras: NavigationExtras = {};
    if (!profileMenuItem) {
      this.selectChild(schemaMenuItem, menuItem, MenuChildType.rawData);

      // reset last searchProfile when explicitly clicking on schema menu
      this.persistingService.remove(`${keyForLastUsedSearchProfile}_${schemaMenuItem.setting?.id}_${schemaMenuItem.setting?.areaType}`);
      this.store.dispatch(
        new SetSelectedSearchProfile({
          profile: null,
          type: 'rawData'
        })
      );
    } else {
      navigationExtras.queryParams = {
        searchProfile: profileMenuItem.setting.id
      };
      // reset the other queryParams
      // navigationExtras.queryParamsHandling = 'merge'
    }
    this.router.navigate([routerLink], navigationExtras);
  }
  selectChild(child: ChildrenItems, menuItem: Menu, type: MenuChildType) {
    if (!menuItem.opened) {
      this.toggleParentMenu(menuItem, true);
    }
    menuItem.isSelected = true;
    this.activeSearchProfileId = null;
  }

  applyWorkflow(child: ChildrenItems, menuItem: Menu, sub?: SubChildren): void {
    this.closeWorkflowSidebar();

    const url = `/${this.sidebarData.tenant.tenantName.replace(/\s/g, '-')}/${workflowStatesMainRoute}/${workflowStatesListRoute}/${
      (<WorkflowDto>child.setting).id
    }`;
    let navigationExtras: NavigationExtras = {};

    if (!sub) {
      this.selectChild(child, menuItem, MenuChildType.workFlow);
      // reset last searchProfile when explicitly clicking on workflow menu

      this.persistingService.remove(`${keyForLastUsedSearchProfile}_${child.setting?.caseSchemaId}_${AreaTypeEnum.case}`);

      this.store.dispatch(
        new SetSelectedSearchProfile({
          profile: null,
          type: 'case'
        })
      );
    } else {
      navigationExtras.queryParams = {
        searchProfile: sub.setting.id
      };
      // reset the other queryParams

      // navigationExtras.queryParamsHandling = 'merge'
    }
    this.router.navigate([url], navigationExtras);
  }

  applyReport(child: ChildrenItems, menuItem: Menu, sub?: SubChildren): void {
    this.closeWorkflowSidebar();

    const url = `/${this.sidebarData.tenant.tenantName.replace(/\s/g, '-')}/${reportsMainRoute}/${
      (<DataSourceSimplified>child.setting).id
    }`;
    let navigationExtras: NavigationExtras = {};

    if (!sub) {
      this.selectChild(child, menuItem, MenuChildType.report);
      // reset last searchProfile when explicitly clicking on workflow menu

      this.persistingService.remove(`${keyForLastUsedSearchProfile}_${child.setting?.id}_datasource`);

      this.store.dispatch(
        new SetSelectedSearchProfile({
          profile: null,
          type: 'report'
        })
      );
    } else {
      navigationExtras.queryParams = {
        searchProfile: sub.setting.id
      };
      // reset the other queryParams
    }
    this.router.navigate([url], navigationExtras);
  }

  createReport(): void {
    this.closeWorkflowSidebar();
    this.activeSchemaId = null;
    this.store.dispatch(new SetSelectedWorkflow({ selectedWorkflow: null }));
    this.store.dispatch(new SetSelectedRawDataSchema({ selectedRawDataSchemaId: null }));
    this.store.dispatch(new SetSelectedReport({ selectedReport: null }));
    const url = `/${this.sidebarData.tenant.tenantName.replace(/\s/g, '-')}/${reportsMainRoute}/create`;
    this.router.navigate([url]);
  }

  /**
   * toggle parent menu
   */
  toggleParentMenu(menuItem: Menu, closeOthers?: boolean): void {
    if (closeOthers)
      this.sidebarMenu?.forEach((item: Menu) => {
        item.opened = false;
        item.isSelected = false;
      });
    menuItem.opened = !menuItem?.opened;
    if (menuItem.opened) {
      this.openDefaultSchemaOrWorkflow(menuItem);
    }
  }

  openDefaultSchemaOrWorkflow(menuItem: Menu): void {
    // When there exists only 1 schema/workflow in Raw Data/Cases/Reports respectively.
    let schemas: ChildrenItems[];

    switch (menuItem.name) {
      case MainMenuTypeEnum.ARTICLES:
        schemas = menuItem.children?.filter((child) => child.type === 'schema');
        if (schemas?.length === 1) {
          this.applySchema(schemas[0], menuItem);
        }
        break;
      case MainMenuTypeEnum.CASES:
        schemas = menuItem.children?.filter((child) => child.type === 'workflow');
        if (schemas?.length === 1) {
          this.applyWorkflow(schemas[0], menuItem);
        }
        break;
      case MainMenuTypeEnum.REPORTS:
        schemas = menuItem.children?.filter((child) => child.type === 'report');
        if (schemas?.length === 1) {
          this.applyReport(schemas[0], menuItem);
        }
        break;
      default:
        break;
    }
  }

  closeWorkflowSidebar(): void {
    this.sharedService.closeNavBar.next(true);
  }

  profileClicked(profileMenuItem: SubChildren, schemaMenuItem: ChildrenItems, parentMenuItem: Menu, isFromCode?: boolean): void {
    this.activeSearchProfileId = profileMenuItem.setting.id;
    if (!isFromCode) {
      if (profileMenuItem.state === appRawDataSearchProfile) {
        this.applySchema(schemaMenuItem, parentMenuItem, profileMenuItem);
      } else if (profileMenuItem.state === appCaseSearchProfile) {
        this.applyWorkflow(schemaMenuItem, parentMenuItem, profileMenuItem);
      } else if (profileMenuItem.state === appReportSearchProfile) {
        this.applyReport(schemaMenuItem, parentMenuItem, profileMenuItem);
      }
    } else {
      this.router.navigate([], {
        queryParams: {
          searchProfile: this.activeSearchProfileId
        },
        // keep the existing queryParams (in case they were ther on purpose, on app loading)
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute
      });
    }

    let profileType;
    if (profileMenuItem.state === appRawDataSearchProfile) {
      profileType = 'rawData';
    } else if (profileMenuItem.state === appCaseSearchProfile) {
      profileType = 'case';
    } else if (profileMenuItem.state === appReportSearchProfile) {
      profileType = 'report';
    }

    this.store.dispatch(
      new SetSelectedSearchProfile({
        profile: profileMenuItem.setting,
        type: profileType
      })
    );

    // this.store.dispatch(new SetOpenedChildMenuAction({ itemName: profileMenuItem.name }));
    profileMenuItem.isOpened = true;
  }

  /**
   * if queryParams exists, use it
   * else if localstorage item exists, use it
   * else if nothing found, do nothing
   */

  checkForActiveSearchProfile(menuItem: ChildrenItems, areaType: AreaTypeEnum, parentMenu: Menu): boolean {
    const itemId =
      areaType === AreaTypeEnum.rawData || areaType === AreaTypeEnum.workflowState ? menuItem.setting.id : menuItem.setting.caseSchemaId;
    let activeSearchProfileId = this.searchProfileQueryParam;
    const defaultProfile = menuItem?.child?.find((x) => x?.isDefault);
    if (!activeSearchProfileId) {
      const lastUsedSearchProfile: string = this.persistingService.get(`${keyForLastUsedSearchProfile}_${itemId}_${areaType}`);
      if (lastUsedSearchProfile) {
        try {
          // find the resepective profileMenuItem and call profileClicked with the correct params
          activeSearchProfileId = JSON.parse(lastUsedSearchProfile);
        } catch (error) {
          console.log(error);
          return false;
        }
      }
      if (!lastUsedSearchProfile && defaultProfile) {
        activeSearchProfileId = defaultProfile?.setting?.id;
      }
    }
    if (activeSearchProfileId) {
      const searchProfileMenuItem = menuItem.child.find((child) => {
        return child.setting.id === activeSearchProfileId;
      });
      if (searchProfileMenuItem) {
        this.profileClicked(searchProfileMenuItem, menuItem, parentMenu, true);
        return true;
      }
    }
    return false;
  }

  getUniqueChildren(items: ChildrenItems[]): ChildrenItems[] {
    let uniqueIds = new Map();
    let uniqueItems: ChildrenItems[] = [];
    items.forEach((item) => {
      if (item.type !== 'link') {
        if (!uniqueIds.has(item.setting?.id)) {
          uniqueIds.set(item.setting?.id, item);
          uniqueItems.push(item);
        }
      } else uniqueItems.push(item);
    });
    return uniqueItems;
  }
}
