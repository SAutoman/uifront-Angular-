import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export abstract class BaseComponent implements OnDestroy {
  protected destroyed$ = new Subject<any>();
  componentId: string;
  protected constructor() {}

  ngOnDestroy(): void {
    this.destroyed$.next({});
    this.destroyed$.complete();
    this.onDestroy();
  }

  protected onDestroy(): void {}

  createId(partName: string, index = 0, separator = '_'): string {
    const parts = [this.componentId || '', partName, index];
    return parts.join(separator);
  }

  scrollToTop(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToBottom(el: HTMLElement) {
    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }, 500);
  }
}
