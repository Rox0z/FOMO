import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPannel } from './admin-pannel';

describe('AdminPannel', () => {
  let component: AdminPannel;
  let fixture: ComponentFixture<AdminPannel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPannel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPannel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
