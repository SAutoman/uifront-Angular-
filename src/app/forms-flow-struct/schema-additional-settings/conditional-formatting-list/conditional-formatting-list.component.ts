import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { IConfigurableListItem } from '@wfm/common/models';
import { ConditionalFormatting } from '@wfm/service-layer/models/conditional-formatting';

export interface ConditionalFormattingUi extends ConditionalFormatting {
  expanded: boolean;
  isValid: boolean;
}
@Component({
  selector: 'app-conditional-formatting-list',
  templateUrl: './conditional-formatting-list.component.html',
  styleUrls: ['./conditional-formatting-list.component.scss']
})
export class ConditionalFormattingListComponent {
  @Input() fields: IConfigurableListItem[];
  @Input() formattings: ConditionalFormattingUi[] = [];
  @Output() emitData: EventEmitter<ConditionalFormattingUi[]> = new EventEmitter(null);

  constructor(private dialogRef: MatDialogRef<ConditionalFormattingListComponent>) {}

  createConditionalFormatting(): void {
    this.formattings.push({
      name: '',
      conditionFormula: '',
      formatting: {
        types: null,
        className: ''
      },
      expanded: true,
      isDisabled: false,
      isValid: false
    });
    this.emitToParent();
  }

  onExpanded(item: ConditionalFormattingUi): void {
    setTimeout(() => {
      item.expanded = true;
    });
  }

  onCollapse(item: ConditionalFormattingUi): void {
    setTimeout(() => {
      item.expanded = false;
    });
  }

  onDelete(e: Event, formattingIndex: number): void {
    e.preventDefault();
    e.stopImmediatePropagation();
    this.formattings.splice(formattingIndex, 1);
    this.emitToParent();
  }

  cancelDialog(): void {
    this.dialogRef.close(false);
  }

  updateFormattingData(formattingData: ConditionalFormattingUi, index: number): void {
    this.formattings[index].conditionFormula = formattingData.conditionFormula;
    this.formattings[index].formatting = formattingData.formatting;
    this.formattings[index].name = formattingData.name;
    this.formattings[index].isValid = formattingData.isValid;
    this.formattings[index].isDisabled = formattingData.isDisabled;
    this.emitToParent();
  }

  emitToParent(): void {
    const formattingsDto: ConditionalFormattingUi[] = this.formattings.map((f) => {
      return {
        name: f.name,
        conditionFormula: f.conditionFormula,
        formatting: f.formatting,
        expanded: f.expanded,
        isDisabled: f.isDisabled,
        isValid: f.isValid
      };
    });
    this.emitData.next(formattingsDto);
  }

  isValid(): boolean {
    return this.formattings.every((f) => f.isValid);
  }
}
