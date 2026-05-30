import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css'
})
export class Tickets implements OnInit {

  private readonly apiUrl = environment.apiUrl;  

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
    this.http.get(`${this.apiUrl}/tickets/me`)
      .subscribe({
        next: async (data: any) => {
    
          this.tickets = await Promise.all(
            data.map(async (ticket: any) => ({
              ...ticket,
              qrCodeDataUrl: await this.generateQrCode(ticket.qrCode),
            }))
          );
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
 
  private async generateQrCode(qrData: string): Promise<string> {
    if (!qrData) return '';
    return await QRCode.toDataURL(qrData, {
      margin: 4,
      errorCorrectionLevel: 'L',
      version: 3,
      width: 150,
      color: {
        dark: '#1a0b2e',
        light: '#ffffff',
      },
    });
  }
}