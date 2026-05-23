import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PublicEvent {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string;
  ticketsLeft: number;
  image: string;
  description: string;
  lineup: string[];
  rules: string[];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class Events {
  selectedEvent: PublicEvent | null = null;

  events: PublicEvent[] = [
    {
      id: 1,
      title: 'FOMO Rooftop Opening',
      subtitle: 'The night everyone will talk about',
      category: 'Premium',
      location: 'Faro Skyline Club',
      date: 'Fri, Apr 03',
      time: '23:30',
      price: '€18',
      ticketsLeft: 42,
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      description: 'A premium rooftop experience with house music, sunset energy and a curated crowd.',
      lineup: ['House set', 'Guest DJ', 'Rooftop visuals'],
      rules: ['Valid ID required', 'Ticket QR code required', 'Smart casual recommended']
    },
    {
      id: 2,
      title: 'Afterclass Rush',
      subtitle: 'Student energy, premium look',
      category: 'Student',
      location: 'Dock 9, Faro',
      date: 'Sat, Apr 04',
      time: '22:00',
      price: '€10',
      ticketsLeft: 80,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      description: 'A student night built for groups, pre-drinks, dancing and late-night memories.',
      lineup: ['Afro beats', 'Commercial hits', 'Student specials'],
      rules: ['18+ only', 'No refunds after purchase', 'Arrive before 01:00']
    },
    {
      id: 3,
      title: 'Purple District',
      subtitle: 'Late night deep house selection',
      category: 'House',
      location: 'Lisbon Warehouse',
      date: 'Sun, Apr 05',
      time: '00:00',
      price: '€22',
      ticketsLeft: 25,
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      description: 'Deep house, dark lights and a warehouse atmosphere for a serious night out.',
      lineup: ['Deep house', 'Progressive set', 'Late night closing'],
      rules: ['18+ only', 'Respect the venue', 'No outside drinks']
    }
  ];

  openEvent(event: PublicEvent): void {
    this.selectedEvent = event;
  }

  closeEvent(): void {
    this.selectedEvent = null;
  }
}