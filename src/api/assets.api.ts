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
  list(params?: {
    assetType?: string;
    classification?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    return apiClient.get<PaginatedResponse<Asset>>('/api/assets', { params });
  },
  getById(id: number) {
    return apiClient.get<{ data: Asset & { risks: AssetRiskAssessment[] } }>(`/api/assets/${id}`);
  },
  create(payload: CreateAssetPayload) {
    return apiClient.post<{ data: Asset }>('/api/assets', payload);
  },
  update(id: number, payload: UpdateAssetPayload) {
    return apiClient.put<{ data: Asset }>(`/api/assets/${id}`, payload);
  },
  remove(id: number) {
    return apiClient.delete(`/api/assets/${id}`);
  },
  addRisk(assetId: number, payload: CreateRiskPayload) {
    return apiClient.post<{ data: AssetRiskAssessment }>(`/api/assets/${assetId}/risks`, payload);
  },
};
