import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.css'],
})
export class PaymentComponent implements OnInit {
  private readonly apiUrl = environment.apiUrl;

  // Dados vindos da página de evento via router state
  eventId: number = 0;
  eventName: string = '';
  quantity: number = 1;
  totalPrice: number = 0;

  // Campos do formulário de cartão falso
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvc = '';

  isPaying = false;
  errorMsg = '';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    // Ler os dados passados pelo event-details via router state
    const state = history.state;

    if (!state || !state.eventId) {
      this.errorMsg = 'Nenhuma sessão de checkout ativa. A redirecionar para a página principal...';
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000); // Dá 2 segundos para o utilizador conseguir ler o aviso
      return;
    }

    this.eventId = state.eventId;
    this.eventName = state.eventName;
    this.quantity = state.quantity;
    this.totalPrice = state.totalPrice;
  }

  // Formatar número de cartão com espaços a cada 4 dígitos
  formatCardNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = value.replace(/(.{4})/g, '$1 ').trim();
  }

  // Formatar validade MM/AA
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

    const orderPayload = {
      items: [
        {
          eventId: this.eventId,
          quantity: this.quantity,
        }
      ]
    };

    this.http.post(`${this.apiUrl}/orders/checkout`, orderPayload).subscribe({
      next: () => {
        this.isPaying = false;
        this.router.navigate(['/user/my-tickets']);
      },
      error: (err) => {
        this.isPaying = false;
        this.errorMsg = err.error?.message || 'Erro ao processar pagamento. Tenta novamente.';
      },
    });
  }

  goBack(): void {
    history.back();
  }
}