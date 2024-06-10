import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store, select } from '@ngrx/store';
import {
  WorkflowDto,
  UserGroupsDto,
  UserGroupsService,
  AreaTypeEnum,
  FieldTypeIds,
  WorkflowStatusDto,
  SchemaDto,
  Roles
} from '@wfm/service-layer';
import { AdminSchemasService } from '@wfm/service-layer/services/admin-schemas.service';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store';
import {
  wfOperationMsgSelector,
  wfAllRawDataLinksSelector,
  CreateRawDataLink,
  DeleteRawDataLink,
  GetAllRawDataLinks,
  GetRawDataLink,
  UpdateRawDataLink,
  wfRawDataLinkSelector
} from '@wfm/store/workflow-builder';
import { ConfirmActionComponent } from '@wfm/workflow-state/confirm-action/confirm-action.component';
import { combineLatest, Observable, of } from 'rxjs';
import { takeUntil, map, distinctUntilChanged } from 'rxjs/operators';
import { cloneDeep } from 'lodash-core';
import { RawDataLinkOverrideComponent } from './raw-data-link-override/raw-data-link-override.component';
import { CreateRawDataLinkDto, RawDataLinkDto, RawDataLinkOverride, RawDataLinkRightsEnum } from './rawdata-link.model';
import { RawDataLinkRightMap } from './rawdata-link.model';

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
  overrides: RawDataLinkOverride[];
}

