// import { DataSource, CollectionViewer } from "@angular/cdk/collections";
// import {
//   RawDataEntity,
//   RawDataEntityService,
//   Paging,
//   Sorting
// } from '../../service-layer';
// import { BehaviorSubject, of, Observable } from "rxjs";
// import { tap, catchError, finalize } from "rxjs/operators";

// export class RawDataDataSource implements DataSource<RawDataEntity> {
//   private rawDatasubject = new BehaviorSubject<RawDataEntity[]>([]);

//   private totalItemsSubject = new BehaviorSubject<number>(0);
//   private loadingSubject = new BehaviorSubject<boolean>(false);

//   public loading$ = this.loadingSubject.asObservable();
//   public totalItems$ = this.totalItemsSubject.asObservable();

//   constructor(private rawDataService: RawDataEntityService) { }

//   loadRawData(tenant: string, paging?: Paging, sorting?: Sorting[]) {
//     this.loadingSubject.next(true);

//     this.rawDataService
//       .search(tenant, paging, sorting)
//       .pipe(
//         tap(data => {
//           data.items.forEach(i => {
//             i['fields'] = {};
//             i.extra.forEach(f => i['fields'][f.name] = f.value);
//           });

//           this.rawDatasubject.next(data.items);
//           this.totalItemsSubject.next(data.total);
//         }),
//         catchError(() => of([])),
//         finalize(() => this.loadingSubject.next(false))
//       )
//       .subscribe();
//   }

//   connect(collectionViewer: CollectionViewer): Observable<RawDataEntity[]> {
//     console.log("Connecting data source");
//     return this.rawDatasubject.asObservable();
//   }

//   disconnect(collectionViewer: CollectionViewer): void {
//     this.rawDatasubject.complete();
//     this.loadingSubject.complete();
//   }
// }
