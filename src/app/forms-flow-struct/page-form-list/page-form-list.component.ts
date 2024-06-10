// /**
//  * global
//  */
// import { Component, OnInit } from '@angular/core';
// import { FormControl } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// import { BehaviorSubject, Observable } from 'rxjs';
// /**
//  * project
//  */
// import { AreaTypeAll, AreaTypeEnum, AreaTypeOption, schemasGridSettings, GridConfiguration } from '@wfm/service-layer';
// import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
// import { BaseComponent } from '@wfm/shared/base.component';
// import { defaultSchemasListGridSettings } from '@wfm/shared/default-grid-settings';

// /**
//  * local
//  */
// import { IFormDto } from '../interface';
// import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
// import { select, Store } from '@ngrx/store';
// import { allSchemasSelector, tenantIdKey } from '@wfm/store';
// import { AppBarData, SharedService } from '@wfm/service-layer/services/shared.service';

// @Component({
//   selector: 'app-page-form-list',
//   templateUrl: './page-form-list.component.html',
//   styleUrls: ['./page-form-list.component.scss']
// })
// export class PageFormListComponent extends BaseComponent implements OnInit {
//   gridConfigBase: GridConfiguration;
//   gridSettingsKeyBase: string;
//   areaTypes: Array<AreaTypeOption>;
//   areaType: BehaviorSubject<AreaTypeEnum> = new BehaviorSubject(null);
//   areaType$: Observable<AreaTypeEnum>;
//   areaSelect: FormControl;
//   allSchemasFromStore: IFormDto[];
//   appBarData: AppBarData = { title: 'Schema Overview' } as AppBarData;

//   constructor(
//     public service: AdminSchemasService,
//     private activatedRoute: ActivatedRoute,
//     private router: Router,
//     private store: Store<any>,
//     private adminService: AdminSchemasService,
//     private sharedService: SharedService
//   ) {
//     super();
//     // this.gridConfigBase = defaultSchemasListGridSettings;

//     // this.gridSettingsKeyBase = schemasGridSettings;
//     // this.areaType$ = this.areaType.asObservable();
//     // this.sharedService.setAppBarData(this.appBarData);
//   }

//   ngOnInit() {
//     // this.areaSelect = new FormControl();
//     // this.areaSelect.valueChanges.pipe(distinctUntilChanged()).subscribe((newAreaType) => {
//     //   this.updateRouteQuery(newAreaType);
//     //   this.areaType.next(newAreaType);
//     // });

//     // this.activatedRoute.queryParamMap.subscribe((queries) => {
//     //   const area = queries.get('area');
//     //   area ? this.setupAreaSelector(Number(area)) : this.setupAreaSelector(AreaTypeAll);
//     // });
//     this.loadSchemasFromStore();
//   }

//   setupAreaSelector(area): void {
//     // this.areaTypes = this.service.getAreaEnumOptions();
//     // this.areaSelect.setValue(area);
//   }

//   // updateRouteQuery(newArea) {
//   //   //for better ux, load the correct area on page refresh or when going back
//   //   this.router.navigate([], {
//   //     relativeTo: this.activatedRoute,
//   //     queryParams: { area: newArea },
//   //     queryParamsHandling: 'merge'
//   //   });
//   // }

//   loadSchemasFromStore() {
//     this.store.pipe(select(allSchemasSelector), takeUntil(this.destroyed$)).subscribe((schemas) => {
//       this.allSchemasFromStore = schemas;
//       if (!schemas) {
//         this.adminService.fetchSchemas(localStorage.getItem(tenantIdKey));
//       } else this.allSchemasFromStore = schemas;
//     });
//   }

//   ngOnDestroy(): void {
//     super.ngOnDestroy();
//   }
// }
