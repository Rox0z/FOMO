import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-admin-pannel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-pannel.html',
  styleUrls: ['./admin-pannel.css'],
})
export class AdminPannel implements OnInit {

  activeTab = 'users';

  loading = false;
  error = '';

  users: any[] = [];
  vendors: any[] = [];
  events: any[] = [];

  private apiUrl = 'http://localhost:3000/admin';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdRef: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOverview();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login-admin']);
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  loadOverview() {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${this.apiUrl}/overview`).subscribe({
      // Adicionado ': any' no res para evitar o erro de TS (implicit any)
      next: (res: any) => {
        this.users = res.users || [];
        this.vendors = res.vendors || [];
        this.events = res.events || [];
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: () => {
        this.error = 'Erro ao carregar painel.';
        this.loading = false;
      }
    });
  }

  approveVendor(vendor: any) {
    this.http.patch(`${this.apiUrl}/vendors/${vendor.id}/approve`, {}).subscribe({
      next: () => {
        // ATUALIZAÇÃO LOCAL: Muda o estado no objeto que já está na lista
        vendor.active = true; 
        this.cdRef.detectChanges();
      },
      error: () => this.error = 'Erro ao aprovar vendor.'
    });
  }

  banUser(user: any) {
    this.http.patch(`${this.apiUrl}/users/${user.id}/ban`, {}).subscribe({
      next: () => {
        user.active = false;
        this.cdRef.detectChanges();
      },
      error: () => this.error = 'Erro ao banir utilizador.'
    });
  }

  unbanUser(user: any) {
    this.http.patch(`${this.apiUrl}/users/${user.id}/unban`, {}).subscribe({
      next: () => {
        user.active = true;
        this.cdRef.detectChanges();
      },
      error: () => this.error = 'Erro ao desbanir utilizador.'
    });
  }
}