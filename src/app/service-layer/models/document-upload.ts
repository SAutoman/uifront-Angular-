export interface UploadedFile {
  client: string;
  created: string;
  customData: string;
  fileInfo: FileInfo;
  id: string;
  shares: Share[];
  targetObjectGuid: string;
  userName: string;
}

export interface FileInfoExtDto extends UploadedFile {
  /**
   * Url to download file
   */
  url: string;
  fileType?: string;
}

export interface FilesData {
  items: FileInfoExtDto[];
}

export interface Share {
  token: string;
  expiration: string;
}

export interface Application {
  name: string;
}

export interface FileInfo {
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DocumentFile {
  documentId: string;
  // token: string;
}
