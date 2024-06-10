import { ColumnSettings } from '@wfm/service-layer';

export function createUserGridColumnSettings(width: number = 120): ColumnSettings[] {
  const _width = width;
  const columns: ColumnSettings[] = [
    { field: 'name', title: 'Name', _width },
    { field: 'lastName', title: 'Last Name', _width },
    { field: 'email', title: 'Email', _width },
    { field: 'country', title: 'Country', _width },
    { field: 'city', title: 'City', _width }
  ];
  return columns;
}
