import { Component, Input, OnInit } from '@angular/core';
import { FailedOverrideData } from '@wfm/dynamic-entities/case-creator-wrapper/case-creator-wrapper.component';

@Component({
  selector: 'app-failed-rules',
  templateUrl: './failed-rules.component.html',
  styleUrls: ['./failed-rules.component.scss']
})
export class FailedRulesComponent implements OnInit {
  @Input() failures: FailedOverrideData[];

  constructor() {}

  ngOnInit(): void {}
}
