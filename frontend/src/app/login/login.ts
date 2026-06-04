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

  mode: string = 'user';

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
      this.toast.show('Fill all fields!', 'error');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({

      next: (res: any) => {
        const user = res.user;

        if (!user.active) {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Account blocked.', 'error');

          return;
        }

        if (this.mode === 'admin' && user.role !== 'admin') {
          this.isLoading = false;
          this.password = '';
          this.authService.logout();
          this.toast.show('Access denied (admin only)', 'error');

          return;
        }

        if (this.mode === 'vendor'){
          if(user.role !== 'vendor') {
            this.isLoading = false;
            this.password = '';
            
            this.authService.logout();
            this.toast.show('Access denied (vendor only)', 'error');
            return;
          }

          if (!user.approved) {
            this.isLoading = false;
            this.password = '';

            this.authService.logout();
            this.toast.show('Account pending approval.', 'error');
            return;
          }
        }

        if (this.mode === 'user' && user.role !== 'user') {
          this.isLoading = false;
          this.password = '';

          this.authService.logout();
          this.toast.show('Access denied (user only)', 'error');

          return;
        }

        this.authService.finalizeLogin(user, res.token);
        this.isLoading = false;
        this.redirectByRole(user);
      },

      error: (err) => {
        this.isLoading = false;

        const msg = err.error?.message || '';
        if (err.status === 401) {
          if (msg === 'account_blocked') {
            this.toast.show('Conta bloqueada. Contacta o suporte.', 'error');
          } else if (msg === 'vendor_not_approved') {
            this.toast.show('Conta de vendor ainda não aprovada pelo administrador.', 'error');
          } else {
            this.toast.show('Credenciais inválidas.', 'error');
          }
        } else {
          this.toast.show('Erro ao iniciar sessão.', 'error');
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