import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {ToastService} from '../services/toast.service';

@Component({
  selector: 'app-login-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-users.html',
  styleUrls: ['./login-users.css']
})
export class LoginUsers {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.toast.show('Preencha todos os campos!', 'error');
      return;
    }

    this.isLoading = true;

    // Chamada ao serviço de autenticação
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        this.isLoading = false;
        // 2. REDIRECIONAMENTO: Agora mandamos para a Home em vez do Dashboard
        this.router.navigate(['/home']);
        // Limpamos os campos
        this.email = '';
        this.password = '';
      },
      error: (error: any) => {
        this.isLoading = false;
        
        if (error.message === 'USER_BLOCKED') {
          this.toast.show('Conta com acesso bloqueado.', 'error');
        }

        if (error.status === 401) {
          this.toast.show('Email ou password inválidos.', 'error');
        } else {
          this.toast.show('Erro ao fazer login. Tenta novamente.', 'error');
        }
      }
    });
  }

  onRegister() {
    this.router.navigate(['/register-users']);
  }
}