import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.scss']
})
export class ImageCropperComponent implements OnInit {
  imageChangedEvent: Event;
  isRoundCropper: boolean;
  aspectRatio: number;
  image: ImageCroppedEvent;
  fileReady: boolean = false;
  imageFileb64: string | ArrayBuffer;

  constructor(public dialogRef: MatDialogRef<ImageCropperComponent>, @Inject(MAT_DIALOG_DATA) public data) {}

  ngOnInit(): void {
    this.imageChangedEvent = this.data?.file;
    this.isRoundCropper = this.data?.isRoundCropper;
    this.aspectRatio = this.data?.aspectRatio;
    if (this.data?.imageFile) this.encodeImageFileAsURL(this.data.imageFile);
    if (this.data?.b64) {
      this.imageFileb64 = this.data.b64;
    }
  }

  encodeImageFileAsURL(file: File): void {
    const reader = new FileReader();
    reader.onloadend = () => {
      this.imageFileb64 = reader.result;
    };
    reader.readAsDataURL(file);
  }
  imageCropped(event: ImageCroppedEvent): void {
    this.image = event;
  }

  imageLoaded(image: LoadedImage): void {
    // show cropper
  }

  cropperReady(): void {
    this.fileReady = true;
    // cropper ready
  }

  loadImageFailed(): void {
    // show message
  }

  onCropImage(): void {
    this.dialogRef.close(this.image);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
