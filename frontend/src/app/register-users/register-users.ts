import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-users.html',
  styleUrl: './register-users.css'
})
export class RegisterUsers {
  name: string = '';
  email: string = '';
  phone: string = '';
  countryCode: string = '+351';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private router: Router) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  async onSubmit() {
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As passwords não coincidem.';
      return;
    }

    this.isLoading = true;
    try {
      // TODO: substituir pela chamada real ao serviço de registo
      await new Promise(resolve => setTimeout(resolve, 1200));
      this.router.navigate(['/login']);
    } catch (err) {
      this.errorMessage = 'Erro ao criar conta. Tenta novamente.';
    } finally {
      this.isLoading = false;
    }
  }
   onLogin() {
    this.router.navigate(['/login-users']);
  }
}
