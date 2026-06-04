import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../services/auth.service'; 
import { ToastService } from '../services/toast.service';
import { CartService } from '../services/cart.service'; 
import { environment } from '../../environments/environment';

interface EventItem {
  id: number;
  vendorId: number;
  name: string;
  description: string;
  location: string;
  date: string;
  bannerUrl: string | null;
  ticketPrice: string;
  maxCapacity: number;
  ticketsSold: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl;

  user: any = null;

  vibes: string[] = ['Featured', 'House', 'Techno', 'Sunset', 'Student', 'Premium', 'Live', 'Beach', 'Rooftop'];
  activeVibe = 'Featured'; 
  searchQuery = '';
  tickerItems: string[] = ['last tickets live now', 'exclusive drops', 'nightlife', 'student parties', 'beach vibes', 'rooftop events', 'house music', 'techno beats'];
  
  events: EventItem[] = [];
  readonly fallbackBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; 

  isModalOpen = false;
  selectedEvent: EventItem | null = null;
  ticketQuantity = 1;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: ToastService,
    private cartService: CartService 
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((userData: any) => {
      this.user = userData;
    });
    this.fetchApprovedEvents();
  }

  fetchApprovedEvents(): void {
    this.http.get<EventItem[]>(`${this.apiUrl}/events`).subscribe({
      next: (data) => {
        this.events = data.map((event, index) => ({
          ...event,
          bannerUrl: event.bannerUrl || this.imageForEvent(event.name, index),
        }));
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erro ao carregar eventos da API', err);
      }
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase().trim();

    if (this.searchQuery) {
      this.activeVibe = 'Featured';
    }
  }

  setVibe(vibe: string): void {
    this.activeVibe = vibe;
  }

  goToEventsPage(): void {
    document.getElementById('events')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  scrollToHowItWorks(): void {
    document.getElementById('how-it-works')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  get filteredEvents(): EventItem[] {
    let filtered = this.events.filter((event) => {
      const name = event.name?.toLowerCase() || '';
      const desc = event.description?.toLowerCase() || '';
      const loc = event.location?.toLowerCase() || '';

      if (this.activeVibe === 'Featured') {
        const matchesPromoted = name.includes('promoted') || desc.includes('promoted') || loc.includes('promoted');
        const matchesFeatured = name.includes('featured') || desc.includes('featured') || loc.includes('featured');
        
        const hasSpecificEvents = this.events.some(e => 
          e.name?.toLowerCase().includes('promoted') || 
          e.description?.toLowerCase().includes('promoted') ||
          e.name?.toLowerCase().includes('featured') ||
          e.description?.toLowerCase().includes('featured')
        );

        if (hasSpecificEvents && !matchesPromoted && !matchesFeatured) {
          return false;
        }
      } else if (this.activeVibe !== 'All') {
        const targetVibe = this.activeVibe.toLowerCase();
        const matchesVibe = name.includes(targetVibe) || desc.includes(targetVibe) || loc.includes(targetVibe);
        if (!matchesVibe) return false;
      }

      const matchesSearch =
        !this.searchQuery ||
        name.includes(this.searchQuery) ||
        desc.includes(this.searchQuery) ||
        loc.includes(this.searchQuery);

      return matchesSearch;
    });

    if (this.activeVibe === 'Featured' && !this.searchQuery) {
      filtered.sort((a, b) => b.ticketsSold - a.ticketsSold);
    }

    return filtered;
  }

  get featuredEvent(): EventItem | undefined {
    if (this.activeVibe === 'Featured' && !this.searchQuery) {
      return this.filteredEvents[0];
    }
    return undefined;
  }

  get regularEvents(): EventItem[] {
    if (this.featuredEvent) {
      return this.filteredEvents.filter(event => event.id !== this.featuredEvent?.id).slice(0, 4);
    }
    return this.filteredEvents;
  }

  getStockLabel(event: EventItem): string {
    const available = event.maxCapacity - event.ticketsSold;
    if (available <= 0) return 'Sold out';
    if (available <= event.maxCapacity * 0.15) return 'Last spots';
    if (available <= event.maxCapacity * 0.40) return 'Selling fast';
    return 'Available';
  }

  getStockClass(event: EventItem): string {
    const label = this.getStockLabel(event);
    switch (label) {
      case 'Available': return 'stock-high';
      case 'Selling fast': return 'stock-medium';
      case 'Last spots': return 'stock-low';
      case 'Sold out': return 'stock-sold';
      default: return '';
    }
  }

  onImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = this.fallbackBanner;
  }

  private imageForEvent(name: string, index: number): string {
    const key = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const eventImages: Record<string, string> = {
      'rock in winter 2026': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80',
      'pop fest summer': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      'tributo historico: queen & pink floyd': 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=1200&q=80',
      'indie rock sessions': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
      'hip-hop national summit': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      'trap & drill night': 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80',
      'r&b classics & soul vibes': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      'cypher live portugal': 'https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=1200&q=80',
      'deep house rooftop session': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      'techno beach opening 2026': 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
      'afro house sunset': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
      'premium electronic gala': 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80',
    };

    const fallbackImages = Object.values(eventImages);
    return eventImages[key] || fallbackImages[index % fallbackImages.length] || this.fallbackBanner;
  }

  openReservationModal(eventItem: EventItem, mouseEvent: MouseEvent): void {
    mouseEvent.stopPropagation(); 
    this.selectedEvent = eventItem;
    this.ticketQuantity = 1;
    this.isModalOpen = true;
    this.cdr.detectChanges(); 
  }

  closeReservationModal(): void {
    this.isModalOpen = false;
    this.selectedEvent = null;
    this.cdr.detectChanges();
  }

  get totalPrice(): number {
    if (!this.selectedEvent) return 0;
    return parseFloat(this.selectedEvent.ticketPrice) * this.ticketQuantity;
  }

  addToCartOnly(): void {
    if (!this.selectedEvent) return;

    this.cartService.addToCart({
      eventId: this.selectedEvent.id,
      eventName: this.selectedEvent.name,
      quantity: this.ticketQuantity,
      unitPrice: parseFloat(this.selectedEvent.ticketPrice),
      totalPrice: this.totalPrice
    });

    this.toast.show(`${this.ticketQuantity} ticket(s) added to your cart!`, 'success');
    this.closeReservationModal();
  }

  buyNow(): void {
    if (!this.selectedEvent) return;

    if (!this.user) {
      this.toast.show('Login required to complete reservation. Redirecting to login page...', 'error');
      this.closeReservationModal();
      this.router.navigate(['/login'], { queryParams: { mode: 'user' } });
      return;
    }

    this.cartService.addToCart({
      eventId: this.selectedEvent.id,
      eventName: this.selectedEvent.name,
      quantity: this.ticketQuantity,
      unitPrice: parseFloat(this.selectedEvent.ticketPrice),
      totalPrice: this.totalPrice
    });

    this.closeReservationModal();
    this.router.navigate(['/payment']);
  }
}
