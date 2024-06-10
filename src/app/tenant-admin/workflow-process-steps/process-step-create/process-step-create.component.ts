/**
 * global
 */
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

/** project */
import {
  AreaTypeEnum,
  CreateProcessStepEntityCmd,
  ProcessStepEntityDto,
  SchemaDto,
  UpdateProcessStepEntityCmd,
  WorkflowResolutionDto
} from '@wfm/service-layer';
import { isEmptyField } from '@wfm/service-layer/helpers/field-empty-check';
import { SchemasService } from '@wfm/service-layer/services/schemas-service';
import { TenantComponent } from '@wfm/shared/tenant.component';

/** local */
import {
  AddProcessStepEntity,
  ClearCurrentProcessStepData,
  ResetErrorState,
  UpdateProcessStepEntity,
  wfProcessStepsLoaderSelector,
  workflowProcessStepEntityError,
  workflowProcessStepEntitySuccess
} from '@wfm/store/workflow-builder';
import { TranslateService } from '@ngx-translate/core';

interface ProcessStepDialogData {
  id: string;
  data: ProcessStepEntityDto;
  processSteps: ProcessStepEntityDto[];
}
@Component({
  selector: 'app-process-step-create',
  templateUrl: './process-step-create.component.html',
  styleUrls: ['./process-step-create.component.scss']
})
export class ProcessStepCreateComponent extends TenantComponent implements OnInit {
  componentId: string = 'b1818009-46ae-4de6-a299-c0705fe22455';
  title: string = 'Create Process Step Entity';
  processStepEntityForm: FormGroup;
  stepSchemas: SchemaDto[];
  resolutionsList: WorkflowResolutionDto[] = [];
  currentProcessStepId: string;
  wfStateLoading$: Observable<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private schemaService: SchemasService,
    private store: Store<any>,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<ProcessStepCreateComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: ProcessStepDialogData,
    private ts: TranslateService
  ) {
    super(store);
    this.currentProcessStepId = this.dialogData?.id;
    if (this.currentProcessStepId) {
      this.title = 'Update Process Step Entity';
    }
    this.wfStateLoading$ = this.store.pipe(select(wfProcessStepsLoaderSelector), takeUntil(this.destroyed$));
  }

  ngOnInit(): void {
    this.processStepEntityForm = this.formBuilder.group({
      name: ['', Validators.required],
      schemaId: [null, Validators.required],
      resolutions: [null]
    });
    this.loadSchemas();

    this.store.pipe(select(workflowProcessStepEntityError), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        const message = `Failed to ${!this.currentProcessStepId ? 'create' : 'update'} Process Step Entity`;
        this.snackbar.open(this.ts.instant(message), 'Ok', { duration: 2000 });
        this.resetErrorAndSuccessState();
      }
    });

    this.store.pipe(select(workflowProcessStepEntitySuccess), takeUntil(this.destroyed$)).subscribe((x) => {
      if (x) {
        const message = `Process Step Entity ${!this.currentProcessStepId ? 'created' : 'updated'} successfully`;
        this.snackbar.open(this.ts.instant(message), 'Ok', {
          duration: 2000
        });
        this.dialogRef.close(true);
        this.resetErrorAndSuccessState();
      }
    });
  }

  resetErrorAndSuccessState(): void {
    this.store.dispatch(
      new ResetErrorState({
        resetStepUpdateError: true,
        resetStepUpdateSuccess: true
      })
    );
  }

  loadSchemas(): void {
    this.schemaService
      .search(this.tenant, AreaTypeEnum.stepForm, { skip: 0, take: 999 }, [{ propertyName: 'name', sort: 1 }])
      .then((response) => {
        if (response && response?.items?.length > 0) {
          this.stepSchemas = response.items;
          if (this.currentProcessStepId) {
            this.loadProcessStepEntityById();
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async loadProcessStepEntityById() {
    try {
      if (this.dialogData.data) {
        this.processStepEntityForm.patchValue({
          name: this.dialogData.data.name,
          schemaId: this.dialogData.data.schemaId
        });
        if (this.dialogData.data?.resolutions.length > 0) {
          this.resolutionsList = this.dialogData.data.resolutions.map((data) => {
            return { name: data.name, id: data.id };
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.processStepEntityForm.controls[controlName].hasError(errorName);
  };

  addToResolutionsList(resolution): void {
    if (resolution.value.trim().length > 0 && !this.isDuplicate(resolution.value)) {
      this.resolutionsList.push({ name: resolution.value });
      resolution.value = '';
    }
  }

  isDuplicate(resolution: string): boolean {
    const index = this.resolutionsList.findIndex((x) => x.name.toLowerCase() === resolution.toLowerCase());
    if (index >= 0) return true;
    else return false;
  }

  removeResolutionFromList(index: number) {
    this.resolutionsList.splice(index, 1);
  }

  onSubmit(): void {
    let existingProcessSteps: ProcessStepEntityDto[] = this.dialogData.processSteps;
    if (this.dialogData.id) {
      existingProcessSteps = this.dialogData.processSteps.filter((x) => x.id !== this.currentProcessStepId);
    }
    const processStepName = this.processStepEntityForm.controls.name.value;
    if (isEmptyField(processStepName)) {
      this.snackbar.open(this.ts.instant('Name can not be blank'), this.ts.instant('OK'), { duration: 2000 });
    } else if (existingProcessSteps?.find((x) => x.name.trim().toLowerCase() === processStepName.trim().toLowerCase())) {
      this.snackbar.open(this.ts.instant('Process Step name can not be same'), this.ts.instant('OK'), { duration: 3000 });
    } else {
      !this.currentProcessStepId ? this.createProcessStep() : this.updateProcessStep();
    }
  }

  async createProcessStep(): Promise<void> {
    const processStepData: CreateProcessStepEntityCmd = {
      name: this.processStepEntityForm.controls.name.value.trim(),
      schemaId: this.processStepEntityForm.controls.schemaId.value,
      tenantId: this.tenant,
      resolutions: this.resolutionsList.map((x) => {
        return { name: x.name, id: x.id };
      })
    };
    try {
      this.store.dispatch(new AddProcessStepEntity({ data: processStepData }));
    } catch (error) {
      console.log(error);
    }
  }

  async updateProcessStep(): Promise<void> {
    const processStepData: UpdateProcessStepEntityCmd = {
      name: this.processStepEntityForm.controls.name.value.trim(),
      schemaId: this.processStepEntityForm.controls.schemaId.value,
      tenantId: this.tenant,
      resolutions: this.resolutionsList.map((x) => {
        return { name: x.name, id: x.id };
      }),
      id: this.currentProcessStepId
    };
    try {
      this.store.dispatch(new UpdateProcessStepEntity({ data: processStepData }));
      this.clearCurrentProcessStepData();
    } catch (error) {
      console.log(error);
    }
  }

  resetFields(): void {
    this.processStepEntityForm.reset();
    this.processStepEntityForm.markAsPristine();
    this.resolutionsList = [];
    this.processStepEntityForm.controls.schemaId.setValue(this.stepSchemas[0].id);
  }

  close(): void {
    this.clearCurrentProcessStepData();
    this.dialogRef.close(false);
  }

  clearCurrentProcessStepData(): void {
    this.store.dispatch(new ClearCurrentProcessStepData());
  }
}
