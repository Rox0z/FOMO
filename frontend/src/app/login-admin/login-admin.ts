import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login-admin', // Mudei para admin para não dar conflito
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-admin.html',
  styleUrls: ['./login-admin.css']
})
export class LoginAdmin {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;


  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {

  if (!this.email || !this.password) {
    this.toast.show('Preencha todos os campos!', 'error');
    return;
  }

  this.isLoading = true;

  this.authService.login(this.email, this.password).subscribe({
    next: (response: any) => {
      const user = response.user;

      this.isLoading = false;

      if (user.role !== 'admin') {
        this.toast.show('Acesso negado. Apenas administradores.', 'error');
        this.authService.logout();
        return;
      }

      this.router.navigate(['/admin-pannel']);

      this.email = '';
      this.password = '';
    },

    error: (error) => {
      this.isLoading = false;

      if (error.message === 'USER_BLOCKED') {
        this.toast.show('Conta bloqueada.', 'error');
        return;
      }

      if (error.status === 401) {
        this.toast.show('Email ou password inválidos.', 'error');
      } else {
        this.toast.show('Erro ao fazer login. Tenta novamente.', 'error');
      }
    }
  });
}

  // Se o admin quiser voltar para o registo de users (opcional)
  onRegister() {
    this.router.navigate(['/register-users']);
  }
}