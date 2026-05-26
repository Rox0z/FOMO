import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface ApiEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  date: string;
  bannerUrl?: string;
  ticketPrice: string | number;
  maxCapacity: number;
  ticketsSold: number;
  status: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'],
})
export class EventsPage implements OnInit {
  events: ApiEvent[] = [];
  selectedEvent: ApiEvent | null = null;
  user: any = null;
  isLoading = true;
  searchQuery = '';
  activeFilter: 'all' | 'available' | 'last' = 'all';
  actionMessage = '';
  actionError = '';
  reservingId: number | null = null;

  private fallbackImages = [
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
    this.loadEvents();
  }

  async loadEvents(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await fetch(`${environment.apiUrl}/events`);
      if (!response.ok) throw new Error('Events request failed');
      this.events = await response.json();
    } catch {
      this.actionError = 'Nao foi possivel carregar os eventos.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  setFilter(filter: 'all' | 'available' | 'last'): void {
    this.activeFilter = filter;
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase().trim();
  }

  openEvent(event: ApiEvent): void {
    this.selectedEvent = event;
    this.actionMessage = '';
    this.actionError = '';
  }

  closeModal(): void {
    this.selectedEvent = null;
  }

  reserve(event: ApiEvent): void {
    this.actionMessage = '';
    this.actionError = '';

    if (!this.user) {
      this.router.navigate(['/login-users']);
      return;
    }

    if (this.remainingTickets(event) <= 0) {
      this.actionError = 'Este evento esta esgotado.';
      return;
    }

    this.reservingId = event.id;
    this.http.post(`${environment.apiUrl}/orders/checkout`, {
      eventId: event.id,
      quantity: 1,
    }).subscribe({
      next: () => {
        this.reservingId = null;
        this.actionMessage = 'Reserva confirmada. O bilhete ja esta na tua conta.';
        this.loadEvents();
      },
      error: error => {
        this.reservingId = null;
        this.actionError = error.error?.message || 'Nao foi possivel reservar este evento.';
      },
    });
  }

  get filteredEvents(): ApiEvent[] {
    return this.events.filter(event => {
      const text = `${event.name} ${event.description} ${event.location}`.toLowerCase();
      const matchesSearch = !this.searchQuery || text.includes(this.searchQuery);
      const remaining = this.remainingTickets(event);
      const matchesFilter =
        this.activeFilter === 'all' ||
        (this.activeFilter === 'available' && remaining > 0) ||
        (this.activeFilter === 'last' && remaining > 0 && remaining <= 10);

      return matchesSearch && matchesFilter;
    });
  }

  remainingTickets(event: ApiEvent): number {
    return Math.max(Number(event.maxCapacity || 0) - Number(event.ticketsSold || 0), 0);
  }

  eventImage(event: ApiEvent, index = 0): string {
    return event.bannerUrl || this.fallbackImages[index % this.fallbackImages.length];
  }

  price(event: ApiEvent): string {
    const value = Number(event.ticketPrice || 0);
    return value > 0 ? `€${value.toFixed(2)}` : 'Free';
  }

  formattedDate(event: ApiEvent): string {
    const date = new Date(event.date);
    if (Number.isNaN(date.getTime())) return event.date;
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
