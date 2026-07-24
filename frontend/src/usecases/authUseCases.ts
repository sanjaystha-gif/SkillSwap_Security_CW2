import * as authService from '../services/authService';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../domain/auth';

export function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  return authService.login(payload);
}

export function registerUser(payload: RegisterPayload): Promise<{ user_id: string; message: string }> {
  return authService.register(payload);
}

export function refreshSession(): Promise<AuthResponse> {
  return authService.refresh();
}

export function signOut(): Promise<void> {
  return authService.logout();
}
