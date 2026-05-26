import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // CAMINHO ATUALIZADO!

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
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;

    // Chamada ao serviço de autenticação
    this.authService.login(this.email, this.password).subscribe({
      next: (response: any) => {
        console.log('Login successful:', response);
        
        // 1. Guardamos os dados no localStorage para persistência (caso o serviço não o faça)
        localStorage.setItem('user_info', JSON.stringify(response.user));
        
        this.isLoading = false;
        
        // 2. REDIRECIONAMENTO: Agora mandamos para a Home em vez do Dashboard
        this.router.navigate(['/home']);
        
        // Limpamos os campos
        this.email = '';
        this.password = '';
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage = 'Email ou password inválidos.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tenta novamente.';
        }
      }
    });
  }

  onRegister() {
    this.router.navigate(['/register-users']);
  }
}