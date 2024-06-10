import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { FormFieldEditorComponent } from './form-field-editor.component';

describe('FormFieldEditorComponent', () => {
  let component: FormFieldEditorComponent;
  let fixture: ComponentFixture<FormFieldEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormFieldEditorComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormFieldEditorComponent);
    component = fixture.componentInstance;
    component.field = { name: 'test', type: 0 } as any;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
