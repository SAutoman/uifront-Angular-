/**
 * global
 */
import { Injectable } from '@angular/core';
import {
  SchemaValidationPopupData,
  SchemaValidationPopupComponent
} from '@wfm/forms-flow-struct/schema-additional-settings/schema-validators/schema-validation-popup/schema-validation-popup.component';
import { ValidatorActionEnum } from '../models';
import { BaseFieldValueType } from '../models/FieldValueDto';
import { SchemasService } from '../services';
import { MatDialog } from '@angular/material/dialog';

export interface SchemaValidatorQuery {
  tenantId: string;
  schemaId: string;
  fields: BaseFieldValueType[];
  id?: string;
}

@Injectable()
export class SchemaValidatorsHelper {
  constructor(private schemaService: SchemasService, private dialog: MatDialog) {}

  async checkSchemaValidators(validatorQuery: SchemaValidatorQuery): Promise<boolean> {
    const messages = [];
    let isBlock = false;
    let isAlert = false;

    const validationResults = await this.schemaService.checkSchemaValidators(
      validatorQuery.tenantId,
      validatorQuery.schemaId,
      validatorQuery.fields,
      validatorQuery.id
    );
    for (let i = 0; i < validationResults.length; i++) {
      const res = validationResults[i];
      if (res.validationPassed) {
        continue;
      } else {
        if (res.action === ValidatorActionEnum.BLOCK) {
          messages.push({ name: res.validatorName, message: res.message });

          isAlert = false;
          isBlock = true;
          break;
        } else if (res.action === ValidatorActionEnum.ALERT) {
          messages.push({ name: res.validatorName, message: res.message });
          isAlert = true;
        }
      }
    }

    if (!isBlock && !isAlert) {
      // validations are passed
      return true;
    }

    const popupData: SchemaValidationPopupData = {
      failedValidators: messages,
      isAlert: true
    };

    if (isBlock) {
      popupData.isAlert = false;
    } else if (isAlert) {
      popupData.isAlert = true;
    }

    const dialogRef = this.dialog.open(SchemaValidationPopupComponent, {
      data: popupData,
      width: '400',
      disableClose: true
    });
    return await dialogRef
      .afterClosed()
      .toPromise()
      .then(async (result) => {
        return Promise.resolve(result);
      });
  }
}
