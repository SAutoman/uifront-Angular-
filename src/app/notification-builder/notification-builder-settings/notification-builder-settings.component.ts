/**
 * Global
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectChange } from '@angular/material/select';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Project
 */
import { Roles, SidebarLinksService, UserAndSystemGroupsDto, UserGroupsService } from '@wfm/service-layer';
import { NotificationTemplateDto } from '@wfm/service-layer/models/notificationTemplate';
import {
  CreateUpdateNotificationTopicCommand,
  NotificationTopicDto,
  TopicKindEnum,
  TopicKindNameMap,
  TopicSendTypeEnum,
  TopicType
} from '@wfm/service-layer/services/notification-topic.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import {
  AddNotificationTopic,
  GetNotificationDetailsById,
  GetNotificationTemplates,
  GetNotificationTopics,
  ResetNfDetailsById,
  ResetNfTopicOperationMessage,
  UpdateNotificationTopic
} from '@wfm/store/notification-builder';
import {
  nfBuilderLoadingSelector,
  nfDetailsSelector,
  nfTemplatesSelector,
  nfTopicMessageSelector,
  nfNewlyAddedEntity,
  nfTopicsSelector
} from '@wfm/store/notification-builder/notification-builder-selectors';
import { convertTenantName } from '@wfm/shared/utils';

interface TopicKinds {
  label: string;
  value: TopicKindEnum;
  type?: TopicType;
  controlsToHide: string[];
  isAutoTriggerable: boolean;
}

export const topicKinds: TopicKinds[] = [
  {
    label: TopicKindNameMap.get(TopicKindEnum.NewRawData).viewValue,
    value: TopicKindEnum.NewRawData,
    type: TopicType.RawData,
    controlsToHide: ['days'],
    isAutoTriggerable: true
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.RawDataNotProcessed).viewValue,
    value: TopicKindEnum.RawDataNotProcessed,
    type: TopicType.RawData,
    controlsToHide: [],
    isAutoTriggerable: true
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.CasesNotProcessed).viewValue,
    value: TopicKindEnum.CasesNotProcessed,
    type: TopicType.CaseProcess,
    controlsToHide: [],
    isAutoTriggerable: true
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.Invitations).viewValue,
    value: TopicKindEnum.Invitations,
    type: TopicType.Invitations,
    controlsToHide: ['days', 'userGroups', 'roles'],
    isAutoTriggerable: true
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.Cases).viewValue,
    value: TopicKindEnum.Cases,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: true
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnCaseUpdate).viewValue,
    value: TopicKindEnum.OnCaseUpdate,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnCaseDelete).viewValue,
    value: TopicKindEnum.OnCaseDelete,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnCaseStatusChange).viewValue,
    value: TopicKindEnum.OnCaseStatusChange,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnStepAdd).viewValue,
    value: TopicKindEnum.OnStepAdd,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnStepUpdate).viewValue,
    value: TopicKindEnum.OnStepUpdate,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnStepDelete).viewValue,
    value: TopicKindEnum.OnStepDelete,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  },
  {
    label: TopicKindNameMap.get(TopicKindEnum.OnStepResolutionChange).viewValue,
    value: TopicKindEnum.OnStepResolutionChange,
    type: TopicType.CaseProcess,
    controlsToHide: ['days'],
    isAutoTriggerable: false
  }
];

@Component({
  selector: 'app-notification-builder-settings',
  templateUrl: './notification-builder-settings.component.html',
  styleUrls: ['./notification-builder-settings.component.scss']
})
export class NotificationTopicComponent extends TenantComponent implements OnInit, OnDestroy {
  notificationTopicDto: NotificationTopicDto;
  notificationSettingsForm: FormGroup;
  notificationTemplates: NotificationTemplateDto[];

  userGroups: UserAndSystemGroupsDto[];
  notificationId: string;
  loading$: Observable<boolean>;

  topicKinds: TopicKinds[];
  allRoles: { name: string; value: number }[] = [];
  topicType: TopicType;

  topicTypes: { name: string; value: TopicType }[];
  showExisitngTopicsList: boolean = false;
  notificationTopicsList: NotificationTopicDto[];
  copiedNotificationData: NotificationTopicDto;
  isNotificationCopiedFromList: boolean = false;
  isTopicKindAutoTriggerable: boolean;

