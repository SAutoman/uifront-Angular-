import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-camera-dialog',
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.scss']
})
export class CameraDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('video') video: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  videoElement: HTMLVideoElement;
  isImageTaken: boolean;
  isCameraAllowed: boolean = true;
  camView: string = 'environment';
  canvasWidth = 400;
  canvasHeight = 300;

  constructor(private dialogRef: MatDialogRef<CameraDialogComponent>, private snackBar: MatSnackBar) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initCamera();
    this.canvasWidth = window.screen.width - 32;
    this.canvasHeight = (this.canvasWidth * 75) / 100;
  }

  initCamera(): void {
    this.videoElement = this.video?.nativeElement;
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: this.camView }
      })
      .then((stream) => {
        this.videoElement.srcObject = stream;
      })
      .catch((err) => {
        this.isCameraAllowed = false;
        this.snackBar.open(err, 'Ok', { duration: 3000 });
      });
  }

  takePicture(): void {
    setTimeout(() => {
      this.isImageTaken = true;
      const canvasElement = this.canvas?.nativeElement;
      if (canvasElement) {
        const context = canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, this.canvasWidth, this.canvasHeight);
        this.saveImage();
      }
    }, 300);
  }

  stopCamera(): void {
    const videoElement = this.video?.nativeElement;
    const vs = videoElement?.srcObject;
    const tracks = vs?.getTracks();
    tracks?.forEach((x) => x.stop());
  }

  saveImage(): void {
    const canvasElement = this.canvas?.nativeElement;
    if (canvasElement) {
      const image = canvasElement.toDataURL();

      this.stopCamera();
      setTimeout(() => {
        this.dialogRef.close(image);
      }, 200);
    }
  }

  closeDialog(): void {
    this.stopCamera();
    this.dialogRef.close();
  }

  // changeCameraView(data: MatRadioChange): void {
  //   this.stopCamera();
  //   setTimeout(() => {
  //     if (this.isImageTaken) this.isImageTaken = false;
  //     this.initCamera();
  //   }, 1000);
  // }
}
