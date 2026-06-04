import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; 
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true, 
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent implements OnInit {
  user: any = null;
  isMenuOpen = false;

  constructor(
    private authService: AuthService,
    public cartService: CartService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((userData: any) => {
      this.user = userData;
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.user = null;
    this.router.navigate(['/home']);
  }
}