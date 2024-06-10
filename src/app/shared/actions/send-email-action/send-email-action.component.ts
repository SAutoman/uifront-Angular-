import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { debounceTime, takeUntil } from 'rxjs/operators';
/**
 * Global
 */
import { AreaTypeEnum, FieldTypeIds, SchemaFieldDto } from '@wfm/service-layer';
import {
  EventAreaScopes,
  EventTypes,
  SendEmailActionDto,
  SendEmailDataDto,
  WorkflowEventSubAreas,
  ProcessStepLinksEventSubArea
} from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { NotificationBuilderState } from '@wfm/store/notification-builder';
import { NotificationTopicDto, TopicKindEnum } from '@wfm/service-layer/services/notification-topic.service';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { Observable } from 'rxjs';
/**
 * Project
 */

/**
 * Local
 */

enum EmailSourceTypeEnum {
  TO = 1,
  SCHEMA_FIELD
}

export enum EmailSubjectTypeEnum {
  Unkown = 0,
  TOPIC_SUBJECT = 1,
  CUSTOM_SUBJECT
}

export interface SendEmailActionData {
  type: EventTypes;
  emailData: SendEmailDataDto;
  isValid: boolean;
}

@Component({
  selector: 'app-send-email-action',
  templateUrl: './send-email-action.component.html',
  styleUrls: ['./send-email-action.component.scss']
})
export class SendEmailActionComponent extends TenantComponent implements OnInit, OnChanges {
  @Input() actionScope: EventAreaScopes;
  @Input() schemaId: string;
  @Input() actionDto: SendEmailActionDto;
  @Input() notificationTopics: NotificationTopicDto[];
  @Input() eventSubArea$: Observable<WorkflowEventSubAreas | ProcessStepLinksEventSubArea>;

  @Output() outputEmitter: EventEmitter<SendEmailActionData> = new EventEmitter();

  emailForm: FormGroup;
  schemaFields: SchemaFieldDto[];
  eventSubArea: WorkflowEventSubAreas | ProcessStepLinksEventSubArea;
  filteredNotificationTopics: NotificationTopicDto[];

  get emailSubjectType() {
    return EmailSubjectTypeEnum;
  }

  get getEmailSourceType() {
    return EmailSourceTypeEnum;
  }

  constructor(private fb: FormBuilder, private store: Store<NotificationBuilderState>, private adminSchemasService: AdminSchemasService) {
    super(store);
    this.emailForm = this.fb.group({
      emailSourceType: [EmailSourceTypeEnum.TO],
      to: [null, Validators.pattern('^([a-z][a-z0-9_.]+@([a-z0-9-]+.)+[a-z]{2,6}(, )*)+$')],
      schemaField: [],
      cc: [null, Validators.pattern('^([a-z][a-z0-9_.]+@([a-z0-9-]+.)+[a-z]{2,6})$')],
      bcc: [null, Validators.pattern('^([a-z][a-z0-9_.]+@([a-z0-9-]+.)+[a-z]{2,6})$')],
      subjectType: [EmailSubjectTypeEnum.TOPIC_SUBJECT, Validators.required],
      subjectMessage: [],
      notificationTopicId: [null, Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.actionDto?.currentValue) {
      this.populateEmailData();
    }
    if (changes?.notificationTopics?.currentValue) {
      this.subAreasSelected();
      if (this.actionDto) this.emailForm.controls.notificationTopicId.setValue(this.actionDto?.emailData?.emailTopicId);
    }
  }

  populateEmailData(): void {
    const emailData = this.actionDto.emailData;
    this.emailForm.patchValue({
      emailSourceType: emailData?.emailTo ? EmailSourceTypeEnum.TO : EmailSourceTypeEnum.SCHEMA_FIELD,
      to: emailData?.emailTo,
      schemaField: emailData?.emailToFieldName,
      cc: emailData.emailCC,
      bcc: emailData?.emailBCC,
      subjectType: emailData?.emailSubjectType,
      subjectMessage: emailData?.subject
    });
    this.emitToParent();
  }

  async ngOnInit(): Promise<void> {
    this.eventSubArea$.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      this.eventSubArea = data;
      this.subAreasSelected(true);
    });
    if (this.schemaId) {
      this.schemaFields = await this.getSchemaFields();
    }
    this.emailForm.valueChanges.pipe(takeUntil(this.destroyed$), debounceTime(300)).subscribe((x) => {
      this.emitToParent();
    });
    this.emitToParent();
  }

