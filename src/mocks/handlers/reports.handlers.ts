import { http, HttpResponse } from 'msw';

function mockBlobResponse(format: string, section: string) {
  const isXlsx = format === 'xlsx';
  const isCsv = format === 'csv';
  const ext = isXlsx ? 'xlsx' : isCsv ? 'csv' : 'pdf';
  const contentType = isXlsx
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : isCsv
    ? 'text/csv; charset=utf-8'
    : 'application/pdf';

  return new HttpResponse(`mock-${section}-${ext}-content`, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${section}.${ext}"`,
    },
  });
}

export const reportsHandlers = [
  http.get('/api/reports/company/:companyId', ({ request }) => {
    const url = new URL(request.url);
    return mockBlobResponse(url.searchParams.get('format') ?? 'pdf', 'reporte');
  }),

  http.get('/api/reports/trainings/:companyId', ({ request }) => {
    const url = new URL(request.url);
    return mockBlobResponse(url.searchParams.get('format') ?? 'pdf', 'capacitaciones');
  }),

  http.get('/api/reports/audits/:companyId', ({ request }) => {
    const url = new URL(request.url);
    return mockBlobResponse(url.searchParams.get('format') ?? 'pdf', 'auditorias');
  }),

  http.get('/api/reports/implementation/:companyId', ({ request }) => {
    const url = new URL(request.url);
    return mockBlobResponse(url.searchParams.get('format') ?? 'pdf', 'implementacion');
  }),
];
