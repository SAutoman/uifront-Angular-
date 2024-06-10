import { Component, Input, OnInit } from '@angular/core';
import { FormulaDetails } from '@wfm/service-layer/models/formula';

@Component({
  selector: 'app-formula-hint',
  templateUrl: './formula-hint.component.html',
  styleUrls: ['./formula-hint.component.scss']
})
export class FormulaHintComponent implements OnInit {
  @Input() formulaDetails: FormulaDetails;
  constructor() {}

  ngOnInit() {}
}
