// /**
//  * global
//  */
// import { BehaviorSubject } from 'rxjs';
// import { Injectable } from '@angular/core';

// /**
//  * project
//  */

// /**
//  * local
//  */
// import { LikeFilter } from '@wfm/service-layer/models/dynamic-entity-models';

// @Injectable({
//   providedIn: 'root'
// })
// export class CasesSearchEventService {
//   private searchModel = new BehaviorSubject<LikeFilter<string>>(<any>{});
//   private refresh = new BehaviorSubject<boolean>(false);

//   currentSearchModel = this.searchModel.asObservable();
//   currentState = this.refresh.asObservable();

//   constructor() {}

//   assignSearchModel(model: LikeFilter<string>) {
//     this.searchModel.next(model);
//   }

//   onRefresh(value: boolean) {
//     this.refresh.next(value);
//   }
// }
