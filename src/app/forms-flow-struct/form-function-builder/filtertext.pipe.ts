import { Pipe, PipeTransform } from '@angular/core';
import { IFieldsExpressionView } from '../interface/expression/expressionModelUI';

@Pipe({
  name: 'filterFields'
})
export class FiltertextPipe implements PipeTransform {
  transform(fields: IFieldsExpressionView[], searchTerm: string): IFieldsExpressionView[] {
    if (!searchTerm) return fields;
    else {
      return fields.filter((x) => x.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  }
}
