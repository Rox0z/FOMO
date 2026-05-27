import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from "../services/toast.service";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-pannel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pannel.html',
  styleUrls: ['./admin-pannel.css']
})
export class AdminPannel implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/admin`;

  activeTab = 'dashboard';
  loading = false;
  error = '';
  mobileMenuOpen = false;

  userFilter = 'all';
  isSidebarCollapsed = false;

  requestFilter: string = 'all';

  users: any[] = [];
  vendors: any[] = [];
  events: any[] = [];
  logs: any[] = [];
  eventEdits: any[] = [];

  pendingRequests: any[] = [];

  get filteredRequests() {
    if (this.requestFilter === 'all') {
      return this.pendingRequests;
    }

    return this.pendingRequests.filter(
      req => req.type === this.requestFilter
    );
  }

  filteredUsers: any[] = [];
  filteredVendors: any[] = [];
  filteredEvents: any[] = [];

  stats = {
    users: { total: 0, active: 0 },
    vendors: { total: 0, approved: 0, pending: 0, rejected: 0 },
    events: { total: 0, approved: 0, pending: 0, rejected: 0 },
    edits: { pending: 0 }
  };

  searchUserQuery = '';
  searchUserCriteria = 'all';

  searchVendorQuery = '';
  searchVendorCriteria = 'businessName';
  vendorFilter = 'all';

  searchEventCreatorQuery = '';
  searchEventCriteria = 'name';
  eventFilter = 'all';

  selectedEvent: any = null;
  isEventModalOpen = false;
  selectedUser: any = null;
  selectedVendor: any = null;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadOverview();
    this.loadAuditLogs();
  }

  notify(msg: string, type: 'success' | 'error' = 'success') {
    this.toast.show(msg, type);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.mobileMenuOpen = false;
    this.cdRef.detectChanges();
  }

  toggleMobileMenu(state?: boolean) {
    if (window.innerWidth > 992) {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    } else {
      if (state !== undefined) {
        this.mobileMenuOpen = state;
      } else {
        this.mobileMenuOpen = !this.mobileMenuOpen;
      }
    }
  }

  loadOverview() {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${this.apiUrl}/overview`).subscribe({
      next: (res: any) => {
        this.users = res.users || [];
        this.vendors = res.vendors || [];
        this.events = res.events || [];
        this.eventEdits = res.eventEdits || [];

        this.pendingRequests = [
          ...this.events
            .filter((e: any) => e.status === 'pending')
            .map((e: any) => ({
              ...e,
              type: 'EVENT_PUBLISH'
            })),

          ...this.eventEdits
            .filter((e: any) => e.status === 'pending')
            .map((e: any) => ({
              ...e,
              type: 'EVENT_EDIT'
            })),

          ...this.vendors
            .filter((v: any) => v.status === 'pending')
            .map((v: any) => ({
              ...v,
              type: 'VENDOR_APPROVAL'
            }))
        ];

        this.filteredUsers = [...this.users];
        this.filteredVendors = [...this.vendors];
        this.filteredEvents = [...this.events];

        this.userFilter = 'all';
        this.vendorFilter = 'all';
        this.eventFilter = 'all';
        this.requestFilter = 'all';

        this.recalculateAllLocalStats();

        this.loading = false;

        this.cdRef.detectChanges();
      },

      error: () => {
        this.error = 'Error loading system overview data.';
        this.loading = false;
        this.notify('Erro ao carregar overview.', 'error');
      }
    });
  }

  loadAuditLogs() {
    this.http.get<any[]>(`${this.apiUrl}/logs`).subscribe({
      next: (data) => {
        this.logs = data || [];
        this.cdRef.detectChanges();
      },

      error: () => {
        console.error('Failed to load audit logs.');
        this.notify('Erro ao carregar audit logs.', 'error');
      }
    });
  }

  recalculateAllLocalStats() {
    this.stats.users.total = this.users.length;
    this.stats.users.active = this.users.filter(u => u.active).length;

    this.stats.vendors.total = this.vendors.length;
    this.stats.vendors.approved = this.vendors.filter(v => v.status === 'approved').length;
    this.stats.vendors.pending = this.vendors.filter(v => v.status === 'pending' || !v.status).length;
    this.stats.vendors.rejected = this.vendors.filter(v => v.status === 'rejected').length;

    this.stats.events.total = this.events.length;
    this.stats.events.approved = this.events.filter(e => e.status === 'approved').length;
    this.stats.events.pending = this.events.filter(e => e.status === 'pending' || !e.status).length;
    this.stats.events.rejected = this.events.filter(e => e.status === 'rejected').length;

    this.stats.edits.pending = this.pendingRequests.length;
  }

  setUserFilter(status: string) {
    this.userFilter = status;
    this.filterUsers();
  }

  filterUsers() {
    const query = this.searchUserQuery.toLowerCase().trim();

    let textFiltered = this.users;

    if (query) {
      textFiltered = this.users.filter(u => {
        if (this.searchUserCriteria === 'id') {
          return u.id?.toString() === query;
        }

        if (this.searchUserCriteria === 'email') {
          return u.email?.toLowerCase().includes(query);
        }

        return (
          u.id?.toString() === query ||
          u.email?.toLowerCase().includes(query) ||
          u.name?.toLowerCase().includes(query)
        );
      });
    }

    if (this.userFilter === 'active') {
      this.filteredUsers = textFiltered.filter(u => u.active === true);
    } else if (this.userFilter === 'blocked') {
      this.filteredUsers = textFiltered.filter(u => u.active === false);
    } else {
      this.filteredUsers = textFiltered;
    }
  }

  setVendorFilter(status: string) {
    this.vendorFilter = status;
    this.filterVendors();
  }

  filterVendors() {
    const query = this.searchVendorQuery.toLowerCase().trim();

    let result = this.vendors;

    if (this.vendorFilter !== 'all') {
      result = result.filter(v => v.status === this.vendorFilter);
    }

    if (query) {
      result = result.filter(v => {
        if (this.searchVendorCriteria === 'id') {
          return v.id?.toString() === query;
        }

        if (this.searchVendorCriteria === 'email') {
          return v.email?.toLowerCase().includes(query);
        }

        return v.businessName?.toLowerCase().includes(query);
      });
    }

    this.filteredVendors = result;
  }

  setEventFilter(status: string) {
    this.eventFilter = status;
    this.filterEventsByCreator();
  }

  filterEventsByCreator() {
    const query = this.searchEventCreatorQuery.toLowerCase().trim();

    let result = this.events;

    if (this.eventFilter !== 'all') {
      result = result.filter(e => e.status === this.eventFilter);
    }

    if (query) {
      result = result.filter(e => {
        if (this.searchEventCriteria === 'id') {
          return e.id?.toString() === query;
        }

        if (this.searchEventCriteria === 'vendorId') {
          return e.vendorId?.toString() === query;
        }

        return e.name?.toLowerCase().includes(query);
      });
    }

    this.filteredEvents = result;
  }

  banUser(user: any) {
    this.http.patch(`${this.apiUrl}/users/${user.id}/ban`, {}).subscribe({
      next: () => {
        user.active = false;
        this.recalculateAllLocalStats();
        this.filterUsers();
        this.loadAuditLogs();
        this.notify('Utilizador bloqueado.');
      },

      error: () => {
        this.notify('Erro ao bloquear utilizador.', 'error');
      }
    });
  }

  unbanUser(user: any) {
    this.http.patch(`${this.apiUrl}/users/${user.id}/unban`, {}).subscribe({
      next: () => {
        user.active = true;
        this.recalculateAllLocalStats();
        this.filterUsers();
        this.loadAuditLogs();
        this.notify('Utilizador desbloqueado.');
      },

      error: () => {
        this.notify('Erro ao desbloquear utilizador.', 'error');
      }
    });
  }

  approveVendor(vendor: any) {
    this.http.patch(`${this.apiUrl}/vendors/${vendor.id}/approve`, {}).subscribe({
      next: () => {
        vendor.status = 'approved';
        this.notify('Vendor aprovado com sucesso.');
        this.loadOverview();
        this.loadAuditLogs();
      },

      error: () => {
        this.notify('Erro ao aprovar vendor.', 'error');
      }
    });
  }

  rejectVendor(vendor: any) {
    this.http.patch(`${this.apiUrl}/vendors/${vendor.id}/reject`, {}).subscribe({
      next: () => {
        vendor.status = 'rejected';
        this.notify('Vendor rejeitado.');
        this.loadOverview();
        this.loadAuditLogs();
      },

      error: () => {
        this.notify('Erro ao rejeitar vendor.', 'error');
      }
    });
  }

  banVendorUser(vendor: any) {
    this.http.patch(`${this.apiUrl}/users/${vendor.userId}/ban`, {}).subscribe({
      next: () => {
        vendor.active = false;
        this.filterVendors();
        this.loadAuditLogs();
        this.notify('Conta do vendor bloqueada.');
      },

      error: () => {
        this.notify('Erro ao bloquear vendor.', 'error');
      }
    });
  }

  unbanVendorUser(vendor: any) {
    this.http.patch(`${this.apiUrl}/users/${vendor.userId}/unban`, {}).subscribe({
      next: () => {
        vendor.active = true;
        this.filterVendors();
        this.loadAuditLogs();
        this.notify('Conta do vendor desbloqueada.');
      },

      error: () => {
        this.notify('Erro ao desbloquear vendor.', 'error');
      }
    });
  }

  approveEvent(event: any) {
    this.http.patch(`${this.apiUrl}/events/${event.id}/approve`, {}).subscribe({
      next: () => {
        event.status = 'approved';
        this.notify('Evento aprovado.');
        this.loadOverview();
        this.closeEventModal();
        this.loadAuditLogs();
      },

      error: () => {
        this.notify('Erro ao aprovar evento.', 'error');
      }
    });
  }

  rejectEvent(event: any) {
    this.http.patch(`${this.apiUrl}/events/${event.id}/reject`, {}).subscribe({
      next: () => {
        event.status = 'rejected';
        this.notify('Evento rejeitado.');
        this.loadOverview();
        this.closeEventModal();
        this.loadAuditLogs();
      },

      error: () => {
        this.notify('Erro ao rejeitar evento.', 'error');
      }
    });
  }

  approveEditRequest(edit: any) {
    if (!confirm('Aprovar e publicar estas alterações em produção?')) {
      return;
    }

    this.http.patch(`${this.apiUrl}/events/edits/${edit.id}/approve`, {}).subscribe({
      next: () => {
        this.notify('As alterações foram publicadas com sucesso!');
        this.loadOverview();
        this.loadAuditLogs();
      },

      error: (err) => {
        console.error('Erro ao aprovar a edição:', err);
        this.notify('Erro ao aprovar a alteração.', 'error');
      }
    });
  }

  rejectEditRequest(edit: any) {
    if (!confirm('Tens a certeza que desejas rejeitar esta proposta de alteração?')) {
      return;
    }

    this.http.patch(`${this.apiUrl}/events/edits/${edit.id}/reject`, {}).subscribe({
      next: () => {
        this.notify('Proposta de alteração rejeitada.');
        this.loadOverview();
        this.loadAuditLogs();
      },

      error: (err) => {
        console.error('Erro ao rejeitar a edição:', err);
        this.notify('Erro ao rejeitar alteração.', 'error');
      }
    });
  }

  handleApprove(req: any) {
    if (req.type === 'EVENT_PUBLISH') {
      this.approveEvent(req);
    } else if (req.type === 'EVENT_EDIT') {
      this.approveEditRequest(req);
    } else if (req.type === 'VENDOR_APPROVAL') {
      this.approveVendor(req);
    }
  }

  handleReject(req: any) {
    if (req.type === 'EVENT_PUBLISH') {
      this.rejectEvent(req);
    } else if (req.type === 'EVENT_EDIT') {
      this.rejectEditRequest(req);
    } else if (req.type === 'VENDOR_APPROVAL') {
      this.rejectVendor(req);
    }
  }

  openRequestModal(req: any) {
    if (req.type === 'EVENT_PUBLISH') {
      this.openEventModal(req);
    } else if (req.type === 'EVENT_EDIT') {
      this.openEventModal(req);
    } else if (req.type === 'VENDOR_APPROVAL') {
      this.openVendorModal(req);
    }
  }

  openEventModal(event: any) {
    this.selectedEvent = event;
    this.isEventModalOpen = true;
  }

  closeEventModal() {
    this.selectedEvent = null;
    this.isEventModalOpen = false;
  }

  openUserModal(user: any) {
    this.selectedUser = user;
  }

  closeUserModal() {
    this.selectedUser = null;
  }

  openVendorModal(vendor: any) {
    this.selectedVendor = vendor;
  }

  closeVendorModal() {
    this.selectedVendor = null;
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_info');

    this.notify('Sessão terminada.');

    this.router.navigate(['/login'], { queryParams: { mode: 'admin' } });
  }

  getCountryName(code: string): string {
    if (!code) return 'Global';
    if (code.includes('351')) return 'Portugal';
    if (code.includes('34')) return 'Spain';

    return code;
  }
}