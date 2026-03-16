import apiClient from './client';
import type { DashboardStats, ComplianceByTheme, RiskOverview, RecentActivity } from '../types';

export const dashboardApi = {
  stats() {
    return apiClient.get<{ data: DashboardStats }>('/api/dashboard/stats');
  },
  complianceProgress() {
    return apiClient.get<{ data: ComplianceByTheme[] }>('/api/dashboard/compliance-progress');
  },
  riskOverview() {
    return apiClient.get<{ data: RiskOverview[] }>('/api/dashboard/risk-overview');
  },
  recentActivity() {
    return apiClient.get<{ data: RecentActivity[] }>('/api/dashboard/recent-activity');
  },
};
