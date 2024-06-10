import { DataEntity } from '@wfm/service-layer';
import { find } from 'lodash-core';
import { PredicateFn } from '../../common/models';

export function idPredicate<T extends DataEntity>(id: string): PredicateFn<T> {
  return (x) => x.id === id;
}
export function itemIdPredicate<T extends DataEntity>(item: T): PredicateFn<T> {
  return (x) => idPredicate(item.id)(x);
}
export function itemPredicate<T>(item: T): PredicateFn<T> {
  return (x) => x === item;
}

export function itemOrIdPredicate<T extends DataEntity>(item: T): PredicateFn<T> {
  return (x) => itemPredicate(item)(x) || itemIdPredicate(item)(x);
}

export function findByItemOrId<T extends DataEntity>(arr: T[], item: T): T {
  return find(arr, itemOrIdPredicate(item));
}
export function findByItem<T extends DataEntity>(arr: T[], item: T): T {
  return find(arr, itemPredicate(item));
}
export function findById<T extends DataEntity>(arr: T[], id: string): T {
  return find(arr, idPredicate(id));
}
