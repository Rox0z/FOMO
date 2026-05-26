import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-register-vendors',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register-vendors.html',
  styleUrls: ['./register-vendors.css']
})
export class RegisterVendors {
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  countryCode: string = '+351';
  phone: string = '';
  businessName: string = '';
  businessDescription: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  showSuccessModal: boolean = false;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef // Força o Angular a renderizar o Modal imediatamente
  ) {}

  goHome() { 
    this.authService.logout();
    this.router.navigate(['/home']);
  }
  
  togglePassword() { 
    this.showPassword = !this.showPassword; 
  }
  
  toggleConfirmPassword() { 
    this.showConfirmPassword = !this.showConfirmPassword; 
  }

  onSubmit() {
    // Validate all fields
    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.toast.show('Please fill in all required fields.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.show('Passwords do not match.');
      return;
    }

    if (this.password.length < 8) {
      this.toast.show('Password must be at least 8 characters long.');
      return;
    }

    this.isLoading = true;
    
    const vendorData = {
      name: this.name,
      email: this.email,
      phone: this.phone,
      countryCode: this.countryCode,
      password: this.password,
      businessName: this.businessName,
      businessDescription: this.businessDescription,
      userType: 'vendor',
    };

    this.authService.register(vendorData).subscribe(
      (response) => {
        console.log('Vendor registration successful:', response);
        this.isLoading = false;
        this.showSuccessModal = true;
        this.cdr.detectChanges(); 
      },
      (error) => {
        this.isLoading = false;
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.toast.show('This email is already registered.');
        } else if (error.error?.message) {
          this.toast.show(error.error.message);
        } else {
          this.toast.show('Error creating account. Please try again.');
        }
        this.cdr.detectChanges();
      }
    );
  }

  onLogin() {
    this.router.navigate(['/login-vendors']);
  }
}