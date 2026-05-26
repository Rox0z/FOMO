import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterVendors } from './register-vendors';

describe('RegisterVendors', () => {
  let component: RegisterVendors;
  let fixture: ComponentFixture<RegisterVendors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterVendors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterVendors);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
