import apiClient from './client';
import type {
  Training,
  TrainingDetail,
  CompanyTraining,
  CreateTrainingPayload,
  UpdateTrainingPayload,
  AvailableTraining,
  PaginatedResponse,
} from '../types';

export const trainingsApi = {
  // ─── Admin: global CRUD ───────────────────────────
  list(params?: { search?: string; trainingType?: string; page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<Training>>('/api/trainings', { params });
  },
  getById(id: number) {
    return apiClient.get<{ data: TrainingDetail }>(`/api/trainings/${id}`);
  },
  create(payload: CreateTrainingPayload) {
    return apiClient.post<{ data: Training }>('/api/trainings', payload);
  },
  update(id: number, payload: UpdateTrainingPayload) {
    return apiClient.put<{ data: Training }>(`/api/trainings/${id}`, payload);
  },
  remove(id: number) {
    return apiClient.delete(`/api/trainings/${id}`);
  },

  // ─── Company-scoped ───────────────────────────────
  listByCompany(companyId: number) {
    return apiClient.get<{ data: CompanyTraining[] }>(`/api/companies/${companyId}/trainings`);
  },
  getCompanyTraining(companyId: number, trainingId: number) {
    return apiClient.get<{ data: CompanyTraining }>(`/api/companies/${companyId}/trainings/${trainingId}`);
  },
  available(companyId: number) {
    return apiClient.get<{ data: AvailableTraining[] }>(`/api/companies/${companyId}/trainings/available`);
  },
  assignToCompany(companyId: number, trainingId: number) {
    return apiClient.post<{ data: unknown }>(`/api/companies/${companyId}/trainings`, { trainingId });
  },
  removeFromCompany(companyId: number, trainingId: number) {
    return apiClient.delete(`/api/companies/${companyId}/trainings/${trainingId}`);
  },
  enroll(companyId: number, companyTrainingId: number) {
    return apiClient.post<{ data: unknown }>(`/api/companies/${companyId}/trainings/enroll`, { companyTrainingId });
  },
  updateEnrollment(companyId: number, enrollmentId: number, status: string) {
    return apiClient.patch<{ data: unknown }>(`/api/companies/${companyId}/trainings/enrollments/${enrollmentId}`, { status });
  },
};
