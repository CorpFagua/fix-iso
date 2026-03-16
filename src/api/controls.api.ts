import apiClient from './client';
import type {
  IsoTheme,
  CompanyControl,
  UpdateCompanyControlPayload,
  SoAEntry,
  UpdateSoAPayload,
  PaginatedResponse,
} from '../types';

export const controlsApi = {
  listThemes() {
    return apiClient.get<{ data: IsoTheme[] }>('/api/controls/themes');
  },
  listCompanyControls(
    companyId: number,
    params?: { themeId?: number; status?: string; search?: string; page?: number; limit?: number },
  ) {
    return apiClient.get<PaginatedResponse<CompanyControl>>(
      `/api/companies/${companyId}/controls`,
      { params },
    );
  },
  updateCompanyControl(companyId: number, controlId: number, payload: UpdateCompanyControlPayload) {
    return apiClient.put<{ data: CompanyControl }>(
      `/api/companies/${companyId}/controls/${controlId}`,
      payload,
    );
  },
  getSoA(companyId: number) {
    return apiClient.get<{ data: SoAEntry[] }>(`/api/companies/${companyId}/soa`);
  },
  updateSoA(companyId: number, controlId: number, payload: UpdateSoAPayload) {
    return apiClient.put(`/api/companies/${companyId}/soa/${controlId}`, payload);
  },
};
