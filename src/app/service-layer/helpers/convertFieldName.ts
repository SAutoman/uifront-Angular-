import { camelCase } from 'lodash-core';

export function convertFieldName(userFieldName: string): string {
  return camelCase(userFieldName);
}