  get topicTypeEnum() {
    return TopicType;
  }

  constructor(
    private formBuilder: FormBuilder,
    private store: Store<any>,
    private userGroupsService: UserGroupsService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private sidebarLinksService: SidebarLinksService,
    private ts: TranslateService
  ) {
    super(store);
    this.notificationId = this.route.snapshot.paramMap.get('id');

    const roles = [Roles.Tenant, Roles.TenantAdmin, Roles.Supplier, Roles.Auditor];

    this.allRoles = roles.map((role) => {
      return {
        name: Roles[role],
        value: role
      };
    });
    const topicTypes = [TopicType.RawData, TopicType.CaseProcess, TopicType.Invitations];
    this.topicTypes = topicTypes.map((type) => {
      return {
        name: TopicType[type],
        value: type
      };
    });
  }

  ngOnInit(): void {
    this.notificationSettingsForm = this.formBuilder.group({
      name: ['', Validators.required],
      subject: [''],
      description: ['', Validators.required],
      topicKind: ['', Validators.required],
      topicTemplateId: ['', Validators.required]
    });

    this.notificationSettingsForm
      .get('topicKind')
      .valueChanges.pipe(
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((newTopicKind: TopicKindEnum) => {
        this.addDynamicControls();
        const selectedTopic = topicKinds.find((t) => t.value === newTopicKind);
        selectedTopic?.controlsToHide?.forEach((controlKey: string) => {
          this.notificationSettingsForm.removeControl(controlKey);
        });
        this.notificationSettingsForm.updateValueAndValidity();
      });
    this.store.dispatch(new GetNotificationTopics({ data: { skip: 0, take: 9999 } }));
    this.getNotificationTemplates();
    this.getUserGroups();

    if (this.notificationId) {
      this.store.dispatch(new GetNotificationDetailsById({ data: { id: this.notificationId } }));
      this.getNotificationDetails();
    }

    this.loading$ = this.store.pipe(select(nfBuilderLoadingSelector), takeUntil(this.destroyed$));

    this.store.pipe(select(nfTopicMessageSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.snackBar.open(x, 'Ok', { duration: 2000 });
        if (!this.notificationId && x.toString().includes('Success')) {
          this.notificationSettingsForm.reset();
        }
        this.store.dispatch(new ResetNfTopicOperationMessage());
      }
    });

    this.store
      .pipe(
        select(nfNewlyAddedEntity),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((entityId) => {
        if (!this.notificationId) {
          this.router.navigate([
            `/${convertTenantName(this.sidebarLinksService.tenantName)}/notification-builder/settings/edit/${entityId}`
          ]);
        }
      });

    this.store.pipe(select(nfTopicsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length > 0) {
        this.notificationTopicsList = x;
      }
    });
  }

  showTopicsList(): void {
    this.showExisitngTopicsList = true;
  }

  onNotificationTopicChange(selection: MatSelectChange): void {
    const topic = this.notificationTopicsList.filter((x) => x.id === selection.value)[0];
    this.notificationSettingsForm.patchValue(topic);
    this.topicType = topicKinds.filter((x) => x.value === topic.topicKind)[0].type;
    this.onTopicTypeChange();
    this.showExisitngTopicsList = false;
    this.copiedNotificationData = cloneDeep(topic);
    this.isNotificationCopiedFromList = true;
  }

  addDynamicControls(): void {
    this.notificationSettingsForm.addControl(
      'roles',
      this.formBuilder.control(this.notificationTopicDto ? this.notificationTopicDto.roles : null)
    );
    this.notificationSettingsForm.addControl(
      'userGroups',
      this.formBuilder.control(this.notificationTopicDto ? this.notificationTopicDto.userGroups : null)
    );
    this.notificationSettingsForm.addControl(
      'days',
      this.formBuilder.control(this.notificationTopicDto ? this.notificationTopicDto.days : null, [
        Validators.required,
        Validators.pattern(/^\d*$/)
      ])
    );
  }

  onTopicTypeChange(): void {
    this.topicKinds = topicKinds.filter((x) => x.type === this.topicType);
  }

