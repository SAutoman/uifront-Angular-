import { animate, style, transition, trigger } from '@angular/animations';

export const Animations = [
  trigger('fadeInOut', [
    transition(':enter', [
      // :enter is alias to 'void => *'
      style({ opacity: 0 }),
      animate('200ms ease-in', style({ opacity: 1 }))
    ]),
    transition(':leave', [
      // :leave is alias to '* => void'
      animate('200ms ease-in', style({ opacity: 0 }))
    ])
  ]),
  trigger('fadeIn', [
    transition(':enter', [
      // :enter is alias to 'void => *'
      style({ opacity: 0 }),
      animate('200ms ease-in', style({ opacity: 1 }))
    ])
  ]),
  trigger('spinner', [
    transition(':enter', [
      // :enter is alias to 'void => *'
      style({ opacity: 0 }),
      animate('4000ms ease-in', style({ opacity: 1 }))
    ])
  ])
];

export const panelIn = trigger('panelIn', [
  transition(':enter', [
    style({
      'margin-left': 'translateX(100%)'
    }),
    animate(
      '.3s',
      style({
        transform: 'translateX(0)'
      })
    )
  ]),
  transition(':leave', [
    style({
      transform: 'translateX(0)'
    }),
    animate(
      '.3s',
      style({
        transform: 'translateX(100%)'
      })
    )
  ])
]);
export const panelInBottom = trigger('panelInBottom', [
  transition(':enter', [
    style({
      transform: 'translateY(100%)'
    }),
    animate(
      '.3s',
      style({
        transform: 'translateY(0)'
      })
    )
  ]),
  transition(':leave', [
    style({
      transform: 'translateY(0)'
    }),
    animate(
      '.3s',
      style({
        transform: 'translateY(100%)'
      })
    )
  ])
]);
