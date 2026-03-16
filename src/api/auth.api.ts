import apiClient from './client';
import type { LoginRequest, LoginResponse, RefreshResponse, AuthUser } from '../types';

export const authApi = {
  login(payload: LoginRequest) {
    return apiClient.post<LoginResponse>('/api/auth/login', payload);
  },
  refresh(refreshToken: string) {
    return apiClient.post<RefreshResponse>('/api/auth/refresh', { refreshToken });
  },
  logout(refreshToken: string) {
    return apiClient.post('/api/auth/logout', { refreshToken });
  },
  me() {
    return apiClient.get<{ data: AuthUser }>('/api/auth/me');
  },
};
