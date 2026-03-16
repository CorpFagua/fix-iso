import apiClient from './client';
import type { DashboardStats, ComplianceByTheme, RiskOverview, RecentActivity, CompanySummary } from '../types';

export const dashboardApi = {
  stats(companyId?: number) {
    return apiClient.get<{ data: DashboardStats }>('/api/dashboard/stats', {
      params: companyId ? { companyId } : undefined,
    });
  },
  complianceProgress(companyId?: number) {
    return apiClient.get<{ data: ComplianceByTheme[] }>('/api/dashboard/compliance-progress', {
      params: companyId ? { companyId } : undefined,
    });
  },
  riskOverview(companyId?: number) {
    return apiClient.get<{ data: RiskOverview[] }>('/api/dashboard/risk-overview', {
      params: companyId ? { companyId } : undefined,
    });
  },
  recentActivity(companyId?: number) {
    return apiClient.get<{ data: RecentActivity[] }>('/api/dashboard/recent-activity', {
      params: companyId ? { companyId } : undefined,
    });
  },
  globalSummary() {
    return apiClient.get<{ data: CompanySummary[] }>('/api/dashboard/global');
  },
};
