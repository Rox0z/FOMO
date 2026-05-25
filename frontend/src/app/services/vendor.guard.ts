import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service'; // Ajusta para o teu serviço
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    
    if (token && role === 'vendor') {
      return true; 
    }

    // Se não for vendor, recambiamos para o login ou home
    localStorage.clear();
    this.router.navigate(['/login-vendors']); 
    return false;
    }
}