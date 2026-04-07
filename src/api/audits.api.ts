import apiClient from './client';
import type {
  Audit,
  AuditDetail,
  CreateAuditPayload,
  UpdateAuditPayload,
  UpdateAuditResultPayload,
  AuditResult,
  PaginatedResponse,
} from '../types';

export const auditsApi = {
  list(companyId: number, params?: { status?: string; page?: number; limit?: number }) {
    return apiClient.get<PaginatedResponse<Audit>>(
      `/api/companies/${companyId}/audits`,
      { params },
    );
  },

  getById(companyId: number, auditId: number) {
    return apiClient.get<{ data: AuditDetail }>(
      `/api/companies/${companyId}/audits/${auditId}`,
    );
  },

  create(companyId: number, payload: CreateAuditPayload) {
    return apiClient.post<{ data: AuditDetail }>(
      `/api/companies/${companyId}/audits`,
      payload,
    );
  },

  update(companyId: number, auditId: number, payload: UpdateAuditPayload) {
    return apiClient.put<{ data: Audit }>(
      `/api/companies/${companyId}/audits/${auditId}`,
      payload,
    );
  },

  remove(companyId: number, auditId: number) {
    return apiClient.delete(`/api/companies/${companyId}/audits/${auditId}`);
  },

  updateResult(
    companyId: number,
    auditId: number,
    controlId: number,
    payload: UpdateAuditResultPayload,
  ) {
    return apiClient.put<{ data: AuditResult }>(
      `/api/companies/${companyId}/audits/${auditId}/results/${controlId}`,
      payload,
    );
  },
};
