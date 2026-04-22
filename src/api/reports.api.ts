import apiClient from './client';

export const reportsApi = {
  async downloadReport(companyId: number, format: 'pdf' | 'xlsx') {
    const response = await apiClient.get(`/api/reports/company/${companyId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  async downloadTrainingsReport(companyId: number, format: 'pdf' | 'csv') {
    const response = await apiClient.get(`/api/reports/trainings/${companyId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  async downloadAuditsReport(companyId: number, format: 'pdf' | 'csv') {
    const response = await apiClient.get(`/api/reports/audits/${companyId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },

  async downloadImplementationReport(companyId: number, format: 'pdf' | 'csv') {
    const response = await apiClient.get(`/api/reports/implementation/${companyId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },
};
