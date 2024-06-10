/**
 * global
 */
import { SortDirection } from '@angular/material/sort';

/**
 * project
 */
import {
  AllowedFileType,
  Roles,
  InvitationStatus,
  SettingsUI,
  appDateFormatKey,
  SortDirection as appSortDirection,
  Settings,
  SortDirectionValue
} from '@wfm/service-layer';

import { DateFormat } from '@wfm/service-layer/models/DateFormat';
import { nameToProperty } from '@wfm/service-layer/helpers';
import { isNil } from 'lodash-core';
/**
 * local
 */

export function sort(sortDir: SortDirection): appSortDirection {
  if (sortDir === SortDirectionValue.asc) {
    return appSortDirection.asc;
  }

  if (sortDir === SortDirectionValue.desc) {
    return appSortDirection.desc;
  }

  if (sortDir === '') {
    return appSortDirection.invalid;
  }
}

export function roleConverter(role: string): Roles {
  switch (role) {
    case 'TenantAdmin':
      return Roles.TenantAdmin;
    case 'Tenant':
      return Roles.Tenant;
    case 'Supplier':
      return Roles.Supplier;
    case 'Auditor':
      return Roles.Auditor;
  }
}

export function convertRole(role: Roles): string {
  switch (role) {
    case Roles.TenantAdmin:
      return 'TenantAdmin';
    case Roles.Tenant:
      return 'Tenant';
    case Roles.Supplier:
      return 'Supplier';
    case Roles.Auditor:
      return 'Auditor';
  }
}

export function convertInvitationStatus(invitationStatus: InvitationStatus): string {
  switch (invitationStatus) {
    case InvitationStatus.Accepted:
      return 'Accepted';
    case InvitationStatus.Pending:
      return 'Pending';
    case InvitationStatus.Revoked:
      return 'Revoked';
  }
}

// export function convertRawDataStatus(status: RawDataStatus): string {
//   const item = RawDataStatusNameMap.get(status);
//   return item?.viewValue;
// }

export enum FileTypeEnum {
  // All = 'all',
  Image = 'image',
  Pdf = 'pdf',
  Doc = 'doc',
  PPT = 'ppt',
  XML = 'xml'
}

export enum FileExtensionsEnum {
  PNG = 'image/png',
  JPG = 'image/jpg',
  JPEG = 'image/jpeg',
  BMP = 'image/bmp',
  GIF = 'image/gif',
  XML = 'text/xml',
  TXT = 'text/plain',
  DOC = 'application/msword',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'application/vnd.ms-excel',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'application/vnd.ms-powerpoint',
  PPTX = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ODT = 'application/vnd.oasis.opendocument.text',
  ODS = 'application/vnd.oasis.opendocument.spreadsheet',
  PDF = 'application/pdf'
}

// blocked as per request from N. Marinov
// security issues
export enum BlockedFileExtensionsEnum {
  WEBP = 'image/webp'
}

export function allowedFileTypes(): AllowedFileType[] {
  const allowedFileTypes: AllowedFileType[] = [
    // All is redundant, File field without FileType validation
    // will behave like 'All' does
    // {
    //   id: FileTypeEnum.All,
    //   displayName: 'All',
    //   extensions: ['*']
    // },
    {
      id: FileTypeEnum.Image,
      displayName: 'Image',
      extensions: [
        { name: 'png', extension: FileExtensionsEnum.PNG },
        { name: 'jpg', extension: FileExtensionsEnum.JPG },
        { name: 'jpeg', extension: FileExtensionsEnum.JPEG },
        { name: 'gif', extension: FileExtensionsEnum.GIF },
        { name: 'bmp', extension: FileExtensionsEnum.BMP }
      ]
    },
    {
      id: FileTypeEnum.Pdf,
      displayName: 'PDF',
      extensions: [{ name: 'pdf', extension: FileExtensionsEnum.PDF }]
    },
    {
      id: FileTypeEnum.Doc,
      displayName: 'Doc',
      extensions: [
        { name: 'xls', extension: FileExtensionsEnum.XLS },
        { name: 'xlsx', extension: FileExtensionsEnum.XLSX },
        { name: 'docx', extension: FileExtensionsEnum.DOCX },
        { name: 'doc', extension: FileExtensionsEnum.DOC },
        { name: 'odt', extension: FileExtensionsEnum.ODT },
        { name: 'ods', extension: FileExtensionsEnum.ODS },
        { name: 'txt', extension: FileExtensionsEnum.TXT }
      ]
    },
    {
      id: FileTypeEnum.PPT,
      displayName: 'Presentation',
      extensions: [
        { name: 'ppt', extension: FileExtensionsEnum.PPT },
        { name: 'pptx', extension: FileExtensionsEnum.PPTX }
      ]
    },
    {
      id: FileTypeEnum.XML,
      displayName: 'XML',
      extensions: [{ name: 'xml', extension: FileExtensionsEnum.XML }]
    }
  ];
  return allowedFileTypes;
}

export function getExtensionsByType(fileType: FileTypeEnum): AllowedFileType {
  let allowedTypes = allowedFileTypes();
  const item = allowedTypes.find((allowedType) => allowedType.id === fileType);
  return item;
}

/**
 * @description alias to nameToProperty
 * @param tenantName
 */
export function convertTenantName(tenantName: string): string {
  return nameToProperty(tenantName);
}

export function mapToObject(map: Map<string, any>): any {
  try {
    let obj = Array.from(map).reduce((obj, [key, value]) => Object.assign(obj, { [key]: value }), {});

    return obj;
  } catch (error) {
    console.log(error);
    return {};
  }
}

export function getHyperlinkUrl(urlTemplate: string, fieldValue: any): string {
  const urlWIthValue = urlTemplate.replace(/{value}/g, encodeURIComponent(fieldValue?.toString()?.trim()));
  // prevent injection attempts
  const safeUrl = urlWIthValue.replace('<', '&lt;').replace('>', '&gt;');
  return safeUrl;
}

export function isUndefinedOrNull(value: any): boolean {
  return isNil(value);
}
