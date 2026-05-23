import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Inicializamos o BehaviorSubject com os dados do localStorage (se existirem)
  // Isto evita que a UI pisque como "não logada" enquanto o pedido 'me' é feito
  private currentUserSubject = new BehaviorSubject<any>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Só tentamos validar o utilizador no arranque se existir um token
    if (this.getToken()) {
      this.loadCurrentUser();
    }
  }

  private getUserFromStorage() {
    const user = localStorage.getItem('user_info');
    return user ? JSON.parse(user) : null;
  }

  // --- MÉTODOS DE AUTENTICAÇÃO ---

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
    return this.http.post<any>(`${API_URL}/vendors`, vendorData).pipe(
      tap(res => {
        this.storeToken(res.token);
        this.storeUser(res.user);
        this.currentUserSubject.next(res.user);
      })
    );
  }

  // --- GESTÃO DE ESTADO E STORAGE ---

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

  // --- MÉTODOS DE PERFIL (Sem headers manuais, confiando no Interceptor) ---

  /**
   * Obtém os dados do utilizador atual. 
   * Útil para componentes que precisam de forçar um refresh manual.
   */
  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${API_URL}/users/me`);
  }

  /**
   * Valida o token no arranque e atualiza o estado global.
   * Se o token for inválido (401), limpa a sessão.
   */
  private loadCurrentUser(): void {
    this.http.get<any>(`${API_URL}/users/me`).subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
        this.storeUser(user);
      },
      error: (err) => {
        // Apenas fazemos logout automático se o erro for 401 (Não Autorizado)
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
        // 1. Atualiza o objeto no LocalStorage (para o refresh funcionar à 1ª)
        const token = localStorage.getItem('auth_token');
        // Se guardas o user e token juntos, ajusta aqui. 
        // Geralmente:
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // 2. Notifica a app inteira que o user mudou
        this.currentUserSubject.next(updatedUser);
      })
    );
  }
}