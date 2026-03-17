import apiClient from './client';
import type {
  Company,
  CompanyUser,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from '../types';

export const companiesApi = {
  list() {
    return apiClient.get<{ data: Company[] }>('/api/companies');
  },
  getById(id: number) {
    return apiClient.get<{ data: Company }>(`/api/companies/${id}`);
  },
  create(payload: CreateCompanyPayload) {
    return apiClient.post<{ data: Company }>('/api/companies', payload);
  },
  update(id: number, payload: UpdateCompanyPayload) {
    return apiClient.put<{ data: Company }>(`/api/companies/${id}`, payload);
  },
  remove(id: number) {
    return apiClient.delete(`/api/companies/${id}`);
  },
  getUsers(companyId: number) {
    return apiClient.get<{ data: CompanyUser[] }>(`/api/companies/${companyId}/users`);
  },
  assignUser(companyId: number, userId: number, roleInCompany?: string) {
    return apiClient.post<{ data: CompanyUser }>(`/api/companies/${companyId}/users`, { userId, roleInCompany });
  },
  removeUser(companyId: number, userId: number) {
    return apiClient.delete(`/api/companies/${companyId}/users/${userId}`);
  },
};
