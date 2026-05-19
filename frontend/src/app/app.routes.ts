import { Routes } from '@angular/router';

import { LoginVendors } from './login-vendors/login-vendors';
import { LoginUsers } from './login-users/login-users';
import { RegisterVendors } from './register-vendors/register-vendors';
import { RegisterUsers } from './register-users/register-users';
import { HomeComponent } from './home/home';
import { VendorsDashboard } from './vendors-dashboard/vendors-dashboard';
import { About } from './home/about/about';
import { AdminPannel } from './admin-pannel/admin-pannel';
import { LoginAdmin } from './login-admin/login-admin';
import { AdminGuard } from './services/admin.guard';
import { UserGuard } from './services/user.guard';
import { ProfileComponent } from './profile/profile';
import { Tickets } from './tickets/tickets';

export const routes: Routes = [
<<<<<<< Updated upstream
=======
<<<<<<< Updated upstream
  {
    path: 'login-vendors',
    component: LoginVendors
  },
  {
    path: 'register-vendors',
    component: RegisterVendors
  },
  {
    path: 'login-users',
    component: LoginUsers
  },
  {
    path: 'register-users',
    component: RegisterUsers
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'admin-pannel',
    component: AdminPannel
  },
  {
    path: 'login-admin',
    component: LoginAdmin
  }
=======
>>>>>>> Stashed changes
  { path: 'login-vendors', component: LoginVendors },
  { path: 'register-vendors', component: RegisterVendors },
  { path: 'login-users', component: LoginUsers },
  { path: 'register-users', component: RegisterUsers },
  { path: 'home', component: HomeComponent },
<<<<<<< Updated upstream
  { path: 'vendor-dashboard', component: VendorsDashboard },
  { path: 'about', component: About },
  { path: 'admin-pannel', component: AdminPannel },
  { path: 'login-admin', component: LoginAdmin },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
=======
  { path: 'user', children: [
      { path: 'profile', component: ProfileComponent, canActivate: [UserGuard] },
      { path: 'my-tickets', component: Tickets, canActivate: [UserGuard]  }]
  },
  { path: 'vendor-dashboard', component: VendorsDashboard },
  { path: 'about', component: About },
  { path: 'admin-pannel', component: AdminPannel, canActivate: [AdminGuard] },
  { path: 'login-admin', component: LoginAdmin },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
>>>>>>> Stashed changes
>>>>>>> Stashed changes
];