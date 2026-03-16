import { http, HttpResponse } from 'msw';
import { mockThemes, allMockCompanyControls, allMockSoA } from '../data/controls.mock';

export const controlsHandlers = [
  http.get('/api/controls/themes', () => {
    return HttpResponse.json({ data: mockThemes });
  }),

  http.get('/api/companies/:companyId/controls', ({ params, request }) => {
    const companyId = Number(params.companyId);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    const themeFilter = url.searchParams.get('themeId');
    const statusFilter = url.searchParams.get('status');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();

    let filtered = allMockCompanyControls.filter(c => c.companyId === companyId);
    if (themeFilter) {
      const themeName = mockThemes.find(t => t.id === Number(themeFilter))?.name;
      if (themeName) filtered = filtered.filter(c => c.themeName === themeName);
    }
    if (statusFilter) filtered = filtered.filter(c => c.status === statusFilter);
    if (search) {
      filtered = filtered.filter(
        c => c.code.toLowerCase().includes(search) || c.title.toLowerCase().includes(search),
      );
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  http.put('/api/companies/:companyId/controls/:id', async ({ params, request }) => {
    const companyId = Number(params.companyId);
    const control = allMockCompanyControls.find(c => c.companyId === companyId && c.controlId === Number(params.id));
    if (!control) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(control, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ data: control });
  }),

  http.get('/api/companies/:companyId/soa', ({ params }) => {
    const companyId = Number(params.companyId);
    const soaData = allMockSoA[companyId] ?? [];
    return HttpResponse.json({ data: soaData });
  }),

  http.put('/api/companies/:companyId/soa/:controlId', async ({ params, request }) => {
    const companyId = Number(params.companyId);
    const soaData = allMockSoA[companyId];
    if (!soaData) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const entry = soaData.find(s => s.controlId === Number(params.controlId));
    if (!entry) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(entry, body);
    return HttpResponse.json({ data: entry });
  }),
];
