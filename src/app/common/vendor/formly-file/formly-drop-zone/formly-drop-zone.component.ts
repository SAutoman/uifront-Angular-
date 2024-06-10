import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { SelectEvent } from '@progress/kendo-angular-upload';
import { Guid } from '@wfm/shared/guid';
import { FileRestrictions } from '@progress/kendo-angular-upload';

@Component({
  selector: 'app-formly-drop-zone',
  templateUrl: './formly-drop-zone.component.html',
  styleUrls: ['./formly-drop-zone.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormlyDropZoneComponent implements OnInit {
  @Input() accept: any;
  @Input() disableUpload: boolean;
  @Input() allowMultipleFiles?: boolean;
  @Output() filesListEmitter: EventEmitter<File[]> = new EventEmitter(null);

  componentId: string = Guid.createQuickGuid()?.toString();
  myRestrictions: FileRestrictions = {
    maxFileSize: 50000
  };

  ngOnInit(): void {
    this.accept = this.accept?.split(',')?.join(', ');
  }

  onFilesAdd(event: SelectEvent): void {
    const files = event.files;
    if (files) {
      const list = files?.map((x) => x.rawFile);
      this.filesListEmitter.emit(list);
    }
  }
}
