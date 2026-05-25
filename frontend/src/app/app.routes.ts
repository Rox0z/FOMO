import { Routes } from '@angular/router';

import { LoginVendors } from './login-vendors/login-vendors';
import { LoginUsers } from './login-users/login-users';
import { RegisterVendors } from './register-vendors/register-vendors';
import { RegisterUsers } from './register-users/register-users';
import { HomeComponent } from './home/home';
import { VendorsDashboard } from './vendors-dashboard/vendors-dashboard';
import { AdminPannel } from './admin-pannel/admin-pannel';
import { LoginAdmin } from './login-admin/login-admin';
import { AdminGuard } from './services/admin.guard';
import { VendorGuard } from './services/vendor.guard';
import { UserGuard } from './services/user.guard';
import {AuthGuard} from './services/auth.guard';
import { LoggedInGuard } from './services/logged-in.guards';
import { ProfileComponent } from './profile/profile';
import { Tickets } from './tickets/tickets';
import { EventDetailComponent } from './event-details/event-details';

export const routes: Routes = [
  { path: 'login-vendors', component: LoginVendors, canActivate: [LoggedInGuard] },
  { path: 'register-vendors', component: RegisterVendors, canActivate: [LoggedInGuard] },
  { path: 'login-users', component: LoginUsers, canActivate: [LoggedInGuard] },
  { path: 'register-users', component: RegisterUsers, canActivate: [LoggedInGuard] },
  { path: 'home', component: HomeComponent },
  { 
  path: 'event/:id', component: EventDetailComponent
  },
  { 
    path: 'user', 
    children: [
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard, UserGuard] },
      { path: 'my-tickets', component: Tickets, canActivate: [AuthGuard, UserGuard] }
    ]
  },
  { path: 'vendor',
    children: [
      { path: 'dashboard',component: VendorsDashboard, canActivate: [AuthGuard, VendorGuard] },
    ]
  },
  { path: 'admin-pannel', component: AdminPannel, canActivate: [AuthGuard, AdminGuard] },
  { path: 'login-admin', component: LoginAdmin, canActivate: [LoggedInGuard] },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];