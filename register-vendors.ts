import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  isLoading = true;
  isEditing = false;
  profileForm!: FormGroup;

  toast = { show: false, message: '', type: 'success' };

  // --- LÓGICA DO DROPDOWN CUSTOMIZADO ---
  isDropdownOpen = false;
  countryOptions = [
    { value: 'PT', label: 'Portugal (+351)' },
    { value: 'BR', label: 'Brasil (+55)' },
    { value: 'ES', label: 'Espanha (+34)' },
    { value: 'US', label: 'USA (+1)' }
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (userData) => {
        if (userData) {
          this.user = userData;
          if (!this.isEditing) {
            this.initForm();
          }
          this.isLoading = false;
        }
      }
    });
  }

  initForm(): void {
    if (this.user) {
      this.profileForm = this.fb.group({
        name: [this.user.name, [Validators.required, Validators.minLength(3)]],
        phone: [this.user.phone || '', [Validators.pattern('^[- +()0-9]*$')]],
        countryCode: [this.user.countryCode || 'PT', [Validators.required]]
      });
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.isDropdownOpen = false; // Fecha o dropdown se cancelar a edição
    if (!this.isEditing) this.initForm();
  }

  // --- MÉTODOS DO DROPDOWN ---
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Evita que o HostListener feche instantaneamente
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectCountry(value: string): void {
    this.profileForm.patchValue({ countryCode: value });
    this.isDropdownOpen = false;
  }

  getSelectedCountryLabel(): string {
    if (!this.profileForm) return 'Selecione...';
    const code = this.profileForm.get('countryCode')?.value;
    const country = this.countryOptions.find(c => c.value === code);
    return country ? country.label : 'Selecione...';
  }

  // Se clicar em qualquer outro lado da página, fecha o dropdown!
 @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    // Se o utilizador clicou no botão de guardar, não fazemos nada aqui,
    // deixamos a função saveProfile tratar de tudo.
    const target = event.target as HTMLElement;
    if (target.closest('.btn-save')) return; 

    this.isDropdownOpen = false;
  }

  saveProfile(): void {
    // Forçamos o fecho do dropdown imediatamente no início da função
    this.isDropdownOpen = false;

    if (this.profileForm.invalid) {
      this.showToast('Verifique os campos.', 'error');
      return;
    }

    const updatedData = this.profileForm.value;

    this.authService.updateProfile(updatedData).subscribe({
      next: (res) => {
        this.isEditing = false;
        this.showToast('Perfil atualizado!', 'success');
        this.user = { ...this.user, ...updatedData };
      },
      error: (err) => {
        this.showToast('Erro ao guardar.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { show: true, message, type };
    setTimeout(() => this.toast.show = false, 3000);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  getCountryName(code: string): string {
    const countries: any = { "US": "EUA", "PT": "Portugal", "BR": "Brasil", "ES": "Espanha" };
    return countries[code?.toUpperCase()] || code || 'Portugal';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login-users']);
  }
}