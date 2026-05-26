import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 🌟 Mantém apenas o HttpClient
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../services/auth.service'; 
import { ToastService } from '../services/toast.service';

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
  // --- CONFIGURAÇÃO CENTRAL DA API ---
  private readonly apiUrl = 'http://localhost:3000';

  // --- VARIÁVEIS DE PERFIL ---
  user: any = null;
  isMenuOpen = false;
  

  // --- VARIÁVEIS DE INTERFACE ---
  vibes: string[] = ['All', 'House', 'Techno', 'Sunset', 'Student', 'Premium', 'Live', 'Beach', 'Rooftop'];
  activeVibe = 'All';
  searchQuery = '';
  tickerItems: string[] = ['last tickets live now', 'exclusive drops', 'faro nightlife', 'student parties'];

  // ESTADO MASTER LOCAL
  events: EventItem[] = [];

  // Imagem de fallback caso o evento não tenha banner cadastrado ou dê erro
  readonly fallbackBanner = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000'; 

  // --- VARIÁVEIS DO POP-UP DE ENCOMENDA MÁGICA ---
  isModalOpen = false;
  selectedEvent: EventItem | null = null;
  ticketQuantity = 1;
  isSubmittingOrder = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((userData: any) => {
      this.user = userData;
      console.log('Utilizador na Home:', this.user);
    });

    this.fetchApprovedEvents();
  }

  fetchApprovedEvents(): void {
    this.http.get<EventItem[]>(`${this.apiUrl}/events`).subscribe({
      next: (data) => {
        this.events = data;
        console.log('Eventos carregados com sucesso:', this.events.length);
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erro ao carregar eventos da API', err);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.user = null;
    this.router.navigate(['/home']);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase().trim();
  }

  setVibe(vibe: string): void {
    this.activeVibe = vibe;
  }

  get filteredEvents(): EventItem[] {
    let filtered = this.events.filter((event) => {
      const name = event.name?.toLowerCase() || '';
      const desc = event.description?.toLowerCase() || '';
      const loc = event.location?.toLowerCase() || '';

      const matchesVibe =
        this.activeVibe === 'All' ||
        name.includes(this.activeVibe.toLowerCase()) ||
        desc.includes(this.activeVibe.toLowerCase()) ||
        loc.includes(this.activeVibe.toLowerCase());

      const matchesSearch =
        !this.searchQuery ||
        name.includes(this.searchQuery.toLowerCase()) ||
        desc.includes(this.searchQuery.toLowerCase()) ||
        loc.includes(this.searchQuery.toLowerCase());

      return matchesVibe && matchesSearch;
    });
    if (this.activeVibe === 'All' && !this.searchQuery) {
      filtered.sort((a, b) => b.ticketsSold - a.ticketsSold);
    }

    return filtered;
  }

  get featuredEvent(): EventItem | undefined {
    return this.filteredEvents[0];
  }

  get regularEvents(): EventItem[] {
    const remaining = this.filteredEvents.filter(event => event.id !== this.featuredEvent?.id);

    if (this.searchQuery) {
      return remaining;
    }

    if (this.activeVibe === 'All') {
      return remaining.slice(0, 4);
    }

    return remaining.slice(0, 5);
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

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // --- GESTÃO DO POP-UP DE ENCOMENDA MÁGICA ---
  openReservationModal(eventItem: EventItem, mouseEvent: MouseEvent): void {
    console.log('Botão clicado! Tentando abrir modal para:', eventItem.name);
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

  confirmReservation(): void {
    if (!this.selectedEvent || this.isSubmittingOrder) return;

    this.isSubmittingOrder = true;

    const orderPayload = {
      eventId: this.selectedEvent.id,
      quantity: this.ticketQuantity
    };

    console.log('A enviar pedido de checkout (via Interceptor Global) para:', orderPayload);

    this.http.post(`${this.apiUrl}/orders/checkout`, orderPayload).subscribe({
      next: (response: any) => {
        this.toast.show('Reserva efetuada com sucesso! Os teus bilhetes já foram gerados.', 'success');
        this.isSubmittingOrder = false;
        
        if (this.selectedEvent) {
          this.selectedEvent.ticketsSold += this.ticketQuantity;
        }
        
        this.closeReservationModal();
        this.router.navigate(['/user/my-tickets']);
      },
      error: (err) => {
        console.error('Erro detetado no checkout:', err);
        
      if (err.status === 401) {
        this.toast.show('Sessão expirada ou inválida. Por favor, faz login novamente.', 'error');
        this.router.navigate(['/login'], {queryParams: { mode: 'user' }});
      }
        else {
          this.toast.show('Não foi possível completar a reserva.', 'error');
        }
        
        this.isSubmittingOrder = false;
      }
    });
  }
}