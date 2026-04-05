import apiClient from './client';
import type {
  ImplementationControlSummary,
  ImplementationControlDetail,
  ImplementationTask,
  ImplementationNote,
  ImplementationGlobalSummary,
  TaskStatus,
  PaginatedResponse,
} from '../types';

export const implementationApi = {
  getSummary(companyId: number) {
    return apiClient.get<{ data: ImplementationGlobalSummary }>(
      `/api/companies/${companyId}/implementation/summary`,
    );
  },

  listControls(
    companyId: number,
    params?: { themeId?: number; status?: string; search?: string; page?: number; limit?: number },
  ) {
    return apiClient.get<PaginatedResponse<ImplementationControlSummary>>(
      `/api/companies/${companyId}/implementation`,
      { params },
    );
  },

  getControlDetail(companyId: number, controlId: number) {
    return apiClient.get<{ data: ImplementationControlDetail }>(
      `/api/companies/${companyId}/implementation/${controlId}`,
    );
  },

  updateTask(
    companyId: number,
    controlId: number,
    taskId: number,
    payload: { status?: TaskStatus; notes?: string },
  ) {
    return apiClient.put<{ data: ImplementationTask }>(
      `/api/companies/${companyId}/implementation/${controlId}/tasks/${taskId}`,
      payload,
    );
  },

  addNote(companyId: number, controlId: number, content: string) {
    return apiClient.post<{ data: ImplementationNote }>(
      `/api/companies/${companyId}/implementation/${controlId}/notes`,
      { content },
    );
  },
};
