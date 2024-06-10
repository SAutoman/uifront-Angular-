/**
 * global
 */
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-core';
import { DateTime } from 'luxon';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * project
 */

/**
 * local
 */

interface CacheEntry<T> {
  date: Date;
  value: T;
}

@Injectable({ providedIn: 'root' })
export class CacheService<T> {
  listMap: Map<string, CacheEntry<T>> = new Map<string, CacheEntry<T>>();

  update(key: string, newValue: T, dateGenerator: () => Date = () => DateTime.now().toJSDate()) {
    if (this.listMap.get(key)) {
      const current = dateGenerator();
      this.listMap.delete(key);
      const entity = <CacheEntry<T>>{
        date: current,
        value: newValue
      };
      this.listMap.set(key, entity);
    }
  }

  removeFromCache(key: string): void {
    if (this.listMap.get(key)) {
      this.listMap.delete(key);
    }
  }

  clearCache(): void {
    this.listMap.clear();
  }

  async get(
    key: string,
    expirationMin: number,
    load: () => Promise<T>,
    dateGenerator: () => Date = () => DateTime.now().toJSDate()
  ): Promise<T> {
    const value = this.listMap.get(key);

    if (value) {
      const current = dateGenerator();
      const start = DateTimeFormatHelper.parseToLuxon(current);
      const end = DateTimeFormatHelper.parseToLuxon(value.date);

      const minutesPassed = start?.diff(end).as('minutes');

      if (minutesPassed >= expirationMin) {
        const result = await load();
        const entity = <CacheEntry<T>>{
          date: current,
          value: result
        };
        this.listMap.delete(key);
        this.listMap.set(key, entity);
        return cloneDeep(entity.value);
      }

      return cloneDeep(value.value);
    } else {
      const result = await load();
      const currentDate = dateGenerator();
      const entity = <CacheEntry<T>>{
        date: currentDate,
        value: result
      };
      this.listMap.set(key, entity);
      return cloneDeep(entity.value);
    }
  }
}
