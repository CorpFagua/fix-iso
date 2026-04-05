import { http, HttpResponse } from 'msw';
import { generateMockControlsResult } from '../data/applicability.mock';
import { mockCompanies } from '../data/companies.mock';

/**
 * MSW handlers for control generation and applicability endpoints
 * These are OPTIONAL and only used if VITE_ENABLE_MOCKS=true
 * For production, backend Express will handle these endpoints
 */
export const applicabilityHandlers = [
  /**
   * POST /api/companies/:companyId/generate-controls
   * Generate controls based on company sector + size
   */
  http.post('/api/companies/:companyId/generate-controls', ({ params }) => {
    const companyId = Number(params.companyId);
    const company = mockCompanies.find(c => c.id === companyId);

    if (!company) {
      return HttpResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    // Generate result based on sector and size
    const result = generateMockControlsResult(company.sectorName, company.sizeName);
    console.log(`[MSW] Generated controls for company ${companyId}: ${result.applicable} applicable`);

    return HttpResponse.json({ data: result }, { status: 201 });
  }),

  /**
   * POST /api/companies/:companyId/regenerate-controls
   * Regenerate controls (delete existing, create new)
   */
  http.post('/api/companies/:companyId/regenerate-controls', async ({ params, request }) => {
    const companyId = Number(params.companyId);
    const company = mockCompanies.find(c => c.id === companyId);

    if (!company) {
      return HttpResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const confirm = body.confirm === true;

    if (!confirm) {
      return HttpResponse.json(
        { error: 'Regeneration requires confirmation (confirm=true in body)' },
        { status: 400 },
      );
    }

    const result = generateMockControlsResult(company.sectorName, company.sizeName);
    console.log(`[MSW] Regenerated controls for company ${companyId}: ${result.applicable} applicable`);

    return HttpResponse.json({ data: result }, { status: 200 });
  }),
];
