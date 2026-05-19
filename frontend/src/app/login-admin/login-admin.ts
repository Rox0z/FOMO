import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

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

    // 1. Validação igual ao LoginUsers
    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;

    // 2. Subscribe no formato que pediste (com as duas funções separadas por vírgula)
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => { // Usamos 'any' para evitar o erro da propriedade 'role'
        console.log('Login successful:', response);
        
        // Verificamos se o user é realmente um admin
        if (response.user && response.user.role === 'admin') {
          // Guarda os dados necessários para o Interceptor e Guard
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_role', response.user.role);
          
          this.isLoading = false;
          this.router.navigate(['/admin-pannel']); // Redireciona para o painel
          
          // Limpa os campos
          this.email = '';
          this.password = '';
        } else {
          // Se os dados estiverem certos mas NÃO for admin
          this.isLoading = false;
          this.errorMessage = 'Acesso negado. Apenas administradores.';
          localStorage.clear(); // Limpa tudo por segurança
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        // Tratamento de erro igual ao LoginUsers
        if (error.status === 401) {
          this.errorMessage = 'Email ou password inválidos.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tenta novamente.';
        }
      }
    );
  }

  // Se o admin quiser voltar para o registo de users (opcional)
  onRegister() {
    this.router.navigate(['/register-users']);
  }
}