import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface VendorEvent {
  title: string;
  location: string;
  date: string;
  status: 'active' | 'sold';
  image: string;
}

@Component({
  selector: 'app-vendors-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendors-dashboard.html',
  styleUrls: ['./vendors-dashboard.css']
})
export class VendorsDashboard {
  showModal = false;

  events: VendorEvent[] = [
    {
      title: 'FOMO Rooftop',
      location: 'Faro',
      date: '23:30',
      status: 'active',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80'
    },
    {
      title: 'Techno Night',
      location: 'Lisboa',
      date: '03:00',
      status: 'sold',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80'
    }
  ];

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}