import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRuleBuilderComponent } from './form-rule-builder.component';

describe('FormRuleBuilderComponent', () => {
  let component: FormRuleBuilderComponent;
  let fixture: ComponentFixture<FormRuleBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormRuleBuilderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRuleBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
