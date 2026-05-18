import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    const token = this.authService.getToken();

    // Se tiver token, qualquer utilizador (User ou Admin) pode ver o seu perfil
    if (token) {
      return true;
    }

    // Se não tiver token, manda para o login de utilizadores
    console.warn('Acesso negado: Precisas de fazer login primeiro.');
    this.router.navigate(['/login-users']);
    return false;
  }
}