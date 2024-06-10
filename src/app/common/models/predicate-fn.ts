export type PredicateFn<T> = (iterationItem: T, index?: number, array?: T[]) => boolean;
export type FilterPredicateFn<T> = (a: T, b: T) => boolean;
