import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

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
    private authService: AuthService,
    private toast: ToastService
  ) {}

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.toast.show('Preencha todos os campos!', 'error');
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
                this.toast.show('A sua conta de vendedor ainda não foi aprovada pelo admin.', 'error');
              }
            },
            error: (err) => {
              this.isLoading = false;
              this.toast.show('Erro ao verificar o estado da sua conta.', 'error');
            }
          });

        } else {
          this.isLoading = false;
          this.toast.show('Acesso negado. Apenas para vendedores.', 'error');
          localStorage.clear();
        }
      },
      (error) => {
        this.isLoading = false;
        if (error.status === 401) {
          this.toast.show('Email ou password inválidos.', 'error');
        } else {
          this.toast.show('Erro ao fazer login. Tenta novamente.', 'error');
        }
      }
    );
  }

  onRegister(): void {
    this.router.navigate(['/register-vendors']);
  }
}