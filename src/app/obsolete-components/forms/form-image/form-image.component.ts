// import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// @Component({
//   selector: 'app-form-image',
//   templateUrl: './form-image.component.html',
//   styleUrls: ['./form-image.component.scss']
// })
// export class FormImageComponent implements OnInit {
//   @Input() image: string;
//   @Output() onUpload: EventEmitter<FormData> = new EventEmitter<FormData>();
//   file: File;
//   componentId = 'd1ed0f4a-585c-4af8-ba99-f44825e3849f';

//   constructor() {}

//   ngOnInit() {}

//   upload(files: FileList) {
//     if (files.length === 0) {
//       return;
//     }
//     this.file = files.item(0);
//     const formData = new FormData();
//     formData.append('file', this.file);
//     this.onUpload.emit(formData);
//   }
// }
