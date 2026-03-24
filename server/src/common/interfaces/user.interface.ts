export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  verified: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
