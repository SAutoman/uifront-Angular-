import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-multiselect-list-field',
  templateUrl: './multiselect-list-field.component.html',
  styleUrls: ['./multiselect-list-field.component.scss']
})
export class MultiselectListFieldComponent implements OnInit {
  toppings = new FormControl();
  toppingList: string[] = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6'];
  constructor() {}

  ngOnInit(): void {}
}
