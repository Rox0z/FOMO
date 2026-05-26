import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // 1. Vamos buscar os dados que guardámos no login
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    // 2. VERIFICAÇÃO DE SEGURANÇA:
    // Só deixa passar se existir um token E se a role for exatamente 'admin'
    if (token && role === 'admin') {
      return true;
    }

    // 3. Se falhar (não tem token ou não é admin), expulsa para o login de admin
    localStorage.clear();
    this.router.navigate(['/login-admin']); 
    return false;
  }
}