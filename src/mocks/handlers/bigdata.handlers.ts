import { http, HttpResponse } from 'msw';
import {
  mockThreatMap,
  mockThreatTimeline,
  mockCorrelation,
  mockRiskScore,
  mockCorrelationByCompany,
  mockRiskScoreByCompany,
} from '../data/bigdata.mock';

export const bigdataHandlers = [
  http.get('/api/bigdata/health', () =>
    HttpResponse.json({ data: { status: 'ok', data_available: true } }),
  ),

  http.get('/api/bigdata/threat-map', () =>
    HttpResponse.json({ data: mockThreatMap }),
  ),

  http.get('/api/bigdata/threat-timeline', () =>
    HttpResponse.json({ data: mockThreatTimeline }),
  ),

  http.get('/api/bigdata/mitre-iso-correlation', ({ request }) => {
    const url = new URL(request.url);
    const companyId = parseInt(url.searchParams.get('companyId') ?? '0');
    const data = mockCorrelationByCompany[companyId] ?? mockCorrelation;
    return HttpResponse.json({ data });
  }),

  http.get('/api/bigdata/company-risk-score', ({ request }) => {
    const url = new URL(request.url);
    const companyId = parseInt(url.searchParams.get('companyId') ?? '0');
    const data = mockRiskScoreByCompany[companyId] ?? mockRiskScore;
    return HttpResponse.json({ data });
  }),

  http.post('/api/bigdata/run-pipeline', () =>
    HttpResponse.json({
      data: { status: 'started', message: 'Analytics pipeline started in background' },
    }),
  ),
];
