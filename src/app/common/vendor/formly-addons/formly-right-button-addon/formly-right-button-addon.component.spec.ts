/**
 * global
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * project
 */

/**
 * local
 */

import { FormlyRightButtonAddonComponent } from './formly-right-button-addon.component';

describe('FormlyRightButtonAddonComponent', () => {
  let component: FormlyRightButtonAddonComponent;
  let fixture: ComponentFixture<FormlyRightButtonAddonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormlyRightButtonAddonComponent],
      imports: [MatIconModule, MatButtonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(FormlyRightButtonAddonComponent);
    component = fixture.componentInstance;
    const config = {};
    Object.defineProperty(component, 'to', {
      get: () => config
    });

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
