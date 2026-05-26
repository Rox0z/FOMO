import { Routes } from '@angular/router';
import { Login } from './login/login';
import { RegisterVendors } from './register-vendors/register-vendors';
import { RegisterUsers } from './register-users/register-users';
import { HomeComponent } from './home/home';
import { VendorsDashboard } from './vendors-dashboard/vendors-dashboard';
import { AdminPannel } from './admin-pannel/admin-pannel';
import { AuthGuard} from './services/auth.guard';
import { RoleGuard } from './services/role.guard';
import { ProfileComponent } from './profile/profile';
import { Tickets } from './tickets/tickets';
import { EventDetailComponent } from './event-details/event-details';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register-vendors', component: RegisterVendors},
  { path: 'register-users', component: RegisterUsers},
  { path: 'home', component: HomeComponent },
  { path: 'event/:id', component: EventDetailComponent},
  { path: 'user', canActivate: [AuthGuard, RoleGuard], data: { roles: ['user'] },
    children: [
      { path: 'profile', component: ProfileComponent },
      { path: 'my-tickets', component: Tickets}
    ]
  },
  { path: 'vendor-dashboard', component: VendorsDashboard, canActivate: [AuthGuard, RoleGuard], data: { roles: ['vendor'] },},
  { path: 'admin-dashboard', component: AdminPannel, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] },},
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];