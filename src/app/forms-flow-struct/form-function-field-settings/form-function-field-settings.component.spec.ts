import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFunctionFieldSettingsComponent } from './form-function-field-settings.component';

describe('FormFunctionFieldSettingsComponent', () => {
  let component: FormFunctionFieldSettingsComponent;
  let fixture: ComponentFixture<FormFunctionFieldSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormFunctionFieldSettingsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFunctionFieldSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
