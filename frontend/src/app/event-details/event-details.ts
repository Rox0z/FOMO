import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from "../services/toast.service";
import { CartService } from '../services/cart.service';
import { environment } from '../../environments/environment';

interface EventItem {
  id: number;
  vendorId: number;
  businessName?: string;
  name: string;
  description: string;
  location: string;
  date: string;
  bannerUrl: string | null;
  ticketPrice: string;
  maxCapacity: number;
  ticketsSold: number;
  status: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './event-details.html',
  styleUrls: ['./event-details.css']
})
export class EventDetailComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl;

  user: any = null;
  event: EventItem | null = null;
  loading = true;
  error: string | null = null;

  ticketQuantity = 1;
  isSubmittingOrder = false;
  readonly fallbackBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80';

  private cartService = inject(CartService);

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchEventDetails(Number(id));
      } else {
        this.error = 'ID do evento inválido.';
        this.loading = false;
      }
    });
  }

  fetchEventDetails(id: number): void {
    this.loading = true;
    this.http.get<EventItem>(`${this.apiUrl}/events/${id}`).subscribe({
      next: (data) => {
        this.event = data; 
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching event details:', err);
        this.error = 'Error fetching event details:';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get totalPrice(): number {
    if (!this.event) return 0;
    return parseFloat(this.event.ticketPrice) * this.ticketQuantity;
  }

  get isSoldOut(): boolean {
    if (!this.event) return false;
    return this.event.ticketsSold >= this.event.maxCapacity || this.event.status === 'Sold out';
  }

  get stockStatusText(): string {
    if (!this.event) return '';
    const available = this.event.maxCapacity - this.event.ticketsSold;

    if (this.isSoldOut) return 'Sold out';
    if (available <= this.event.maxCapacity * 0.15) return 'Last spots';
    if (available <= this.event.maxCapacity * 0.40) return 'Selling fast';
    return 'Available';
  }

  get stockStatusClass(): string {
    switch (this.stockStatusText) {
      case 'Available':    return 'stock-available';
      case 'Selling fast': return 'stock-low';
      case 'Last spots':   return 'stock-last';
      case 'Sold out':     return 'stock-sold';
      default: return '';
    }
  }

  onImageError(event: Event): void {
    const element = event.target as HTMLImageElement;
    element.src = this.fallbackBanner;
  }

  shareEvent(): void {
    if (navigator.share) {
      navigator.share({
        title: this.event?.name,
        text: this.event?.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.toast.show('Event link copied to clipboard!', 'success');
    }
  }

  addToCartOnly(): void {
    if (!this.event || this.isSubmittingOrder || this.isSoldOut) return;

    if (!this.user) {
      this.toast.show('You need to log in to add items to your cart.', 'error');
      this.router.navigate(['/login'], { queryParams: { mode: 'user' } });
      return;
    }

    this.cartService.addToCart({
      eventId: this.event.id,
      eventName: this.event.name,
      quantity: this.ticketQuantity,
      unitPrice: parseFloat(this.event.ticketPrice),
      totalPrice: this.totalPrice
    });

    this.toast.show(`${this.ticketQuantity} ticket(s) added to your cart!`, 'success');
  }

  confirmPurchase(): void {
    if (!this.event || this.isSubmittingOrder || this.isSoldOut) return;

    if (!this.user) {
      this.toast.show('You need to log in to purchase tickets.', 'error');
      this.router.navigate(['/login'], { queryParams: { mode: 'user' } });
      return;
    }

    const available = this.event.maxCapacity - this.event.ticketsSold;
    if (this.ticketQuantity > available) {
      this.toast.show(`Só há ${available} bilhete(s) disponível(is).`, 'error');
      this.ticketQuantity = available > 0 ? available : 1;
      return;
    }

    this.cartService.clearCart();
    this.cartService.addToCart({
      eventId: this.event.id,
      eventName: this.event.name,
      quantity: this.ticketQuantity,
      unitPrice: parseFloat(this.event.ticketPrice),
      totalPrice: this.totalPrice
    });

    this.router.navigate(['/payment']);
  }
}