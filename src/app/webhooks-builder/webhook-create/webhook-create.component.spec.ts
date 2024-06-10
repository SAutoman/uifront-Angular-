import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WebhookCreateComponent } from './webhook-create.component';

describe('WebhookCreateComponent', () => {
  let component: WebhookCreateComponent;
  let fixture: ComponentFixture<WebhookCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WebhookCreateComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebhookCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
