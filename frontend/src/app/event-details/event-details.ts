import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from "../services/toast.service";
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
  
  isMenuOpen = false;
  user: any = null;
  event: EventItem | null = null;
  loading = true;
  error: string | null = null;
  
  ticketQuantity = 1;
  isSubmittingOrder = false;
  readonly fallbackBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((userData: any) => {
    this.user = userData;
    this.cdr.detectChanges();
  });
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.fetchEventDetails(+eventId);
    } else {
      this.error = 'Evento não especificado.';
      this.loading = false;
    }
  }

  fetchEventDetails(id: number): void {
    this.http.get<EventItem>(`${this.apiUrl}/events/${id}`).subscribe({
      next: (data) => {
        this.event = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do evento:', err);
        this.error = 'Não foi possível encontrar este evento ou ele não está disponível.';
        this.loading = false;
      }
    });
  }

  get totalPrice(): number {
    if (!this.event) return 0;
    return parseFloat(this.event.ticketPrice) * this.ticketQuantity;
  }

  get isSoldOut(): boolean {
    if (!this.event) return false;
    return this.event.ticketsSold >= this.event.maxCapacity;
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

  shareEvent(): void {
    if (navigator.share) {
      navigator.share({
        title: this.event?.name,
        text: this.event?.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.toast.show('Link do evento copiado para a área de transferência!', 'success');
    }
  }

  confirmPurchase(): void {
    if (!this.event || this.isSubmittingOrder || this.isSoldOut) return;

    this.isSubmittingOrder = true;

    const orderPayload = {
      eventId: this.event.id,
      quantity: this.ticketQuantity
    };

    this.http.post(`${this.apiUrl}/orders/checkout`, orderPayload).subscribe({
      next: (response: any) => {
        this.toast.show('🎉 Compra efetuada com sucesso! O teu bilhete digital já foi emitido.', 'success');
        this.isSubmittingOrder = false;
        this.router.navigate(['/user/my-tickets']);
      },
      error: (err) => {
        console.error('Erro no checkout:', err);
        if (err.status === 401) {
          this.toast.show('Sessão expirada ou inválida. Por favor, faz login novamente.', 'error');
          this.router.navigate(['/login'], { queryParams: { mode: 'user' } });
        } else {
          this.toast.show(err.error?.message || 'Não foi possível completar a reserva.', 'error');
        }
        this.isSubmittingOrder = false;
      }
    });
  }

  toggleMenu(): void {
  this.isMenuOpen = !this.isMenuOpen;
  this.cdr.detectChanges();
}

  onLogout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.user = null;
    this.router.navigate(['/home']);
  }
}