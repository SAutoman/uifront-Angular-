/**
 * global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';

import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * project
 */
import { FieldTypeIds, UploadedFile } from '@wfm/service-layer';
import { FormlyFieldAdapterFactory, FormVariableDto } from '@wfm/common/vendor/formly-field-adapter';

/**
 * local
 */

interface IFileInfo {
  url: string;
}
type FileInfo = UploadedFile & { url: string };

// seems to be the old version of file uploader, to be double checked before archiving

@Component({
  selector: 'app-formly-file-uploader',
  templateUrl: './formly-file-uploader.component.html',
  styleUrls: ['./formly-file-uploader.component.scss']
})
export class FormlyFileUploaderComponent implements OnInit {
  @Input() label = 'Upload';
  @Input() usePreview = false;
  @Input() fileId?: string;
  @Input() accept: string[] = [];
  @Input() required = true;

  @Output() uploaded = new EventEmitter<FileInfo>();
  model = {};
  form: FormGroup;
  fields: FormlyFieldConfig[];
  fileInfo$: Observable<IFileInfo>;
  private fileInfo = new Subject<FileInfo>();
  constructor(private fb: FormBuilder) {
    this.fileInfo$ = this.fileInfo.asObservable().pipe(
      filter((x) => !!x),
      filter((x) => !!x.url),
      map((x) => {
        this.uploaded.next(x);
        return {
          url: x.url
        };
      })
    );
  }

  ngOnInit(): void {
    this.form = this.fb.group({});

    const fieldVariable: FormVariableDto = {
      label: this.label,
      name: 'file',
      type: FieldTypeIds.FileField,
      value: this.fileId
    };

    const fileField = FormlyFieldAdapterFactory.createAdapter(fieldVariable).getConfig();
    if (!fileField.templateOptions) {
      fileField.templateOptions = {};
    }
    fileField.templateOptions.formlyFileOptions = {
      onUpload: (e: FileInfo) => {
        this.fileInfo.next(e);
      }
    };
    fileField.templateOptions.required = this.required;
    fileField.templateOptions.accept = this.accept.join(',');
    this.fields = [fileField];
  }
}
