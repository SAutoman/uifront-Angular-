/**
 * global
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */
import { IConfigurableListItem } from '@wfm/common/models';
import { PopupConfirmComponent } from '@wfm/shared/popup-confirm/popup-confirm.component';
import { SchemasService } from '@wfm/service-layer';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { PopupAlertComponent } from '@wfm/shared/popup-alert/popup-alert.component';
import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';
import { selectTenantListsState, TenantListsState, GetTenantLists, RemoveTenantList, AddOrUpdateTenantList } from '@wfm/store/tenant-lists';
/**
 * local
 */
import { TenantListsStateWrapper } from './tenant-lists-state-wrapper';

@Component({
  selector: 'app-page-tenant-lists',
  templateUrl: './page-tenant-lists.component.html',
  styleUrls: ['./page-tenant-lists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTenantListsComponent extends TenantComponent implements OnInit {
  title = 'Lists';
  disabled = false;
  updateItem?: IConfigurableListItem;
  state$: Observable<TenantListsStateWrapper>;
  searchTermCtrl = new FormControl('');
  componentId = '36208757-4a98-4b2b-a9ec-0e9b56f1bf04';
  isDeskTop: boolean = true;
  appBarData: AppBarData = { title: 'Tenant Lists' } as AppBarData;
  private wrapper: TenantListsStateWrapper;

  get allLists(): IConfigurableListItem[] {
    return this.wrapper?.allFields || [];
  }

  constructor(
    private store: Store<any>,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private schemasService: SchemasService,
    private sharedService: SharedService,
    private ts: TranslateService
  ) {
    super(store);
    this.sharedService.updateMobileQuery.pipe(takeUntil(this.destroyed$)).subscribe((isDeskTop: boolean) => (this.isDeskTop = isDeskTop));
    this.sharedService.setAppBarData(this.appBarData);
  }

  ngOnInit(): void {
    this.state$ = this.store.select(selectTenantListsState).pipe(
      map((state: TenantListsState) => {
        this.disabled = !!state.loading;
        this.wrapper = new TenantListsStateWrapper(state);
        this.wrapper.filter(this.searchTermCtrl.value);
        return this.wrapper;
      })
    );

    this.store.dispatch(new GetTenantLists());

    this.searchTermCtrl.valueChanges
      .pipe(
        debounceTime(300),
        filter(() => !!this.wrapper)
      )
      .subscribe((term) => {
        this.wrapper.filter(term);
      });
  }

  openDialogAddList(template: TemplateRef<any>) {
    this.openDialog(template, ['page-tenant-lists--create-list-dialog'], 500).subscribe();
  }

  openDialogEditList(e: Event, template: TemplateRef<any>, list: IConfigurableListItem): void {
    if (this.disabled) {
      return;
    }
    this.updateItem = list;
    this.openDialog(template, ['page-tenant-lists--edit-list-dialog'], 500).subscribe();
  }

  async onRemove(e: Event, list: IConfigurableListItem): Promise<void> {
    if (this.disabled) {
      return;
    }

    let usageObject = await this.checkIfListIsUsed(list);
    if (usageObject.inSchemas || usageObject.inTenantFields) {
      this.dialog.open(PopupAlertComponent, {
        data: {
          message: `Cannot remove: the list is referenced in ${usageObject.inSchemas ? 'schemas' : ''} ${
            usageObject.inSchemas ? (usageObject.inTenantFields ? 'and' : '') : ''
          } ${usageObject.inTenantFields ? 'tenant fields' : ''}.`
        },
        width: '400px',
        panelClass: []
      });
      return;
    }

    const confirm = this.dialog.open(PopupConfirmComponent, {
      width: '400px',
      data: {
        title: this.ts.instant('Remove List?'),
        message: this.ts.instant(`Removing this list will also trigger removing all its child lists (if any).`)
      }
    });
    confirm.afterClosed().subscribe(async (result) => {
      if (result === true) {
        this.disabled = true;
        this.cd.detectChanges();
        this.store.dispatch(new RemoveTenantList({ id: list.id }));
      }
    });
  }

  async checkIfListIsUsed(list: IConfigurableListItem): Promise<{ [key: string]: boolean }> {
    try {
      let results = await Promise.all([
        this.schemasService.getSchemaFieldsByList(this.tenant, list.id),
        this.schemasService.getTenantFieldsByList(this.tenant, list.id)
      ]);

      return {
        inSchemas: !!results[0].length,
        inTenantFields: !!results[1].length
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  onListItemSave(list: IConfigurableListItem): void {
    this.dialog.closeAll();

    this.updateItem = undefined;
    this.disabled = true;
    this.cd.detectChanges();

    this.store.dispatch(
      new AddOrUpdateTenantList({
        item: list,
        refresh: true
      })
    );
  }

  private openDialog(template: TemplateRef<any>, panelClasses?: string[], minWidth: number = 300): Observable<any> {
    // const themeClass = this.kendoThemeService.theme;
    // panelClasses.push(themeClass);

    return this.dialog
      .open(template, {
        minWidth,
        panelClass: panelClasses,
        disableClose: true
      })
      .afterClosed()
      .pipe(filter((x) => !!x));
  }
}
