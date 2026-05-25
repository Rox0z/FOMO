import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {
  tickets: any[] = [];
  isLoading = true;
  error = '';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.fetchMyTickets();
  }

  fetchMyTickets(): void {
    
    this.http.get('http://localhost:3000/tickets/me')
      .subscribe({
        next: (data: any) => {
          this.tickets = data;
          this.isLoading = false;
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          this.toast.show('Erro ao carregar os teus bilhetes.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  getQrCodeUrl(qrData: string): string {
    if (!qrData) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&color=1a0b2e&bgcolor=ffffff`;
  }
}