export type Role = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: Role;
  company?: string;
  verified: boolean;
}

export interface AuthResponse {
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
  token: string;
}
