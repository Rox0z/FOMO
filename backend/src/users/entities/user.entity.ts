export class User {
  id: number;
  email: string;
  password?: string; // Should not be returned in API responses
  name: string;
  phone?: string;
  countryCode?: string;
  userType: 'user' | 'vendor';
  superuser: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
