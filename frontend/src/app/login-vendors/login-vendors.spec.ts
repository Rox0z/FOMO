import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginVendors } from './login-vendors';

describe('LoginVendors', () => {
  let component: LoginVendors;
  let fixture: ComponentFixture<LoginVendors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginVendors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginVendors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
