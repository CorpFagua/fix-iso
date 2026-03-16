import { http, HttpResponse } from 'msw';
import { mockAssets, mockAssetRisks } from '../data/assets.mock';

export const assetsHandlers = [
  http.get('/api/assets', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10);
    const typeFilter = url.searchParams.get('assetType');
    const classFilter = url.searchParams.get('classification');
    const search = (url.searchParams.get('search') ?? '').toLowerCase();

    let filtered = [...mockAssets];
    if (typeFilter) filtered = filtered.filter(a => a.assetType === typeFilter);
    if (classFilter) filtered = filtered.filter(a => a.classification === classFilter);
    if (search) filtered = filtered.filter(a => a.name.toLowerCase().includes(search));

    const total = filtered.length;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return HttpResponse.json({
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  }),

  http.get('/api/assets/:id', ({ params }) => {
    const asset = mockAssets.find(a => a.id === Number(params.id));
    if (!asset) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const risks = mockAssetRisks.filter(r => r.assetId === asset.id);
    return HttpResponse.json({ data: { ...asset, risks } });
  }),

  http.post('/api/assets', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newAsset = {
      id: mockAssets.length + 1,
      companyId: 1,
      name: body.name as string,
      description: (body.description as string) ?? null,
      assetType: body.assetType as string,
      classification: body.classification as string,
      ownerName: 'Carlos Mendoza',
      ownerId: (body.ownerId as number) ?? 1,
      custodianName: null,
      custodianId: null,
      location: (body.location as string) ?? null,
      status: 'active' as const,
      risksCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAssets.push(newAsset as typeof mockAssets[0]);
    return HttpResponse.json({ data: newAsset }, { status: 201 });
  }),

  http.put('/api/assets/:id', async ({ params, request }) => {
    const asset = mockAssets.find(a => a.id === Number(params.id));
    if (!asset) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    Object.assign(asset, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json({ data: asset });
  }),

  http.delete('/api/assets/:id', ({ params }) => {
    const idx = mockAssets.findIndex(a => a.id === Number(params.id));
    if (idx === -1) return HttpResponse.json({ error: 'No encontrado' }, { status: 404 });
    mockAssets.splice(idx, 1);
    return HttpResponse.json({ message: 'Activo eliminado' });
  }),

  http.post('/api/assets/:id/risks', async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const likelihood = body.likelihood as number;
    const impact = body.impact as number;
    const score = likelihood * impact;
    const level = score >= 16 ? 'critical' : score >= 11 ? 'high' : score >= 6 ? 'medium' : 'low';
    const newRisk = {
      id: mockAssetRisks.length + 1,
      assetId: Number(params.id),
      threat: body.threat as string,
      vulnerability: body.vulnerability as string,
      likelihood,
      impact,
      riskScore: score,
      riskLevel: level as 'low' | 'medium' | 'high' | 'critical',
      treatment: body.treatment as string,
      treatmentPlan: (body.treatmentPlan as string) ?? null,
      residualRiskScore: null,
      assessedByName: 'Carlos Mendoza',
      createdAt: new Date().toISOString(),
    };
    mockAssetRisks.push(newRisk as typeof mockAssetRisks[0]);
    return HttpResponse.json({ data: newRisk }, { status: 201 });
  }),
];
