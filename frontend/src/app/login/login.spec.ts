import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Login } from './login';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'home', children: [] }]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} }, params: of({}), queryParams: of({}) } },
        { provide: AuthService, useValue: { login: () => of({}), logout: () => undefined, finalizeLogin: () => undefined } },
        { provide: ToastService, useValue: { show: () => undefined } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
