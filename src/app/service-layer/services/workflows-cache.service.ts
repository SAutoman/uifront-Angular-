import { Injectable } from '@angular/core';
import { WorkflowDto } from '../models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class WorkflowsCacheService extends CacheService<WorkflowDto> {}
