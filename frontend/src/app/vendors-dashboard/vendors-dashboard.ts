import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth.service';

export interface VendorEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  bannerUrl?: string;
  ticketsSold: number;
  maxCapacity: number;
  ticketPrice: number | string;
}

export interface GlobalStats {
  totalTickets: number;
  totalRevenue: number;
  activeEvents: number;
}

export interface DetailedVendorEvent extends VendorEvent {
  calculatedPrice: number;
  totalRevenue: number;
  occupancyRate: number;
}

@Component({
  selector: 'app-vendors-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendors-dashboard.html',
  styleUrls: ['./vendors-dashboard.css']
})
export class VendorsDashboard implements OnInit {
  private readonly apiUrl = environment.apiUrl;


  activeTab: 'overview' | 'events' | 'profile' | 'create' = 'overview';
  selectedFile: File | null = null;
  isSidebarCollapsed: boolean = false;

  globalStats: GlobalStats = { totalTickets: 0, totalRevenue: 0, activeEvents: 0 };
  events: VendorEvent[] = [];
  vendorData: any = null;

  selectedEvent: DetailedVendorEvent | null = null;
  
  isEditing: boolean = false;
  editFormValues: any = {};

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadStats();
    this.loadMyEvents();
  }

  // ---------------------------------------------------------
  // CHAMADAS HTTP (GET)
  // ---------------------------------------------------------
  loadProfile() {
    this.http.get<any>(`${this.apiUrl}/vendors/me`).subscribe({
      next: (data) => {
        this.vendorData = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching vendor profile:', err);
        this.vendorData = {'Error fetching profile': 'Please try again later.'};
        this.toast.show('Error fetching vendor profile.');
      }
    });
  }

  loadStats() {
    this.http.get<GlobalStats>(`${this.apiUrl}/events/my-stats`).subscribe({
      next: (data) => {
        this.globalStats = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching statistics:', err);
        this.toast.show('Error fetching statistics.');
      }
    });
  }

  loadMyEvents() {
    this.http.get<VendorEvent[]>(`${this.apiUrl}/events/my-events`).subscribe({
      next: (data) => {
        this.events = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching events:', err);
        this.toast.show('Error fetching events.');
      }
    });
  }

  // ---------------------------------------------------------
  // CHAMADAS HTTP (POST / PATCH / PUT)
  // ---------------------------------------------------------
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submitNewEvent(eventData: any): void {
    const formData = new FormData();

    formData.append('name', eventData.name);
    formData.append('description', eventData.description);
    formData.append('location', eventData.location);
    formData.append('date', eventData.date);
    formData.append('time', eventData.time);
    formData.append('price', String(eventData.price));
    formData.append('maxCapacity', String(eventData.maxCapacity));

    if (this.selectedFile) {
      formData.append('banner', this.selectedFile);
    }

    this.http.post(`${this.apiUrl}/events`, formData).subscribe({
      next: () => {
        this.toast.show('Evento submetido com sucesso!');
        this.loadMyEvents();
        this.switchTab('events');
      },
      error: (err) => {
        console.error(err);
        this.toast.show('Error creating event. Please try again.');
      }
    });
  }

  submitEventEdition(updatedData: any): void {
    if (!this.selectedEvent) return;
    
    const formData = new FormData();

    formData.append('name', updatedData.name);
    formData.append('description', updatedData.description);
    formData.append('location', updatedData.location);
    formData.append('date', updatedData.date);
    formData.append('time', updatedData.time);
    formData.append('price', String(updatedData.price));
    formData.append('maxCapacity', String(updatedData.maxCapacity));

    if (this.selectedFile) {
      formData.append('banner', this.selectedFile);
    }

    this.http.put(`${this.apiUrl}/events/${this.selectedEvent.id}/request-edit`, formData).subscribe({
      next: () => {
        this.toast.show('Changes submitted! The event will remain live without changes until the Admin approves.');
        this.isEditing = false;
        this.selectedFile = null; 
        this.loadMyEvents();
        this.backToEventsList();
      },
      error: (err) => {
        console.error('Error submitting event modification:', err);
        this.toast.show('Error processing your modification request.');
      }
    });
  }

  updateProfile(profileData: any): void {
    this.http.patch(`${this.apiUrl}/vendors/me`, profileData).subscribe({
      next: () => {
        this.toast.show('Perfil atualizado com sucesso!');
        this.loadProfile();
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.toast.show('Error updating commercial profile.');
      }
    });
  }

  // ---------------------------------------------------------
  // CONTROLADORES DE INTERFACE (SPA)
  // ---------------------------------------------------------
  switchTab(tab: 'overview' | 'events' | 'profile' | 'create'): void {
    this.activeTab = tab;
    this.selectedEvent = null; 
    this.isEditing = false;
    
    if (tab === 'overview') this.loadStats();
    if (tab === 'events') this.loadMyEvents();
    if (tab === 'profile') this.loadProfile();
    this.cdr.detectChanges();
  }
  
  viewEventDetails(event: VendorEvent): void {
    const price = Number(event.ticketPrice) || 0;
    const revenue = event.ticketsSold * price;
    const occupancy = event.maxCapacity > 0 ? (event.ticketsSold / event.maxCapacity) * 100 : 0;

    this.selectedEvent = {
      ...event,
      calculatedPrice: price,
      totalRevenue: revenue,
      occupancyRate: occupancy
    };
    
    const eventDateObj = new Date(event.date);
    const formattedDate = !isNaN(eventDateObj.getTime()) ? eventDateObj.toISOString().split('T')[0] : '';
    const formattedTime = !isNaN(eventDateObj.getTime()) ? eventDateObj.toTimeString().split(' ')[0].substring(0, 5) : '';

    this.editFormValues = {
      name: event.name,
      description: event.description,
      location: event.location,
      date: formattedDate,
      time: formattedTime,
      price: price,
      maxCapacity: event.maxCapacity
    };

    this.isEditing = false;
    this.cdr.detectChanges();
  }

  startEditing() {
    this.isEditing = true;
    this.cdr.detectChanges();
  }

  cancelEditing() {
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  backToEventsList(): void {
    this.selectedEvent = null;
    this.isEditing = false;
    this.cdr.detectChanges();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login'], { queryParams: { mode: 'vendor' } });
  }
}