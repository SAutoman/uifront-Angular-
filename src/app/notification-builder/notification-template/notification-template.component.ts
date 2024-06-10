/**
 * Global
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

/**
 * Project
 */
import { CreateNotificationTemplateCommand, UpdateNotificationTemplateCommand } from '@wfm/service-layer/models/notificationTemplate';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AddNotificationTemplate,
  GetTemplateDetailsById,
  nfBuilderLoadingSelector,
  nfNewlyAddedEntity,
  nfTemplateDetailById,
  nfTemplateMessageSelector,
  NotificationBuilderState,
  ResetNfTemplateOperationMessage,
  ResetTemplateDetailsById,
  UpdateNotificationTemplate
} from '@wfm/store/notification-builder';
import { ActivatedRoute, Router } from '@angular/router';
import { convertTenantName } from '@wfm/shared/utils';
import { DocumentUploadService, SidebarLinksService } from '@wfm/service-layer';
import { ImageCropperComponent } from '@wfm/shared/image-cropper/image-cropper.component';
import { SharedService, UploadImageData, ImageData } from '@wfm/service-layer/services/shared.service';
import { AuthState } from '@wfm/store/auth/auth.reducer';
import { loggedInState } from '@wfm/store/auth/auth.selectors';

@Component({
  selector: 'app-notification-template',
  templateUrl: './notification-template.component.html',
  styleUrls: ['./notification-template.component.scss']
})
export class NotificationTemplateComponent extends TenantComponent implements OnInit, OnDestroy {
  templateForm: FormGroup;
  loading$: Observable<boolean>;
  templateId: string;
  componentId = '1cddb34c-e45e-4f83-b477-d9636420c2h3';
  logoId: string;
  isValid: boolean = true;
  authState: AuthState;
  file: File;
  isNewImageSelected: boolean;
  imageURL: string;

  constructor(
    private store: Store<NotificationBuilderState>,
    private formBuilder: FormBuilder,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private uploadService: DocumentUploadService
  ) {
    super(store);

    this.templateId = this.route.snapshot.paramMap.get('id');

    this.templateForm = this.formBuilder.group({
      name: [null, Validators.required],
      template: [null, Validators.required]
    });
    this.loading$ = this.store.pipe(select(nfBuilderLoadingSelector), takeUntil(this.destroyed$));

    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((state) => {
      this.authState = state;
    });
  }

  ngOnInit(): void {
    this.store.pipe(select(nfTemplateMessageSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.snackbar.open(x, 'Ok', { duration: 2000 });
        this.store.dispatch(new ResetNfTemplateOperationMessage());
        if (!this.templateId) {
          this.templateForm.reset();
        }
      }
    });

    this.store
      .pipe(
        select(nfNewlyAddedEntity),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((entityId) => {
        if (!this.templateId) {
          this.router.navigate([
            `/${convertTenantName(this.sidebarLinksService.tenantName)}/notification-builder/templates/edit/${entityId}`
          ]);
        }
      });

    if (this.templateId) {
      this.store.dispatch(new GetTemplateDetailsById({ data: { id: this.templateId } }));
      this.store.pipe(select(nfTemplateDetailById), takeUntil(this.destroyed$)).subscribe((x) => {
        if (x) {
          this.templateForm.patchValue(x);
          this.logoId = x.logoId ? x.logoId : null;
          if (this.logoId) this.imageURL = this.uploadService.buildImage(this.logoId, this.authState.access_token);
        }
      });
    }
  }

  onRemove(): void {
    this.logoId = null;
    this.file = null;
    this.isNewImageSelected = false;
    this.imageURL = null;
  }

  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.file = files[0];
    this.checkFileType(this.file);
    if (!this.isValid) {
      return;
    }

    const dialogRef = this.dialog.open(ImageCropperComponent, {
      width: '480px',
      disableClose: true,
      data: { file: event, isRoundCropper: true, aspectRatio: 1 / 1 }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.imageURL = result?.base64;
        this.isNewImageSelected = true;
      } else {
        this.onRemove();
      }
    });
  }

  private checkFileType(file: File): void {
    if (file.type === 'image/png' || file.type === 'image/jpg' || file.type === 'image/jpeg') {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }

  onSubmit(): void {
    if (this.isNewImageSelected) {
      this.uploadImageAndSaveTemplate();
    } else this.saveTemplateData();
  }

  saveTemplateData(documentId?: string): void {
    !this.templateId ? this.addTemplate(documentId) : this.updateTemplate(documentId);
  }

  addTemplate(documentId?: string): void {
    const templateData: CreateNotificationTemplateCommand = {
      name: this.templateForm.controls.name.value,
      template: this.templateForm.controls.template.value,
      logoId: documentId ? documentId : '',
      tenantId: this.tenant
    };
    this.store.dispatch(new AddNotificationTemplate({ data: templateData }));
  }

  updateTemplate(documentId?: string): void {
    const templateData: UpdateNotificationTemplateCommand = {
      name: this.templateForm.controls.name.value,
      template: this.templateForm.controls.template.value,
      logoId: documentId ? documentId : this.logoId,
      tenantId: this.tenant,
      id: this.templateId
    };
    this.store.dispatch(new UpdateNotificationTemplate({ data: templateData }));
  }

  uploadImageAndSaveTemplate(): void {
    const data: UploadImageData = {
      base64: this.imageURL || '',
      sessionId: this.authState?.sessionId,
      fileName: this.file.name,
      fileType: this.file.type
    };
    this.sharedService.uploadCroppedImage(data).then((response: ImageData) => {
      this.saveTemplateData(response?.documentId);
    });
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.templateId) this.store.dispatch(new ResetTemplateDetailsById());
  }
}
