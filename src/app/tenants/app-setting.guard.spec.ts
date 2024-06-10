import { TestBed } from '@angular/core/testing';

import { AppSettingGuard } from './app-setting.guard';

describe('AppSettingGuard', () => {
  let guard: AppSettingGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AppSettingGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
