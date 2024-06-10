import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[ignoreScroll]'
})
export class IgnoreWheelDirective {
  @HostListener('wheel', ['$event'])
  @HostListener('scroll', ['$event'])
  onWheel(event: Event) {
    event.preventDefault();
  }
}
