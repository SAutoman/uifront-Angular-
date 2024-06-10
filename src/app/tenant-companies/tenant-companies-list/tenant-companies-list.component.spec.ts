import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantCompaniesListComponent } from './tenant-companies-list.component';

describe('TenantCompaniesListComponent', () => {
  let component: TenantCompaniesListComponent;
  let fixture: ComponentFixture<TenantCompaniesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TenantCompaniesListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantCompaniesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
