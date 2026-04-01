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
};
