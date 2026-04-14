import apiClient from './client';
import type {
  ThreatMapResponse,
  ThreatTimelineResponse,
  MitreIsoCorrelationResponse,
  CompanyRiskScoreResponse,
  PipelineStatus,
  BigDataHealth,
} from '../types/bigdata.types';

export const bigdataApi = {
  health() {
    return apiClient.get<{ data: BigDataHealth }>('/api/bigdata/health');
  },
  threatMap() {
    return apiClient.get<{ data: ThreatMapResponse }>('/api/bigdata/threat-map');
  },
  threatTimeline() {
    return apiClient.get<{ data: ThreatTimelineResponse }>('/api/bigdata/threat-timeline');
  },
  mitreIsoCorrelation(companyId?: number) {
    return apiClient.get<{ data: MitreIsoCorrelationResponse }>('/api/bigdata/mitre-iso-correlation', {
      params: companyId ? { companyId } : undefined,
    });
  },
  companyRiskScore(companyId?: number) {
    return apiClient.get<{ data: CompanyRiskScoreResponse }>('/api/bigdata/company-risk-score', {
      params: companyId ? { companyId } : undefined,
    });
  },
  runPipeline() {
    return apiClient.post<{ data: PipelineStatus }>('/api/bigdata/run-pipeline');
  },
};
