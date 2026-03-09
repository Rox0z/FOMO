import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.email || !this.password) {
      alert('Preencha todos os campos!');
      return;
    }

    // Apenas imprime no console (sem backend)
    console.log('Email:', this.email);
    console.log('Password:', this.password);

    alert('Login enviado com sucesso!');

    // Opcional: navegar para outra rota
    // this.router.navigate(['/dashboard']);

    // Limpar campos
    this.email = '';
    this.password = '';
  }
  onRegister() {
    this.router.navigate(['/register-users']);
  }
}