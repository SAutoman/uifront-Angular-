import { Observable, BehaviorSubject } from 'rxjs';

export interface DataSourceBase {
  length: Observable<number>;
  setPageSizeAndIndex(pageIndex: number, pageSize: number): void;
}

export interface DataSource<T> extends DataSourceBase {
  items: Observable<T[]>;
}

export class DataSourceIMPL<T> implements DataSource<T> {
  itemsBS: BehaviorSubject<T[]> = new BehaviorSubject<T[]>(null);
  lengthBS: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  setPageSizeAndIndex(pageIndex: number, pageSize: number): void {
    throw new Error('Method not implemented.');
  }

  get items() {
    return this.itemsBS.asObservable();
  }

  get length() {
    return this.lengthBS.asObservable();
  }
}