@Component({
  selector: 'app-raw-data-link',
  templateUrl: './raw-data-link.component.html',
  styleUrls: ['./raw-data-link.component.scss']
})
export class RawDataLinkComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  form: FormGroup;
  rawDataReferenceFields: FieldOptions[];
  allRawDataLinks: RawDataLinkDto[] = [];
  rawDataLink: CreateRawDataLinkDto | RawDataLinkDto;
  hasUnsavedChanges: boolean = false;
  userGroups: UserGroupsDto[];
  /**
   * all the fields that have links, the current selection filtered out
   */
  fieldsWithLinks: FieldRuleData[] = [];
  caseSchema: SchemaDto;
  selectedRawDataSchema: SchemaDto;
  get rawDataReferenceFieldControl(): FormControl {
    return this.form?.get('rawDataReferenceFieldControl') as FormControl;
  }

  get rolesEnum() {
    return Roles;
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
    this.initForm();
    this.subscribeToStore();
    this.getAllRawDataLinks();
    this.fetchUserGroups();
    await this.getRawDataReferenceFields();
    if (this.rawDataReferenceFields) {
      this.rawDataReferenceFieldControl.setValue(this.rawDataReferenceFields[0]?.id);
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      rawDataReferenceFieldControl: [''],
      minCount: [1, Validators.compose([Validators.min(0), Validators.required])],
      maxCount: [999, Validators.compose([Validators.min(0), Validators.required])]
    });
    this.form
      .get('rawDataReferenceFieldControl')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((fieldSelected: string) => {
        const previousValue = this.form.value['rawDataReferenceFieldControl'];

        this.isSafeToChangeField().subscribe((isSafe) => {
          if (isSafe) {
            this.setActiveRawDataLink();
            this.getFilteredLinks();
          } else {
            // revert to the previous selection, user changed his mind
            this.rawDataReferenceFieldControl.setValue(previousValue, { emitEvent: false });
          }
        });
      });
  }

  listenForOperationMessage(): void {
    this.store.pipe(select(wfOperationMsgSelector), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x && x.toLowerCase().includes('success')) {
        this.store.dispatch(new GetAllRawDataLinks({ tenantId: this.tenant, workflowId: this.workflow.id }));
      }
    });
  }

  getById(id: string): void {
    this.store.dispatch(new GetRawDataLink({ tenantId: this.tenant, linkId: id }));
  }

  getRightLabel(right: RawDataLinkRightsEnum): string {
    return RawDataLinkRightMap.get(right).viewValue;
  }

  /**
   * populate all the rules that can be copied
   */
  getFilteredLinks(): void {
    this.fieldsWithLinks = [];
    if (this.rawDataReferenceFields && this.allRawDataLinks.length) {
      this.allRawDataLinks
        .filter((l) => l.schemaFieldId !== this.rawDataReferenceFieldControl.value)
        .forEach((l) => {
          const field = this.rawDataReferenceFields.find((f) => f.id === l.schemaFieldId);
          if (field) {
            this.fieldsWithLinks.push({
              field: {
                id: field.id,
                label: field.label
              },
              overrides: l.rawDataLinkOverrides
            });
          }
        });
    }
  }
  subscribeToStore(): void {
    combineLatest([this.store.select(wfRawDataLinkSelector), this.store.select(wfAllRawDataLinksSelector)])
      .pipe(distinctUntilChanged(), takeUntil(this.destroyed$))
      .subscribe(async (data) => {
        this.rawDataLink = data[0] ? cloneDeep(data[0]) : this.createEmptyLink();

        this.allRawDataLinks = cloneDeep(data[1]) || [];
        this.setActiveRawDataLink();
        this.getFilteredLinks();
      });
    this.listenForOperationMessage();
  }

  async setActiveRawDataLink(): Promise<void> {
    const selectedFieldId = this.rawDataReferenceFieldControl?.value;

    if (selectedFieldId && this.caseSchema) {
      await this.getRawDataSchema(selectedFieldId);
    }

    if (selectedFieldId && this.allRawDataLinks.length) {
      const existingLink = this.allRawDataLinks.find((link) => link.schemaFieldId === selectedFieldId);

      if (existingLink) {
        this.rawDataLink = cloneDeep(existingLink);
        this.form.patchValue({
          minCount: existingLink.minRawDataCount,
          maxCount: existingLink.maxRawDataCount
        });
      } else {
        this.rawDataLink = this.createEmptyLink();
      }
    } else {
      this.rawDataLink = this.createEmptyLink();
    }
  }

  async getRawDataSchema(rawDataReferenceFieldId: string): Promise<void> {
    const rawDataSchemaField = this.caseSchema.fields.find(
      (f) => f.type === FieldTypeIds.ListOfLinksField && f.id === rawDataReferenceFieldId
    );

    this.selectedRawDataSchema = await this.adminSchemasService.getSchema(
      this.tenant,
      AreaTypeEnum.rawData,
      rawDataSchemaField.configuration.schemaId
    );
  }

  async getRawDataReferenceFields(): Promise<void> {
    this.caseSchema = await this.adminSchemasService.getSchema(this.tenant, AreaTypeEnum.case, this.workflow.caseSchemaId);
    this.rawDataReferenceFields = this.caseSchema.fields
      .filter((f) => f.type === FieldTypeIds.ListOfLinksField && f.configuration.schemaAreaType === AreaTypeEnum.rawData)
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
    const dialogRef = this.dialog.open(RawDataLinkOverrideComponent, { width: '600px', disableClose: true });
    dialogRef.componentInstance.userGroups = this.userGroups;
    const rawDataRef = this.rawDataReferenceFields.find((f) => f.id === this.rawDataReferenceFieldControl.value);
    dialogRef.componentInstance.fieldLabel = rawDataRef?.label;
    dialogRef.componentInstance.fieldName = rawDataRef?.key;

    dialogRef.componentInstance.statuses = this.workflow.statuses.map((status: WorkflowStatusDto) => cloneDeep(status));
    dialogRef.componentInstance.rawDataSchema = this.selectedRawDataSchema;
    dialogRef.componentInstance.caseSchema = this.caseSchema;

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        setTimeout(() => {
          // add new override to the ones that need to be saved
          this.rawDataLink.rawDataLinkOverrides.push(cloneDeep(result.data));
          this.hasUnsavedChanges = true;
        });
      }
    });
  }

  createEmptyLink(): CreateRawDataLinkDto {
    this.form.patchValue({
      minCount: null,
      maxCount: null
    });
    return {
      workflowSchemaId: this.workflow.id,
      tenantId: this.tenant,
      rawDataSchemaId: this.selectedRawDataSchema?.id,
      schemaFieldId: this.rawDataReferenceFieldControl?.value || null,
      rawDataLinkOverrides: [],
      minRawDataCount: null,
      maxRawDataCount: null
    };
  }

  editLinkOverride(rule: RawDataLinkOverride, index: number): void {
    const dialogRef = this.dialog.open(RawDataLinkOverrideComponent, { width: '600px', disableClose: true });
    dialogRef.componentInstance.userGroups = this.userGroups;
    dialogRef.componentInstance.statuses = this.workflow.statuses.map((status: WorkflowStatusDto) => cloneDeep(status));

    const rawDataRef = this.rawDataReferenceFields.find((f) => f.id === this.rawDataReferenceFieldControl.value);
    dialogRef.componentInstance.fieldLabel = rawDataRef?.label;
    dialogRef.componentInstance.fieldName = rawDataRef?.key;

    dialogRef.componentInstance.rawDataSchema = this.selectedRawDataSchema;
    dialogRef.componentInstance.caseSchema = this.caseSchema;

    dialogRef.componentInstance.override = cloneDeep(rule);
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.data) {
        setTimeout(() => {
          this.rawDataLink.rawDataLinkOverrides[index] = cloneDeep(result.data);
          this.hasUnsavedChanges = true;
        });
      }
    });
  }

  removeLinkOverride(index: number): void {
    this.rawDataLink.rawDataLinkOverrides.splice(index, 1);
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

  getAllRawDataLinks(): void {
    this.allRawDataLinks = [];
    this.store.dispatch(new GetAllRawDataLinks({ tenantId: this.tenant, workflowId: this.workflow.id }));
  }

  async saveRawDataLink(): Promise<void> {
    try {
      this.rawDataLink = {
        ...this.rawDataLink,
        minRawDataCount: this.form.get('minCount').value,
        maxRawDataCount: this.form.get('maxCount').value
      };
      if ((<RawDataLinkDto>this.rawDataLink).id) {
        this.store.dispatch(new UpdateRawDataLink({ data: cloneDeep(this.rawDataLink) }));
      } else {
        this.store.dispatch(new CreateRawDataLink({ data: cloneDeep(this.rawDataLink) }));
      }
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteRawDataLink(): Promise<void> {
    try {
      this.store.dispatch(new DeleteRawDataLink({ tenantId: this.tenant, linkId: this.rawDataLink['id'] }));
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.log(error);
    }
  }

  copyRulesFrom(fieldRuleData: FieldRuleData): void {
    const copiableOverrides: RawDataLinkOverride[] = fieldRuleData.overrides.map((over) => {
      const copyOverride: RawDataLinkOverride = cloneDeep(over);
      copyOverride.name += `(copied from ${fieldRuleData.field.label})`;
      // ruleset shall not be copied, schemaFields are different between different rawData schemas
      copyOverride.ruleSet = null;
      return copyOverride;
    });
    this.rawDataLink.rawDataLinkOverrides = [...this.rawDataLink.rawDataLinkOverrides, ...copiableOverrides];
    this.hasUnsavedChanges = true;
  }

  async fetchUserGroups(): Promise<void> {
    const result = await this.userGroupService.getUserGroups(this.tenant);
    this.userGroups = result.items;
  }
}
