import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TenantSettingsService } from '@wfm/service-layer';
import { ChildrenItems, Menu, SubChildren, MenuItemType } from '@wfm/shared/menu-items/menu-items';
import { SharedService } from '@wfm/service-layer/services/shared.service';
import { MenuType } from '@wfm/store/auth/auth.reducer';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-items-sidebar',
  templateUrl: './admin-items-sidebar.component.html',
  styleUrls: ['./admin-items-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminItemsSidebarComponent implements OnInit {
  @Input() menuType: MenuType;
  @Input() adminMenuItems: Menu[];

  /**Store selected child */
  childId: ChildrenItems;
  get menuTypeEnum(): typeof MenuType {
    return MenuType;
  }
  constructor(
    private router: Router,
    private _cdr: ChangeDetectorRef,
    public tenantSetting: TenantSettingsService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((e) => {
      this.checkOpenLink();
    });
    this.checkOpenLink();
  }

  handleAction() {
    this.sharedService.closeNavBar.next(true);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.adminMenuItems?.currentValue && changes?.adminMenuItems?.currentValue !== changes?.adminMenuItems?.previousValue) {
      this.checkOpenLink();
    }
  }

  /**
   * getActive parnet from router
   */
  checkOpenLink() {
    this.adminMenuItems.map((menu: Menu) => {
      const routeUrl = this.router.url;
      const currentUrl = routeUrl.split('/');

      menu.opened = false;
      menu.isSelected = false;
      // menu.opened = menu.state != '' && currentUrl.indexOf(menu.state) > 0;
      if (currentUrl.indexOf(menu.state) > 0) {
        menu.opened = true;
        menu.isSelected = true;
        if (menu.children?.length)
          for (let child of menu.children) {
            child.isOpened = false;
            let moveNext = false;
            if (child.child?.length && currentUrl.indexOf(child.state) > 0) {
              moveNext = true;
            } else if (currentUrl[currentUrl.length - 1].includes(child.state)) {
              moveNext = true;
            }
            if (moveNext) {
              this.childId = child;
              child.isOpened = true;
              if (child.child?.length) {
                for (let subChild of child.child) {
                  if (subChild.state !== '' && routeUrl.includes(subChild.state)) {
                    this.childId = subChild;
                  }
                }
              }
            }
          }
      }
    });
    this._cdr.detectChanges();
  }

  /**
   * toggle parent menu
   */
  toggleParentMenu(menuItem: Menu, closeOthers?: boolean) {
    menuItem.opened = !menuItem?.opened;

    if (menuItem.opened) {
      const firstSubChild = menuItem.children[0];
      switch (firstSubChild.type) {
        case MenuItemType.link:
          this.router.navigate(['/', menuItem.tenantName, menuItem.state, firstSubChild.state]);
          break;
        case MenuItemType.subChild:
          this.router.navigate(this.buildSubChildPath(menuItem, firstSubChild, firstSubChild.child[0]));
          break;
      }
    }
  }

  toggleChildItemActive(item: ChildrenItems, menuItem: Menu): void {
    item.isOpened = !item.isOpened;
    if (item.isOpened) {
      this.router.navigate(this.buildSubChildPath(menuItem, item, item.child[0]));
    }
  }

  buildSubChildPath(menuitem: Menu, childItem?: ChildrenItems, child?: SubChildren): string[] {
    const parts: string[] = ['/'];

    const splitPart = (name: string) => {
      name.split('/').forEach((x) => parts.push(x));
    };
    if (child && child.useTenantPrefix && menuitem.tenantName) {
      splitPart(menuitem.tenantName);
    }
    splitPart(menuitem.state);
    if (childItem) {
      splitPart(childItem.state);
    }
    if (child) {
      splitPart(child.state);
    }
    return parts;
  }
}
