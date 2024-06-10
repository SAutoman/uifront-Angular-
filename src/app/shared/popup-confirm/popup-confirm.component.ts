/**
 * global
 */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './popup-confirm.component.html',
  styleUrls: []
})
export class PopupConfirmComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<PopupConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }
  ) {}

  ngOnInit() {}
}
