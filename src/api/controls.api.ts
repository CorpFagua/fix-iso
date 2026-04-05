import apiClient from './client';
import type {
  IsoTheme,
  IsoControl,
  CompanyControl,
  UpdateCompanyControlPayload,
  SoAEntry,
  UpdateSoAPayload,
  PaginatedResponse,
} from '../types';

export interface UpdateCatalogControlPayload {
  title?: string;
  description?: string;
  controlType?: 'preventive' | 'detective' | 'corrective';
  properties?: string;
}

export const controlsApi = {
  listThemes() {
    return apiClient.get<{ data: IsoTheme[] }>('/api/controls/themes');
  },
  listCatalog(params?: { themeId?: number; controlType?: string; search?: string; page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<IsoControl>>('/api/controls', { params });
  },
  updateCatalogControl(id: number, payload: UpdateCatalogControlPayload) {
    return apiClient.put<{ data: IsoControl }>(`/api/controls/${id}`, payload);
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
  generateControls(companyId: number) {
    return apiClient.post<{ data: { total: number; applicable: number; mandatory: number; recommended: number } }>(
      `/api/companies/${companyId}/generate-controls`,
      {},
    );
  },
  regenerateControls(companyId: number, confirm = true) {
    return apiClient.post<{ data: { total: number; applicable: number; mandatory: number; recommended: number } }>(
      `/api/companies/${companyId}/regenerate-controls`,
      { confirm },
    );
  },

  // ── Control Applicability Rules (admin) ──
  listApplicabilityRules(params?: { sectorId?: number; sizeId?: number; search?: string; page?: number; limit?: number }) {
    return apiClient.get<{
      data: Array<{
        id: number; controlId: number; controlCode: string; controlTitle: string;
        sectorId: number; sectorName: string; sizeId: number; sizeName: string;
        priority: number; mandatory: boolean;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    }>('/api/controls/applicability', { params });
  },
  updateApplicabilityRule(id: number, data: { priority?: number; mandatory?: boolean }) {
    return apiClient.put<{ data: { id: number; priority: number; mandatory: boolean } }>(
      `/api/controls/applicability/${id}`,
      data,
    );
  },
  deleteApplicabilityRule(id: number) {
    return apiClient.delete(`/api/controls/applicability/${id}`);
  },
};
