/**
 * global
 */
import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';

/**
 * project
 */
import { DataEntity, SettingsUI } from '@wfm/service-layer';

import { ApplicationState } from '@wfm/store';
import { BaseComponent } from '@wfm/shared/base.component';
import DateTimeFormatHelper from '@wfm/shared/dateTimeFormatHelper';

/**
 * local
 */
export enum CaseHistoryEventType {
  Unknown = 0,
  Created,
  Edited,
  ProcessStepAdded,
  ProcessStepDeleted,

  CommentAdded,
  CommentDeleted,

  RawDataAdded,
  RawDataDeleted,

  StatusChanged,
  Assigned
}

export interface CaseEventHistoryDto extends DataEntity {
  userId: string;
  date: Date;
  caseHistoryEventType: CaseHistoryEventType;
  userFirstName: string;
  userLastName: string;
}
export interface CaseEventHistoryUI {
  userFirstName: string;
  userLastName: string;
  date: string;
  caseHistoryEventTypeUI: string;
}

@Component({
  selector: 'app-workflow-state-case-activity-history',
  templateUrl: './workflow-state-case-activity-history.component.html',
  styleUrls: ['./workflow-state-case-activity-history.component.scss']
})
export class WorkflowStateCaseActivityHistoryComponent extends BaseComponent implements OnInit {
  @Input() tenantId: string;
  @Input() caseId: string;
  events: CaseEventHistoryDto[] = [];
  eventsUI: CaseEventHistoryUI[] = [];
  dateFormatDb: SettingsUI;

  constructor(private store: Store<ApplicationState>) {
    super();
  }

  async ngOnInit(): Promise<void> {
    // this.events = await this.caseProcessStepFormService.getEvents(this.tenantId, this.caseId);
    // this.store.pipe(takeUntil(this.destroyed$), select(dateFormatSettingsSelector)).subscribe((res) => {
    //   if (res) {
    //     this.dateFormatDb = {...res};
    //     this.events.forEach((x) => this.eventsUI.push(this.mapCaseHistoryEvent(x)));
    //   }
    // });
  }

  mapCaseHistoryEvent(x: CaseEventHistoryDto): CaseEventHistoryUI {
    return {
      userFirstName: x.userFirstName,
      userLastName: x.userLastName,
      date: DateTimeFormatHelper.formatDateBasedOnSetting(x.date, this.dateFormatDb) + ' ' + DateTimeFormatHelper.formatTime(x.date, false),
      caseHistoryEventTypeUI: this.getCaseHistoryEventTypeUI(x.caseHistoryEventType)
    };
  }

  getCaseHistoryEventTypeUI(x: CaseHistoryEventType): string {
    switch (x) {
      case CaseHistoryEventType.Created:
        return 'created case';
      case CaseHistoryEventType.Edited:
        return 'edited case';
      case CaseHistoryEventType.ProcessStepAdded:
        return 'added process step';
      case CaseHistoryEventType.ProcessStepDeleted:
        return 'deleted process step';
      case CaseHistoryEventType.CommentAdded:
        return 'commented';
      case CaseHistoryEventType.CommentDeleted:
        return 'deleted a comment';
      case CaseHistoryEventType.RawDataAdded:
        return 'added article';
      case CaseHistoryEventType.RawDataDeleted:
        return 'deleted article';
      case CaseHistoryEventType.StatusChanged:
        return 'changed case status';
      default:
        return 'Unknown';
    }
  }
}
