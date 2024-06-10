/**
 * Global
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
/**
 * Project
 */
import { AreaTypeEnum, ProcessStepEntityDto, ProcessStepLinkDto, SchemaFieldDto, WorkflowDto } from '@wfm/service-layer';
import { AutoIncrementActionDto, EventAreaScopes, EventTypes } from '@wfm/service-layer/models/actionDto';
import { TenantComponent } from '@wfm/shared/tenant.component';
import { ApplicationState } from '@wfm/store/application/application.reducer';
import { PropertyPath } from '@wfm/service-layer/models/expressionModel';
/**
 * Local
 */
import { StepDataWithRefName } from '../difference-calculation-action/difference-calculation-action.component';
import { pathSeparator } from '../field-path-generator/field-path-generator.component';

export interface AutoIncrementActionData {
  type: EventTypes;
  autoIncrementFieldPaths: PropertyPath[];
  isValid: boolean;
}

@Component({
  selector: 'app-auto-increment-action',
  templateUrl: './auto-increment-action.component.html',
  styleUrls: ['./auto-increment-action.component.scss']
})
export class AutoIncrementActionComponent extends TenantComponent implements OnInit {
  @Input() workflow: WorkflowDto;
  @Input() actionDto: AutoIncrementActionDto;
  @Input() actionScope?: EventAreaScopes;
  @Input() currentProcessStep?: ProcessStepEntityDto;

  @Output() outputEmitter: EventEmitter<AutoIncrementActionData> = new EventEmitter();

  autoIncrementFields: SchemaFieldDto[];

  links: ProcessStepLinkDto[];
  steps: StepDataWithRefName[];
  selectedFieldsForTree: string[];

  get areaTypeEnum() {
    return AreaTypeEnum;
  }

  constructor(store: Store<ApplicationState>) {
    super(store);
  }

  async ngOnInit(): Promise<void> {
    if (this.actionDto) {
      this.selectedFieldsForTree = this.actionDto.autoIncrementFieldPaths.map((x) => x.path?.join(pathSeparator));
    }
    this.populateOutputData();
  }

  onFieldUpdate(event: PropertyPath[]): void {
    this.populateOutputData(event);
  }

  populateOutputData(fields?: PropertyPath[]): void {
    const outputData: AutoIncrementActionData = {
      autoIncrementFieldPaths: fields,
      isValid: fields?.length ? true : false,
      type: EventTypes.AutoIncrement
    };
    this.emitToParent(outputData);
  }

  emitToParent(data: AutoIncrementActionData): void {
    this.outputEmitter.emit(data);
  }
}
