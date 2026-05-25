import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoggedInGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate() {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) return true;

        // redirect inteligente
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/admin-pannel']);
            break;

          case 'vendor':
            this.router.navigate(['/vendor-dashboard']);
            break;

          default:
            this.router.navigate(['/home']);
        }

        return false;
      })
    );
  }
}