import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';

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
    
          this.tickets = data;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toast.show('Error fetching your tickets.');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }
}