import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestUiPageComponent } from './test-ui-page.component';

describe('TestUiPageComponent', () => {
  let component: TestUiPageComponent;
  let fixture: ComponentFixture<TestUiPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestUiPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestUiPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
