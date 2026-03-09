import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-register-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  templateUrl: './register-vendors.html',
  styleUrls: ['./register-vendors.css']
})

export class RegisterVendors {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  countryCode = '+351';
  phone = '';

  constructor(private router: Router) {}

  showPassword = false;
  showConfirmPassword = false;

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords não coincidem!');
      return;
    }

    console.log('Nome:', this.name);
    console.log('Email:', this.email);
    console.log('Password:', this.password);
    console.log('Telefone:', this.countryCode, this.phone);
  }
  onLoginr() {
    // Exemplo: navegar para a página de registro
    this.router.navigate(['/login-vendors']);
  }
}
