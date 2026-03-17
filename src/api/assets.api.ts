import apiClient from './client';
import type {
  Asset,
  CreateAssetPayload,
  UpdateAssetPayload,
  AssetRiskAssessment,
  CreateRiskPayload,
  PaginatedResponse,
} from '../types';

export const assetsApi = {
  list(companyId: number, params?: {
    assetType?: string;
    classification?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<PaginatedResponse<Asset>>(`/api/companies/${companyId}/assets`, { params });
  },
  getById(companyId: number, id: number) {
    return apiClient.get<{ data: Asset & { risks: AssetRiskAssessment[] } }>(`/api/companies/${companyId}/assets/${id}`);
  },
  create(companyId: number, payload: CreateAssetPayload) {
    return apiClient.post<{ data: Asset }>(`/api/companies/${companyId}/assets`, payload);
  },
  update(companyId: number, id: number, payload: UpdateAssetPayload) {
    return apiClient.put<{ data: Asset }>(`/api/companies/${companyId}/assets/${id}`, payload);
  },
  remove(companyId: number, id: number) {
    return apiClient.delete(`/api/companies/${companyId}/assets/${id}`);
  },
  addRisk(companyId: number, assetId: number, payload: CreateRiskPayload) {
    return apiClient.post<{ data: AssetRiskAssessment }>(`/api/companies/${companyId}/assets/${assetId}/risks`, payload);
  },
};
