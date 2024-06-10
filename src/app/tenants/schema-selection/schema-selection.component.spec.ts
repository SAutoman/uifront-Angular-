import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaSelectionComponent } from './schema-selection.component';

describe('SchemaSelectionComponent', () => {
  let component: SchemaSelectionComponent;
  let fixture: ComponentFixture<SchemaSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SchemaSelectionComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchemaSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
