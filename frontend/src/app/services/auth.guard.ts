import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (user) return true;

        const allowedRoles = route.data['roles'] || [];
        const mode = allowedRoles.includes('admin')
          ? 'admin'
          : allowedRoles.includes('vendor')
            ? 'vendor'
            : 'user';

        this.router.navigate(['/login'], { queryParams: { mode } });
        return false;
      })
    );
  }
}
