import { environment } from '../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-pannel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-pannel.html',
  styleUrls: ['./admin-pannel.css']
})
export class AdminPannel implements OnInit {

  apiUrl = environment.apiUrl + '/admin';

  activeTab = 'dashboard';
  loading = false;
  error = '';
  mobileMenuOpen = false;

  // 🎯 NEW DESIGN VARIABLES
  userFilter = 'all';
  isSidebarCollapsed = false;

  // 🎯 REQUEST FILTER
  requestFilter: string = 'all';

  // RAW LISTS
  users: any[] = [];
  vendors: any[] = [];
  events: any[] = [];
  logs: any[] = [];
  eventEdits: any[] = [];

  // 🎯 NEW AGGREGATED REQUESTS LIST
  pendingRequests: any[] = [];

  // 🎯 FILTERED REQUESTS
  get filteredRequests() {

    if (this.requestFilter === 'all') {
      return this.pendingRequests;
    }

    return this.pendingRequests.filter(
      req => req.type === this.requestFilter
    );
  }

  // FILTERED LISTS
  filteredUsers: any[] = [];
  filteredVendors: any[] = [];
  filteredEvents: any[] = [];

  // STATS OBJECT
  stats = {
    users: { total: 0, active: 0 },
    vendors: { total: 0, approved: 0, pending: 0, rejected: 0 },
    events: { total: 0, approved: 0, pending: 0, rejected: 0 },
    edits: { pending: 0 }
  };

  // SEARCH INPUTS
  searchUserQuery = '';
  searchUserCriteria = 'all';

  searchVendorQuery = '';
  searchVendorCriteria = 'businessName';
  vendorFilter = 'all';

  searchEventCreatorQuery = '';
  searchEventCriteria = 'name';
  eventFilter = 'all';

  // MODAL CONTROLS
  selectedEvent: any = null;
  isEventModalOpen = false;
  selectedUser: any = null;
  selectedVendor: any = null;

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOverview();
    this.loadAuditLogs();
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

