/**
 * global
 */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';

/**
 * project
 */

import { DocumentUploadService, UserSettingsDto } from '@wfm/service-layer';
import { AuthState, loggedInState } from '@wfm/store';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ImageCropperComponent } from '@wfm/shared/image-cropper/image-cropper.component';
import { ImageData, SharedService, UploadImageData } from '@wfm/service-layer/services/shared.service';
/**
 * local
 */

@Component({
  selector: 'app-upload-profile-picture',
  templateUrl: './upload-profile-picture.component.html',
  styleUrls: ['./upload-profile-picture.component.scss']
})
export class UploadProfilePictureComponent extends TenantComponent implements OnInit {
  @Output() updatePhoto: EventEmitter<any> = new EventEmitter();
  file: File;
  fileName: string;
  fileType: string;
  userId: string;
  authState: AuthState;
  image: string;
  setting: UserSettingsDto;
  isValid: boolean = true;
  componentId = '1cddb34c-e45e-4f83-b477-d9636420c2e3';
  isUserLogo = false;
  userImage: string;
  documentId: string;

  constructor(
    private store: Store<AuthState>,
    private uploadService: DocumentUploadService,
    private dialog: MatDialog,
    private sharedService: SharedService
  ) {
    super(store);
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
      this.authState = state;
    });
  }

  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.userId = data.profile.id;
        if (data.profile?.photoId) {
          this.prepareImagePath(data.profile.photoId);
        }
      }
    });
  }

  onUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.file = files[0];
    this.checkFileType(this.file);
    if (!this.isValid) {
      return;
    }
    this.fileName = this.file.name;
    this.fileType = this.file.type;

    const dialogRef = this.dialog.open(ImageCropperComponent, {
      width: '480px',
      disableClose: true,
      data: { file: event, isRoundCropper: true, aspectRatio: 1 / 1 }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const data: UploadImageData = {
          base64: result?.base64,
          sessionId: this.authState?.sessionId,
          fileName: this.fileName,
          fileType: this.fileType
        };
        this.sharedService.uploadCroppedImage(data).then((response: ImageData) => {
          this.image = response?.image;
          this.documentId = response?.documentId;
        });
      } else {
        this.onRemove();
      }
    });
  }

  onRemove(): void {
    this.file = null;
    this.fileName = null;
    this.image = this.userImage;
  }

  delete(): void {
    this.documentId = null;
    this.isUserLogo = false;
    this.image = null;
    this.sharedService.setUpdateUserImage(this.image);
    this.updatePhoto.emit(null);
  }

  async onSaveClicked(): Promise<void> {
    this.updatePhoto.emit(this.documentId);
    this.sharedService.setUpdateUserImage(this.image);
    this.file = null;
    this.fileName = null;
    this.isUserLogo = true;
  }

  private async prepareImagePath(photoId: string): Promise<void> {
    if (photoId) {
      this.image = this.uploadService.buildImage(photoId, this.authState.sessionId);
      this.userImage = this.image;
      if (this.userImage) {
        this.isUserLogo = true;
      }
    }
  }

  private checkFileType(file: File): void {
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }
}
