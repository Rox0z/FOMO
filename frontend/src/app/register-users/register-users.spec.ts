import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RegisterUsers } from './register-users';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('RegisterUsers', () => {
  let component: RegisterUsers;
  let fixture: ComponentFixture<RegisterUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterUsers],
      providers: [
        provideRouter([{ path: 'login', children: [] }]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, params: of({}), queryParams: of({}) } },
        { provide: AuthService, useValue: { register: () => of({}) } },
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
