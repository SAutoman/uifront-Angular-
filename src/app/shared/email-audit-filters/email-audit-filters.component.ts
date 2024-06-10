/**
 * global
 */
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormlyFormOptions } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * project
 */

import { EmailAuditSearch } from '@wfm/email-audit/email-audit/email-audit.view-models';
import { User } from '@wfm/service-layer/models/wfm-application';
import { NotificationTopicDto } from '@wfm/service-layer/services/notification-topic.service';
import { FormlyFieldAdapterFactory } from '@wfm/common/vendor';
import { FieldTypeIds } from '@wfm/service-layer';
import { IFormlyView } from '@wfm/common/models';
/**
 * local
 */
import DateTimeFormatHelper from '../dateTimeFormatHelper';

export interface EmailAuditFilterData {
  filters: EmailAuditSearch;
  tenantUsersList: User[];
  notificationTopics: NotificationTopicDto[];
}

@Component({
  selector: 'app-email-audit-filters',
  templateUrl: './email-audit-filters.component.html',
  styleUrls: ['./email-audit-filters.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'standard' } }]
})
export class EmailAuditFiltersComponent implements OnInit {
  emailAuditSearchQuery: EmailAuditSearch;
  view: IFormlyView;
  options: FormlyFormOptions = {};

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmailAuditFiltersComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: EmailAuditFilterData,
    private snackbar: MatSnackBar,
    private ts: TranslateService
  ) {}

  ngOnInit(): void {
    this.initFormly();
  }

  initFormly(): void {
    const fromAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('From'),
      name: 'from',
      type: FieldTypeIds.DateTimeField,
      value: null
    });
    const toAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('To'),
      name: 'to',
      type: FieldTypeIds.DateTimeField,
      value: null
    });
    const usersSelectAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Users'),
      name: 'users',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: this.data.tenantUsersList.map((user) => {
          return {
            key: `${user.title} ${user?.name} ${user.lastName}`,
            value: user.id
          };
        })
      }
    });

    const notificationAdapter = FormlyFieldAdapterFactory.createAdapter({
      label: this.ts.instant('Notification Topics'),
      name: 'notificationTopics',
      type: FieldTypeIds.MultiselectListField,
      value: null,
      valueInfo: {
        options: this.data.notificationTopics.map((topic) => {
          return {
            key: topic.name,
            value: topic.id
          };
        })
      }
    });

    const fromDateField = fromAdapter.getConfig();
    const toDateField = toAdapter.getConfig();
    const usersField = usersSelectAdapter.getConfig();
    const notificationsField = notificationAdapter.getConfig();

    this.view = {
      fields: [fromDateField, toDateField, usersField, notificationsField],
      form: this.fb.group({}),
      model: {
        from: this.data?.filters?.from,
        to: this.data?.filters?.to,
        users: this.data?.filters?.users,
        notificationTopics: this.data?.filters?.notificationTopics
      }
    };
  }

  applyFilters(): void {
    const formValue = this.view.model;
    this.data.filters.from = formValue?.from;
    this.data.filters.to = formValue?.to;
    if (formValue?.from || formValue?.to) {
      if (!formValue?.from || !formValue?.to) {
        this.snackbar.open(this.ts.instant('From & To Dates are required'), 'Ok', { duration: 3000 });
        return;
      } else if (this.checkDateValidation(formValue.from, formValue.to)) {
        this.data.filters.from = DateTimeFormatHelper.getUtcDateTimeWithNormalizedSeconds(formValue.from);
        this.data.filters.to = DateTimeFormatHelper.getUtcDateTimeWithMaxSeconds(formValue.to);
      } else {
        this.snackbar.open(this.ts.instant('Invalid date range'), 'Ok', { duration: 3000 });
        return;
      }
    }
    this.data.filters.users = formValue.users || [];
    this.data.filters.notificationTopics = formValue.notificationTopics || [];
    this.dialogRef.close(this.data.filters);
  }

  checkDateValidation(from: Date, to: Date): boolean {
    return DateTimeFormatHelper.parseToLuxon(from) < DateTimeFormatHelper.parseToLuxon(to);
  }

  resetFilters(): void {
    this.data.filters = { from: null, to: null, notificationTopics: [], users: [] };
    this.view.form.reset();
  }
}
