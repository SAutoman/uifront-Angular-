import { InjectionToken } from '@angular/core';

import { File } from './file-preview-overlay.service';

export const FILE_PREVIEW_DIALOG_DATA = new InjectionToken<File>('FILE_PREVIEW_DIALOG_DATA');
