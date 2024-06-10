import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTopicsListComponent } from './notification-topics-list.component';

describe('NotificationTopicsListComponent', () => {
  let component: NotificationTopicsListComponent;
  let fixture: ComponentFixture<NotificationTopicsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationTopicsListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationTopicsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
