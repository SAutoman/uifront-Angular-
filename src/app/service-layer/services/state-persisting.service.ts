import { Injectable } from '@angular/core';

export const getCircularReplacer = () => {
  const seen = new WeakSet();
  return (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

@Injectable()
export class StatePersistingService {
  public get<T>(token: string): T {
    const settings = localStorage.getItem(token);
    return settings ? JSON.parse(JSON.stringify(settings)) : settings;
  }

  public set<T>(token: string, gridConfig: any): void {
    this.remove(token);
    localStorage.setItem(token, JSON.stringify(gridConfig, getCircularReplacer()));
  }

  public remove(token: string): void {
    localStorage.removeItem(token);
  }

  public setUserId(token: string, userId: string) {
    localStorage.setItem(token, JSON.stringify(userId));
  }
  public clear() {
    localStorage.clear();
  }

  public removeItemsByKey(key: string): void {
    /* Removes all the storage items which includes the key */
    const keysCount = window.localStorage.length;
    for (let index = 0; index < keysCount; index++) {
      const item = window.localStorage.key(index);
      if (item?.includes(key)) {
        this.remove(item);
      }
    }
  }
}
