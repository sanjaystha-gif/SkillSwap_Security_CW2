import apiClient from './apiClient';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../domain/auth';

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function register(data: RegisterPayload): Promise<{ user_id: string; message: string }> {
  return apiClient.request<{ user_id: string; message: string }>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export function logout(): Promise<void> {
  return apiClient.request<void>('/auth/logout', {
    method: 'POST',
  });
}

export function refresh(): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/refresh', {
    method: 'POST',
  });
}