  async getSchemaFields(): Promise<SchemaFieldDto[]> {
    const areaType: AreaTypeEnum = this.actionScope === EventAreaScopes.WorkflowScope ? AreaTypeEnum.case : AreaTypeEnum.stepForm;
    const schema = await this.adminSchemasService.getSchema(this.tenant, areaType, this.schemaId);
    const fields = schema.fields.filter((x) => x.type === FieldTypeIds.StringField);
    return fields;
  }

  resetFieldValue(): void {
    this.emailForm.controls.schemaField.setValue(null);
  }

  emitToParent(): void {
    const data = this.getActionData();
    const outputData: SendEmailActionData = {
      emailData: data,
      isValid: this.isFormValid(data),
      type: EventTypes.SendEmail
    };
    this.outputEmitter.emit(outputData);
  }

  getActionData(): SendEmailDataDto {
    const formValue = this.emailForm.value;
    const data: SendEmailDataDto = {
      emailTo: formValue?.emailSourceType === EmailSourceTypeEnum.TO && formValue?.to ? formValue.to : null,
      emailToFieldName:
        formValue?.emailSourceType === EmailSourceTypeEnum.SCHEMA_FIELD && formValue?.schemaField ? formValue.schemaField : null,
      emailBCC: formValue?.bcc,
      emailCC: formValue?.cc,
      emailTopicId: formValue?.notificationTopicId,
      emailSubjectType: formValue?.subjectType,
      subject:
        formValue?.subjectType === EmailSubjectTypeEnum.CUSTOM_SUBJECT && formValue?.subjectMessage ? formValue?.subjectMessage : null
    };
    return data;
  }

  isFormValid(data: SendEmailDataDto): boolean {
    let isValid: boolean = true;
    if (!this.emailForm.valid) {
      isValid = false;
      return isValid;
    }
    if (!data.emailTo && !data.emailToFieldName) isValid = false;
    if (data.emailSubjectType === EmailSubjectTypeEnum.CUSTOM_SUBJECT && !data.subject) isValid = false;
    return isValid;
  }

  subAreasSelected(emitValue?: boolean): void {
    this.emailForm.controls.notificationTopicId.setValue(null);
    this.filterNotificationsTopics();
    if (emitValue) this.emitToParent();
  }

  filterNotificationsTopics(): void {
    const topicKinds =
      this.actionScope === EventAreaScopes.WorkflowScope ? this.getTopicKindWorkflow() : this.getTopicKindProcessStepLinks();
    this.filteredNotificationTopics = this.notificationTopics?.filter((topic) => topicKinds === topic.topicKind);
  }

  getTopicKindWorkflow(): TopicKindEnum {
    switch (this.eventSubArea) {
      case WorkflowEventSubAreas.WorkflowOnCreateEventsScope:
        return TopicKindEnum.Cases;
      case WorkflowEventSubAreas.WorkflowOnDeleteEventsScope:
        return TopicKindEnum.OnCaseDelete;
      case WorkflowEventSubAreas.WorkflowOnUpdateEventsScope:
        return TopicKindEnum.OnCaseUpdate;
      case WorkflowEventSubAreas.WorkflowStatusEventsScope:
        return TopicKindEnum.OnCaseStatusChange;
      case WorkflowEventSubAreas.WorkflowStepAddedEventsScope:
        return TopicKindEnum.OnStepAdd;
      default:
        break;
    }
  }

  getTopicKindProcessStepLinks(): TopicKindEnum {
    switch (this.eventSubArea) {
      case ProcessStepLinksEventSubArea.OnStepAdded:
        return TopicKindEnum.OnStepAdd;
      case ProcessStepLinksEventSubArea.OnStepDeleted:
        return TopicKindEnum.OnStepDelete;
      case ProcessStepLinksEventSubArea.OnStepResolved:
        return TopicKindEnum.OnStepResolutionChange;
      case ProcessStepLinksEventSubArea.OnStepUpdated:
        return TopicKindEnum.OnStepUpdate;
      default:
        break;
    }
  }
}
