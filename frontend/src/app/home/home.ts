import { CommonModule } from '@angular/common';
<<<<<<< Updated upstream
import { Component } from '@angular/core';
<<<<<<< Updated upstream
import { RouterModule } from '@angular/router';
=======
=======
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Caminho atualizado para a tua nova pasta
>>>>>>> Stashed changes
>>>>>>> Stashed changes

interface EventItem {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  date: string;
  price: string;
  stock: 'high' | 'medium' | 'low' | 'sold';
  image: string;
  featured?: boolean;
  tags: string[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  // --- VARIÁVEIS DE PERFIL ---
  user: any = null;
  isMenuOpen = false;

  // --- VARIÁVEIS DE INTERFACE ---
  categories: string[] = [
    'All',
    'House',
    'Techno',
    'Afro',
    'Sunset',
    'Student',
    'Premium',
    'Live',
    'Beach',
    'Rooftop'
  ];

  activeCategory = 'All';
  searchQuery = '';

  tickerItems: string[] = [
    'last tickets live now',
    'exclusive drops',
    'faro nightlife',
    'student parties',
    'premium events',
    'real-time access'
  ];

  // --- LISTA DE EVENTOS ---
  events: EventItem[] = [
    {
      id: 1,
      title: 'FOMO Rooftop Opening',
      subtitle: 'The night everyone will talk about',
      category: 'Premium',
      location: 'Faro Skyline Club',
      date: 'Fri, Apr 03 • 23:30',
      price: '€18',
      stock: 'high',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      tags: ['Rooftop', 'Exclusive', 'House']
    },
    {
      id: 2,
      title: 'Afterclass Rush',
      subtitle: 'Student energy, premium look',
      category: 'Student',
      location: 'Dock 9, Faro',
      date: 'Sat, Apr 04 • 22:00',
      price: '€10',
      stock: 'medium',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      tags: ['Afro', 'Club']
    },
    {
      id: 3,
      title: 'Purple District',
      subtitle: 'Late night deep house selection',
      category: 'House',
      location: 'Lisbon Warehouse',
      date: 'Sun, Apr 05 • 00:00',
      price: '€22',
      stock: 'high',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      tags: ['House', 'Deep House']
    },
    {
      id: 4,
      title: 'Atlantic Sunset Ritual',
      subtitle: 'Golden hour to moonlight',
      category: 'Sunset',
      location: 'Praia de Faro',
      date: 'Sun, Apr 05 • 18:30',
      price: 'Free',
      stock: 'low',
      image: 'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=80',
      tags: ['Sunset', 'Beach']
    },
    {
      id: 5,
      title: 'Hard Rush 3AM',
      subtitle: 'Raw energy only',
      category: 'Techno',
      location: 'Underground Room',
      date: 'Fri, Apr 10 • 03:00',
      price: '€16',
      stock: 'sold',
      image: 'https://images.unsplash.com/photo-1571266028243-8c6b9cdbf34b?auto=format&fit=crop&w=1200&q=80',
      tags: ['Hard Techno', 'Industrial']
    },
    {
      id: 6,
      title: 'Velvet Live Showcase',
      subtitle: 'Live set, premium crowd',
      category: 'Live',
      location: 'Secret Garden, Lisbon',
      date: 'Thu, Apr 09 • 21:00',
      price: '€25',
      stock: 'high',
      image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
      tags: ['Live', 'Premium']
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Escuta o estado do utilizador em tempo real
    this.authService.currentUser$.subscribe(userData => {
      this.user = userData;
    });
  }

  // --- MÉTODOS DE AUTENTICAÇÃO ---
  onLogout(): void {
    this.authService.logout();
    this.isMenuOpen = false;
    this.user = null;
    this.router.navigate(['/home']);
  }

  // --- MÉTODOS DE FILTRAGEM ---
  setCategory(category: string): void {
    this.activeCategory = category;
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value.toLowerCase().trim();
  }

  get filteredEvents(): EventItem[] {
    return this.events.filter((event) => {
      const matchesCategory =
        this.activeCategory === 'All' ||
        event.category === this.activeCategory ||
        event.tags.some(tag => tag.toLowerCase().includes(this.activeCategory.toLowerCase()));

      const matchesSearch =
        !this.searchQuery ||
        event.title.toLowerCase().includes(this.searchQuery) ||
        event.subtitle.toLowerCase().includes(this.searchQuery) ||
        event.location.toLowerCase().includes(this.searchQuery) ||
        event.tags.some(tag => tag.toLowerCase().includes(this.searchQuery));

      return matchesCategory && matchesSearch;
    });
  }

  // --- MÉTODOS AUXILIARES DE INTERFACE ---
  get featuredEvent(): EventItem | undefined {
    return this.filteredEvents.find(event => event.featured) ?? this.filteredEvents[0];
  }

  get regularEvents(): EventItem[] {
    return this.filteredEvents.filter(event => event.id !== this.featuredEvent?.id);
  }

  getStockLabel(stock: EventItem['stock']): string {
    switch (stock) {
      case 'high': return 'Available';
      case 'medium': return 'Selling fast';
      case 'low': return 'Last spots';
      case 'sold': return 'Sold out';
      default: return '';
    }
  }

  getStockClass(stock: EventItem['stock']): string {
    switch (stock) {
      case 'high': return 'stock-high';
      case 'medium': return 'stock-medium';
      case 'low': return 'stock-low';
      case 'sold': return 'stock-sold';
      default: return '';
    }
  }

  toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}
}