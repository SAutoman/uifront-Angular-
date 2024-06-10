import { Component, Input, Inject, HostListener } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

import { FilePreviewOverlayRef } from './file-preview-overlay-ref';
import { File } from './file-preview-overlay.service';
import { FILE_PREVIEW_DIALOG_DATA } from './file-preview-overlay.tokens';

const ESCAPE = 27;

@Component({
  selector: 'file-preview-overlay',
  templateUrl: './file-preview.component.html',
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h1 {
        margin: 0;
        padding: 1em;
      }

      img {
        width: 100%;
        max-width: 1000px;
        height: auto;
      }

      .overlay-content {
        padding: 1em;
      }
    `
  ]
})
export class FilePreviewOverlayComponent {
  @HostListener('document:keydown', ['$event']) private handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === ESCAPE) {
      this.dialogRef.close();
    }
  }

  constructor(
    public dialogRef: FilePreviewOverlayRef,
    @Inject(FILE_PREVIEW_DIALOG_DATA) public file: File,
    public sanitizer: DomSanitizer
  ) {}
}
