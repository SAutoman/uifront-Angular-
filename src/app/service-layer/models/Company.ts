import { DataEntity } from './model';
import { SortDescriptor, State } from '@progress/kendo-data-query';
import { MappingDto } from '@wfm/service-layer/models/mappings';
import { GridDataResultEx } from '../../shared/kendo-util';
import { User } from './wfm-application';

export interface Company extends DataEntity {
  name: string;
  number: string;
  vatNr: string;
  email: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  contactPersonId: number;
  notes: string;
  publicId: string;
  zip: string;
  taxNumber?: string;
  usersCount?: number;
  invoiceAddress?: Invoice;
}

export interface TenantCompaniesWithUsers extends Company {
  users: User[];
}

export class CompanyListPageViewModel {
  paging: State;
  gridData: GridDataResultEx<MappingDto>;
  sort: SortDescriptor[];
  displayDeleteConfirmation: boolean;
}

export const companyGridSettings = 'companyGridSettings';

export interface InvoiceDetails {
  invoiceAddressDto: Invoice;
}

export interface Invoice {
  id: string;
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  zip: string;
  city: string;
  country: string;
  vatNr: string;
  taxNumber: string;
}
