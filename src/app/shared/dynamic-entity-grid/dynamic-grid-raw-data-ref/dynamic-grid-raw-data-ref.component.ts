import { Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Row } from '../dynamic-entity-grid.component';
import { AreaTypeEnum, Operation, SchemaDto, SchemaFieldDto } from '@wfm/service-layer';

@Component({
  selector: 'app-dynamic-grid-raw-data-ref',
  templateUrl: './dynamic-grid-raw-data-ref.component.html',
  styleUrls: ['./dynamic-grid-raw-data-ref.component.scss']
})
export class DynamicGridRawDataRefComponent implements OnInit {
  @Input() deItem?: Row;
  @Input() fields?: SchemaFieldDto[];
  @Input() allowActionsFor?: AreaTypeEnum;
  @Input() schema: SchemaDto;
  @Input() schemaId: string;
  @Input() areaTypeFromGrid: AreaTypeEnum;
  @Input() isEdit?: boolean;

  constructor(private dialogRef: MatDialogRef<DynamicGridRawDataRefComponent>) {}

  ngOnInit(): void {}

  onCreate(e: Operation[]): void {
    //send targetId string[]
    const createdChildIds = e?.map((x) => x.targetId);
    this.dialogRef.close(createdChildIds);
  }

  close(event: boolean): void {
    if (event) this.dialogRef.close();
  }
}
