/**
 * global
 */
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-core';
import { map, takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Observable, of } from 'rxjs';
import {
  CreateCaseFieldLink,
  DeleteCaseFieldLink,
  GetAllCaseFieldLinks,
  GetCaseFieldLink,
  UpdateCaseFieldLink,
  wfCaseFieldLinkSelector,
  wfCaseFieldsLinksSelector,
  wfOperationMsgSelector
} from '@wfm/store/workflow-builder';
/**
 * project
 */
import { AreaTypeEnum, FieldTypeIds, UserGroupsDto, UserGroupsService, WorkflowDto, WorkflowStatusDto } from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';

/**
 * local
 */
import { CreateFieldLinkDto, FieldLinkDto, FieldLinkOverride } from './field-link.model';
import { FieldLinkOverrideComponent } from './field-link-override/field-link-override.component';

interface FieldOptions {
  id: string;
  type: FieldTypeIds;
  label: string;
  key: string;
}

interface FieldRuleData {
  field: {
    id: string;
    label: string;
  };
  overrides: FieldLinkOverride[];
}

@Component({
  selector: 'app-workflow-field-link',
  templateUrl: './workflow-field-link.component.html',
  styleUrls: ['./workflow-field-link.component.scss']
})
export class WorkflowFieldLinkComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  form: FormGroup;
  caseFields: FieldOptions[];
  allFieldLinks: FieldLinkDto[] = [];
  fieldLink: CreateFieldLinkDto | FieldLinkDto;
  hasUnsavedChanges: boolean = false;
  userGroups: UserGroupsDto[];
  /**
   * all the fields that have links, the current selection filtered out
   */
  fieldsWithLinks: FieldRuleData[] = [];
  get caseFieldControl(): FormControl {
    return this.form?.get('caseFieldControl') as FormControl;
  }
  constructor(
    private store: Store<ApplicationState>,
    private adminSchemasService: AdminSchemasService,
    private dialog: MatDialog,
    private userGroupService: UserGroupsService,
    private fb: FormBuilder
  ) {
    super(store);
  }

  async ngOnInit() {
    this.subscribeToStore();
    this.initForm();
    this.getAllFieldLinks();
    this.fetchUserGroups();
    await this.getCaseFields();
    if (this.caseFields) {
      this.caseFieldControl.setValue(this.caseFields[0]?.id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      caseFieldControl: ['']
    });
    this.form
      .get('caseFieldControl')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((fieldSelected: string) => {
        const previousValue = this.form.value['caseFieldControl'];

        this.isSafeToChangeField().subscribe((isSafe) => {
          if (isSafe) {
            this.setActiveFieldLink();
            this.getFilteredLinks();
          } else {
            // revert to the previous selection, user changed his mind
            this.caseFieldControl.setValue(previousValue, { emitEvent: false });
          }
        });
      });
  }

  listenForOperationMessage(): void {
    this.store.pipe(select(wfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.store.dispatch(new GetAllCaseFieldLinks({ tenantId: this.tenant, workflowId: this.workflow.id }));
      }
    });
  }

  getById(id: string): void {
    this.store.dispatch(new GetCaseFieldLink({ tenantId: this.tenant, linkId: id }));
  }

  /**
   * populate all the rules that can be copied
   */
  getFilteredLinks(): void {
    this.fieldsWithLinks = [];
    if (this.caseFields && this.allFieldLinks.length) {
      this.allFieldLinks
        .filter((l) => l.schemaFieldId !== this.caseFieldControl.value)
        .forEach((l) => {
          const field = this.caseFields.find((f) => f.id === l.schemaFieldId);
          if (field) {
            this.fieldsWithLinks.push({
              field: {
                id: field.id,
                label: field.label
              },
              overrides: l.caseFieldLinkOverrides
            });
          }
        });
    }
  }
  subscribeToStore(): void {
    combineLatest([this.store.select(wfCaseFieldLinkSelector), this.store.select(wfCaseFieldsLinksSelector)])
      .pipe(takeUntil(this.destroyed$))
      .subscribe(async (data) => {
        this.fieldLink = data[0] ? cloneDeep(data[0]) : this.createEmptyLink();
        this.allFieldLinks = cloneDeep(data[1]) || [];
        this.setActiveFieldLink();
        this.getFilteredLinks();
      });
    this.listenForOperationMessage();
  }

  setActiveFieldLink(): void {
    const selectedField = this.caseFieldControl?.value;
    if (selectedField && this.allFieldLinks.length) {
      const existingLink = this.allFieldLinks.find((link) => link.schemaFieldId === selectedField);
      this.fieldLink = existingLink ? cloneDeep(existingLink) : this.createEmptyLink();
    } else {
      this.fieldLink = this.createEmptyLink();
    }
  }

  async getCaseFields(): Promise<void> {
    let schema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId);
    this.caseFields = schema.fields
      .filter((f) => f.type !== FieldTypeIds.EmbededField && f.type !== FieldTypeIds.LinkField && f.type !== FieldTypeIds.ListOfLinksField)
      .map((f) => {
        return <FieldOptions>{
          id: f.id,
          type: f.type,
          label: f.displayName,
          key: f.fieldName
        };
      });
  }

  addLinkOverride(): void {
    const dialogRef = this.dialog.open(FieldLinkOverrideComponent, { width: '600px' });
    dialogRef.componentInstance.userGroups = this.userGroups;
    dialogRef.componentInstance.field = this.caseFields.find((f) => f.id === this.caseFieldControl.value)?.label;

    dialogRef.componentInstance.statuses = this.workflow.statuses.map((status: WorkflowStatusDto) => cloneDeep(status));
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        setTimeout(() => {
          // add new override to the ones that need to be saved
          this.fieldLink.caseFieldLinkOverrides.push(cloneDeep(result.data));
          this.hasUnsavedChanges = true;
        });
      }
    });
  }

  createEmptyLink(): CreateFieldLinkDto {
    return {
      workflowSchemaId: this.workflow.id,
      tenantId: this.tenant,
      schemaFieldId: this.caseFieldControl?.value || null,
      caseFieldLinkOverrides: []
    };
  }

  editLinkOverride(rule: FieldLinkOverride, index: number): void {
    const dialogRef = this.dialog.open(FieldLinkOverrideComponent, { width: '600px' });
    dialogRef.componentInstance.userGroups = this.userGroups;
    dialogRef.componentInstance.statuses = this.workflow.statuses.map((status: WorkflowStatusDto) => cloneDeep(status));
    dialogRef.componentInstance.field = this.caseFields.find((f) => f.id === this.caseFieldControl.value)?.label;

    dialogRef.componentInstance.override = cloneDeep(rule);
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        setTimeout(() => {
          this.fieldLink.caseFieldLinkOverrides[index] = cloneDeep(result.data);
          this.hasUnsavedChanges = true;
        });
      }
    });
  }

  removeLinkOverride(index: number): void {
    this.fieldLink.caseFieldLinkOverrides.splice(index, 1);
    this.hasUnsavedChanges = true;
  }

  isSafeToChangeField(): Observable<boolean> {
    if (this.hasUnsavedChanges) {
      return this.dialog
        .open(ConfirmActionComponent, {
          data: {
            title: 'Change Field?',
            message: 'There are unsaved changes, if you proceed without saving, the changes will be lost',
            showProceedBtn: true
          }
        })
        .afterClosed()
        .pipe(
          map((x) => {
            if (x) {
              this.hasUnsavedChanges = false;
              return true;
            }
            return false;
          })
        );
    } else {
      return of(true);
    }
  }

  getAllFieldLinks(): void {
    this.allFieldLinks = [];
    this.store.dispatch(new GetAllCaseFieldLinks({ tenantId: this.tenant, workflowId: this.workflow.id }));
  }

  async saveFieldLink(): Promise<void> {
    try {
      if ((<FieldLinkDto>this.fieldLink).id) {
        this.store.dispatch(new UpdateCaseFieldLink({ data: cloneDeep(this.fieldLink) }));
      } else {
        this.store.dispatch(new CreateCaseFieldLink({ data: cloneDeep(this.fieldLink) }));
      }
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteFieldLink(): Promise<void> {
    try {
      this.store.dispatch(new DeleteCaseFieldLink({ tenantId: this.tenant, linkId: this.fieldLink['id'] }));
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.log(error);
    }
  }

  copyRulesFrom(fieldRuleData: FieldRuleData): void {
    this.fieldLink.caseFieldLinkOverrides = [...this.fieldLink.caseFieldLinkOverrides, ...fieldRuleData.overrides];
    this.hasUnsavedChanges = true;
  }

  async fetchUserGroups(): Promise<void> {
    const result = await this.userGroupService.getUserGroups(this.tenant);
    this.userGroups = result.items;
  }
}
