import { Pipe, PipeTransform } from '@angular/core';
import { orderBy } from 'lodash';

@Pipe({
  name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
  transform(array: any, sortBy: string, order?: string): any[] {
    const sortOrder = order ? order : 'asc'; // setting default ascending order
    let newArr = orderBy(array, [sortBy], [sortOrder]);
    console.log(newArr);
    return newArr;
  }
}
