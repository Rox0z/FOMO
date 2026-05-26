import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    const allowedRoles = route.data['roles'];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {

        if (!user) {
          const allowedRoles = route.data['roles'] || [];
          let mode = 'user';
          
          if (allowedRoles.includes('admin')) mode = 'admin';
          else if (allowedRoles.includes('vendor')) mode = 'vendor';

          this.router.navigate(['/login'], { queryParams: { mode: mode } });
          return false;
        }

        if (!allowedRoles.includes(user.role)) {
          this.router.navigate(['/home']);
          return false;
        }

        return true;
      })
    );
  }
}