import { TestBed, inject } from '@angular/core/testing';

import { FormAuthGuardService } from './form-auth-guard.service';

describe('AuthGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormAuthGuardService]
    });
  });

  it('should be created', inject([FormAuthGuardService], (service: FormAuthGuardService) => {
    expect(service).toBeTruthy();
  }));
});
