import { Injectable } from '@angular/core';
import { UploadedFile } from '../models';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentCacheService extends CacheService<UploadedFile> {}
