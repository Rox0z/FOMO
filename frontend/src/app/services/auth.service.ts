import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

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

  // =========================
  // STORAGE SAFE
  // =========================

  private getUserFromStorage() {
    try {
      const user = localStorage.getItem('user_info');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  private storeUser(user: any): void {
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  // =========================
  // AUTH
  // =========================

    login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/auth/login`, {
      email,
      password
    });
  }

  finalizeLogin(user: any, token: string): void {
    this.storeToken(token);
    this.storeUser(user);
    this.currentUserSubject.next(user);
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

  // =========================
  // SESSION
  // =========================

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // =========================
  // PROFILE
  // =========================

  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/me`);
  }

  getVendorProfile(): Observable<any> {
    return this.http.get<any>(`${API_URL}/vendors/me`);
  }

  private loadCurrentUser(): void {
    this.http.get<any>(`${API_URL}/users/me`).subscribe({
      next: (user) => {
        this.storeUser(user);
        this.currentUserSubject.next(user);
      },
      error: (err) => {
        if (err.status === 401) {
          this.logout();
        }
      }
    });
  }

  updateProfile(updatedData: any): Observable<any> {
    return this.http.patch<any>(`${API_URL}/users/me`, updatedData).pipe(
      tap(updatedUser => {
        this.storeUser(updatedUser);
        this.currentUserSubject.next(updatedUser);
      })
    );
  }

  // =========================
  // HELPERS (IMPORTANT)
  // =========================

  getRole(): string | null {
    const user = this.currentUserSubject.value;
    return user?.role || null;
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isVendor(): boolean {
    return this.getRole() === 'vendor';
  }

  isUser(): boolean {
    return this.getRole() === 'user';
  }
}