import apiClient from './client';
import type { Document, CreateDocumentPayload, UpdateDocumentPayload, DocumentType, PaginatedResponse } from '../types';

interface ListParams {
  companyId?: number;
  type?: DocumentType;
  relatedEntityType?: string;
  relatedEntityId?: number;
  page?: number;
  limit?: number;
}

export const documentsApi = {
  list(params?: ListParams) {
    return apiClient.get<PaginatedResponse<Document>>('/api/documents', { params });
  },
  templates() {
    return apiClient.get<{ data: Document[] }>('/api/documents/templates');
  },
  getById(id: number) {
    return apiClient.get<{ data: Document }>(`/api/documents/${id}`);
  },
  create(payload: CreateDocumentPayload) {
    return apiClient.post<{ data: Document }>('/api/documents', payload);
  },
  upload(formData: FormData) {
    return apiClient.post<{ data: Document }>('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update(id: number, payload: UpdateDocumentPayload) {
    return apiClient.put<{ data: Document }>(`/api/documents/${id}`, payload);
  },
  remove(id: number) {
    return apiClient.delete(`/api/documents/${id}`);
  },
  initCompanyFolders(companyId: number) {
    return apiClient.post<{ data: Record<string, string> }>(`/api/documents/init-company-folders/${companyId}`);
  },
};
