export class User {
  id: number;
  email: string;
  password?: string; 
  name: string;
  phone: string | null;
  countryCode: string | null;
  role: 'user' | 'vendor' | 'admin' | string;
  active: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}