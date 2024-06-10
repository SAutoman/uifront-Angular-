/**
 * global
 */
import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
/**
 * project
 */
import { ImageCropperComponent } from '@wfm/shared/image-cropper/image-cropper.component';
import { ImageData, SharedService, UploadImageData } from '@wfm/service-layer/services/shared.service';

/**
 * local
 */
import {
  TenantSettingsDto,
  DocumentUploadService,
  UserSettingsDto,
  Settings,
  tenantLogo,
  TenantSettingsService
} from '../../service-layer';

import { loggedInState, AuthState, FetchTenantSettingsAction } from '../../store';

import { TenantComponent } from '../../shared/tenant.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
@Component({
  selector: 'app-upload-tenant-logo',
  templateUrl: './upload-tenant-logo.component.html',
  styleUrls: ['./upload-tenant-logo.component.scss']
})
export class UploadTenantLogoComponent extends TenantComponent implements OnInit {
  file: File;
  fileName: string;
  fileType: string;
  userId: string;
  documentId: string;
  authState: AuthState;
  image: string;
  setting: UserSettingsDto;
  isValid: boolean = true;
  componentId = 'd644886b-7667-43db-9467-30b59d05a470';
  settingId: string;
  tenantImage: string;
  editOrAddText: string = 'Add';

  constructor(
    private tenantsService: TenantSettingsService,
    private store: Store<AuthState>,
    private uploadService: DocumentUploadService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private ts: TranslateService,
    private errorHandlerService: ErrorHandlerService
  ) {
    super(store);

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
      this.authState = state;
      this.buildImage();
    });
  }

  ngOnInit(): void {
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((data) => {
      if (data.profile) {
        this.userId = data.profile.id;
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
      data: { file: event, isRoundCropper: false, aspectRatio: 16 / 9 }
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

    // this.checkFilteType(files.item(0));
    // if (!this.isValid) {
    //   return;
    // }
    // this.file = files.item(0);
    // this.fileName = this.file.name;
    // const formData = new FormData();
    // formData.append('file', this.file);
    // const result = await this.uploadService.upload(formData);
    // this.documentId = result.id;
    // this.image = this.uploadService.buildImage(this.documentId, this.authState.sessionId);
  }

  onRemove(): void {
    this.file = null;
    this.fileName = null;
    this.image = this.tenantImage;
    // this.buildImage();
  }

  async onSaveClicked(): Promise<void> {
    const setting = {
      key: tenantLogo,
      value: { documentId: this.documentId },
      id: this.settingId
    } as Settings;

    const cmd = {
      tenantId: this.tenant,
      settings: [setting]
    } as TenantSettingsDto;

    try {
      await this.tenantsService.update(cmd);
      this.snackBar.open(this.ts.instant('Tenant Logo  Updated'), 'CLOSE', {
        duration: 3000
      });
      this.refreshTenantSettings();
      this.sharedService.setUpdateTenantImage(this.image);
      this.file = null;
      this.fileName = null;
      // this.onRemove();
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  checkFileType(file: File): void {
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }

  async buildImage(): Promise<void> {
    const settings = this.authState.currentTenantSystem?.tenantSettings;
    this.settingId = settings?.find((s) => s.key === tenantLogo)?.id;
    const tenantLogoSetting = settings?.find((s) => s.key === tenantLogo);

    tenantLogoSetting ? (this.documentId = tenantLogoSetting.value.documentId) : null;
    tenantLogoSetting ? (this.image = this.uploadService.buildImage(this.documentId, this.authState.sessionId)) : null;
    this.tenantImage = this.image;
    if (this.tenantImage) {
      this.editOrAddText = 'Edit';
    }
  }

  refreshTenantSettings(): void {
    if (this.authState.currentTenantSystem?.tenant && this.authState.profile) {
      this.store.dispatch(
        new FetchTenantSettingsAction({ tenant: this.authState.currentTenantSystem.tenant, userId: this.authState.profile.id })
      );
    }
  }
}
