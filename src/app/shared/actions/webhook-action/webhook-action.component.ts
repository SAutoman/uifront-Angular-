/**
 * global
 */
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { filter, takeUntil } from 'rxjs/operators';

/**
 * project
 */
import { ProcessStepEntityDto, WorkflowDto, WorkflowStatusDto } from '@wfm/service-layer';
import { EventAreaScopes, WebhookEventDto } from '@wfm/service-layer/models/actionDto';
import { WebHookData } from '@wfm/service-layer/models/webHooks';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { GetWebHookFields, GetWebHooks } from '@wfm/store/webhooks-builder/webhooks-builder-actions';
import { webHooksFieldsSelector, webHooksListSelector } from '@wfm/store/webhooks-builder/webhooks-builder-selector';
import { TreeLikeNodes } from '@wfm/shared/tree-selectbox/checklist-database.service';
import { KeyValue } from '@angular/common';
/**
 * local
 */

export interface WebhookActionData {
  statusId?: string;
  webhookEndpointId: string;
  isValid: boolean;
  fields?: string[];
}

interface RawAndProcessed {
  raw: string;
  processed: string[];
}

@Component({
  selector: 'app-webhook-action',
  templateUrl: './webhook-action.component.html',
  styleUrls: ['./webhook-action.component.scss']
})
export class WebhookActionComponent extends TenantComponent implements OnInit {
  @Input() actionScope: EventAreaScopes;
  @Input() workflow: WorkflowDto;
  @Input() actionDto: WebhookEventDto;
  @Input() currentProcessStep?: ProcessStepEntityDto;
  @Output() outputEmitter: EventEmitter<WebhookActionData> = new EventEmitter();
  allWebhooks: WebHookData[];
  workflowStatuses: WorkflowStatusDto[];
  actionForm: FormGroup;

  webHookFields: string[];
  webhookFieldsTree: TreeLikeNodes;
  selectedFields: string[];
  get eventScopes() {
    return EventAreaScopes;
  }

  constructor(private fb: FormBuilder, private store: Store<ApplicationState>) {
    super(store);
  }

  ngOnInit() {
    this.workflowStatuses = this.workflow.statuses.map((status: WorkflowStatusDto) => {
      return {
        ...status
      };
    });

    this.store.dispatch(
      new GetWebHooks({
        data: {
          paging: { skip: 0, take: 9999 }
        }
      })
    );

    this.getWebhooks();

    this.actionForm = this.fb.group({
      statusId: [null],
      webhookEndpointId: [null, Validators.required],
      fields: [null]
    });

    this.actionForm.valueChanges.subscribe((formData) => {
      this.emitOutputData();
    });

    if (this.actionDto) {
      this.updateFormData();
      this.emitOutputData();
    }

    this.store.dispatch(new GetWebHookFields({ workflowSchemaId: this.workflow.id }));
    this.getWebHookFields();
    this.emitOutputData();
  }

  emitOutputData(): void {
    const formData = this.actionForm.value;
    let outputData: WebhookActionData = {
      ...formData,
      isValid: formData.webhookEndpointId ? true : false
    };
    setTimeout(() => {
      this.outputEmitter.emit(outputData);
    });
  }

  buildTreeSource(): void {
    let tree: TreeLikeNodes = {};

    const processedTestArray: RawAndProcessed[] = this.webHookFields.map((item) => {
      return {
        raw: item,
        processed: item.split('.')
      };
    });
    processedTestArray.forEach((item: RawAndProcessed) => {
      this.buildLevel(tree, item, 0);
    });
    this.webhookFieldsTree = { ...tree };
  }

  /**
   * recursively add the next level tree nodes to the source object
   * @param targetObject
   * @param item
   * @param level
   * @returns
   */
  buildLevel(targetObject: TreeLikeNodes, item: RawAndProcessed, level: number): void {
    if (!item.processed[level]) {
      return;
    }
    let nextLevelObject;
    if (!targetObject.hasOwnProperty(item.processed[level])) {
      targetObject[item.processed[level]] = {
        rawValue: item.raw,
        children: {}
      };
    }

    nextLevelObject = targetObject[item.processed[level]].children;
    level++;
    this.buildLevel(nextLevelObject, item, level);
  }

  updateFormData(): void {
    this.actionForm.patchValue(
      {
        statusId: this.actionDto.statusId,
        webhookEndpointId: this.actionDto.webhookEndpointId,
        fields: this.actionDto.fields
      },
      { onlySelf: false }
    );

    this.selectedFields = this.actionDto.fields;
  }

  getWebhooks(): void {
    this.store.pipe(select(webHooksListSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.length) {
        this.allWebhooks = x;
      }
    });
  }

  getWebHookFields(): void {
    this.store
      .pipe(
        select(webHooksFieldsSelector),
        filter((x) => !!x),
        takeUntil(this.destroyed$)
      )
      .subscribe((x) => {
        this.webHookFields = x;
        this.buildTreeSource();
      });
  }

  fieldSelectionEmitted(selection: KeyValue<string, string>[]): void {
    this.selectedFields = selection.map((item) => item.value);
    this.actionForm.get('fields').setValue(this.selectedFields);
  }
}
