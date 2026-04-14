import apiClient from './client';

export const reportsApi = {
  async downloadReport(companyId: number, format: 'pdf' | 'xlsx') {
    const response = await apiClient.get(`/api/reports/company/${companyId}`, {
      params: { format },
      responseType: 'blob',
    });
    return response;
  },
};
