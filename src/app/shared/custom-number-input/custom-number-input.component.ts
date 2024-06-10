import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-number-input',
  templateUrl: './custom-number-input.component.html',
  styleUrls: ['./custom-number-input.component.scss']
})
export class CustomNumberInputComponent implements OnInit {
  /**
   * label
   */
  @Input() label: string = '';

  /**
   * Form Control
   */
  @Input() control: FormControl;

  constructor() {}

  ngOnInit(): void {}

  hasError(errorName: string): boolean {
    return this.control.hasError(errorName);
  }

  increment(): void {
    this.control.setValue(this.control.value + 1);
  }

  decrement(): void {
    if (this.control.value > 0) {
      this.control.setValue(this.control.value - 1);
    }
  }
}
