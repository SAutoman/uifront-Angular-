import { Injectable } from '@angular/core';
import { Company, PagedData } from '../models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CompaniesCacheService extends CacheService<Company> {}
