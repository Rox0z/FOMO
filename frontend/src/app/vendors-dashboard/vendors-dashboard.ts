import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

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
  apiUrl = 'http://localhost:3000';


  // Estado de Navegação
  activeTab: 'overview' | 'events' | 'profile' | 'create' = 'overview';
  selectedFile: File | null = null;
  isSidebarCollapsed: boolean = false;

  // Dados da Empresa e Métricas Gerais
  globalStats: GlobalStats = { totalTickets: 0, totalRevenue: 0, activeEvents: 0 };
  events: VendorEvent[] = [];
  vendorData: any = null;

  // Estado Único de Seleção Avançada
  selectedEvent: DetailedVendorEvent | null = null;
  
  // Controlo de Modo de Edição
  isEditing: boolean = false;
  editFormValues: any = {};

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadStats();
    this.loadMyEvents();
  }

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // ---------------------------------------------------------
  // CHAMADAS HTTP (GET)
  // ---------------------------------------------------------
  loadProfile() {
    this.http.get<any>(`${this.apiUrl}/vendors/me`, this.getAuthHeaders()).subscribe({
      next: (data) => {
        this.vendorData = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar o perfil do vendor:', err);
        this.vendorData = {'Erro ao Carregar': 'Tente novamente mais tarde.'};
      }
    });
  }

  loadStats() {
    this.http.get<GlobalStats>(`${this.apiUrl}/events/my-stats`, this.getAuthHeaders()).subscribe({
      next: (data) => {
        this.globalStats = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar estatísticas:', err)
    });
  }

  loadMyEvents() {
    this.http.get<VendorEvent[]>(`${this.apiUrl}/events/my-events`, this.getAuthHeaders()).subscribe({
      next: (data) => {
        this.events = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar os eventos:', err)
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

    this.http.post(`${this.apiUrl}/events`, formData, this.getAuthHeaders()).subscribe({
      next: () => {
        alert('Evento submetido com sucesso!');
        this.loadMyEvents();
        this.switchTab('events');
      },
      error: (err) => {
        console.error(err);
        alert('Erro ao criar evento');
      }
    });
  }

  submitEventEdition(updatedData: any): void {
    if (!this.selectedEvent) return;
    
    // Criamos um FormData nativo em vez de enviar JSON puro
    const formData = new FormData();

    // Injetamos todos os dados de texto do formulário no FormData
    formData.append('name', updatedData.name);
    formData.append('description', updatedData.description);
    formData.append('location', updatedData.location);
    formData.append('date', updatedData.date);
    formData.append('time', updatedData.time);
    formData.append('price', String(updatedData.price));
    formData.append('maxCapacity', String(updatedData.maxCapacity));

    // Se o utilizador selecionou um ficheiro novo, anexamo-lo com o nome correto: 'banner'
    if (this.selectedFile) {
      formData.append('banner', this.selectedFile);
    }

    // Enviamos o formData no PUT em vez do updatedData
    this.http.put(`${this.apiUrl}/events/${this.selectedEvent.id}/request-edit`, formData, this.getAuthHeaders()).subscribe({
      next: () => {
        alert('Alterações enviadas! O evento atual continuará live sem alterações até o Admin aprovar.');
        this.isEditing = false;
        this.selectedFile = null; // Limpa o ficheiro selecionado para a próxima ação
        this.loadMyEvents();
        this.backToEventsList();
      },
      error: (err) => {
        console.error('Erro ao submeter alteração de evento:', err);
        alert('Erro ao processar o seu pedido de alteração.');
      }
    });
  }

  updateProfile(profileData: any): void {
    this.http.patch(`${this.apiUrl}/vendors/me`, profileData, this.getAuthHeaders()).subscribe({
      next: () => {
        alert('Perfil atualizado com sucesso!');
        this.loadProfile();
      },
      error: (err) => {
        console.error('Erro ao atualizar perfil:', err);
        alert('Erro ao atualizar o perfil comercial.');
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_info');
    this.router.navigate(['/login-vendors']);
  }
}