  async getNotificationDetails(): Promise<void> {
    this.store.pipe(select(nfDetailsSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        this.notificationTopicDto = x;
        this.notificationSettingsForm.patchValue(x);
        this.topicType = topicKinds.filter((y) => y.value === x.topicKind)[0].type;
        this.onTopicTypeChange();
      }
    });
  }

  async getNotificationTemplates(): Promise<void> {
    this.store.dispatch(new GetNotificationTemplates({ data: { paging: { skip: 0, take: 9999 } } }));
    this.store.pipe(select(nfTemplatesSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x?.length > 0) {
        this.notificationTemplates = x;
      }
    });
  }

  getUserGroups(): void {
    this.userGroupsService
      .getAllUserAndSystemGroups(this.tenant)
      .then((x) => {
        if (x?.length) this.userGroups = x.filter((y) => !y.systemGroup);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async onSubmit(): Promise<void> {
    !this.notificationId ? this.addNotificationTopic() : this.updateNotificationTopic();
  }

  addNotificationTopic(): void {
    if (!this.isNotificationCopiedFromList) {
      this.createNotificationTopic();
    } else {
      if (this.isFormDataSameAsCopiedTopic()) {
        this.snackBar.open(`${this.ts.instant('Can not create a duplicate copy of')} ${this.copiedNotificationData.name}`, 'Ok', {
          duration: 2000
        });
      } else this.createNotificationTopic();
    }
  }

  isFormDataSameAsCopiedTopic(): boolean {
    const formValue = this.notificationSettingsForm.getRawValue();
    if (
      formValue.name.toLowerCase() === this.copiedNotificationData.name.toLowerCase() &&
      formValue.subject.toLowerCase() === this.copiedNotificationData.subject.toLowerCase() &&
      formValue.description.toLowerCase() === this.copiedNotificationData.description.toLowerCase() &&
      formValue.topicKind === this.copiedNotificationData.topicKind &&
      formValue.topicTemplateId === this.copiedNotificationData.topicTemplateId &&
      (formValue.userGroups || []) === this.copiedNotificationData.userGroups &&
      (formValue.roles || []) === this.copiedNotificationData.roles &&
      (formValue.days || 0) === this.copiedNotificationData.days
    )
      return true;
    else return false;
  }

  createNotificationTopic(): void {
    const formValue = this.notificationSettingsForm.getRawValue();
    const notificationTopic: CreateUpdateNotificationTopicCommand = {
      subject: formValue.subject,
      description: formValue.description,
      name: formValue.name,
      topicKind: formValue.topicKind,
      topicTemplateId: formValue.topicTemplateId,
      userGroups: formValue.userGroups || [],
      roles: formValue.roles || [],
      topicSendType: TopicSendTypeEnum.Email,
      days: formValue.days
    };
    if (!formValue.days && formValue.days !== 0) {
      delete notificationTopic.days;
    }
    this.store.dispatch(new AddNotificationTopic({ data: notificationTopic }));
  }

  updateNotificationTopic(): void {
    const formValue = this.notificationSettingsForm.getRawValue();
    const notificationTopic: CreateUpdateNotificationTopicCommand = {
      subject: formValue.subject,
      description: formValue.description,
      name: formValue.name,
      topicKind: formValue.topicKind,
      topicTemplateId: formValue.topicTemplateId,
      userGroups: formValue.userGroups || null,
      roles: formValue.roles || null,
      topicSendType: TopicSendTypeEnum.Email,
      days: formValue.days,
      id: this.notificationId
    };
    if (!formValue.days && formValue.days !== 0) {
      delete notificationTopic.days;
    }
    this.store.dispatch(new UpdateNotificationTopic({ id: this.notificationId, data: notificationTopic }));
  }

  public hasError(controlName: string, errorName: string): boolean {
    return this.notificationSettingsForm.controls[controlName]?.hasError(errorName);
  }

  onTopicKindChange(event: MatSelectChange): void {
    const topicKind = this.topicKinds.find((x) => x.value === event.value);
    this.isTopicKindAutoTriggerable = topicKind?.isAutoTriggerable ? true : false;
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.notificationId) this.store.dispatch(new ResetNfDetailsById());
  }
}
