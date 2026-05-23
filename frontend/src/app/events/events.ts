import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PublicEvent {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
  imageUrl: string;
  status: 'approved' | 'pending' | 'rejected';
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
  ticketMessage = '';

  // TODO backend:
  // Replace this mock array with GET /events.
  // Backend should return only approved events.
  // Expected fields:
  // id, title, description, category, location, date, time,
  // price, totalTickets, availableTickets, imageUrl, status.
  events: PublicEvent[] = [
    {
      id: 1,
      title: 'FOMO Rooftop Opening',
      subtitle: 'The night everyone will talk about',
      description: 'A premium rooftop experience with house music, sunset energy and a curated crowd.',
      category: 'Premium',
      location: 'Faro Skyline Club',
      date: 'Fri, Apr 03',
      time: '23:30',
      price: 18,
      totalTickets: 200,
      availableTickets: 42,
      imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      rules: ['Valid ID required', 'Ticket QR code required', 'Smart casual recommended']
    },
    {
      id: 2,
      title: 'Afterclass Rush',
      subtitle: 'Student energy, premium look',
      description: 'Student night built for groups, pre-drinks, dancing and late-night memories.',
      category: 'Student',
      location: 'Dock 9, Faro',
      date: 'Sat, Apr 04',
      time: '22:00',
      price: 10,
      totalTickets: 300,
      availableTickets: 80,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      rules: ['18+ only', 'No refunds after purchase', 'Arrive before 01:00']
    },
    {
      id: 3,
      title: 'Purple District',
      subtitle: 'Late night deep house selection',
      description: 'Deep house, dark lights and a warehouse atmosphere for a serious night out.',
      category: 'House',
      location: 'Lisbon Warehouse',
      date: 'Sun, Apr 05',
      time: '00:00',
      price: 22,
      totalTickets: 150,
      availableTickets: 25,
      imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      status: 'approved',
      rules: ['18+ only', 'Respect the venue', 'No outside drinks']
    }
  ];

  openEvent(event: PublicEvent): void {
    this.selectedEvent = event;
    this.ticketMessage = '';
  }

  closeEvent(): void {
    this.selectedEvent = null;
    this.ticketMessage = '';
  }

  getTicket(event: PublicEvent): void {
    // TODO backend:
    // Replace this mock message with POST /orders or POST /tickets.
    // Payload example: { eventId: event.id, quantity: 1 }
    // Backend should use the logged-in user token.
    this.ticketMessage = `Mock reservation created for "${event.title}". Later this will create a real ticket/order.`;
  }
}