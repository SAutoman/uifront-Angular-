import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CaseViewEnum } from '@wfm/workflow-state/workflow-states-list/workflow-states-list.component';
import { DocumentUploadService, FieldSetting, UploadedFile } from '@wfm/service-layer';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';
import { DateTime } from 'luxon';
import { TimePeriodFormat } from '../models/TimePeriodFormat';
import { AbstractControl } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface ImageData {
  image: string;
  documentId?: string;
  uploadedFileData?: UploadedFile;
}
export interface NotificationMessageData {
  message: string;
  lsKey: string;
  type: string;
}

export interface AppBarData {
  title: string;
  type: ScreenType;
  caseViewSwitched?: CaseViewEnum;
}

export interface UploadImageData {
  base64: string;
  sessionId: string;
  fileName: string;
  fileType: string;
}

export enum ScreenType {
  CASES = 'cases'
}

const regexForURL: RegExp = /(((https?:\/\/)|(www\.))[^\s]+)/g;

export function whiteSpaceValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control?.value && control?.value?.toString()?.trim()?.length === 0) {
    return { whiteSpace: true };
  }
  return null;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private notificationMessage = new Subject<NotificationMessageData>();
  private updateUserImage = new Subject<ImageData>();
  // workflowState edit/process panel
  private closeSidePanel = new Subject<boolean>();
  private updateAppBarData = new Subject<AppBarData>();
  private updateTenantImage = new Subject<ImageData>();
  public updateMobileQuery = new BehaviorSubject<boolean>(true);
  closeNavBar: BehaviorSubject<any> = new BehaviorSubject(undefined);
  private renderer: Renderer2;
  documentListener: () => void;
  documentClickSubject: Subject<Event> = new Subject();

  constructor(private uploadService: DocumentUploadService, private domSanitizer: DomSanitizer, rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  startListeningOutsideClick(): void {
    this.documentListener = this.renderer.listen('document', 'click', (x) => {
      if (x) {
        this.documentClickSubject.next(x);
      }
    });
  }

  stopListeningOutsideClick(): void {
    this.documentListener();
  }

  getClickBroadcastEvent(): Observable<Event> {
    return this.documentClickSubject.asObservable();
  }

  setNotificationMessage(message: string, lsKey: string, type: string) {
    this.notificationMessage.next({ message: message, lsKey: lsKey, type: type });
  }

  getNotificationMessage(): Observable<NotificationMessageData> {
    return this.notificationMessage.asObservable();
  }

  getAppBarData(): Observable<AppBarData> {
    return this.updateAppBarData.asObservable();
  }

  setAppBarData(appBarData: AppBarData) {
    this.updateAppBarData.next(appBarData);
  }

  setUpdateUserImage(userImage: string) {
    this.updateUserImage.next({ image: userImage });
  }

  getUpdateUserImage(): Observable<ImageData> {
    return this.updateUserImage.asObservable();
  }

  setUpdateTenantImage(tenantImage: string) {
    this.updateTenantImage.next({ image: tenantImage });
  }

  getUpdateTenantImage(): Observable<ImageData> {
    return this.updateTenantImage.asObservable();
  }

  async uploadCroppedImage(data: UploadImageData): Promise<ImageData> {
    const imageBase64 = data?.base64;
    if (imageBase64) {
      const newFile = await this.base64ToBlob(imageBase64, data?.fileName, data?.fileType);
      const formData = new FormData();
      formData.append('file', newFile);
      const response = await this.uploadService.upload(formData);
      const documentId = response.id;
      const image = this.uploadService.buildImage(documentId, data?.sessionId);
      const result: ImageData = {
        image: image,
        documentId: documentId,
        uploadedFileData: response
      };
      return result;
    }
  }

  base64ToBlob(base64File: string, fileName: string, fileType: string): Promise<File> {
    return new Promise((resolve, reject) => {
      return fetch(base64File)
        .then((res) => {
          return res.blob();
        })
        .then((blob) => {
          return resolve(new File([blob], fileName, { type: fileType }));
        })
        .catch((err) => {
          return reject(err);
        });
    });
  }

  getFileType(file: UploadedFile): string {
    const fileName = file?.fileInfo?.fileName;
    if (!fileName) {
      return '';
    }

    const extension = fileName.toLowerCase().split('.')?.pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'doc';
      case 'txt':
        return 'file';
      case 'ppt':
      case 'pptx':
        return 'ppt';
      case 'xls':
      case 'xlsx':
        return 'xls';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'svg':
        return 'image';
      case 'mp4':
      case 'mpeg':
        return 'video';
      default:
        return 'file';
    }
  }

  isUrl(text: string): boolean {
    return regexForURL.test(text);
  }

  extractUrlFromString(text: string): string {
    if (text) {
      // to stop injection attempts
      text = text.replace('<', '&lt;').replace('>', '&gt;');
      const processedText = text.replace(regexForURL, (match) => this.generateHyperlink(match));
      return processedText;
    }
  }

  generateHyperlink(url: string): string {
    const link = `<a href="${url}" target="${url}">${url}</a>`;
    return link;
  }

  getUniqueValuesByIDFromArray(array: any[]): any[] {
    let uniqueIds = new Map();
    let uniqueItems: any[] = [];

    array.forEach((item) => {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.set(item.id, item);
        uniqueItems.push(item);
      }
    });
    return uniqueItems;
  }

  setCloseSidePanel() {
    this.closeSidePanel.next(true);
  }

  getCloseSidePanel(): Observable<boolean> {
    return this.closeSidePanel.asObservable();
  }

  getFromAndToDateValues(searchTimePeriodSetting: FieldSetting): { from: DateTime; to: DateTime } {
    const currentDateTime = DateTime.now();
    switch (searchTimePeriodSetting.timePeriod) {
      case TimePeriodFormat.Custom:
        return {
          from: DateTimeFormatHelper.parseToLuxon(searchTimePeriodSetting.from),
          to: DateTimeFormatHelper.parseToLuxon(searchTimePeriodSetting.to)
        };
      case TimePeriodFormat.Day:
        const dateafter1Day = currentDateTime.plus({ days: 1 });
        return {
          from: currentDateTime,
          to: dateafter1Day
        };
      case TimePeriodFormat.Week:
        const dateAfter1Week = currentDateTime.plus({ days: 7 });
        return {
          from: currentDateTime,
          to: dateAfter1Week
        };
      case TimePeriodFormat.Month:
        const dateAfter1Month = currentDateTime.plus({ months: 1 });
        return {
          from: currentDateTime,
          to: dateAfter1Month
        };
      case TimePeriodFormat.Year:
        const dateAfter1Year = currentDateTime.plus({ months: 12 });
        return {
          from: currentDateTime,
          to: dateAfter1Year
        };
      default:
        break;
    }
  }

  getSanitizedYtVideoUrl(embedUrl: string, isAutoplay?: boolean): SafeResourceUrl {
    const baseEmbedCode: string = 'https://www.youtube.com/embed/';
    let path: string;
    // For URL format, https://www.youtube.com/embed/<resource>
    // For URL format, https://youtu.be/<resource>
    if (embedUrl && !embedUrl.includes('watch')) {
      path = embedUrl.substring(embedUrl.lastIndexOf('/') + 1, embedUrl.length);
    }
    // For URL format, https://www.youtube.com/watch?v=<resource>
    else if (embedUrl && embedUrl.includes('watch')) {
      path = embedUrl.substring(embedUrl.lastIndexOf('=') + 1, embedUrl.length);
    }
    let fullPath: string = baseEmbedCode + path;
    if (isAutoplay) {
      fullPath += `?autoplay=1`;
    }
    const safeResourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(fullPath);
    return safeResourceUrl;
  }
}
