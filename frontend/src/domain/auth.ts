export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  display_name: string;
  password: string;
  confirm_password: string;
}

export interface AuthResponse {
  access_token: string;
  expires_at: string;
  mfa_required?: boolean;
  challenge_id?: string;
}

export interface JwtPayload {
  sub?: string;
  uid?: string;
  role?: string;
  exp?: number;
  iat?: number;
}