        // 🎯 AGGREGATED REQUESTS
        this.pendingRequests = [

          // EVENT PUBLICATIONS
          ...this.events
            .filter((e: any) => e.status === 'pending')
            .map((e: any) => ({
              ...e,
              type: 'EVENT_PUBLISH'
            })),

          // EVENT EDITS
          ...this.eventEdits
            .filter((e: any) => e.status === 'pending')
            .map((e: any) => ({
              ...e,
              type: 'EVENT_EDIT'
            })),

          // VENDOR APPROVALS
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

        // RESET FILTERS
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
      }
    });
  }

  loadAuditLogs() {

    this.http.get<any[]>(`${this.apiUrl}/logs`).subscribe({

      next: (data) => {

        this.logs = data || [];
        this.cdRef.detectChanges();
      },

      error: () => console.error('Failed to load audit logs.')
    });
  }

  recalculateAllLocalStats() {

    // USERS
    this.stats.users.total = this.users.length;
    this.stats.users.active = this.users.filter(u => u.active).length;

    // VENDORS
    this.stats.vendors.total = this.vendors.length;
    this.stats.vendors.approved = this.vendors.filter(v => v.status === 'approved').length;
    this.stats.vendors.pending = this.vendors.filter(v => v.status === 'pending' || !v.status).length;
    this.stats.vendors.rejected = this.vendors.filter(v => v.status === 'rejected').length;

    // EVENTS
    this.stats.events.total = this.events.length;
    this.stats.events.approved = this.events.filter(e => e.status === 'approved').length;
    this.stats.events.pending = this.events.filter(e => e.status === 'pending' || !e.status).length;
    this.stats.events.rejected = this.events.filter(e => e.status === 'rejected').length;

    // 🎯 AGGREGATED REQUESTS COUNT
    this.stats.edits.pending = this.pendingRequests.length;
  }

  // USERS FILTERS
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

  // VENDOR FILTERS
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

  // EVENT FILTERS
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

  // USER MODERATION
  banUser(user: any) {

    this.http.patch(`${this.apiUrl}/users/${user.id}/ban`, {}).subscribe(() => {

      user.active = false;

      this.recalculateAllLocalStats();
      this.filterUsers();
      this.loadAuditLogs();
    });
  }

  unbanUser(user: any) {

    this.http.patch(`${this.apiUrl}/users/${user.id}/unban`, {}).subscribe(() => {

      user.active = true;

      this.recalculateAllLocalStats();
      this.filterUsers();
      this.loadAuditLogs();
    });
  }

  // VENDOR MODERATION
  approveVendor(vendor: any) {

    this.http.patch(`${this.apiUrl}/vendors/${vendor.id}/approve`, {}).subscribe(() => {

      vendor.status = 'approved';

      this.loadOverview();
      this.loadAuditLogs();
    });
  }

  rejectVendor(vendor: any) {

    this.http.patch(`${this.apiUrl}/vendors/${vendor.id}/reject`, {}).subscribe(() => {

      vendor.status = 'rejected';

      this.loadOverview();
      this.loadAuditLogs();
    });
  }

  banVendorUser(vendor: any) {

    this.http.patch(`${this.apiUrl}/users/${vendor.userId}/ban`, {}).subscribe(() => {

      vendor.active = false;

      this.filterVendors();
      this.loadAuditLogs();
    });
  }

  unbanVendorUser(vendor: any) {

    this.http.patch(`${this.apiUrl}/users/${vendor.userId}/unban`, {}).subscribe(() => {

      vendor.active = true;

      this.filterVendors();
      this.loadAuditLogs();
    });
  }

  // EVENT MODERATION
  approveEvent(event: any) {

    this.http.patch(`${this.apiUrl}/events/${event.id}/approve`, {}).subscribe(() => {

      event.status = 'approved';

      this.loadOverview();
      this.closeEventModal();
      this.loadAuditLogs();
    });
  }

  rejectEvent(event: any) {

    this.http.patch(`${this.apiUrl}/events/${event.id}/reject`, {}).subscribe(() => {

      event.status = 'rejected';

      this.loadOverview();
      this.closeEventModal();
      this.loadAuditLogs();
    });
  }

  // EVENT EDIT REQUESTS
  approveEditRequest(edit: any) {

    if (!confirm('Aprovar e publicar estas alterações em produção?')) {
      return;
    }

    this.http.patch(`${this.apiUrl}/events/edits/${edit.id}/approve`, {}).subscribe({

      next: () => {

        alert('As alterações foram publicadas e o evento original atualizado!');

        this.loadOverview();
        this.loadAuditLogs();
      },

      error: (err) => console.error('Erro ao aprovar a edição:', err)
    });
  }

  rejectEditRequest(edit: any) {

    if (!confirm('Tens a certeza que desejas rejeitar esta proposta de alteração?')) {
      return;
    }

    this.http.patch(`${this.apiUrl}/events/edits/${edit.id}/reject`, {}).subscribe({

      next: () => {

        alert('Proposta de alteração rejeitada.');

        this.loadOverview();
        this.loadAuditLogs();
      },

      error: (err) => console.error('Erro ao rejeitar a edição:', err)
    });
  }

  // 🎯 UNIFIED REQUEST HANDLERS
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

  // 🎯 SMART REQUEST MODAL
  openRequestModal(req: any) {

    // EVENT PUBLICATION
    if (req.type === 'EVENT_PUBLISH') {

      this.openEventModal(req);

    // EVENT EDIT
    } else if (req.type === 'EVENT_EDIT') {

      this.openEventModal(req);

    // VENDOR APPROVAL
    } else if (req.type === 'VENDOR_APPROVAL') {

      this.openVendorModal(req);
    }
  }

  // MODALS
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

  // AUTH
  logout() {

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_info');

    this.router.navigate(['/login-admin']);
  }

  // HELPERS
  getCountryName(code: string): string {

    if (!code) return 'Global';

    if (code.includes('351')) return 'Portugal';

    if (code.includes('34')) return 'Spain';

    return code;
  }
}