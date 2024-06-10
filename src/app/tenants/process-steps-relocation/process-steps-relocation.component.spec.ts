import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessStepsRelocationComponent } from './process-steps-relocation.component';

describe('ProcessStepsRelocationComponent', () => {
  let component: ProcessStepsRelocationComponent;
  let fixture: ComponentFixture<ProcessStepsRelocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProcessStepsRelocationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessStepsRelocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
