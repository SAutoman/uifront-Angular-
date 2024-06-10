/**
 * global
 */
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

/**
 * local
 */
import { Test } from '@tests/models';
import { TestUiPageComponent } from '@wfm/tests/modules/test-ui/test-ui-page/test-ui-page.component';

@Component({
  selector: 'validators-tests',
  template: '<app-test-ui-page #test></app-test-ui-page>'
})
export class ValidatorsTestsComponent implements OnInit {
  @ViewChild('test') testsComp: TestUiPageComponent;

  title: string = 'Validators tests';

  ngOnInit(): void {
    // const validators: KeyValue<ValidatorType, ValidatorDtoType>[] = [
    //     {
    //       key: ValidatorType.Min,
    //       value: <MinMaxTimeValidator>{
    //         fieldType: FieldTypeIds.TimeField,
    //         min: '09:52'
    //       }
    //     },
    //     {
    //       key: ValidatorType.Required,
    //       value: <IRequiredValidatorUi>{
    //         required: true
    //       }
    //     },
    //     {
    //       key: ValidatorType.MinMax,
    //       value: <IMinMaxNumberValidator>{
    //         fieldType: FieldTypeIds.IntField,
    //         min: 10,
    //         max: 100
    //       }
    //     },
    //     {
    //       key: ValidatorType.Min,
    //       value: <MinTimeValidator>{
    //         fieldType: FieldTypeIds.TimeField,
    //         min: '09:52'
    //       }
    //     }
    //   ];
  }

  //   private async createWithValidator(
  //     test: IViewTest,
  //     areaType: AreaTypeEnum,
  //     fieldType: FieldTypeIds,
  //     validators: KeyValue<ValidatorType, ValidatorDtoType>[]
  //   ) {
  //     let isSuccess = false;
  //     this.testUiService.testStart(test);

  //     try {
  //       const tenantField = await this.createTenantField(fieldType, validators);
  //       const fields = await this.schemaHelper.createSchemaFields([tenantField]);

  //       const cmd: SchemaDto = {
  //         id: undefined,
  //         status: CaseStatus.Open,
  //         name: `create${areaType.toString()}`,
  //         areaType: areaType,
  //         tenantId: this.tenant,
  //         functions: [],
  //         fields: fields
  //       };

  //       const operation = await this.schemasService.create(cmd);
  //       const operationStatusEnum: OperationStatus = OperationStatus[operation.status.toString()];
  //       if (operationStatusEnum === OperationStatus.Success) {
  //         const entity = await this.schemasService.getById(operation.targetId, this.tenant, areaType);
  //         if (
  //           JSON.stringify(cmd.fields[0].configuration.validators[0].value) ===
  //           JSON.stringify(entity?.fields[0]?.configuration?.validators[0]?.value)
  //         ) {
  //           isSuccess = true;
  //         }
  //       }
  //     } catch (error) {
  //       console.warn('create failed error', { error });
  //       isSuccess = false;
  //     }

  //     this.testUiService.testEnd(test, isSuccess);
  //   }
}
