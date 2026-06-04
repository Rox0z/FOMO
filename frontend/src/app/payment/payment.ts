import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl;
  protected cartService = inject(CartService);

  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvc = '';

  isPaying = false;
  errorMsg = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/home']);
    }
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  formatCardNumber(event: any): void {
    let input = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = input.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      this.cardNumber = parts.join(' ');
    } else {
      this.cardNumber = input;
    }
  }

  formatExpiry(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    this.cardExpiry = value;
  }

  get isFormValid(): boolean {
    return (
      this.cardNumber.replace(/\s/g, '').length === 16 &&
      this.cardName.trim().length > 2 &&
      this.cardExpiry.length === 5 &&
      this.cardCvc.length >= 3
    );
  }

  pay(): void {
    if (!this.isFormValid || this.isPaying) return;

    this.isPaying = true;
    this.errorMsg = '';

    const cartItems = this.cartService.cartItems();
    if (cartItems.length === 0) {
      this.errorMsg = 'Your cart is empty.';
      this.isPaying = false;
      return;
    }

    const itemsPayload = cartItems.map(item => ({ 
      eventId: item.eventId, 
      quantity: item.quantity 
    }));

    const orderPayload = {
      items: itemsPayload
    };

    this.http.post(`${this.apiUrl}/orders/checkout`, orderPayload).subscribe({
      next: (res: any) => {
        this.isPaying = false;
        this.cartService.clearCart();
        this.router.navigate(['/user/my-tickets']);
      },
      error: (err) => {
        this.isPaying = false;
        if (err.error && err.error.message) {
          this.errorMsg = err.error.message;
        } else {
          this.errorMsg = 'An error occurred during checkout. Please try again.';
        }
      }
    });
  }
}