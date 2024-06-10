import { DateTime } from 'luxon';
import { getTimeZones, TimeZone } from '@vvo/tzdb';
import { sortBy } from 'lodash-core';

export function getTimezonesFromtzdb(): TimeZone[] {
  const timeZonesWithUtc: TimeZone[] = getTimeZones({ includeUtc: true });
  const filtered = timeZonesWithUtc.filter((tz) => DateTime.local().setZone(tz.name).isValid);
  const ordered = sortBy(filtered, [(x: TimeZone) => x.name]);
  return ordered;
}

export function getTimeZoneByName(tzName: string): TimeZone {
  return getTimeZones({ includeUtc: true }).find((timezone: TimeZone) => timezone.name === tzName);
}
