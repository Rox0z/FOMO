import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css']
})
export class CartComponent {

  cartService = inject(CartService);
  private router = inject(Router);
  private toast = inject(ToastService);
  
  isProcessing = false;

  removeItem(eventId: number) {
    this.cartService.removeItem(eventId);
    this.toast.show('Ticket removed from cart.', 'error');
  }

  checkout() {
    const items = this.cartService.cartItems();
    if (items.length === 0) return;

    this.isProcessing = true;

    this.router.navigate(['/payment'])
      .then(() => {
        this.isProcessing = false;
      })
      .catch(() => {
        this.isProcessing = false;
        this.toast.show('Error opening payment page. Please try again.', 'error');
      });
  }
}