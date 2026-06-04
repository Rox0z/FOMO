import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar';


const HIDDEN_NAVBAR_ROUTES = [
  '/login',
  '/register-users',
  '/register-vendors',
  '/vendor-dashboard',
  '/admin-dashboard',
  '/payment', 
];

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
  private currentUrl = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.currentUrl = e.urlAfterRedirects;
      });
  }

  showNavbar(): boolean {
    return !HIDDEN_NAVBAR_ROUTES.some(route => this.currentUrl.startsWith(route));
  }
}