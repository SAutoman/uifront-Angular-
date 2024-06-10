import { CdkDragDrop } from '@angular/cdk/drag-drop';

export interface IDropHandler<T = any> {
  onDrop(list: CdkDragDrop<T[]>): void;
}
