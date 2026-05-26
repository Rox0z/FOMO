import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  private getUserFromStorage() {
    const user = localStorage.getItem('user_info');
    return user ? JSON.parse(user) : null;
  }

  // --- AUTENTICAÇÃO ---

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap(res => {
        this.storeToken(res.token);
        this.storeUser(res.user);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/register`, userData).pipe(
      tap(res => {
        this.storeToken(res.token);
        this.storeUser(res.user);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  registerVendor(vendorData: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/vendors/register`, vendorData);
  }

  // --- GESTÃO DE ESTADO ---

  private storeUser(user: any): void {
    localStorage.setItem('user_info', JSON.stringify(user));
    if (user.role) {
      localStorage.setItem('user_role', user.role);
    }
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // --- PERFIL ---

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/me`);
  }

  getVendorProfile() {
    return this.http.get(`${API_URL}/vendors/me`);
  }

  private loadCurrentUser(): void {
    this.http.get<any>(`${API_URL}/users/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.storeUser(user);
      },
      error: (err) => {
        if (err.status === 401) {
          console.warn('Sessão inválida ou expirada. A efetuar logout...');
          this.logout();
        }
      }
    });
  }

  updateProfile(updatedData: any) {
    return this.http.patch<any>(`${API_URL}/users/me`, updatedData).pipe(
      tap(updatedUser => {
        this.storeUser(updatedUser);
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
}
