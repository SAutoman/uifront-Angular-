import { KeyValue } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-forms-flow-struct',
  templateUrl: './forms-flow-struct.component.html',
  styleUrls: ['./forms-flow-struct.component.scss']
})
export class FormsFlowStructComponent {
  sections: KeyValue<string, string>[];
  componentId = '811e1eea-44c7-4c96-9c95-b864a32d1b92';

  constructor() {
    this.sections = [
      {
        key: 'form',
        value: 'Form'
      },
      {
        key: 'process',
        value: 'Process'
      }
    ];
  }
}
