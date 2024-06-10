// import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

// @Component({
//   selector: 'app-filter',
//   templateUrl: './filter.component.html',
//   styleUrls: ['./filter.component.scss']
// })
// export class FilterComponent implements OnInit {
//   @Output() event = new EventEmitter<FilterType>();
//   @Input() status: string;
//   @Input() color: string = 'primary';

//   private isStringClicked: boolean;
//   private isDateClicked: boolean;
//   private isCreatorClicked: boolean;

//   componentId = 'e65e4354-3a8f-4192-96ec-6cc835b1d86d';

//   constructor() {}

//   ngOnInit(): void {}

//   onDateClicked(): void {
//     this.isDateClicked = true;

//     const date = <FilterType>{
//       type: 'date',
//       isClicked: this.isDateClicked,
//       status: this.status
//     };

//     this.event.emit(date);
//   }

//   onNameClicked(): void {
//     this.isStringClicked = true;

//     const name = <FilterType>{
//       type: 'name',
//       isClicked: this.isStringClicked,
//       status: this.status
//     };

//     this.event.emit(name);
//   }

//   onCreatorClicked(): void {
//     this.isCreatorClicked = true;

//     const creator = <FilterType>{
//       type: 'creator',
//       isClicked: this.isCreatorClicked,
//       status: this.status
//     };

//     this.event.emit(creator);
//   }
// }
