import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
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
  private http = inject(HttpClient);
  private router = inject(Router);
  private toast = inject(ToastService);
  
  isProcessing = false;

  removeItem(eventId: number) {
    this.cartService.removeItem(eventId);
    this.toast.show('Bilhete removido do carrinho.', 'error');
  }

  checkout() {
    const items = this.cartService.cartItems();
    if (items.length === 0) return;

    this.isProcessing = true;

    const payload = {
      items: items.map(item => ({
        eventId: item.eventId,
        quantity: item.quantity
      }))
    };

    this.http.post(`${environment.apiUrl}/orders/checkout`, payload).subscribe({
      next: () => {
        this.toast.show('Compra efetuada com sucesso! Verifica o teu email.', 'success');
        this.cartService.clearCart();
        this.isProcessing = false;
        this.router.navigate(['/user/my-tickets']);
      },
      error: (err) => {
        this.toast.show(err.error?.message || 'Erro ao processar o pagamento.', 'error');
        this.isProcessing = false;
      }
    });
  }
}