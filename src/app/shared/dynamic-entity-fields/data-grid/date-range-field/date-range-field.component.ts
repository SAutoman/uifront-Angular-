import { Component, OnInit, Input } from '@angular/core';
//SAT: unused

@Component({
  selector: 'app-date-range-field',
  templateUrl: './date-range-field.component.html',
  styleUrls: ['./date-range-field.component.scss']
})
export class DateRangeFieldComponent implements OnInit {
  @Input() filter: any;
  componentId = '5107d740-51a1-4ed5-899a-ac25d956cdeb';

  constructor() {}

  ngOnInit() {}
}
