import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-vendors.html',
  styleUrls: ['./login-vendors.css']
})
export class LoginVendors {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        console.log('Login successful:', response);
        
        if (response.user && response.user.role === 'vendor') {
          
          this.authService.getVendorProfile().subscribe({
            next: (profile: any) => {
              // Verificamos se o perfil está aprovado
              if (profile.status === 'approved') {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user_role', response.user.role);
                
                this.isLoading = false;
                this.router.navigate(['/vendor/dashboard']);
              } else {
                this.isLoading = false;
                this.errorMessage = 'A sua conta de vendedor ainda não foi aprovada pelo admin.';
              }
            },
            error: (err) => {
              this.isLoading = false;
              this.errorMessage = 'Erro ao verificar o estado da sua conta.';
            }
          });

        } else {
          this.isLoading = false;
          this.errorMessage = 'Acesso negado. Apenas para vendedores.';
          localStorage.clear();
        }
      },
      (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.errorMessage = 'Email ou password inválidos.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tenta novamente.';
        }
      }
    );
  }

  onRegister(): void {
    this.router.navigate(['/register-vendors']);
  }
}