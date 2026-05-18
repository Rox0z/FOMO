import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Caminho correto para a pasta services

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

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    this.errorMessage = '';

    // Validação de campos vazios
    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Preencha todos os campos!';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'As passwords não coincidem.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'A password deve ter no mínimo 8 caracteres.';
      return;
    }

    this.isLoading = true;

    const registrationData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      countryCode: this.countryCode,
      password: this.password,
      userType: 'user',
    };

    // Chamada ao serviço com correção dos tipos (: any)
    this.authService.register(registrationData).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        
        // REDIRECIONAMENTO: Agora mandamos para a Home para ver o perfil logado
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          this.errorMessage = 'Email já registado.';
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Erro ao criar conta. Tenta novamente.';
        }
      }
    });
  }
}