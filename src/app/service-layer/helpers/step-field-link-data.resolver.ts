import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';

/**
 * project
 */

/**
 * local
 */
import { PropertyPath } from '../models/expressionModel';

export interface FieldLinkData {
  stepRefName: string;
  visualElementId: string;
  stepDynamicEntityId: string;
  fieldPath: PropertyPath;
}

@Injectable({
  providedIn: 'root'
})
export class StepFieldLinkDataResolver implements Resolve<FieldLinkData> {
  constructor() {}

  resolve(route: ActivatedRouteSnapshot): FieldLinkData {
    try {
      const queryParams = route.queryParams;
      if (queryParams) {
        const parsedPath = JSON.parse(queryParams.fieldPath);
        const data = <FieldLinkData>{
          stepRefName: queryParams.stepRefName || null,
          visualElementId: queryParams.visualElementId || null,
          stepDynamicEntityId: queryParams.stepDynamicEntityId || null,
          fieldPath: parsedPath || null
        };
        if (data.fieldPath && data.stepDynamicEntityId && data.stepRefName && data.visualElementId) {
          return data;
        }
        return null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
