import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-users',
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
    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        // Check if user is a vendor
        if (response.user.userType !== 'vendor') {
          this.errorMessage = 'Esta conta não é uma conta de vendor.';
          this.authService.logout();
          this.isLoading = false;
          return;
        }

        console.log('Vendor login successful:', response);
        this.isLoading = false;
        this.router.navigate(['/vendor-dashboard']);
        this.email = '';
        this.password = '';
      },
      (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Email ou password inválidos.';
        } else {
          this.errorMessage = 'Erro ao fazer login. Tenta novamente.';
        }
      },
    );
  }

  onRegister() {
    this.router.navigate(['/register-vendors']);
  }
}