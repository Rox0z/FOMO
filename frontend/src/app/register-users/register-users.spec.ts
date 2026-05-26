import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterUsers } from './register-users';

describe('RegisterUsers', () => {
  let component: RegisterUsers;
  let fixture: ComponentFixture<RegisterUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterUsers]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});