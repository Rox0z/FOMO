import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  eventId: number;
  eventName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Sinal privado que armazena os itens vindos do localStorage
  private cartItemsSignal = signal<CartItem[]>(this.loadFromStorage());

  // Sinais públicos expostos como Ready-Only para os componentes consumirem
  public cartItems = this.cartItemsSignal.asReadonly();
  public cartTotal = computed(() => this.cartItemsSignal().reduce((acc, item) => acc + item.totalPrice, 0));
  public totalItems = computed(() => this.cartItemsSignal().reduce((acc, item) => acc + item.quantity, 0));

  constructor() {
    // Grava automaticamente no localStorage sempre que o sinal muda
    effect(() => {
      localStorage.setItem('fomo_cart', JSON.stringify(this.cartItemsSignal()));
    });
  }

  addToCart(item: CartItem): void {
    this.cartItemsSignal.update(items => {
      const existing = items.find(i => i.eventId === item.eventId);
      if (existing) {
        // Se o evento já está no carrinho, atualiza a quantidade e o preço total
        return items.map(i => i.eventId === item.eventId 
          ? { ...i, quantity: i.quantity + item.quantity, totalPrice: (i.quantity + item.quantity) * i.unitPrice } 
          : i);
      }
      return [...items, item];
    });
  }

  removeItem(eventId: number): void {
    this.cartItemsSignal.update(items => items.filter(i => i.eventId !== eventId));
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
  }

  private loadFromStorage(): CartItem[] {
    const saved = localStorage.getItem('fomo_cart');
    return saved ? JSON.parse(saved) : [];
  }
}