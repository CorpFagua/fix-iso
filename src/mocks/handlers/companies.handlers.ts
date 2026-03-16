import { http, HttpResponse } from 'msw';
import { mockCompanies, mockCompanyUsers, mockSectors, mockCompanySizes } from '../data/companies.mock';

export const companiesHandlers = [
  http.get('/api/companies', () => {
    return HttpResponse.json({ data: mockCompanies });
  }),

  http.get('/api/companies/:id', ({ params }) => {
    const company = mockCompanies.find(c => c.id === Number(params.id));
    if (!company) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });
    return HttpResponse.json({ data: company });
  }),

  http.post('/api/companies', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const sector = mockSectors.find(s => s.id === body.sectorId);
    const size = mockCompanySizes.find(s => s.id === body.sizeId);
    const newCompany = {
      id: mockCompanies.length + 1,
      name: body.name as string,
      sectorId: body.sectorId as number,
      sectorName: sector?.name ?? '',
      sizeId: body.sizeId as number,
      sizeName: size?.name ?? '',
      country: body.country as string,
      createdBy: 1,
      createdAt: new Date().toISOString(),
    };
    mockCompanies.push(newCompany);
    return HttpResponse.json({ data: newCompany }, { status: 201 });
  }),

  http.put('/api/companies/:id', async ({ params, request }) => {
    const company = mockCompanies.find(c => c.id === Number(params.id));
    if (!company) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    if (body.name) company.name = body.name as string;
    if (body.sectorId) {
      company.sectorId = body.sectorId as number;
      company.sectorName = mockSectors.find(s => s.id === body.sectorId)?.name ?? company.sectorName;
    }
    if (body.sizeId) {
      company.sizeId = body.sizeId as number;
      company.sizeName = mockCompanySizes.find(s => s.id === body.sizeId)?.name ?? company.sizeName;
    }
    if (body.country) company.country = body.country as string;
    return HttpResponse.json({ data: company });
  }),

  http.delete('/api/companies/:id', ({ params }) => {
    const idx = mockCompanies.findIndex(c => c.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'No encontrada' }, { status: 404 });
    mockCompanies.splice(idx, 1);
    return HttpResponse.json({ message: 'Empresa eliminada' });
  }),

  http.get('/api/companies/:companyId/users', ({ params }) => {
    const users = mockCompanyUsers.filter(cu => cu.companyId === Number(params.companyId));
    return HttpResponse.json({ data: users });
  }),

  http.post('/api/companies/:companyId/users', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCu = {
      companyId: Number(params.companyId),
      userId: body.userId as number,
      userName: `Usuario ${body.userId}`,
      userEmail: `user${body.userId}@fixiso.com`,
      roleInCompany: (body.roleInCompany as string) ?? null,
      assignedAt: new Date().toISOString(),
    };
    mockCompanyUsers.push(newCu);
    return HttpResponse.json({ data: newCu }, { status: 201 });
  }),

  http.delete('/api/companies/:companyId/users/:userId', ({ params }) => {
    const idx = mockCompanyUsers.findIndex(
      cu => cu.companyId === Number(params.companyId) && cu.userId === Number(params.userId),
    );
    if (idx === -1) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    mockCompanyUsers.splice(idx, 1);
    return HttpResponse.json({ message: 'Usuario desvinculado' });
  }),

  http.get('/api/catalogs/sectors', () => {
    return HttpResponse.json({ data: mockSectors });
  }),

  http.get('/api/catalogs/company-sizes', () => {
    return HttpResponse.json({ data: mockCompanySizes });
  }),
];
