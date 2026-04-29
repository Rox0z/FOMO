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
      (response) => {
        console.log('Vendor login successful:', response);

        this.isLoading = false;
        this.email = '';
        this.password = '';

        this.router.navigate(['/vendor-dashboard']);
      },
      (error) => {
        this.isLoading = false;
        console.error('Vendor login error:', error);

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