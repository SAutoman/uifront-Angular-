// /**
//  * global
//  */
// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';

// /**
//  * project
//  */
// import { GridState, ColumnState } from '../models';

// /**
//  * local
//  */

// @Injectable({
//   providedIn: 'root'
// })
// export class GridStateService {
//   constructor() {}

//   get(gridId: string): Observable<GridState> {
//     if (gridId === 'RawDataGrid') {
//       return this.getRawDataGridState();
//     }

//     if (gridId === 'CompaniesGrid') {
//       return this.getCompaniesGridState();
//     }

//     return of(<any>{});
//   }

//   getRawDataGridState(): Observable<GridState> {
//     return of(<GridState>{});
//   }

//   getCompaniesGridState(): Observable<GridState> {
//     return of(<GridState>{
//       columns: [
//         <ColumnState>{
//           title: 'Name',
//           field: 'name',
//           width: 50
//         },
//         <ColumnState>{
//           title: 'Email',
//           field: 'email',
//           width: 20
//         },
//         <ColumnState>{
//           title: 'Country',
//           field: 'country',
//           width: 40
//         }
//       ],
//       pageSize: 10
//     });
//   }
// }
