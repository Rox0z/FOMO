import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  showPassword: boolean = false;

  mode: string = 'user'; // user | admin | vendor

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const modeParam = this.route.snapshot.queryParams['mode'];

    const allowedModes = ['user', 'admin', 'vendor'];
    this.mode = allowedModes.includes(modeParam) ? modeParam : 'user';
  }

  onLogin() {
    if (!this.email || !this.password) {
      this.toast.show('Preencha todos os campos!', 'error');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({

      next: (res: any) => {
        const user = res.user;

        // conta bloqueada
        if (!user.active) {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Conta bloqueada.', 'error');

          return;
        }

        // ADMIN PAGE
        if (this.mode === 'admin' && user.role !== 'admin') {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Acesso negado (admin only)', 'error');

          return;
        }

        // VENDOR PAGE
        if (this.mode === 'vendor' && user.role !== 'vendor') {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Acesso negado (vendor only)', 'error');

          return;
        }

        // USER PAGE
        if (this.mode === 'user' && user.role !== 'user') {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Acesso negado (user only)', 'error');

          return;
        }

        // LOGIN REAL SÓ AQUI
        this.authService.finalizeLogin(user, res.token);

        this.isLoading = false;

        this.redirectByRole(user);
      },

      error: (err) => {
        this.isLoading = false;

        if (err.status === 401) {
          this.toast.show('Credenciais inválidas.', 'error');
        } else {
          this.toast.show('Erro no login.', 'error');
        }
      }

    });
  }

  private redirectByRole(user: any) {
    switch (user.role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;

      case 'vendor':
        this.router.navigate(['/vendor-dashboard']);
        break;

      default:
        this.router.navigate(['/home']);
        break;
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}