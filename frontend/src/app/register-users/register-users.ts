import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import {ToastService} from '../services/toast.service'; 

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-users.html',
  styleUrl: './register-users.css'
})
export class RegisterUsers {
  name: string = '';
  email: string = '';
  phone: string = '';
  countryCode: string = '+351';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onSubmit() {
    this.errorMessage = '';

    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.toast.show('Fill all fields!');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.show('Passwords do not match.');
      return;
    }

    if (this.password.length < 8) {
      this.toast.show('Password must have at least 8 characters.');
      return;
    }

    this.isLoading = true;

    const registrationData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      countryCode: this.countryCode,
      password: this.password,
      userType: 'user',
    };

    this.authService.register(registrationData).subscribe({
      next: (response: any) => {
        console.log('Registration successful:', response);
        this.isLoading = false;
        
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          this.toast.show('Email already registered.');
        } else if (error.error?.message) {
          this.toast.show(error.error.message);
        } else {
          this.toast.show('Error creating account. Please try again.');
        }
      }
    });
  }
}