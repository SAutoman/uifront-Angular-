import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-alert',
  templateUrl: './popup-alert.component.html'
})
export class PopupAlertComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PopupAlertComponent>, @Inject(MAT_DIALOG_DATA) public data: { message: string }) {}

  ngOnInit() {}
}
