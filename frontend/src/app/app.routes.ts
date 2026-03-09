import { Routes } from '@angular/router';
import { LoginVendors } from './login-vendors/login-vendors';
import { LoginUsers } from './login-users/login-users';
import { RegisterVendors } from './register-vendors/register-vendors';
import { RegisterUsers } from './register-users/register-users';

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
  }
];