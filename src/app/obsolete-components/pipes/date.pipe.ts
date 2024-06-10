// /**
//  * global
//  */
// import { Pipe, PipeTransform } from '@angular/core';
// import { DatePipe } from '@angular/common';
// import * as moment from 'moment';

// /**
//  * project
//  */

// /**
//  * local
//  */

// @Pipe({
//   name: 'customDate'
// })
// export class CustomDatePipe implements PipeTransform {
//   transform(date: Date, format?: string): string {

//     return new DatePipe('en-US').transform(moment.utc(date).local().toDate(), format || 'shortDate', 'UTC');
//   }
// }
