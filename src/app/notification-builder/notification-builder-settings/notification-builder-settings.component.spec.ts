import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationBuilderSettingsComponent } from './notification-builder-settings.component';

describe('NotificationBuilderSettingsComponent', () => {
  let component: NotificationBuilderSettingsComponent;
  let fixture: ComponentFixture<NotificationBuilderSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationBuilderSettingsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationBuilderSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
