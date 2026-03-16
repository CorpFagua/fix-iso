import apiClient from './client';
import type { User, CreateUserPayload, UpdateUserPayload, PaginatedResponse } from '../types';

export const usersApi = {
  list(params?: { page?: number; limit?: number; search?: string }) {
    return apiClient.get<PaginatedResponse<User>>('/api/users', { params });
  },
  getById(id: number) {
    return apiClient.get<{ data: User }>(`/api/users/${id}`);
  },
  create(payload: CreateUserPayload) {
    return apiClient.post<{ data: User }>('/api/users', payload);
  },
  update(id: number, payload: UpdateUserPayload) {
    return apiClient.put<{ data: User }>(`/api/users/${id}`, payload);
  },
  remove(id: number) {
    return apiClient.delete(`/api/users/${id}`);
  },
};
