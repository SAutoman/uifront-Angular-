import { Injectable } from '@angular/core';
import { SchemaDto } from '../models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class SchemasCacheService extends CacheService<SchemaDto> {}
