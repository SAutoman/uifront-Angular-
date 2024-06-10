/**
 * global
 */
import { Component, Input, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store, select } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'lodash';
/**
 * project
 */

import { Company, CompanyService, CountriesService, FieldTypeIds, Invoice, InvoiceDetails, Profile, User } from '@wfm/service-layer';
import { loggedInState, ApplicationState } from '@wfm/store';
import { BaseComponent } from '@wfm/shared/base.component';
import { ErrorHandlerService } from '@wfm/service-layer/services/error-handler.service';
import { IFormlyView } from '@wfm/common/models';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { KeyValue } from '@angular/common';

/**
 * local
 */

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent extends BaseComponent implements AfterContentInit {
  @Input() email: string;
  @Output() loadCompanies: EventEmitter<any> = new EventEmitter();
  @Output() companyCreated: EventEmitter<Company> = new EventEmitter();
  private allCompaniesList: { id: string; name: string }[];
  private invoiceId: string;
  private countries: KeyValue<string, string>[];
  private userProfileData: Profile;
  public companyId: string;
  public loading: boolean = false;
  public usersList: User[];
  public companyView: IFormlyView;
  public invoiceView: IFormlyView;
  public processing = false;

  constructor(
    private companyService: CompanyService,
    private countriesService: CountriesService,
    private errorHandlerService: ErrorHandlerService,
    private formBuilder: FormBuilder,
    private router: ActivatedRoute,
    private snackBar: MatSnackBar,
    private store: Store<ApplicationState>,
    private ts: TranslateService
  ) {
    super();
  }

  async ngAfterContentInit(): Promise<void> {
    this.countries = await this.countriesService.getCountriesAsFieldOptions();
    this.store.pipe(takeUntil(this.destroyed$), select(loggedInState)).subscribe((user) => {
      if (user) {
        this.userProfileData = { ...user.profile };
      }
    });

    this.getAllCompanies();
    this.companyId = this.router.snapshot.paramMap.get('id');

    if (this.companyId) {
      await this.getAllUsers();
    }

    this.initCompanyFormly();
    this.initInvoiceFormly();

    if (this.companyId) {
      await this.getCompanyDetailsById(this.companyId);
    }
  }

  private initCompanyFormly(): void {
    const fields = [
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Company Name'),
        name: 'name',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Email'),
        name: 'email',
        type: FieldTypeIds.StringField,
        value: !!this.userProfileData.email ? this.userProfileData.email : this.email,
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Phone'),
        name: 'phone',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Address'),
        name: 'address',
        type: FieldTypeIds.TextareaField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('ZIP'),
        name: 'zip',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('City'),
        name: 'city',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Country'),
        name: 'country',
        type: FieldTypeIds.ListField,
        valueInfo: {
          options: this.countries
        },
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('VAT Number'),
        name: 'vatNr',
        type: FieldTypeIds.StringField,
        value: ''
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Tax Number'),
        name: 'taxNumber',
        type: FieldTypeIds.StringField,
        value: ''
      }).getConfig()
    ];

    if (this.companyId) {
      fields.push(
        FormlyFieldAdapterFactory.createAdapter({
          label: this.ts.instant('Contact Person'),
          name: 'contactPersonId',
          type: FieldTypeIds.ListField,
          valueInfo: {
            options: this.getUsersList()
          },
          value: ''
        }).getConfig(),
        FormlyFieldAdapterFactory.createAdapter({
          label: this.ts.instant('Notes'),
          name: 'notes',
          type: FieldTypeIds.StringField,
          value: ''
        }).getConfig()
      );
    }

    fields.push(
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Invoice address same as above'),
        name: 'sameInvoiceAddress',
        type: FieldTypeIds.BoolField,
        value: ''
      }).getConfig()
    );

    this.companyView = {
      fields,
      form: this.formBuilder.group({}),
      model: {}
    };

    this.companyView.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((changes) => {
      if (changes.sameInvoiceAddress) {
        this.updateInvitationForm(changes.sameInvoiceAddress);
      }
    });
  }

  private initInvoiceFormly(): void {
    const fields = [
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Name'),
        name: 'name',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Email'),
        name: 'email',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Phone'),
        name: 'phone',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Address Line 1 ( street + number)'),
        name: 'addressLine1',
        type: FieldTypeIds.TextareaField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Address Line 2'),
        name: 'addressLine2',
        type: FieldTypeIds.TextareaField,
        value: ''
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('ZIP'),
        name: 'zip',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('City'),
        name: 'city',
        type: FieldTypeIds.StringField,
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Country'),
        name: 'country',
        type: FieldTypeIds.ListField,
        valueInfo: {
          options: this.countries
        },
        value: '',
        required: true
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('VAT Number'),
        name: 'vatNr',
        type: FieldTypeIds.StringField,
        value: ''
      }).getConfig(),
      FormlyFieldAdapterFactory.createAdapter({
        label: this.ts.instant('Tax Number'),
        name: 'taxNumber',
        type: FieldTypeIds.StringField,
        value: ''
      }).getConfig()
    ];

    this.invoiceView = {
      fields,
      form: this.formBuilder.group({}),
      model: {}
    };
  }

  async getAllCompanies(): Promise<void> {
    const data = await this.companyService.search({ take: 10000, skip: 0 });
    this.allCompaniesList = data.items;
  }

  async getCompanyDetailsById(id: string): Promise<void> {
    try {
      const result = await this.companyService.getById(id);
      this.companyView.form.patchValue(result);
      if (result?.invoiceAddress) {
        this.invoiceView.form.patchValue(result.invoiceAddress);
        this.invoiceId = result.invoiceAddress.id;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getAllUsers(): Promise<void> {
    try {
      const data = await this.companyService.getUsersByCompany(this.companyId);
      this.usersList = data.users;
    } catch (error) {
      console.log(error);
    }
  }

  updateInvitationForm(isCopy: boolean): void {
    const model = this.companyView.model;
    this.invoiceView.form.patchValue({
      name: isCopy ? model?.name : null,
      email: isCopy ? model?.email : null,
      phone: isCopy ? model?.phone : null,
      addressLine1: isCopy ? model?.address : null,
      zip: isCopy ? model?.zip : null,
      city: isCopy ? model?.city : null,
      country: isCopy ? model?.country : null,
      vatNr: isCopy ? model?.vatNr : null,
      taxNumber: isCopy ? model?.taxNumber : null
    });
  }

  async onSubmit(formValue: Company): Promise<void> {
    if (this.isCompanyNameUnique()) {
      this.onEditCompany(formValue);
      // method is called only if company already exists

      // if (!this.companyId) {
      //   this.onCreateCompany(formValue);
      // } else this.onEditCompany(formValue);
    } else {
      this.openSnackBar(this.ts.instant('Company name already exists'), 'OK');
    }
  }

  async createCompanyAndInvoice(): Promise<void> {
    if (this.isCompanyNameUnique()) {
      try {
        // create company
        // const companyData: Company = this.createCompany.value;
        const companyData: Company = this.companyView.model;
        this.loading = true;
        const company = await this.companyService.create(companyData);
        this.companyCreated.emit(company);
        // create invoice address for the newly created company
        const data: InvoiceDetails = {
          // invoiceAddressDto: this.invoice.value
          invoiceAddressDto: this.invoiceView.model
        };
        const result = await this.companyService.createInvoiceAddress(data, company.id);
        if (result.status?.toString()?.toLowerCase() === 'success') {
          this.openSnackBar(this.ts.instant('Company created successfully'), 'CLOSE');
        }
        this.loadCompanies.emit();
        this.getAllCompanies();
        this.companyView.form.reset();
        this.invoiceView.form.reset();
        this.loading = false;
      } catch (error) {
        this.errorHandlerService.getAndShowErrorMsg(error);
        this.loading = false;
      }
    } else {
      this.openSnackBar(this.ts.instant('Company name already exists'), 'OK');
    }
  }

  async onEditCompany(formValue: Company): Promise<void> {
    try {
      formValue.id = this.companyId;
      this.loading = true;
      await this.companyService.update(formValue);
      this.loading = false;
      this.loadCompanies.emit();
      this.openSnackBar(this.ts.instant('Company updated successfully'), 'CLOSE');
      this.getAllCompanies();
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  isCompanyNameUnique(): boolean {
    const name = this.companyView.model.name;

    if (name.trim().length > 0) {
      let allCompaniesCopy = [];
      if (this.companyId) {
        allCompaniesCopy = this.allCompaniesList.filter((x) => x.id !== this.companyId);
      } else {
        allCompaniesCopy = this.allCompaniesList.map((x) => x);
      }
      const itemFound = allCompaniesCopy.find((x) => x.name.trim().toLowerCase() === name.trim().toLowerCase());
      return !itemFound;
    }
  }

  openSnackBar(message: string, action: string): void {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

  async onInvoiceSave(): Promise<void> {
    if (this.invoiceId) {
      this.loading = true;
      await this.updateInvoice();
    } else {
      await this.createInvoice();
    }
    await this.getCompanyDetailsById(this.companyId);
  }

  async createInvoice(): Promise<void> {
    try {
      this.loading = true;
      const data: InvoiceDetails = {
        invoiceAddressDto: this.invoiceView.model
      };
      const result = await this.companyService.createInvoiceAddress(data, this.companyId);
      if (result.status?.toString()?.toLowerCase() === 'success') {
        this.openSnackBar(this.ts.instant('Invoice details updated successfully'), 'CLOSE');
      }
      this.loading = false;
    } catch (error) {
      this.loading = false;
      this.errorHandlerService.getAndShowErrorMsg(error);
    }
  }

  async updateInvoice(): Promise<void> {
    try {
      this.loading = true;
      const data: Invoice = this.invoiceView.model;
      data.id = this.invoiceId;
      const result = await this.companyService.updateInvoiceAddress(data);
      if (result.status?.toString()?.toLowerCase() === 'success') {
        this.openSnackBar(this.ts.instant('Invoice details updated successfully'), 'CLOSE');
      }
      this.loading = false;
    } catch (error) {
      this.errorHandlerService.getAndShowErrorMsg(error);
      this.loading = false;
    }
  }

  private getUsersList(): KeyValue<string, string>[] {
    return map(this.usersList, (user) => {
      return {
        key: user.name + ' ' + user.lastName,
        value: user.id
      };
    });
  }
}
