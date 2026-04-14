import { http, HttpResponse } from 'msw';

export const reportsHandlers = [
  http.get('/api/reports/company/:companyId', ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') ?? 'pdf';

    const content = format === 'xlsx'
      ? 'mock-excel-binary-content'
      : 'mock-pdf-binary-content';

    const contentType = format === 'xlsx'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

    return new HttpResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="reporte.${format === 'xlsx' ? 'xlsx' : 'pdf'}"`,
      },
    });
  }),
];
