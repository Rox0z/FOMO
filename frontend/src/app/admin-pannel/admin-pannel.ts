import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-pannel',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './admin-pannel.html',
  styleUrls: ['./admin-pannel.css'],
})
export class AdminPannel {

  activeTab: string = 'users';

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // dados mock (depois ligas ao backend)
  users = [
    { name: 'Ana Silva', email: 'ana@email.com', status: 'Ativo' }
  ];

  vendors = [
    { name: 'EventPro', email: 'vendor@email.com', status: 'Pending' }
  ];

  events = [
    { name: 'Concerto X', date: '2026-05-01', organizer: 'EventPro' }
  ];

  approveVendor(vendor: any) {
    vendor.status = 'Approved';
  }

  rejectVendor(vendor: any) {
    vendor.status = 'Rejected';
  }
}