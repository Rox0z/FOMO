import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
    phone?: string;
    countryCode?: string;
    userType: 'user' | 'vendor';
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/register`, userData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
      );
  }

  registerVendor(vendorData: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_URL}/vendors`, vendorData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.currentUserSubject.next(response.user);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): Observable<any> {
    if (this.currentUserSubject.value) {
      return new Observable((observer) => {
        observer.next(this.currentUserSubject.value);
        observer.complete();
      });
    }
    return this.http.get<any>(`${API_URL}/auth/profile`);
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      this.getCurrentUser().subscribe(
        (user) => this.currentUserSubject.next(user),
        () => {
          this.logout();
        },
      );
    }
  }
}
