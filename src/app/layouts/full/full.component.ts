/**
 * global
 */
import { ChangeDetectorRef, Component, OnDestroy, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import { select, Store } from '@ngrx/store';

import { filter, take, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { TenantComponent } from '@wfm/shared/tenant.component';
import { applicationTheme, IThemeColorObject, Roles, SentryService } from '@wfm/service-layer';
import { ApplicationState, tenantSettingsSelector, loggedInState } from '@wfm/store';
import { Renderer2 } from '@angular/core';
import { AppBarData, ScreenType, SharedService } from '@wfm/service-layer/services/shared.service';
import { AppHeaderComponent } from './header/header.component';
import { CaseViewEnum } from '@wfm/workflow-state/workflow-states-list/workflow-states-list.component';
/**
 * local
 */

/** @title Responsive sidenav */
@Component({
  selector: 'app-full-layout',
  templateUrl: './full.component.html',
  styleUrls: ['./full.component.scss']
})
export class FullComponent extends TenantComponent implements OnInit, AfterViewInit, OnDestroy {
  mobileQuery: MediaQueryList;
  @ViewChild('snav') snav;
  @ViewChild('profileMenu') profileMenu;
  @ViewChild('appHeader')
  appHeader: AppHeaderComponent;

  dir = 'ltr';
  green: boolean;
  blue: boolean;
  dark: boolean;
  minisidebar: boolean;
  boxed: boolean;
  danger: boolean;
  showHide: boolean;
  sidebarOpened;
  darkgreen: boolean;
  color: string;
  appBarData: AppBarData = {} as AppBarData;
  selectedCaseView: CaseViewEnum | string;
  isVisualViewAllowed: boolean;

  private _mobileQueryListener: () => void;

  constructor(
    private elem: ElementRef,
    router: Router,
    private activatedRoute: ActivatedRoute,
    private store: Store<ApplicationState>,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private renderer: Renderer2,
    private sentryService: SentryService,
    public sharedService: SharedService
  ) {
    super(store);

    this.mobileQuery = media.matchMedia('(min-width: 1280px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.mobileQuery.onchange = (e) => {
      this.sharedService.updateMobileQuery.next(e.matches);
    };
    router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      // You only receive NavigationEnd events
      setTimeout(() => {
        this.setGridContentHeight();
      }, 1000);
    });
    this.sharedService.closeNavBar.pipe(takeUntil(this.destroyed$)).subscribe((close) => {
      if (close && !this.mobileQuery.matches) {
        this.snav.close();
      }
    });
    this.sharedService
      .getAppBarData()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((data: AppBarData) => (this.appBarData = data));
  }

  async ngOnInit(): Promise<void> {
    await this.getColors();
    this.sharedService.updateMobileQuery.next(this.mobileQuery.matches);
    this.store.pipe(select(loggedInState), takeUntil(this.destroyed$)).subscribe((data) => {
      if (data && data.profile && data.currentTenantSystem?.tenant) {
        this.selectedCaseView = localStorage.getItem(`CasesView_${data.profile.id}`) || CaseViewEnum.Grid;
        this.isVisualViewAllowed =
          data.currentTenantSystem.tenant.roleNum !== Roles.Auditor && data.currentTenantSystem.tenant.roleNum !== Roles.Supplier;
      }
    });
  }

  ngAfterViewInit(): void {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (params.isSideMenuHidden === 'true' && this.snav) {
        this.snav.close();
        this.sidebarOpened = false;
      }
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }

  toggleSwitch() {
    this.appBarData.caseViewSwitched = <CaseViewEnum>this.selectedCaseView;
    this.sharedService.setAppBarData(this.appBarData);
  }
  public get screenType(): typeof ScreenType {
    return ScreenType;
  }
  profileActions(type) {
    switch (type) {
      case 0:
        this.appHeader.routeProfile();
        break;
      case 1:
        this.appHeader.onSignOut();
        break;
    }
    this.profileMenu.close();
  }

  async getColors(): Promise<void> {
    this.store
      .pipe(
        select(tenantSettingsSelector),
        takeUntil(this.destroyed$),

        filter((x) => !!x && !!x.length),
        take(1)
      )
      .subscribe((data) => {
        const setting = data.filter((s) => s.key === applicationTheme);

        if (!setting.length) {
          return;
        }

        const colors: IThemeColorObject = data.find((s) => s.key === applicationTheme)?.value?.colors || {};

        this.green = colors.green;
        this.darkgreen = colors.darkgreen;
        this.danger = colors.danger;
        this.blue = colors.blue;
        this.dark = colors.dark;

        if (this.darkgreen) {
          this.color = 'darkgreen';
        }
        if (this.green) {
          this.color = 'green';
        }
        if (this.danger) {
          this.color = 'danger';
        }
        if (this.blue) {
          this.color = 'blue';
        }
        if (this.dark) {
          this.color = 'dark';
        }

        this.renderer.addClass(document.body, `${this.color}`);
      });
  }

  toggleSideBar() {
    this.snav.toggle();
    this.sidebarOpened = !this.sidebarOpened;
  }

  setGridContentHeight(): void {
    // Set grid content height according to window height
    const gridContents: HTMLElement[] = this.elem.nativeElement.querySelectorAll('.k-grid-content');
    gridContents.forEach((x) => {
      x.style.maxHeight = window.innerHeight - 210 + 'px';
    });
  }

  public reportProblemAction(): void {
    this.sentryService.reportProblem();
  }
}
