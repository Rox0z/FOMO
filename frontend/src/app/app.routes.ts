import { Routes } from '@angular/router';
import { LoginVendors } from './login-vendors/login-vendors';
import { LoginUsers } from './login-users/login-users';
import { RegisterVendors } from './register-vendors/register-vendors';
import { RegisterUsers } from './register-users/register-users';
import { HomeComponent } from './home/home';
import { AdminPannel } from './admin-pannel/admin-pannel';
import { LoginAdmin } from './login-admin/login-admin';

export const routes: Routes = [
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
];